const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

function normalizeEmail(email) {
    return String(email || '').trim().toLowerCase();
}

function normalizeUsername(username) {
    return String(username || '').trim().toLowerCase();
}

function normalizePhone(phone) {
    const s = String(phone || '').trim();
    return s.replace(/[^\d+]/g, '');
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
    // E.164-like: optional +, 8-15 digits total
    return /^\+?[1-9]\d{7,14}$/.test(phone);
}

function sanitizeUser(user) {
    return {
        id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone
    };
}

function sendResponse(res, status, success, message, data = null) {
	res.status(status).json({ success, message, data });
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

        const existingUser = await User.findOne({ $or: [ { username }, { email }, { phone } ] });
        if (existingUser) {
            return sendResponse(res, 409, false, "username, email, or phone already in use");
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
        } else if (isValidPhone(normalizePhone(identifier))) {
            query = { phone: normalizePhone(identifier) };
        } else {
            query = { username: normalizeUsername(identifier) };
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