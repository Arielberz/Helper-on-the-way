const Request = require('../models/requestsModel');
const REQUEST_STATUS = require('../constants/requestStatus');

/**
 * Service to handle background cleanup tasks
 */

// Configuration
const EXPIRATION_HOURS = 5;
const CLEANUP_INTERVAL_MS = 60 * 60 * 1000; // Run every hour

/**
 * Find and delete requests that have been active for too long
 * @param {Object} io - Socket.IO instance for broadcasting
 */
const cleanupExpiredRequests = async (io) => {
  try {
    console.info('🧹 Starting cleanup of expired requests...');
    
    // Calculate cutoff time
    const cutoffDate = new Date();
    cutoffDate.setHours(cutoffDate.getHours() - EXPIRATION_HOURS);
    
    // Find requests that are active and older than cutoff
    const query = {
      status: { 
        $in: [
          REQUEST_STATUS.PENDING, 
          REQUEST_STATUS.ASSIGNED, 
          REQUEST_STATUS.IN_PROGRESS
        ] 
      },
      createdAt: { $lt: cutoffDate }
    };
    
    const expiredRequests = await Request.find(query);
    
    if (expiredRequests.length === 0) {
      console.info('✨ No expired requests found.');
      return;
    }
    
    console.info(`Found ${expiredRequests.length} expired requests. Deleting...`);
    
    let deletedCount = 0;
    
    for (const request of expiredRequests) {
      try {
        await Request.findByIdAndDelete(request._id);
        deletedCount++;
        
        // Broadcast deletion so clients remove it from map immediately
        if (io) {
          io.emit('requestDeleted', { _id: String(request._id) });
        }
      } catch (err) {
        console.error(`Failed to delete expired request ${request._id}:`, err.message);
      }
    }
    
    console.info(`✅ Cleanup complete. Deleted ${deletedCount} expired requests.`);
    
  } catch (err) {
    console.error('❌ Error during request cleanup:', err);
  }
};

/**
 * Initialize the cleanup job
 * @param {Object} io - Socket.IO instance
 */
const initCleanupJob = (io) => {
  // Run immediately on startup
  cleanupExpiredRequests(io);
  
  // Schedule periodic runs
  setInterval(() => {
    cleanupExpiredRequests(io);
  }, CLEANUP_INTERVAL_MS);
  
  console.info(`🕒 Request cleanup job scheduled (Interval: ${CLEANUP_INTERVAL_MS / 1000 / 60}m, Expiration: ${EXPIRATION_HOURS}h)`);
};

module.exports = {
  initCleanupJob,
  cleanupExpiredRequests // Exported for testing if needed
};
