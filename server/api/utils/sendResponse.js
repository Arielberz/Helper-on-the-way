/**
 * Standardized response helper
 * Ensures consistent API response format across all controllers
 * 
 * @param {Object} res - Express response object
 * @param {Number} status - HTTP status code
 * @param {Boolean} success - Whether the operation was successful
 * @param {String} message - Response message
 * @param {*} data - Optional data payload (default: null)
 * @returns {Object} JSON response
 */
function sendResponse(res, status, success, message, data = null) {
  return res.status(status).json({ success, message, data });
}

module.exports = sendResponse;
