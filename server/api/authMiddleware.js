const verifyToken = require('./utils/verifyToken');

const authMiddleware = async (req, res, next) => {
    try {
        const rawToken = req.header('Authorization') || '';
        const { decoded, userId } = verifyToken(rawToken);
        
        // Attach decoded token and userId to request
        req.user = decoded;
        req.userId = userId;

        next();
    } catch (error) {
        // Handle NO_TOKEN error
        if (error.code === 'NO_TOKEN') {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.',
                data: null
            });
        }
        
        // Handle JWT-specific errors
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
        
        // Generic server error
        console.error('Authentication error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error during authentication.',
            data: null,
            error: error.message
        });
    }
};

module.exports = authMiddleware;
