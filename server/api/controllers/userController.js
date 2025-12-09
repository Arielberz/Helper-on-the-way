const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const sendResponse = require('../utils/sendResponse');
const { sendEmail } = require('../utils/email');
const generateCode = require('../utils/generateCode');

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
        ratingCount: user.ratingCount || 0,
        avatar: user.avatar || null,
        balance: user.balance || 0,
        totalEarnings: user.totalEarnings || 0,
        totalWithdrawals: user.totalWithdrawals || 0,
        emailVerified: user.emailVerified || false
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
        
        // Generate verification code
        const verificationCode = generateCode(6);
        const hashedCode = crypto.createHash('sha256').update(verificationCode).digest('hex');
        
        // Set verification fields
        newUser.emailVerificationCode = hashedCode;
        newUser.emailVerificationExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
        newUser.emailVerified = false;
        
        await newUser.save();
        
        // Send verification email
        try {
            await sendEmail({
                to: email,
                subject: 'Verify your email',
                text: `Your verification code is: ${verificationCode}`,
                html: `<p>Your verification code is: <b>${verificationCode}</b></p>`
            });
            console.log('Verification email sent successfully to:', email);
        } catch (emailError) {
            console.error('Failed to send verification email:', emailError);
            // Continue with registration even if email fails
        }

        // Do NOT return a token - user must verify email first
        sendResponse(res, 201, true, "User registered. Verification email sent. Please check your inbox and enter the code.", { user: sanitizeUser(newUser) }); 
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
        
        // Check if email is verified
        if (!user.emailVerified) {
            return sendResponse(res, 403, false, "Please verify your email before logging in. Check your inbox for the verification code.");
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

exports.verifyEmail = async (req, res) => {
    try {
        const { email: rawEmail, code } = req.body || {};
        
        if (!rawEmail || !code) {
            return sendResponse(res, 400, false, "email and code are required");
        }
        
        const email = normalizeEmail(rawEmail);
        
        // Find user by email
        const user = await User.findOne({ email });
        
        if (!user || !user.emailVerificationCode) {
            return sendResponse(res, 400, false, "verification code not found");
        }
        
        // Check if verification code has expired
        if (!user.emailVerificationExpires || user.emailVerificationExpires < Date.now()) {
            return sendResponse(res, 400, false, "verification code expired");
        }
        
        // Hash the provided code and compare with stored hash
        const hashedCode = crypto.createHash('sha256').update(code).digest('hex');
        
        if (hashedCode !== user.emailVerificationCode) {
            return sendResponse(res, 400, false, "invalid verification code");
        }
        
        // Verification successful - update user
        user.emailVerified = true;
        user.emailVerificationCode = undefined;
        user.emailVerificationExpires = undefined;
        await user.save();
        
        // Generate JWT token for immediate login after verification
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
        
        sendResponse(res, 200, true, "email verified successfully", { token, user: sanitizeUser(user) });
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

exports.uploadAvatar = async (req, res) => {
    try {
        const userId = req.userId; // Set by authMiddleware
        
        if (!userId) {
            return sendResponse(res, 401, false, "unauthorized");
        }

        const { avatar } = req.body;

        if (!avatar) {
            return sendResponse(res, 400, false, "avatar data is required");
        }

        // Validate base64 image format
        if (!avatar.startsWith('data:image/')) {
            return sendResponse(res, 400, false, "invalid image format");
        }

        // Update user's avatar
        const user = await User.findByIdAndUpdate(
            userId,
            { avatar },
            { new: true }
        ).select('-password');

        if (!user) {
            return sendResponse(res, 404, false, "user not found");
        }

        sendResponse(res, 200, true, "avatar uploaded successfully", { user: sanitizeUser(user) });
    } catch (error) {
        console.error('Error uploading avatar:', error);
        sendResponse(res, 500, false, "server error");
    }
};

exports.deleteAvatar = async (req, res) => {
    try {
        const userId = req.userId; // Set by authMiddleware
        
        if (!userId) {
            return sendResponse(res, 401, false, "unauthorized");
        }

        // Remove user's avatar
        const user = await User.findByIdAndUpdate(
            userId,
            { avatar: null },
            { new: true }
        ).select('-password');

        if (!user) {
            return sendResponse(res, 404, false, "user not found");
        }

        sendResponse(res, 200, true, "avatar deleted successfully", { user: sanitizeUser(user) });
    } catch (error) {
        console.error('Error deleting avatar:', error);
        sendResponse(res, 500, false, "server error");
    }
};

// Get user's wallet balance and transaction history
exports.getWallet = async (req, res) => {
    try {
        const userId = req.userId;
        const Transaction = require('../models/transactionModel');
        
        if (!userId) {
            return sendResponse(res, 401, false, "unauthorized");
        }

        const user = await User.findById(userId).select('balance totalEarnings totalWithdrawals');
        
        if (!user) {
            return sendResponse(res, 404, false, "user not found");
        }

        // Initialize balance fields if they don't exist
        if (user.balance === undefined || user.balance === null) {
            user.balance = 0;
        }
        if (user.totalEarnings === undefined || user.totalEarnings === null) {
            user.totalEarnings = 0;
        }
        if (user.totalWithdrawals === undefined || user.totalWithdrawals === null) {
            user.totalWithdrawals = 0;
        }
        await user.save();

        // Get recent transactions
        const transactions = await Transaction.find({ user: userId })
            .sort({ createdAt: -1 })
            .limit(50)
            .populate('request', 'problemType description');

        console.log(`Wallet for user ${userId}: Balance=${user.balance}, Earnings=${user.totalEarnings}, Withdrawals=${user.totalWithdrawals}`);

        sendResponse(res, 200, true, "wallet retrieved successfully", { 
            balance: user.balance || 0,
            totalEarnings: user.totalEarnings || 0,
            totalWithdrawals: user.totalWithdrawals || 0,
            transactions 
        });
    } catch (error) {
        console.error('Error getting wallet:', error);
        sendResponse(res, 500, false, "server error");
    }
};

// Request withdrawal
exports.requestWithdrawal = async (req, res) => {
    try {
        const userId = req.userId;
        const { amount, method, accountInfo } = req.body;
        const Transaction = require('../models/transactionModel');
        
        if (!userId) {
            return sendResponse(res, 401, false, "unauthorized");
        }

        if (!amount || amount <= 0) {
            return sendResponse(res, 400, false, "invalid withdrawal amount");
        }

        if (!method || !['bank_transfer', 'paypal', 'cash', 'other'].includes(method)) {
            return sendResponse(res, 400, false, "invalid withdrawal method");
        }

        const user = await User.findById(userId);
        
        if (!user) {
            return sendResponse(res, 404, false, "user not found");
        }

        if (user.balance < amount) {
            return sendResponse(res, 400, false, "insufficient balance");
        }

        // Minimum withdrawal amount
        if (amount < 10) {
            return sendResponse(res, 400, false, "minimum withdrawal amount is 10 ILS");
        }

        // Create withdrawal transaction
        const balanceBefore = user.balance;
        user.balance -= amount;
        user.totalWithdrawals += amount;
        
        await user.save();

        const transaction = await Transaction.create({
            user: userId,
            type: 'withdrawal',
            amount: -amount,
            balanceBefore,
            balanceAfter: user.balance,
            description: `Withdrawal request via ${method}`,
            status: 'pending',
            withdrawalDetails: {
                method,
                accountInfo: accountInfo || '',
                processedAt: null
            }
        });

        sendResponse(res, 200, true, "withdrawal request submitted successfully", { 
            transaction,
            newBalance: user.balance 
        });
    } catch (error) {
        console.error('Error requesting withdrawal:', error);
        sendResponse(res, 500, false, "server error");
    }
};