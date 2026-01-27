/*
  קובץ זה אחראי על:
  - אימות טוקן JWT בכל בקשה מוגנת
  - בדיקת תקפות המשתמש וסטטוס החסימה שלו
  - הוספת פרטי המשתמש לאובייקט הבקשה (req.user, req.userId)

  הקובץ משמש את:
  - כל הנתיבים שדורשים אימות (routers)
  - נתיבי פרופיל, בקשות, צ'אט, תשלומים ודירוגים

  הקובץ אינו:
  - יוצר או מנפיק טוכנים חדשים - זה נעשה בשירות המשתמשים
  - מטפל בתהליכי רישום או התחברות
*/

const verifyToken = require('./utils/verifyToken');
const User = require('./models/userModel');

const authMiddleware = async (req, res, next) => {
    try {
        const rawToken = req.header('Authorization') || '';
        const { decoded, userId } = verifyToken(rawToken);
        
        req.user = decoded;
        req.userId = userId;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found.',
                data: null
            });
        }

        if (user.isBlocked) {
            return res.status(403).json({
                success: false,
                message: 'החשבון שלך נחסם. אנא צור קשר עם התמיכה למידע נוסף.',
                data: null,
                isBlocked: true,
                blockReason: user.blockReason
            });
        }

        next();
    } catch (error) {
        if (error.code === 'NO_TOKEN') {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.',
                data: null
            });
        }
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token.',
                data: null
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token has expired.',
                data: null
            });
        }
        
        console.error('Authentication error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error during authentication.',
            data: null,
            error: error.message
        });
    }
};

const adminOnly = async (req, res, next) => {
    try {
        if (!req.userId) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required.',
                data: null
            });
        }

        const user = await User.findById(req.userId);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found.',
                data: null
            });
        }

        if (user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin privileges required.',
                data: null
            });
        }

        next();
    } catch (error) {
        console.error('Admin authorization error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error during authorization.',
            data: null,
            error: error.message
        });
    }
};

module.exports = authMiddleware;
module.exports.adminOnly = adminOnly;
