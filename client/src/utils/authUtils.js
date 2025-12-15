// Secure authentication utilities for localStorage management

/**
 * Securely store authentication data
 * Only stores token and userId - fetch other data from server when needed
 * @param {string} token - JWT token
 * @param {object} user - User object
 */
export const setAuthData = (token, user) => {
  try {
    if (!token || !user) {
      throw new Error('Token and user data are required');
    }

    // Store ONLY token and userId
    localStorage.setItem('token', token);
    localStorage.setItem('userId', user._id || user.id);
  } catch (error) {
    console.error('Error storing auth data:', error);
    clearAuthData();
  }
};

/**
 * Get stored token
 * @returns {string|null} Token or null if not found
 */
export const getToken = () => {
  try {
    const token = localStorage.getItem('token');
    return token || null;
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

/**
 * Get stored user ID
 * @returns {string|null} User ID or null
 */
export const getUserId = () => {
  try {
    return localStorage.getItem('userId');
  } catch (error) {
    console.error('Error getting userId:', error);
    return null;
  }
};

/**
 * Clear all authentication data
 */
export const clearAuthData = () => {
  try {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    // Clean up legacy keys if they exist
    localStorage.removeItem('user');
    localStorage.removeItem('authTimestamp');
    // Clean up ETA data on logout
    localStorage.removeItem('etaData');
    localStorage.removeItem('etaByRequestId');
  } catch (error) {
    console.error('Error clearing auth data:', error);
  }
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if authenticated
 */
export const isAuthenticated = () => {
  const token = getToken();
  return !!token;
};
