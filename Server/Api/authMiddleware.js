const jwt = require('jsonwebtoken');

const authMiddleware = async (req, res, next) => {
    try {
        
        const token = req.header('Authorization')?.replace('Bearer ', '');

        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

    
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
       
        req.user = decoded;
        req.userId = decoded.userId || decoded.id;

        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token.'
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token has expired.'
            });
        }
        return res.status(500).json({
            success: false,
            message: 'Server error during authentication.',
            error: error.message
        });
    }
};

module.exports = authMiddleware;
