/*
  קובץ זה אחראי על:
  - טיפול בבקשות HTTP לבקשות סיוע: יצירה, שיוך, עדכון סטטוס
  - שליפת בקשות פעילות, בקשות של משתמש, בקשות קרובות
  - עדכון פרטי תשלום ומחיקת בקשות
  - קורא לשירות requestsService ללוגיקה עסקית

  הקובץ משמש את:
  - נתיב הבקשות (requestsRouter)
  - הצד הקליינט לניהול בקשות סיוע

  הקובץ אינו:
  - מבצע שאילות מסד נתונים - זה בשירותים
  - שולח הודעות Socket.IO - זה ב-sockets
*/

const Request = require('../models/requestsModel');
const User = require('../models/userModel');
const REQUEST_STATUS = require('../constants/requestStatus');
const { calculateETAWithDistance } = require('../utils/etaUtils');
const requestsService = require('../services/requestsService');
const {
  sendSuccess,
  sendError,
  sendUnauthorized,
  sendNotFound,
  sendForbidden,
  sendBadRequest,
  broadcastRequestAdded,
  broadcastRequestUpdate,
  broadcastRequestDeleted,
  notifyHelperRequest,
  notifyHelperConfirmed,
  notifyHelperCancelled,
  notifyRequestCancelled,
  notifyETAUpdate
} = require('./requests/controllerHelpers');

exports.createRequest = async (req, res) => {
  try {
    if (!req.userId) {
      return sendUnauthorized(res);
    }

    // Check phone verification before creating request
    const user = await User.findById(req.userId);
    if (!user) {
      return sendUnauthorized(res);
    }

    if (!user.phoneVerified) {
      return sendForbidden(res, 'Phone verification required', { requirePhoneVerification: true });
    }

    const { request, sanitized } = await requestsService.createRequest(req.userId, req.body);

    sendSuccess(res, 201, { data: request });

    broadcastRequestAdded(req.app.get('io'), sanitized);
  } catch (err) {
    sendError(res, err, 'Server error creating request');
  }
};

exports.getRequests = async (req, res) => {
  try {
    const requests = await requestsService.getRequests(req.query);
    sendSuccess(res, 200, { count: requests.length, data: requests });
  } catch (err) {
    sendError(res, err, 'Server error fetching requests');
  }
};

exports.getActiveRequests = async (req, res) => {
  try {
    const requests = await requestsService.getActiveRequests();
    sendSuccess(res, 200, { count: requests.length, data: requests });
  } catch (err) {
    sendError(res, err, 'Server error fetching active requests');
  }
};

exports.getRequestById = async (req, res) => {
  try {
    const { id } = req.params;
    const request = await requestsService.getRequestById(id);
    sendSuccess(res, 200, { data: request });
  } catch (err) {
    sendError(res, err, 'Server error fetching request');
  }
};

exports.getMyRequests = async (req, res) => {
  try {
    if (!req.userId) {
      return sendUnauthorized(res);
    }

    const requests = await requestsService.getMyRequests(req.userId);
    sendSuccess(res, 200, { count: requests.length, data: requests });
  } catch (err) {
    sendError(res, err, 'Server error fetching user requests');
  }
};

exports.updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, estimatedArrival, helperCompleted, requesterConfirmed } = req.body;
    const userId = req.userId;

    if (!status && helperCompleted !== true && requesterConfirmed !== true) {
      return sendBadRequest(res, 'Status, helperCompleted, or requesterConfirmed is required');
    }

    const request = await Request.findById(id);
    if (!request) {
      return sendNotFound(res);
    }

    const updateData = {};

    if (helperCompleted === true) {
      if (!request.helper || request.helper.toString() !== userId) {
        return sendForbidden(res, 'Only the assigned helper can mark as completed');
      }
      updateData.helperCompletedAt = Date.now();
      updateData.status = REQUEST_STATUS.ASSIGNED;

    }

    if (requesterConfirmed === true) {
      if (request.user.toString() !== userId) {
        return sendForbidden(res, 'Only the requester can confirm completion');
      }
      if (!request.helperCompletedAt) {
        return sendBadRequest(res, 'Helper must mark as completed first');
      }
      updateData.requesterConfirmedAt = Date.now();
      
      if (request.payment && request.payment.isPaid) {
        updateData.status = REQUEST_STATUS.COMPLETED;
        updateData.completedAt = Date.now();

      } else {
        updateData.status = REQUEST_STATUS.CONFIRMED;

      }
    }

    if (status) {
      const validStatuses = [
        REQUEST_STATUS.PENDING,
        REQUEST_STATUS.ASSIGNED,
        REQUEST_STATUS.IN_PROGRESS,
        REQUEST_STATUS.COMPLETED,
        REQUEST_STATUS.CANCELLED
      ];
      if (!validStatuses.includes(status)) {
        return sendBadRequest(res, 'Invalid status value');
      }
      updateData.status = status;
      
      if (status === REQUEST_STATUS.COMPLETED && !updateData.completedAt) {
        updateData.completedAt = Date.now();
      }
    }
    
    if (estimatedArrival) {
      updateData.estimatedArrival = estimatedArrival;
    }

    const updatedRequest = await Request.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('user', 'username email phone avatar')
      .populate('helper', 'username email phone avatar');

    const message = helperCompleted ? 'ממתין לאישור המבקש' : 
               requesterConfirmed ? 'Request completed successfully' : 
               'Status updated successfully';
    
    sendSuccess(res, 200, { data: updatedRequest, message });

    broadcastRequestUpdate(req.app.get('io'), requestsService.sanitizeRequest(updatedRequest));
  } catch (err) {
    sendError(res, err, 'Server error updating request status');
  }
};

exports.requestToHelp = async (req, res) => {
  try {
    const { id } = req.params;
    const helperId = req.userId;
    const { message, location } = req.body;

    if (!helperId) {
      return sendUnauthorized(res);
    }

    // Check phone verification before offering help
    const helper = await User.findById(helperId);
    if (!helper) {
      return sendUnauthorized(res);
    }

    if (!helper.phoneVerified) {
      return sendForbidden(res, 'Phone verification required', { requirePhoneVerification: true });
    }

    const request = await Request.findById(id).populate('user', 'username avatar');

    if (!request) {
      return sendNotFound(res);
    }

    if (request.status !== REQUEST_STATUS.PENDING) {
      return sendBadRequest(res, 'Request is not available - already assigned or completed');
    }

    const alreadyRequested = request.pendingHelpers.some(
      ph => ph.user.toString() === helperId
    );

    if (alreadyRequested) {
      return sendBadRequest(res, 'You have already requested to help with this request');
    }

    const helperData = {
      user: helperId,
      requestedAt: Date.now(),
      message: message || ''
    };

    if (location && typeof location.lat === 'number' && typeof location.lng === 'number') {
      helperData.location = {
        lat: location.lat,
        lng: location.lng
      };
    }

    request.pendingHelpers.push(helperData);

    await request.save();

    const populatedRequest = await Request.findById(request._id)
      .populate('user', 'username email phone avatar')
      .populate('pendingHelpers.user', 'username email phone averageRating ratingCount avatar');

    const latestHelper = populatedRequest.pendingHelpers[populatedRequest.pendingHelpers.length - 1];
    notifyHelperRequest(req.app.get('io'), String(request.user._id), {
      requestId: request._id,
      helper: latestHelper.user,
      helperLocation: latestHelper.location,
      message: latestHelper.message,
      requestedAt: latestHelper.requestedAt,
      requestLocation: request.location,
      problemType: getProblemTypeLabel(request.problemType)
    });

    sendSuccess(res, 200, {
      message: `Your help request has been sent to ${request.user.username}. Waiting for confirmation.`,
      data: populatedRequest
    });
  } catch (err) {
    sendError(res, err, 'Server error requesting to help');
  }
};

const getProblemTypeLabel = (type) => {
  const labels = {
    flat_tire: 'פנצ׳ר',
    dead_battery: 'בטריה מתה',
    out_of_fuel: 'נגמר הדלק',
    engine_problem: 'בעיה במנוע',
    locked_out: 'נעול בחוץ',
    accident: 'תאונה',
    towing_needed: 'נדרש גרר',
    other: 'אחר'
  };
  return labels[type] || type;
};


exports.confirmHelper = async (req, res) => {
  try {
    const { id } = req.params;
    const { helperId } = req.body;
    const requesterId = req.userId;

    if (!requesterId) {
      return sendUnauthorized(res);
    }

    if (!helperId) {
      return sendBadRequest(res, 'Helper ID is required');
    }

    const request = await Request.findById(id);

    if (!request) {
      return sendNotFound(res);
    }

    if (request.user.toString() !== requesterId) {
      return sendForbidden(res, 'Only the request owner can confirm a helper');
    }

    if (request.status !== REQUEST_STATUS.PENDING) {
      return sendBadRequest(res, 'Request is not available for assignment');
    }

    const helperInPending = request.pendingHelpers.find(
      ph => ph.user.toString() === helperId
    );

    if (!helperInPending) {
      return sendBadRequest(res, 'This helper has not requested to help with this request');
    }

    request.helper = helperId;
    request.status = REQUEST_STATUS.ASSIGNED;
    request.assignedAt = Date.now();

    const helperLocation = helperInPending.location;
    const requestLocation = request.location;
    
    if (helperLocation?.lat && helperLocation?.lng && requestLocation?.lat && requestLocation?.lng) {
      try {
        const etaResult = await calculateETAWithDistance(
          helperLocation.lat,
          helperLocation.lng,
          requestLocation.lat,
          requestLocation.lng
        );
        
        request.etaData = {
          etaSeconds: etaResult.etaSeconds,
          distanceMeters: etaResult.distanceMeters,
          helperLocation: {
            lat: helperLocation.lat,
            lng: helperLocation.lng
          },
          updatedAt: Date.now()
        };
      } catch (etaError) {
        console.warn('Failed to calculate initial ETA:', etaError.message);
      }
    }

    await request.save();

    const populatedRequest = await Request.findById(request._id)
      .populate('user', 'username email phone avatar')
      .populate('helper', 'username email phone averageRating ratingCount avatar');

    const io = req.app.get('io');
    notifyHelperConfirmed(io, String(helperId), {
      requestId: populatedRequest._id,
      request: populatedRequest,
      message: `אושרת לעזור ל-${populatedRequest.user.username}!`
    });

    if (request.etaData?.etaSeconds) {
      const etaPayload = {
        requestId: request._id.toString(),
        etaSeconds: request.etaData.etaSeconds,
        distanceMeters: request.etaData.distanceMeters,
        distanceKm: request.etaData.distanceMeters / 1000,
        etaMinutes: request.etaData.etaSeconds / 60,
        helperLocation: request.etaData.helperLocation,
        timestamp: Date.now()
      };
      notifyETAUpdate(io, String(request.user), etaPayload);
    }

    sendSuccess(res, 200, {
      message: 'Helper confirmed successfully',
      data: populatedRequest
    });
  } catch (err) {
    sendError(res, err, 'Server error confirming helper');
  }
};

exports.rejectHelper = async (req, res) => {
  try {
    const { id } = req.params;
    const { helperId } = req.body;
    const requesterId = req.userId;

    if (!requesterId) {
      return sendUnauthorized(res);
    }

    if (!helperId) {
      return sendBadRequest(res, 'Helper ID is required');
    }

    const request = await Request.findById(id);

    if (!request) {
      return sendNotFound(res);
    }

    if (request.user.toString() !== requesterId) {
      return sendForbidden(res, 'Only the request owner can reject a helper');
    }

    const initialLength = request.pendingHelpers.length;
    request.pendingHelpers = request.pendingHelpers.filter(
      ph => ph.user.toString() !== helperId
    );

    if (request.pendingHelpers.length === initialLength) {
      return sendBadRequest(res, 'Helper not found in pending list');
    }

    await request.save();

    sendSuccess(res, 200, {
      message: 'Helper rejected successfully',
      data: request
    });
  } catch (err) {
    sendError(res, err, 'Server error rejecting helper');
  }
};

exports.cancelHelperAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const helperId = req.userId;

    if (!helperId) {
      return sendUnauthorized(res);
    }

    const request = await Request.findById(id);

    if (!request) {
      return sendNotFound(res);
    }

    if (!request.helper || request.helper.toString() !== helperId) {
      return sendForbidden(res, 'You are not the assigned helper for this request');
    }

    if (request.status === REQUEST_STATUS.COMPLETED) {
      return sendBadRequest(res, 'Cannot cancel a completed request');
    }

    request.helper = null;
    request.status = REQUEST_STATUS.PENDING;
    request.helperCompletedAt = null;
    
    await request.save();

    const updatedRequest = await Request.findById(request._id)
      .populate('user', 'username email phone avatar')
      .populate('pendingHelpers.user', 'username email phone averageRating ratingCount avatar');

    const io = req.app.get('io');
    notifyHelperCancelled(io, String(request.user), {
      requestId: updatedRequest._id,
      request: updatedRequest,
      message: 'The helper has cancelled. Your request is now available again.'
    });
    broadcastRequestUpdate(io, requestsService.sanitizeRequest(updatedRequest));

    sendSuccess(res, 200, {
      message: 'You have cancelled your help. The request is now available for other helpers.',
      data: updatedRequest
    });
  } catch (err) {
    sendError(res, err, 'Server error canceling assignment');
  }
};

exports.assignHelper = async (req, res) => {
  try {
    const { id } = req.params;
    const helperId = req.userId;

    if (!helperId) {
      return sendUnauthorized(res);
    }

    const { request } = await requestsService.assignHelper(id, helperId);


    const helperInfo = request.pendingHelpers.find(
      ph => ph.user._id.toString() === helperId
    );
    notifyHelperRequest(req.app.get('io'), String(request.user._id || request.user), {
      requestId: request._id,
      helper: helperInfo?.user,
      request: request,
      message: `${helperInfo?.user.username || 'Someone'} wants to help you!`
    });

    sendSuccess(res, 200, {
      message: 'Help request sent. Waiting for requester confirmation.',
      data: request
    });
  } catch (err) {
    sendError(res, err, 'Server error assigning helper');
  }
};

exports.addPhotos = async (req, res) => {
  try {
    const { id } = req.params;
    const { photos } = req.body;

    const { request, sanitized } = await requestsService.addPhotos(id, req.userId, photos);

    sendSuccess(res, 200, { data: request });

    broadcastRequestUpdate(req.app.get('io'), sanitized);
  } catch (err) {
    sendError(res, err, 'Server error adding photos');
  }
};

exports.deleteRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await requestsService.deleteRequest(id, req.userId);

    sendSuccess(res, 200, { message: 'Request deleted successfully' });


    broadcastRequestDeleted(req.app.get('io'), result);
  } catch (err) {
    sendError(res, err, 'Server error deleting request');
  }
};

exports.updatePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { request, sanitized } = await requestsService.updatePayment(id, req.userId, req.body);

    sendSuccess(res, 200, { data: request });

    broadcastRequestUpdate(req.app.get('io'), sanitized);
  } catch (err) {
    sendError(res, err, 'Server error updating payment');
  }
};

exports.updateRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    if (!userId) {
      return sendUnauthorized(res);
    }

    const { request, sanitized } = await requestsService.updateRequest(id, userId, req.body);

    sendSuccess(res, 200, {
      message: 'Request updated successfully',
      data: request
    });

    broadcastRequestUpdate(req.app.get('io'), sanitized);
  } catch (err) {
    sendError(res, err, 'Server error updating request');
  }
};

exports.cancelRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const requesterId = req.userId;

    if (!id) {
      return sendBadRequest(res, 'Request ID is required');
    }

    const { request, helperId, sanitized } = await requestsService.cancelRequest(id, requesterId);

    const io = req.app.get('io');
    if (helperId) {
      notifyRequestCancelled(io, helperId, {
        requestId: request._id,
        request: request,
        message: 'המבקש ביטל את הבקשה'
      });
    }
    

    sendSuccess(res, 200, {
      message: 'Request cancelled successfully',
      data: request
    });
  } catch (err) {
    sendError(res, err, 'Server error canceling request');
  }
};

exports.getRoute = async (req, res) => {
  try {
    const result = await requestsService.getRoute(req.query);
    sendSuccess(res, 200, result);
  } catch (err) {
    sendError(res, err, 'Server error fetching route');
  }
};