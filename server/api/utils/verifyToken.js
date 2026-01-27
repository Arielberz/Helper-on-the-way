/*
  קובץ זה אחראי על:
  - פונקציית עזר לאימות JWT tokens
  - חילוץ טוקן מכותרת Authorization
  - בדיקת תקפות וחתימה
  - טיפול בשגיאות אימות

  הקובץ משמש את:
  - authMiddleware.js
  - chatSockets.js

  הקובץ אינו:
  - מייצר טוכנים - זה ב-usersService
*/

const jwt = require('jsonwebtoken');

function verifyToken(rawToken) {
  if (!rawToken) {
    const err = new Error('No token provided');
    err.code = 'NO_TOKEN';
    throw err;
  }

  const token = rawToken.replace(/^Bearer\s+/i, '');
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const userId = decoded.userId || decoded.id;
    
    return { decoded, userId };
  } catch (error) {
    console.error('Token verification failed:', {
      error: error.message,
      tokenPreview: token.substring(0, 20) + '...',
      secretExists: !!process.env.JWT_SECRET
    });
    throw error;
  }
}

module.exports = verifyToken;
