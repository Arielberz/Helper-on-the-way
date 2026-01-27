/*
  קובץ זה אחראי על:
  - לוגיקה עסקית של משתמשים: רישום, התחברות, פרופיל
  - ייצור ואימות JWT tokens
  - אימות אימייל, שחזור סיסמה, עדכון פרופיל
  - הצפנת סיסמאות ושליחת אימיילים
  - נירמול נתונים (אימייל, טלפון)

  הקובץ משמש את:
  - userController.js
  - authMiddleware.js לאימות

  הקובץ אינו:
  - מטפל בבקשות HTTP - זה בקונטרולר
  - מגדיר סכימות - זה במודלים
*/

const User = require('../models/userModel');
const Transaction = require('../models/transactionModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
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
    s = s.replace(/[^\d+]/g, '');
    
    if (s.startsWith('05')) {
        s = '+972' + s.substring(1);
    }
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
    return /^[a-z0-9_.]{3,30}$/.test(username);
}

function isValidPhone(phone) {
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
        emailVerified: user.emailVerified || false,
        role: user.role || 'user'
    };
}

async function registerUser(data) {
    const { rawUsername, rawEmail, password, rawPhone, termsAccepted } = data;

    if (!rawUsername || !rawEmail || !password || !rawPhone) {
        throw { statusCode: 400, message: "all fields are required" };
    }
    
    if (!termsAccepted || termsAccepted !== true) {
        throw { statusCode: 400, message: "Must accept Terms & Privacy" };
    }
    
    const username = normalizeUsername(rawUsername);
    const email = normalizeEmail(rawEmail);
    const phone = normalizePhone(rawPhone);

    if (!isValidUsername(username)) {
        throw { statusCode: 400, message: "invalid username format" };
    }
    if (!isValidEmail(email)) {
        throw { statusCode: 400, message: "invalid email format" };
    }
    if (!isValidPhone(phone)) {
        throw { statusCode: 400, message: "invalid phone format" };
    }
    if (String(password).length < 8) {
        throw { statusCode: 400, message: "password must be at least 8 characters" };
    }

    const existingUser = await User.findOne({ $or: [ { email }, { phone } ] });
    if (existingUser) {
        throw { statusCode: 409, message: "email or phone already in use" };
    }

    const saltRounds = Number.parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);
    const hashedPassword = await bcrypt.hash(password, isNaN(saltRounds) ? 10 : saltRounds);

    const newUser = new User({ 
        username, 
        email, 
        password: hashedPassword, 
        phone,
        termsAccepted: true,
        termsAcceptedAt: new Date()
    });
    
    const adminEmail = process.env.ADMIN_EMAIL || 'info.helperontheway@gmail.com';
    if (email === adminEmail.toLowerCase()) {
        newUser.role = 'admin';
    }
    
    const verificationCode = generateCode(6);
    const hashedCode = crypto.createHash('sha256').update(verificationCode).digest('hex');
    
    newUser.emailVerificationCode = hashedCode;
    newUser.emailVerificationExpires = Date.now() + 10 * 60 * 1000;
    newUser.emailVerified = false;
    
    await newUser.save();
    
    try {
        await sendEmail({
            to: email,
            subject: 'Verify your email',
            text: `Your verification code is: ${verificationCode}`,
            html: `<p>Your verification code is: <b>${verificationCode}</b></p>`
        });

    } catch (emailError) {
        console.error('Failed to send verification email:', emailError);
    }

    return { user: sanitizeUser(newUser) };
}

async function loginUser(credentials) {
    const { rawIdentifier, password } = credentials;
    
    if (!rawIdentifier || !password) {
        throw { statusCode: 400, message: "identifier and password are required" };
    }
    
    const identifier = String(rawIdentifier).trim();

    let query = null;
    const idLower = identifier.toLowerCase();
    if (isValidEmail(idLower)) {
        query = { email: idLower };
    } else {
        const normalizedPhone = normalizePhone(identifier);
        if (isValidPhone(normalizedPhone)) {
            query = { phone: normalizedPhone };
        } else {
            throw { statusCode: 400, message: "please use email or phone to login" };
        }
    }

    const user = await User.findOne(query);
    if (!user) {
        throw { statusCode: 400, message: "invalid credentials" };
    }
    
    if (user.isBlocked) {
        throw { 
            statusCode: 403, 
            message: `החשבון שלך נחסם. סיבה: ${user.blockReason || 'הפרת תנאי השימוש'}. אנא צור קשר עם התמיכה למידע נוסף.`,
            isBlocked: true
        };
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw { statusCode: 400, message: "invalid credentials" };
    }
    
    if (!user.emailVerified) {
        throw { statusCode: 403, message: "Please verify your email before logging in. Check your inbox for the verification code." };
    }
    
    if (!process.env.JWT_SECRET) {
        throw { statusCode: 500, message: "server misconfiguration: missing JWT secret" };
    }
    
    const expiresIn = process.env.JWT_EXPIRES_IN || '1h';
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn });

    return { token, user: sanitizeUser(user), setCookie: String(process.env.JWT_COOKIE).toLowerCase() === 'true' };
}

async function verifyEmail(data) {
    const { rawEmail, code } = data;
    
    if (!rawEmail || !code) {
        throw { statusCode: 400, message: "email and code are required" };
    }
    
    const email = normalizeEmail(rawEmail);
    
    const user = await User.findOne({ email });
    
    if (!user || !user.emailVerificationCode) {
        throw { statusCode: 400, message: "verification code not found" };
    }
    
    if (!user.emailVerificationExpires || user.emailVerificationExpires < Date.now()) {
        throw { statusCode: 400, message: "verification code expired" };
    }
    
    const hashedCode = crypto.createHash('sha256').update(code).digest('hex');
    
    if (hashedCode !== user.emailVerificationCode) {
        throw { statusCode: 400, message: "invalid verification code" };
    }
    
    user.emailVerified = true;
    user.emailVerificationCode = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();
    
    if (!process.env.JWT_SECRET) {
        throw { statusCode: 500, message: "server misconfiguration: missing JWT secret" };
    }
    const expiresIn = process.env.JWT_EXPIRES_IN || '1h';
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn });

    return { token, user: sanitizeUser(user), setCookie: String(process.env.JWT_COOKIE).toLowerCase() === 'true' };
}

/* =========================
   PROFILE & ACCOUNT
   ========================= */

async function getMyProfile(userId) {
    if (!userId) {
        throw { statusCode: 401, message: "unauthorized" };
    }

    const user = await User.findById(userId).select('-password');
    
    if (!user) {
        throw { statusCode: 404, message: "user not found" };
    }

    return { user: sanitizeUser(user) };
}

/* =========================
   AVATAR & MEDIA
   ========================= */

async function uploadAvatar(userId, avatarData) {
    if (!userId) {
        throw { statusCode: 401, message: "unauthorized" };
    }

    if (!avatarData) {
        throw { statusCode: 400, message: "avatar data is required" };
    }

    if (!avatarData.startsWith('data:image/')) {
        throw { statusCode: 400, message: "invalid image format" };
    }

    const user = await User.findByIdAndUpdate(
        userId,
        { avatar: avatarData },
        { new: true }
    ).select('-password');

    if (!user) {
        throw { statusCode: 404, message: "user not found" };
    }

    return { user: sanitizeUser(user) };
}

async function deleteAvatar(userId) {
    if (!userId) {
        throw { statusCode: 401, message: "unauthorized" };
    }

    const user = await User.findByIdAndUpdate(
        userId,
        { avatar: null },
        { new: true }
    ).select('-password');

    if (!user) {
        throw { statusCode: 404, message: "user not found" };
    }

    return { user: sanitizeUser(user) };
}

/* =========================
   WALLET & PAYMENTS
   ========================= */

async function getWallet(userId) {
    if (!userId) {
        throw { statusCode: 401, message: "unauthorized" };
    }

    const user = await User.findById(userId).select('balance totalEarnings totalWithdrawals');
    
    if (!user) {
        throw { statusCode: 404, message: "user not found" };
    }

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

    const transactions = await Transaction.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(50)
        .populate('request', 'problemType description');

    return { 
        balance: user.balance || 0,
        totalEarnings: user.totalEarnings || 0,
        totalWithdrawals: user.totalWithdrawals || 0,
        transactions 
    };
}

async function requestWithdrawal(userId, withdrawalData) {
    const { amount, method, accountInfo } = withdrawalData;
    
    if (!userId) {
        throw { statusCode: 401, message: "unauthorized" };
    }

    if (!amount || amount <= 0) {
        throw { statusCode: 400, message: "invalid withdrawal amount" };
    }

    if (!method || !['bank_transfer', 'paypal', 'cash', 'other'].includes(method)) {
        throw { statusCode: 400, message: "invalid withdrawal method" };
    }

    const user = await User.findById(userId);
    
    if (!user) {
        throw { statusCode: 404, message: "user not found" };
    }

    if (user.balance < amount) {
        throw { statusCode: 400, message: "insufficient balance" };
    }

    if (amount < 10) {
        throw { statusCode: 400, message: "minimum withdrawal amount is 10 ILS" };
    }

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

    return { 
        transaction,
        newBalance: user.balance 
    };
}

/* =========================
   PASSWORD RESET
   ========================= */

async function forgotPassword(rawEmail) {
    if (!rawEmail) {
        throw { statusCode: 400, message: "email is required" };
    }
    
    const email = normalizeEmail(rawEmail);
    
    if (!isValidEmail(email)) {
        throw { statusCode: 400, message: "invalid email format" };
    }
    
    const user = await User.findOne({ email });
    
    if (!user) {
        return { message: "If this email exists in our system, a reset link was sent" };
    }
    
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000;
    
    await user.save();
    
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;
    
    try {
        await sendEmail({
            to: email,
            subject: 'Password Reset Request',
            text: `You requested a password reset. Click the link below to reset your password:\n\n${resetUrl}\n\nThis link will expire in 1 hour.\n\nIf you didn't request this, please ignore this email.`,
            html: `
                <p>You requested a password reset.</p>
                <p>Click the link below to reset your password:</p>
                <p><a href="${resetUrl}">${resetUrl}</a></p>
                <p>This link will expire in 1 hour.</p>
                <p>If you didn't request this, please ignore this email.</p>
            `
        });
    } catch (emailError) {
        console.error('Failed to send password reset email:', emailError);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
        throw { statusCode: 500, message: "failed to send reset email" };
    }
    
    return { message: "If this email exists in our system, a reset link was sent" };
}

async function resetPassword(data) {
    const { token, newPassword } = data;
    
    if (!token || !newPassword) {
        throw { statusCode: 400, message: "token and new password are required" };
    }
    
    if (String(newPassword).length < 8) {
        throw { statusCode: 400, message: "password must be at least 8 characters" };
    }
    
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    
    const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!user) {
        throw { statusCode: 400, message: "Invalid or expired token" };
    }
    
    const saltRounds = Number.parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);
    const hashedPassword = await bcrypt.hash(newPassword, isNaN(saltRounds) ? 10 : saltRounds);
    
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    
    await user.save();
    
    return { message: "Password has been reset successfully" };
}

/* =========================
   GEOLOCATION
   ========================= */

async function getLocationFromIP(req) {
    const isPrivateIP = (ip) => {
        return ip === '::1' || 
               ip === '127.0.0.1' || 
               ip.includes('localhost') ||
               ip.startsWith('10.') || 
               ip.startsWith('192.168.') || 
               (ip.startsWith('172.') && parseInt(ip.split('.')[1], 10) >= 16 && parseInt(ip.split('.')[1], 10) <= 31);
    };

    let clientIP = req.headers['x-forwarded-for']?.split(',')[0].trim() 
                  || req.socket.remoteAddress 
                  || req.ip;
    
    if (clientIP && clientIP.startsWith('::ffff:')) {
        clientIP = clientIP.replace('::ffff:', '');
    }

    const fetch = (await import('node-fetch')).default;
    
    const useAutoDetect = !clientIP || isPrivateIP(clientIP);

    try {
        const primaryUrl = useAutoDetect 
            ? 'https://ipapi.co/json/' 
            : `https://ipapi.co/${clientIP}/json/`;
            

        const response = await fetch(primaryUrl);
        
        if (response.ok) {
            const data = await response.json();
            
            if (!data.error && data.latitude && data.longitude) {
                return {
                    latitude: data.latitude,
                    longitude: data.longitude,
                    city: data.city || 'Unknown',
                    country: data.country_name || 'Unknown',
                    ip: data.ip || clientIP,
                    source: 'primary'
                };
            }
        }
        console.warn('Primary API failed or returned invalid data, trying fallback...');
    } catch (primaryError) {
        console.error('Primary API error:', primaryError.message);
    }

    try {
        const fallbackUrl = useAutoDetect
            ? 'http://ip-api.com/json/'
            : `http://ip-api.com/json/${clientIP}`;
            

        const response = await fetch(fallbackUrl);
        
        if (response.ok) {
            const data = await response.json();
            
            if (data.status === 'success') {
                return {
                    latitude: data.lat,
                    longitude: data.lon,
                    city: data.city || 'Unknown',
                    country: data.country || 'Unknown',
                    ip: data.query || clientIP,
                    source: 'fallback'
                };
            }
        }
    } catch (fallbackError) {
        console.error('Fallback API error:', fallbackError.message);
    }

    throw new Error('All geolocation services failed');
}

module.exports = {
    registerUser,
    loginUser,
    verifyEmail,
    getMyProfile,
    uploadAvatar,
    deleteAvatar,
    getWallet,
    requestWithdrawal,
    forgotPassword,
    resetPassword,
    getLocationFromIP
};
