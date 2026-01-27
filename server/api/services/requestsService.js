/*
  קובץ זה אחראי על:
  - לוגיקה עסקית של בקשות סיוע: יצירה, עדכון, שיוך
  - שאילות מורכבות למסד הנתונים
  - חיפוש גיאוגרפי של בקשות קרובות
  - ניהול מחזור חיים של בקשות
  - חישובי ETA ומרחקים

  הקובץ משמש את:
  - requestsController.js
  - chatService.js (ליצירת שיחות)

  הקובץ אינו:
  - מטפל בבקשות HTTP - זה בקונטרולר
*/

const Request = require('../models/requestsModel');
const REQUEST_STATUS = require('../constants/requestStatus');
const { calculateETAWithDistance } = require('../utils/etaUtils');
const { calculateCommission, getCommissionRatePercentage } = require('../utils/commissionUtils');
const { getRouteGeoJSON } = require('./routingService');

function sanitizeRequest(reqDoc) {
  if (!reqDoc) return null;
  const user = reqDoc.user || null;
  const helper = reqDoc.helper || null;
  const normalizeUser = (u) => {
    if (!u) return null;
    if (typeof u === 'string') return { _id: u };
    if (u._id && u.username !== undefined) return { _id: String(u._id), username: u.username };
    return { _id: String(u._id || u) };
  };
  return {
    _id: String(reqDoc._id),
    location: reqDoc.location ? { lat: reqDoc.location.lat, lng: reqDoc.location.lng } : null,
    problemType: reqDoc.problemType,
    description: reqDoc.description,
    photos: reqDoc.photos || [],
    payment: reqDoc.payment || null,
    status: reqDoc.status,
    user: normalizeUser(user),
    helper: normalizeUser(helper),
    createdAt: reqDoc.createdAt,
    updatedAt: reqDoc.updatedAt,
  };
}

async function createRequest(userId, data) {
  const { location, problemType, description, photos, offeredAmount, currency } = data;

  if (!location || typeof location.lat !== 'number' || typeof location.lng !== 'number') {
    throw { status: 400, message: 'Valid location (lat, lng) is required' };
  }

  if (!problemType) {
    throw { status: 400, message: 'Problem type is required' };
  }

  if (!description || description.trim() === '') {
    throw { status: 400, message: 'Description is required' };
  }

  const existingOpenRequest = await Request.findOne({
    user: userId,
    status: { $in: [REQUEST_STATUS.PENDING, REQUEST_STATUS.ASSIGNED] }
  });

  if (existingOpenRequest) {
    throw {
      status: 400,
      message: 'You already have an open request. Please complete or cancel it before creating a new one.',
      existingRequestId: existingOpenRequest._id
    };
  }

  if (offeredAmount !== undefined && (typeof offeredAmount !== 'number' || offeredAmount < 0)) {
    throw { status: 400, message: 'Offered amount must be a positive number' };
  }

  const requestData = {
    user: userId,
    location: {
      lat: location.lat,
      lng: location.lng,
      address: location.address || ''
    },
    problemType,
    description,
    photos: photos || [],
    status: REQUEST_STATUS.PENDING
  };

  if (offeredAmount !== undefined && offeredAmount > 0) {
    requestData.payment = {
      offeredAmount,
      currency: currency || 'ILS',
      isPaid: false
    };
  }

  const request = await Request.create(requestData);
  const populatedRequest = await Request.findById(request._id)
    .populate('user', 'username email phone avatar');

  return { request: populatedRequest, sanitized: sanitizeRequest(populatedRequest) };
}

/**
 * Get requests with filters
 * @param {Object} filters - Query filters
 * @returns {Promise<Array>} Requests
 */
async function getRequests(filters = {}) {
  const { status, problemType, userId, helperId, limit = 100 } = filters;
  
  const filter = {};
  if (status) filter.status = status;
  if (problemType) filter.problemType = problemType;
  if (userId) filter.user = userId;
  if (helperId) filter.helper = helperId;

  const requests = await Request.find(filter)
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .populate('user', 'username email phone avatar')
    .populate('helper', 'username email phone avatar');

  return requests;
}

/**
 * Get active/pending requests for real-time map
 * @returns {Promise<Array>} Active requests with commission info
 */
async function getActiveRequests() {
  const requests = await Request.find({
    status: { $in: [REQUEST_STATUS.PENDING, REQUEST_STATUS.ASSIGNED, REQUEST_STATUS.IN_PROGRESS] }
  })
    .populate('user', 'username phone avatar')
    .populate('helper', 'username phone averageRating ratingCount avatar')
    .populate('pendingHelpers.user', 'username email phone averageRating ratingCount avatar')
    .sort({ createdAt: -1 })
    .limit(200);

  const requestsWithCommission = requests.map(request => {
    const requestObj = request.toObject();
    if (requestObj.payment?.offeredAmount > 0) {
      const { commissionAmount, helperAmount } = calculateCommission(requestObj.payment.offeredAmount);
      requestObj.payment.commissionAmount = commissionAmount;
      requestObj.payment.helperAmount = helperAmount;
    }
    return requestObj;
  });

  return requestsWithCommission;
}

/**
 * Get user's own requests
 * @param {string} userId - User ID
 * @returns {Promise<Array>} User's requests
 */
async function getMyRequests(userId) {
  const requests = await Request.find({ user: userId })
    .sort({ createdAt: -1 })
    .populate('user', 'username email phone avatar')
    .populate('helper', 'username email phone avatar')
    .populate('pendingHelpers.user', 'username averageRating ratingCount avatar');

  return requests;
}

/**
 * Get request by ID with optional ownership check
 * @param {string} requestId - Request ID
 * @param {string} userId - User ID for ownership check (optional)
 * @param {boolean} requireOwnership - Throw if not owner (default: false)
 * @returns {Promise<Object>} Request
 */
async function getRequestById(requestId, userId, requireOwnership = false) {
  const request = await Request.findById(requestId)
    .populate('user', 'username email phone avatar')
    .populate('helper', 'username email phone averageRating ratingCount avatar')
    .populate('pendingHelpers.user', 'username email phone averageRating ratingCount avatar');

  if (!request) {
    throw { status: 404, message: 'Request not found' };
  }

  if (requireOwnership && userId && request.user._id.toString() !== userId) {
    throw { status: 403, message: 'Unauthorized: Not your request' };
  }

  return request;
}

/* =========================
   HELPERS & STATUS FLOW
   ========================= */

/**
 * Request help (helper volunteers)
 * @param {string} requestId - Request ID
 * @param {string} helperId - Helper user ID
 * @param {Object} data - Optional message and location
 * @returns {Promise<Object>} Updated request
 */
async function requestHelp(requestId, helperId, data = {}) {
  const request = await Request.findById(requestId)
    .populate('user', 'username email phone avatar')
    .populate('helper', 'username email phone avatar');

  if (!request) {
    throw { status: 404, message: 'Request not found' };
  }

  if (request.status !== REQUEST_STATUS.PENDING) {
    throw { status: 400, message: 'Request is no longer available' };
  }

  if (request.helper) {
    throw { status: 400, message: 'Helper already assigned' };
  }

  if (request.user._id.toString() === helperId) {
    throw { status: 400, message: 'You cannot help your own request' };
  }

  request.helper = helperId;
  request.status = REQUEST_STATUS.ASSIGNED;
  await request.save();

  const populatedRequest = await Request.findById(request._id)
    .populate('user', 'username email phone avatar')
    .populate('helper', 'username email phone avatar');

  return { request: populatedRequest, sanitized: sanitizeRequest(populatedRequest) };
}

/**
 * Confirm helper (requester confirms)
 * @param {string} requestId - Request ID
 * @param {string} userId - Requester user ID
 * @returns {Promise<Object>} Updated request
 */
async function confirmHelper(requestId, userId) {
  const request = await Request.findById(requestId)
    .populate('user', 'username email phone avatar')
    .populate('helper', 'username email phone avatar');

  if (!request) {
    throw { status: 404, message: 'Request not found' };
  }

  if (request.user._id.toString() !== userId) {
    throw { status: 403, message: 'Only requester can confirm helper' };
  }

  if (!request.helper) {
    throw { status: 400, message: 'No helper assigned yet' };
  }

  if (request.status === REQUEST_STATUS.IN_PROGRESS) {
    throw { status: 400, message: 'Request already in progress' };
  }

  request.status = REQUEST_STATUS.IN_PROGRESS;
  await request.save();

  const populatedRequest = await Request.findById(request._id)
    .populate('user', 'username email phone avatar')
    .populate('helper', 'username email phone avatar');

  return { request: populatedRequest, sanitized: sanitizeRequest(populatedRequest) };
}

/**
 * Update request status with validation
 * @param {string} requestId - Request ID
 * @param {string} userId - User ID
 * @param {Object} data - Status and optional reason
 * @returns {Promise<Object>} Updated request
 */
async function updateRequestStatus(requestId, userId, data) {
  const { status, reason } = data;

  const request = await Request.findById(requestId)
    .populate('user', 'username email phone avatar')
    .populate('helper', 'username email phone avatar');

  if (!request) {
    throw { status: 404, message: 'Request not found' };
  }

  const isRequester = request.user._id.toString() === userId;
  const isHelper = request.helper && request.helper._id.toString() === userId;

  if (!isRequester && !isHelper) {
    throw { status: 403, message: 'Unauthorized: Only requester or helper can update status' };
  }

  const validTransitions = {
    [REQUEST_STATUS.PENDING]: [REQUEST_STATUS.ASSIGNED, REQUEST_STATUS.CANCELLED],
    [REQUEST_STATUS.ASSIGNED]: [REQUEST_STATUS.IN_PROGRESS, REQUEST_STATUS.CANCELLED],
    [REQUEST_STATUS.IN_PROGRESS]: [REQUEST_STATUS.COMPLETED, REQUEST_STATUS.CANCELLED],
    [REQUEST_STATUS.COMPLETED]: [],
    [REQUEST_STATUS.CANCELLED]: []
  };

  const allowedStatuses = validTransitions[request.status] || [];
  if (!allowedStatuses.includes(status)) {
    throw { status: 400, message: `Cannot transition from ${request.status} to ${status}` };
  }

  request.status = status;
  if (reason) request.reason = reason;
  await request.save();

  const populatedRequest = await Request.findById(request._id)
    .populate('user', 'username email phone avatar')
    .populate('helper', 'username email phone avatar');

  return { request: populatedRequest, sanitized: sanitizeRequest(populatedRequest) };
}

/**
 * Cancel help (helper withdraws)
 * @param {string} requestId - Request ID
 * @param {string} helperId - Helper user ID
 * @returns {Promise<Object>} Updated request
 */
async function cancelHelp(requestId, helperId) {
  const request = await Request.findById(requestId)
    .populate('user', 'username email phone avatar')
    .populate('helper', 'username email phone avatar');

  if (!request) {
    throw { status: 404, message: 'Request not found' };
  }

  if (!request.helper || request.helper._id.toString() !== helperId) {
    throw { status: 403, message: 'You are not the assigned helper' };
  }

  if (request.status === REQUEST_STATUS.IN_PROGRESS) {
    throw { status: 400, message: 'Cannot cancel while in progress' };
  }

  request.helper = null;
  request.status = REQUEST_STATUS.PENDING;
  await request.save();

  const populatedRequest = await Request.findById(request._id)
    .populate('user', 'username email phone avatar');

  return { request: populatedRequest, sanitized: sanitizeRequest(populatedRequest) };
}

/**
 * Cancel request (requester cancels)
 * @param {string} requestId - Request ID
 * @param {string} userId - Requester user ID
 * @returns {Promise<Object>} Updated request with helper ID
 */
async function cancelRequest(requestId, userId) {
  const request = await Request.findById(requestId);

  if (!request) {
    throw { status: 404, message: 'Request not found' };
  }

  if (request.user.toString() !== userId) {
    throw { status: 403, message: 'Only requester can cancel request' };
  }

  if (request.status !== REQUEST_STATUS.PENDING) {
    throw { status: 400, message: 'Can only cancel pending requests' };
  }

  request.status = REQUEST_STATUS.CANCELLED;
  const helperId = request.helper ? String(request.helper) : null;
  await request.save();

  const populatedRequest = await Request.findById(request._id)
    .populate('user', 'username email phone')
    .populate('helper', 'username email phone averageRating ratingCount');

  return { request: populatedRequest, helperId, sanitized: sanitizeRequest(populatedRequest) };
}

/**
 * Reject helper offer
 * @param {string} requestId - Request ID
 * @param {string} userId - Requester user ID
 * @param {string} helperId - Helper to reject
 * @returns {Promise<Object>} Updated request
 */
async function rejectHelper(requestId, userId, helperId) {
  const request = await Request.findById(requestId)
    .populate('user', 'username email phone avatar')
    .populate('helper', 'username email phone avatar');

  if (!request) {
    throw { status: 404, message: 'Request not found' };
  }

  if (request.user._id.toString() !== userId) {
    throw { status: 403, message: 'Only requester can reject helpers' };
  }

  if (!request.helper || request.helper._id.toString() !== helperId) {
    throw { status: 400, message: 'This helper is not assigned to your request' };
  }

  request.helper = null;
  request.status = REQUEST_STATUS.PENDING;
  await request.save();

  const populatedRequest = await Request.findById(request._id)
    .populate('user', 'username email phone avatar');

  return { request: populatedRequest, sanitized: sanitizeRequest(populatedRequest) };
}

/* =========================
   ASSIGNMENT & ACTIVE STATE
   ========================= */

/**
 * Assign helper (legacy endpoint - adds to pending helpers)
 * @param {string} requestId - Request ID
 * @param {string} helperId - Helper user ID
 * @returns {Promise<Object>} Updated request
 */
async function assignHelper(requestId, helperId) {
  const request = await Request.findById(requestId);

  if (!request) {
    throw { status: 404, message: 'Request not found' };
  }

  if (request.status !== REQUEST_STATUS.PENDING) {
    throw { status: 400, message: 'Request is not available for assignment' };
  }

  const alreadyRequested = request.pendingHelpers.some(
    ph => ph.user.toString() === helperId
  );

  if (alreadyRequested) {
    throw { status: 400, message: 'You have already requested to help with this request' };
  }

  request.pendingHelpers.push({
    user: helperId,
    requestedAt: Date.now()
  });

  await request.save();

  const populatedRequest = await Request.findById(request._id)
    .populate('user', 'username email phone avatar')
    .populate('pendingHelpers.user', 'username email phone averageRating ratingCount avatar');

  return { request: populatedRequest, sanitized: sanitizeRequest(populatedRequest) };
}

/* =========================
   ROUTING & LOCATION
   ========================= */

/**
 * Get driving route between two points
 * @param {Object} coords - Coordinates { lon1, lat1, lon2, lat2 }
 * @returns {Promise<Object>} Route data
 */
async function getRoute(coords) {
  const { lon1, lat1, lon2, lat2 } = coords;

  if (!lon1 || !lat1 || !lon2 || !lat2) {
    throw { status: 400, message: 'All coordinates are required: lon1, lat1, lon2, lat2' };
  }

  for (const [key, value] of Object.entries(coords)) {
    const num = parseFloat(value);
    if (isNaN(num)) {
      throw { status: 400, message: `Invalid ${key}: must be a number` };
    }
  }

  const result = await getRouteGeoJSON(
    parseFloat(lat1),
    parseFloat(lon1),
    parseFloat(lat2),
    parseFloat(lon2)
  );

  if (!result.success) {
    throw { 
      status: 404, 
      message: result.message, 
      osrmResponse: result.osrmResponse 
    };
  }

  return {
    route: result.route,
    waypoints: result.waypoints,
    fullResponse: result.fullResponse
  };
}

/* =========================
   PAYMENTS & WALLET
   ========================= */

/**
 * Update payment information with wallet crediting
 * @param {string} requestId - Request ID
 * @param {string} userId - User ID (requester or helper)
 * @param {Object} paymentData - Payment update data
 * @returns {Promise<Object>} Updated request
 */
async function updatePayment(requestId, userId, paymentData) {
  const { offeredAmount, currency, isPaid, paymentMethod } = paymentData;

  const request = await Request.findById(requestId);

  if (!request) {
    throw { status: 404, message: 'Request not found' };
  }

  if (request.user.toString() !== userId && request.helper?.toString() !== userId) {
    throw { status: 403, message: 'Not authorized to update payment for this request' };
  }

  if (offeredAmount !== undefined) {
    if (typeof offeredAmount !== 'number' || offeredAmount < 0) {
      throw { status: 400, message: 'Offered amount must be a positive number' };
    }
    request.payment.offeredAmount = offeredAmount;
  }

  if (currency) {
    request.payment.currency = currency;
  }

  if (isPaid !== undefined) {
    const wasUnpaid = !request.payment.isPaid;
    request.payment.isPaid = isPaid;
    if (isPaid) {
      request.payment.paidAt = Date.now();
      
      if (wasUnpaid && request.helper && request.payment.offeredAmount > 0) {
        try {
          const User = require('../models/userModel');
          const Transaction = require('../models/transactionModel');
          
          const { commissionAmount, helperAmount } = calculateCommission(request.payment.offeredAmount);
          
          const helper = await User.findById(request.helper);
          if (helper) {
            const balanceBefore = helper.balance || 0;
            helper.balance = (helper.balance || 0) + helperAmount;
            helper.totalEarnings = (helper.totalEarnings || 0) + helperAmount;
            await helper.save();
            
            await Transaction.create({
              user: helper._id,
              type: 'earning',
              amount: helperAmount,
              balanceBefore,
              balanceAfter: helper.balance,
              currency: request.payment.currency || 'ILS',
              description: `Payment received for helping with ${request.problemType}`,
              request: request._id,
              status: 'completed',
              commission: {
                amount: commissionAmount,
                rate: getCommissionRatePercentage()
              }
            });
          }
        } catch (walletError) {
          console.error('Error crediting helper wallet:', walletError);
        }
      }
    }
  }

  if (paymentMethod) {
    request.payment.paymentMethod = paymentMethod;
  }

  await request.save();

  const populatedRequest = await Request.findById(request._id)
    .populate('user', 'username email phone avatar')
    .populate('helper', 'username email phone avatar');

  return { request: populatedRequest, sanitized: sanitizeRequest(populatedRequest) };
}

/* =========================
   MEDIA / PHOTOS
   ========================= */

/**
 * Add photos to a request
 * @param {string} requestId - Request ID
 * @param {string} userId - User ID (must be owner)
 * @param {Array} photos - Array of photo URLs
 * @returns {Promise<Object>} Updated request
 */
async function addPhotos(requestId, userId, photos) {
  if (!photos || !Array.isArray(photos) || photos.length === 0) {
    throw { status: 400, message: 'Photos array is required' };
  }

  const request = await Request.findById(requestId);

  if (!request) {
    throw { status: 404, message: 'Request not found' };
  }

  if (request.user.toString() !== userId) {
    throw { status: 403, message: 'Not authorized to update this request' };
  }

  const newPhotos = photos.map(url => ({
    url,
    uploadedAt: Date.now()
  }));

  request.photos.push(...newPhotos);
  await request.save();

  const minimal = await Request.findById(request._id)
    .populate('user', 'username')
    .populate('helper', 'username');

  return { request, sanitized: sanitizeRequest(minimal || request) };
}

/* =========================
   UPDATE & DELETE
   ========================= */

/**
 * General update for a request
 * @param {string} requestId - Request ID
 * @param {string} userId - User ID (must be owner or helper)
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated request
 */
async function updateRequest(requestId, userId, updates) {
  const request = await Request.findById(requestId);

  if (!request) {
    throw { status: 404, message: 'Request not found' };
  }

  const isOwner = request.user.toString() === userId;
  const isHelper = request.helper && request.helper.toString() === userId;
  
  if (!isOwner && !isHelper) {
    throw { status: 403, message: 'Not authorized to update this request' };
  }

  if (updates && updates.location && typeof updates.location.lat === 'number' && typeof updates.location.lng === 'number') {
    updates.geo = { type: 'Point', coordinates: [updates.location.lng, updates.location.lat] };
  }

  const updatedRequest = await Request.findByIdAndUpdate(
    requestId,
    { $set: updates },
    { new: true, runValidators: true }
  )
    .populate('user', 'username email phone')
    .populate('helper', 'username email phone');

  return { request: updatedRequest, sanitized: sanitizeRequest(updatedRequest) };
}

/**
 * Delete a request
 * @param {string} requestId - Request ID
 * @param {string} userId - User ID (must be owner)
 * @returns {Promise<Object>} Deletion result
 */
async function deleteRequest(requestId, userId) {
  const request = await Request.findById(requestId);

  if (!request) {
    throw { status: 404, message: 'Request not found' };
  }

  if (request.user.toString() !== userId) {
    throw { status: 403, message: 'Not authorized to delete this request' };
  }

  await Request.findByIdAndDelete(requestId);

  return { _id: String(requestId) };
}

module.exports = {
  sanitizeRequest,
  createRequest,
  getRequests,
  getActiveRequests,
  getMyRequests,
  getRequestById,
  requestHelp,
  confirmHelper,
  updateRequestStatus,
  cancelHelp,
  cancelRequest,
  rejectHelper,
  assignHelper,
  getRoute,
  updatePayment,
  addPhotos,
  updateRequest,
  deleteRequest
};
