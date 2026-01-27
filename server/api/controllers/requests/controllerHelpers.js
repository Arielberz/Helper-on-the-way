/*
  קובץ זה אחראי על:
  - פונקציות עזר לקונטרולר הבקשות
  - וולידציות ובדיקות משותפות
  - לוגיקה נוספת לעיבוד בקשות

  הקובץ משמש את:
  - requestsController.js

  הקובץ אינו:
  - מטפל בבקשות HTTP - זה בקונטרולר עצמו
*/

function sendSuccess(res, statusCode, payload) {
  res.status(statusCode).json({
    success: true,
    ...payload
  });
}

function sendError(res, err, fallbackMessage = 'Server error') {
  const status = err.status || 500;
  const message = err.message || fallbackMessage;
  
  console.error(`Error in controller: ${message}`, err);
  
  const response = {
    success: false,
    message,
    error: err.message
  };
  
  if (err.existingRequestId) {
    response.existingRequestId = err.existingRequestId;
  }
  if (err.osrmResponse) {
    response.osrmResponse = err.osrmResponse;
  }
  
  res.status(status).json(response);
}

function sendUnauthorized(res, message = 'No user in request (missing or invalid token)') {
  res.status(401).json({
    success: false,
    message
  });
}

function sendNotFound(res, message = 'Request not found') {
  res.status(404).json({
    success: false,
    message
  });
}

function sendForbidden(res, message = 'Forbidden') {
  res.status(403).json({
    success: false,
    message
  });
}

function sendBadRequest(res, message) {
  res.status(400).json({
    success: false,
    message
  });
}

function emitToUser(io, userId, event, payload) {
  if (!io) {
    console.warn(`⚠️ Socket.IO not available, skipping ${event} to user ${userId}`);
    return;
  }
  
  try {
    io.to(`user:${String(userId)}`).emit(event, payload);
  } catch (err) {
    console.warn(`⚠️ Failed to emit ${event} to user ${userId}:`, err.message);
  }
}

function broadcastEvent(io, event, payload) {
  if (!io) {
    console.warn(`⚠️ Socket.IO not available, skipping broadcast ${event}`);
    return;
  }
  
  try {
    io.emit(event, payload);
  } catch (err) {
    console.warn(`⚠️ Failed to broadcast ${event}:`, err.message);
  }
}

function broadcastRequestUpdate(io, sanitizedRequest) {
  broadcastEvent(io, 'requestUpdated', sanitizedRequest);
}

function broadcastRequestAdded(io, sanitizedRequest) {
  broadcastEvent(io, 'requestAdded', sanitizedRequest);
}

function broadcastRequestDeleted(io, result) {
  broadcastEvent(io, 'requestDeleted', result);
}

function notifyHelperRequest(io, userId, payload) {
  emitToUser(io, userId, 'helperRequestReceived', payload);
}

function notifyHelperConfirmed(io, helperId, payload) {
  emitToUser(io, helperId, 'helperConfirmed', payload);
}

function notifyHelperCancelled(io, userId, payload) {
  emitToUser(io, userId, 'helperCancelled', payload);
}

function notifyRequestCancelled(io, helperId, payload) {
  emitToUser(io, helperId, 'requestCancelled', payload);
}

function notifyETAUpdate(io, userId, etaPayload) {
  emitToUser(io, userId, 'etaUpdated', etaPayload);
}

module.exports = {
  sendSuccess,
  sendError,
  sendUnauthorized,
  sendNotFound,
  sendForbidden,
  sendBadRequest,
  
  emitToUser,
  broadcastEvent,
  broadcastRequestUpdate,
  broadcastRequestAdded,
  broadcastRequestDeleted,
  notifyHelperRequest,
  notifyHelperConfirmed,
  notifyHelperCancelled,
  notifyRequestCancelled,
  notifyETAUpdate
};
