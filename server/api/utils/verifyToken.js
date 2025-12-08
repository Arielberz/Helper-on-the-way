/**
 * Shared JWT token verification utility
 * Extracts and verifies JWT tokens for both HTTP and Socket.IO contexts
 * 
 * @param {String} rawToken - The raw token (may include "Bearer " prefix)
 * @returns {Object} { decoded, userId } - Decoded token and extracted userId
 * @throws {Error} With code property for error handling
 */
const jwt = require('jsonwebtoken');

function verifyToken(rawToken) {
  if (!rawToken) {
    const err = new Error('No token provided');
    err.code = 'NO_TOKEN';
    throw err;
  }

  // Remove "Bearer " prefix if present (case-insensitive)
  const token = rawToken.replace(/^Bearer\s+/i, '');
  
  try {
    // Verify token and decode payload
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Extract userId from either userId or id field (handle both patterns)
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
