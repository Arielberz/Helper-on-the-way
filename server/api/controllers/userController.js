const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const sendResponse = require('../utils/sendResponse');

function normalizeEmail(email) {
    return String(email || '').trim().toLowerCase();
}

function normalizeUsername(username) {
    return String(username || '').trim().toLowerCase();
}

function normalizePhone(phone) {
    let s = String(phone || '').trim();
    // Remove all non-digit characters except +
    s = s.replace(/[^\d+]/g, '');
    
    // If starts with 05, convert to +9725
    if (s.startsWith('05')) {
        s = '+972' + s.substring(1);
    }
    // If starts with 9725, add +
    else if (s.startsWith('9725')) {
        s = '+' + s;
    }
    
    return s;
}

function isValidEmail(email) {
    const re = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    return re.test(email);
}

function isValidUsername(username) {
    // 3-30 chars, letters, numbers, underscore, dot
    return /^[a-z0-9_.]{3,30}$/.test(username);
}

function isValidPhone(phone) {
    // Israeli mobile number: must be +9725XXXXXXXX (10 digits total after +972)
    return /^\+9725\d{8}$/.test(phone);
}

function sanitizeUser(user) {
    return {
        id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        averageRating: user.averageRating || 0,
        ratingCount: user.ratingCount || 0
    };
}

exports.register = async (req, res) => {
    try {
        const { username: rawUsername, email: rawEmail, password, phone: rawPhone } = req.body || {};

        if (!rawUsername || !rawEmail || !password || !rawPhone) {
            return sendResponse(res, 400, false, "all fields are required");
        }
        const username = normalizeUsername(rawUsername);
        const email = normalizeEmail(rawEmail);
        const phone = normalizePhone(rawPhone);

        if (!isValidUsername(username)) {
            return sendResponse(res, 400, false, "invalid username format");
        }
        if (!isValidEmail(email)) {
            return sendResponse(res, 400, false, "invalid email format");
        }
        if (!isValidPhone(phone)) {
            return sendResponse(res, 400, false, "invalid phone format");
        }
        if (String(password).length < 8) {
            return sendResponse(res, 400, false, "password must be at least 8 characters");
        }

        const existingUser = await User.findOne({ $or: [ { email }, { phone } ] });
        if (existingUser) {
            return sendResponse(res, 409, false, "email or phone already in use");
        }

        const saltRounds = Number.parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);
        const hashedPassword = await bcrypt.hash(password, isNaN(saltRounds) ? 10 : saltRounds);

        const newUser = new User({ username, email, password: hashedPassword, phone });
        await newUser.save();
        if (!process.env.JWT_SECRET) {
            return sendResponse(res, 500, false, "server misconfiguration: missing JWT secret");
        }
        const expiresIn = process.env.JWT_EXPIRES_IN || '1h';
        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn });

        if (String(process.env.JWT_COOKIE).toLowerCase() === 'true') {
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax'
            });
        }

        sendResponse(res, 201, true, "user registered successfully", { token, user: sanitizeUser(newUser) }); 
    } catch (error) {
        console.error(error);
        sendResponse(res, 500, false, "server error");
    }};

exports.login = async (req, res) => {
    try {
        const { identifier: rawIdentifier, password } = req.body || {};
        if (!rawIdentifier || !password) {
            return sendResponse(res, 400, false, "identifier and password are required");
        }
        const identifier = String(rawIdentifier).trim();

        let query = null;
        const idLower = identifier.toLowerCase();
        if (isValidEmail(idLower)) {
            query = { email: idLower };
        } else {
            // Try to normalize and validate phone
            const normalizedPhone = normalizePhone(identifier);
            if (isValidPhone(normalizedPhone)) {
                query = { phone: normalizedPhone };
            } else {
                return sendResponse(res, 400, false, "please use email or phone to login");
            }
        }

        const user = await User.findOne(query);
        if (!user) {
            return sendResponse(res, 400, false, "invalid credentials");
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return sendResponse(res, 400, false, "invalid credentials");
        }
        if (!process.env.JWT_SECRET) {
            return sendResponse(res, 500, false, "server misconfiguration: missing JWT secret");
        }
        const expiresIn = process.env.JWT_EXPIRES_IN || '1h';
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn });

        if (String(process.env.JWT_COOKIE).toLowerCase() === 'true') {
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax'
            });
        }

        sendResponse(res, 200, true, "login successful", { token, user: sanitizeUser(user) });
    } catch (error) {
        console.error(error);
        sendResponse(res, 500, false, "server error");
    }
};

exports.getMe = async (req, res) => {
    try {
        const userId = req.userId; // Set by authMiddleware
        
        if (!userId) {
            return sendResponse(res, 401, false, "unauthorized");
        }

        const user = await User.findById(userId).select('-password');
        
        if (!user) {
            return sendResponse(res, 404, false, "user not found");
        }

        sendResponse(res, 200, true, "user profile retrieved successfully", { user: sanitizeUser(user) });
    } catch (error) {
        console.error('Error getting user profile:', error);
        sendResponse(res, 500, false, "server error");
    }
};

exports.getLocationFromIP = async (req, res) => {
    try {
        // Helper to check if IP is private/internal
        const isPrivateIP = (ip) => {
            return ip === '::1' || 
                   ip === '127.0.0.1' || 
                   ip.includes('localhost') ||
                   ip.startsWith('10.') || 
                   ip.startsWith('192.168.') || 
                   (ip.startsWith('172.') && parseInt(ip.split('.')[1], 10) >= 16 && parseInt(ip.split('.')[1], 10) <= 31);
        };

        // Get client IP address - prioritize x-forwarded-for
        let clientIP = req.headers['x-forwarded-for']?.split(',')[0].trim() 
                      || req.socket.remoteAddress 
                      || req.ip;
        
        // Clean up IP (remove IPv6 prefix if present)
        if (clientIP && clientIP.startsWith('::ffff:')) {
            clientIP = clientIP.replace('::ffff:', '');
        }

        console.log('Getting location for IP:', clientIP);

        const fetch = (await import('node-fetch')).default;
        
        // Strategy:
        // 1. If public IP -> Query specific IP
        // 2. If private/localhost -> Query "me" endpoint (auto-detect public IP)
        
        const useAutoDetect = !clientIP || isPrivateIP(clientIP);
        console.log(`IP Type: ${useAutoDetect ? 'Private/Local (Auto-detecting public IP)' : 'Public'}`);

        // Primary Service: ipapi.co (Reliable, JSON format)
        // Fallback Service: ip-api.com (Good free tier, slightly different format)
        
        try {
            // --- PRIMARY ATTEMPT (ipapi.co) ---
            const primaryUrl = useAutoDetect 
                ? 'https://ipapi.co/json/' 
                : `https://ipapi.co/${clientIP}/json/`;
                
            console.log(`Trying Primary API: ${primaryUrl}`);
            const response = await fetch(primaryUrl);
            
            if (response.ok) {
                const data = await response.json();
                
                if (!data.error && data.latitude && data.longitude) {
                    return sendResponse(res, 200, true, "location retrieved successfully", {
                        latitude: data.latitude,
                        longitude: data.longitude,
                        city: data.city || 'Unknown',
                        country: data.country_name || 'Unknown',
                        ip: data.ip || clientIP,
                        source: 'primary'
                    });
                }
            }
            console.warn('Primary API failed or returned invalid data, trying fallback...');
        } catch (primaryError) {
            console.error('Primary API error:', primaryError.message);
        }

        // --- FALLBACK ATTEMPT (ip-api.com) ---
        try {
            // Note: ip-api.com doesn't support HTTPS on free tier sometimes, but we'll try http if needed or use their secure endpoint if available.
            // Using http for free tier compatibility as per their docs for non-commercial
            const fallbackUrl = useAutoDetect
                ? 'http://ip-api.com/json/'
                : `http://ip-api.com/json/${clientIP}`;
                
            console.log(`Trying Fallback API: ${fallbackUrl}`);
            const response = await fetch(fallbackUrl);
            
            if (response.ok) {
                const data = await response.json();
                
                if (data.status === 'success') {
                    return sendResponse(res, 200, true, "location retrieved successfully (fallback)", {
                        latitude: data.lat,
                        longitude: data.lon,
                        city: data.city || 'Unknown',
                        country: data.country || 'Unknown',
                        ip: data.query || clientIP,
                        source: 'fallback'
                    });
                }
            }
        } catch (fallbackError) {
            console.error('Fallback API error:', fallbackError.message);
        }

        throw new Error('All geolocation services failed');

    } catch (error) {
        console.error('Final IP geolocation error:', error);
        // Ultimate Fallback to Tel Aviv
        sendResponse(res, 200, true, "location retrieved (default)", {
            latitude: 32.0853,
            longitude: 34.7818,
            city: 'Tel Aviv',
            country: 'Israel',
            ip: 'unknown',
            source: 'default'
        });
    }
};