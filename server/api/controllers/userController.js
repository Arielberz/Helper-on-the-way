/*
  קובץ זה אחראי על:
  - טיפול בבקשות HTTP למשתמשים: רישום, התחברות, פרופיל
  - אימות אימייל, שחזור סיסמה, עדכון פרופיל
  - העלאת תמונת פרופיל וקבלת מיקום לפי IP
  - קורא לשירות usersService ללוגיקה עסקית

  הקובץ משמש את:
  - נתיב המשתמשים (userRouter)
  - הצד הקליינט לפעולות משתמש

  הקובץ אינו:
  - מגדיר מודלים או נתיבים - זה בקבצים אחרים
  - מבצע פעולות מסד נתונים - זה בשירותים
*/

const sendResponse = require('../utils/sendResponse');
const usersService = require('../services/usersService');
const phoneVerificationService = require('../services/phoneVerificationService');
const User = require('../models/userModel');

exports.register = async (req, res) => {
    try {
        const { username: rawUsername, email: rawEmail, password, phone: rawPhone, termsAccepted } = req.body || {};
        
        const result = await usersService.registerUser({
            rawUsername,
            rawEmail,
            password,
            rawPhone,
            termsAccepted
        });

        sendResponse(res, 201, true, "User registered. Verification email sent. Please check your inbox and enter the code.", result); 
    } catch (error) {
        if (error.statusCode) {
            return sendResponse(res, error.statusCode, false, error.message);
        }
        console.error(error);
        sendResponse(res, 500, false, "server error");
    }};

exports.login = async (req, res) => {
    try {
        const { identifier: rawIdentifier, password } = req.body || {};
        
        const result = await usersService.loginUser({ rawIdentifier, password });

        if (result.setCookie) {
            res.cookie('token', result.token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax'
            });
        }

        sendResponse(res, 200, true, "login successful", { token: result.token, user: result.user });
    } catch (error) {
        if (error.statusCode) {
            const extraData = error.isBlocked ? { isBlocked: true } : null;
            return sendResponse(res, error.statusCode, false, error.message, extraData);
        }
        console.error(error);
        sendResponse(res, 500, false, "server error");
    }
};

exports.verifyEmail = async (req, res) => {
    try {
        const { email: rawEmail, code } = req.body || {};
        
        const result = await usersService.verifyEmail({ rawEmail, code });

        if (result.setCookie) {
            res.cookie('token', result.token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax'
            });
        }
        
        sendResponse(res, 200, true, "email verified successfully", { token: result.token, user: result.user });
    } catch (error) {
        if (error.statusCode) {
            return sendResponse(res, error.statusCode, false, error.message);
        }
        console.error(error);
        sendResponse(res, 500, false, "server error");
    }
};

exports.getMe = async (req, res) => {
    try {
        const result = await usersService.getMyProfile(req.userId);
        
        sendResponse(res, 200, true, "user profile retrieved successfully", result);
    } catch (error) {
        if (error.statusCode) {
            return sendResponse(res, error.statusCode, false, error.message);
        }
        console.error('Error getting user profile:', error);
        sendResponse(res, 500, false, "server error");
    }
};

exports.getLocationFromIP = async (req, res) => {
    try {
        const result = await usersService.getLocationFromIP(req);
        
        sendResponse(res, 200, true, "location retrieved successfully", result);
    } catch (error) {
        console.error('Final IP geolocation error:', error);
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
        const { avatar } = req.body;
        
        const result = await usersService.uploadAvatar(req.userId, avatar);

        sendResponse(res, 200, true, "avatar uploaded successfully", result);
    } catch (error) {
        if (error.statusCode) {
            return sendResponse(res, error.statusCode, false, error.message);
        }
        console.error('Error uploading avatar:', error);
        sendResponse(res, 500, false, "server error");
    }
};

exports.deleteAvatar = async (req, res) => {
    try {
        const result = await usersService.deleteAvatar(req.userId);

        sendResponse(res, 200, true, "avatar deleted successfully", result);
    } catch (error) {
        if (error.statusCode) {
            return sendResponse(res, error.statusCode, false, error.message);
        }
        console.error('Error deleting avatar:', error);
        sendResponse(res, 500, false, "server error");
    }
};

exports.getWallet = async (req, res) => {
    try {
        const result = await usersService.getWallet(req.userId);

        sendResponse(res, 200, true, "wallet retrieved successfully", result);
    } catch (error) {
        if (error.statusCode) {
            return sendResponse(res, error.statusCode, false, error.message);
        }
        console.error('Error requesting withdrawal:', error);
        sendResponse(res, 500, false, "server error");
    }
};

/**
 * Forgot Password - sends a password reset email
 */
exports.forgotPassword = async (req, res) => {
    try {
        const { email: rawEmail } = req.body || {};
        
        const result = await usersService.forgotPassword(rawEmail);
        
        sendResponse(res, 200, true, result.message);
    } catch (error) {
        if (error.statusCode) {
            return sendResponse(res, error.statusCode, false, error.message);
        }
        console.error('Error in forgotPassword:', error);
        sendResponse(res, 500, false, "server error");
    }
};

/**
 * Reset Password - validates token and updates password
 */
exports.resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body || {};
        
        const result = await usersService.resetPassword({ token, newPassword });
        
        sendResponse(res, 200, true, result.message);
    } catch (error) {
        if (error.statusCode) {
            return sendResponse(res, error.statusCode, false, error.message);
        }
        console.error('Error in resetPassword:', error);
        sendResponse(res, 500, false, "server error");
    }
};

exports.requestWithdrawal = async (req, res) => {
    try {
        const { amount, method, accountInfo } = req.body;
        
        const result = await usersService.requestWithdrawal(req.userId, { amount, method, accountInfo });

        sendResponse(res, 200, true, "withdrawal request submitted successfully", result);
    } catch (error) {
        if (error.statusCode) {
            return sendResponse(res, error.statusCode, false, error.message);
        }
        console.error('Error requesting withdrawal:', error);
        sendResponse(res, 500, false, "server error");
    }
};

exports.startPhoneVerification = async (req, res) => {
    try {
        const { phone: rawPhone } = req.body || {};
        const userId = req.userId;

        console.log('📱 [Phone Verification Controller] Starting verification for user:', userId);

        if (!userId) {
            console.warn('⚠️ [Phone Verification Controller] Unauthorized - no user ID');
            return sendResponse(res, 401, false, "Unauthorized");
        }

        if (!rawPhone) {
            console.warn('⚠️ [Phone Verification Controller] Phone number is required');
            return sendResponse(res, 400, false, "Phone number is required");
        }

        // Find the user to verify they own this phone number
        const user = await User.findById(userId);
        if (!user) {
            console.warn('⚠️ [Phone Verification Controller] User not found:', userId);
            return sendResponse(res, 404, false, "User not found");
        }

        // Normalize and validate phone
        const normalizedPhone = String(rawPhone || '').trim();
        console.log('📝 [Phone Verification Controller] User phone:', user.phone, 'Provided:', normalizedPhone);
        
        if (normalizedPhone !== user.phone) {
            console.warn('⚠️ [Phone Verification Controller] Phone mismatch');
            return sendResponse(res, 400, false, "Phone number does not match your account");
        }

        // If already verified, no need to verify again
        if (user.phoneVerified) {
            console.log('✅ [Phone Verification Controller] Phone already verified for user:', userId);
            return sendResponse(res, 200, true, "Phone already verified", { verified: true });
        }

        // Start SMS verification with Twilio
        console.log('🚀 [Phone Verification Controller] Calling Twilio service...');
        const result = await phoneVerificationService.startPhoneVerification(normalizedPhone);

        console.log('✅ [Phone Verification Controller] Verification started successfully');
        sendResponse(res, 200, true, "Verification code sent to your phone", { 
            status: result.status,
            message: 'Check your SMS for the verification code'
        });
    } catch (error) {
        console.error('❌ [Phone Verification Controller] Error:', error);
        if (error.statusCode) {
            return sendResponse(res, error.statusCode, false, error.message);
        }
        console.error('Error starting phone verification:', error);
        sendResponse(res, 500, false, "server error");
    }
};

exports.checkPhoneVerification = async (req, res) => {
    try {
        const { phone: rawPhone, code } = req.body || {};
        const userId = req.userId;

        console.log('🔍 [Phone Verification Controller] Checking code for user:', userId);

        if (!userId) {
            console.warn('⚠️ [Phone Verification Controller] Unauthorized - no user ID');
            return sendResponse(res, 401, false, "Unauthorized");
        }

        if (!rawPhone || !code) {
            console.warn('⚠️ [Phone Verification Controller] Missing phone or code');
            return sendResponse(res, 400, false, "Phone number and verification code are required");
        }

        // Find the user
        const user = await User.findById(userId);
        if (!user) {
            console.warn('⚠️ [Phone Verification Controller] User not found:', userId);
            return sendResponse(res, 404, false, "User not found");
        }

        // Normalize and validate phone
        const normalizedPhone = String(rawPhone || '').trim();
        if (normalizedPhone !== user.phone) {
            console.warn('⚠️ [Phone Verification Controller] Phone mismatch');
            return sendResponse(res, 400, false, "Phone number does not match your account");
        }

        // If already verified, return success
        if (user.phoneVerified) {
            console.log('✅ [Phone Verification Controller] Phone already verified for user:', userId);
            return sendResponse(res, 200, true, "Phone already verified", { verified: true });
        }

        // Verify the code with Twilio
        console.log('🔐 [Phone Verification Controller] Calling Twilio to verify code...');
        const verificationResult = await phoneVerificationService.checkPhoneVerification(
            normalizedPhone,
            String(code).trim()
        );

        if (verificationResult.verified) {
            console.log('✅ [Phone Verification Controller] Code verified successfully for user:', userId);
            
            // Update user's phone verification status
            user.phoneVerified = true;
            user.phoneVerifiedAt = new Date();
            await user.save();

            console.log('💾 [Phone Verification Controller] User marked as phone verified in database');

            return sendResponse(res, 200, true, "Phone verified successfully", { 
                verified: true,
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    phoneVerified: user.phoneVerified
                }
            });
        }
    } catch (error) {
        console.error('❌ [Phone Verification Controller] Error:', error);
        if (error.statusCode) {
            return sendResponse(res, error.statusCode, false, error.message);
        }
        console.error('Error checking phone verification:', error);
        sendResponse(res, 500, false, "server error");
    }
};