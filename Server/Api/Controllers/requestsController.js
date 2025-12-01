const Request = require('../models/requestsModel');

// Helper: sanitize a request document for real-time broadcasts
const sanitizeRequest = (reqDoc) => {
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
    status: reqDoc.status,
    user: normalizeUser(user),
    helper: normalizeUser(helper),
    createdAt: reqDoc.createdAt,
    updatedAt: reqDoc.updatedAt,
  };
};

// Create a new roadside assistance request
exports.createRequest = async (req, res) => {
  try {
    const { location, problemType, description, photos, offeredAmount, currency } = req.body;

    // Validation
    if (!location || typeof location.lat !== 'number' || typeof location.lng !== 'number') {
      return res.status(400).json({
        success: false,
        message: 'Valid location (lat, lng) is required'
      });
    }

    if (!problemType) {
      return res.status(400).json({
        success: false,
        message: 'Problem type is required'
      });
    }

    if (!description || description.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Description is required'
      });
    }

    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: 'No user in request (missing or invalid token)'
      });
    }

    // Validate payment amount if provided
    if (offeredAmount !== undefined && (typeof offeredAmount !== 'number' || offeredAmount < 0)) {
      return res.status(400).json({
        success: false,
        message: 'Offered amount must be a positive number'
      });
    }

    const requestData = {
      user: req.userId,
      location: {
        lat: location.lat,
        lng: location.lng,
        address: location.address || ''
      },
      problemType,
      description,
      photos: photos || [],
      status: 'pending'
    };

    // Add payment info if amount is offered
    if (offeredAmount !== undefined && offeredAmount > 0) {
      requestData.payment = {
        offeredAmount,
        currency: currency || 'ILS',
        isPaid: false
      };
    }

    const request = await Request.create(requestData);

    const populatedRequest = await Request.findById(request._id)
      .populate('user', 'username email phone');

    res.status(201).json({
      success: true,
      data: populatedRequest
    });

    // Server-driven broadcast: new request created (sanitized)
    try {
      const io = req.app.get('io');
      if (io) {
        io.emit('requestAdded', sanitizeRequest(populatedRequest));
      }
    } catch (e) {
      console.warn('⚠️ Failed to emit requestAdded:', e.message);
    }
  } catch (err) {
    console.error('Error creating request:', err);
    res.status(500).json({
      success: false,
      message: 'Server error creating request',
      error: err.message
    });
  }
};

// Get all requests (with optional filters)
exports.getRequests = async (req, res) => {
  try {
    const { status, problemType, userId, helperId, limit = 100 } = req.query;
    
    const filter = {};
    
    if (status) filter.status = status;
    if (problemType) filter.problemType = problemType;
    if (userId) filter.user = userId;
    if (helperId) filter.helper = helperId;

    const requests = await Request.find(filter)
      .populate('user', 'username email phone')
      .populate('helper', 'username email phone')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (err) {
    console.error('Error fetching requests:', err);
    res.status(500).json({
      success: false,
      message: 'Server error fetching requests',
      error: err.message
    });
  }
};

// Get active/pending requests for real-time map
exports.getActiveRequests = async (req, res) => {
  try {
    const requests = await Request.find({
      status: { $in: ['pending', 'assigned', 'in_progress'] }
    })
      .populate('user', 'username phone')
      .populate('helper', 'username phone averageRating ratingCount')
      .populate('pendingHelpers.user', 'username email phone averageRating ratingCount')
      .sort({ createdAt: -1 })
      .limit(200);

    res.json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (err) {
    console.error('Error fetching active requests:', err);
    res.status(500).json({
      success: false,
      message: 'Server error fetching active requests',
      error: err.message
    });
  }
};

// Get a single request by ID
exports.getRequestById = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await Request.findById(id)
      .populate('user', 'username email phone')
      .populate('helper', 'username email phone averageRating ratingCount')
      .populate('pendingHelpers.user', 'username email phone averageRating ratingCount');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    res.json({
      success: true,
      data: request
    });
  } catch (err) {
    console.error('Error fetching request:', err);
    res.status(500).json({
      success: false,
      message: 'Server error fetching request',
      error: err.message
    });
  }
};

// Get user's own requests
exports.getMyRequests = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: 'No user in request (missing or invalid token)'
      });
    }

    const requests = await Request.find({ user: req.userId })
      .populate('helper', 'username phone averageRating ratingCount')
      .populate('pendingHelpers.user', 'username email phone averageRating ratingCount')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (err) {
    console.error('Error fetching user requests:', err);
    res.status(500).json({
      success: false,
      message: 'Server error fetching user requests',
      error: err.message
    });
  }
};

// Update request status
exports.updateRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, estimatedArrival, helperCompleted, requesterConfirmed } = req.body;
    const userId = req.userId;

    if (!status && helperCompleted !== true && requesterConfirmed !== true) {
      return res.status(400).json({
        success: false,
        message: 'Status, helperCompleted, or requesterConfirmed is required'
      });
    }

    const request = await Request.findById(id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    const updateData = {};

    // Handle helper marking as completed (waiting for confirmation)
    if (helperCompleted === true) {
      // Verify user is the helper
      if (!request.helper || request.helper.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Only the assigned helper can mark as completed'
        });
      }
      updateData.helperCompletedAt = Date.now();
      updateData.status = 'in_progress'; // Keep in_progress until requester confirms
      console.log(`Helper marked request ${id} as completed, waiting for requester confirmation`);
    }

    // Handle requester confirmation
    if (requesterConfirmed === true) {
      // Verify user is the requester
      if (request.user.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Only the requester can confirm completion'
        });
      }
      // Check if helper has marked as completed
      if (!request.helperCompletedAt) {
        return res.status(400).json({
          success: false,
          message: 'Helper must mark as completed first'
        });
      }
      updateData.requesterConfirmedAt = Date.now();
      updateData.status = 'completed';
      updateData.completedAt = Date.now();
      console.log(`Requester confirmed completion of request ${id}`);
    }

    // Handle normal status updates
    if (status) {
      const validStatuses = ['pending', 'assigned', 'in_progress', 'completed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status value'
        });
      }
      updateData.status = status;
      
      if (status === 'completed' && !updateData.completedAt) {
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
      .populate('user', 'username email phone')
      .populate('helper', 'username email phone');

    res.json({
      success: true,
      data: updatedRequest,
      message: helperCompleted ? 'Waiting for requester confirmation' : 
               requesterConfirmed ? 'Request completed successfully' : 
               'Status updated successfully'
    });

    // Server-driven broadcast: request updated
    try {
      const io = req.app.get('io');
      if (io && updatedRequest) {
        io.emit('requestUpdated', sanitizeRequest(updatedRequest));
      }
    } catch (e) {
      console.warn('⚠️ Failed to emit requestUpdated (status):', e.message);
    }
  } catch (err) {
    console.error('Error updating request status:', err);
    res.status(500).json({
      success: false,
      message: 'Server error updating request status',
      error: err.message
    });
  }
};

// Assign a helper to a request
// Step 1: Helper requests to help (adds themselves to pendingHelpers)
exports.requestToHelp = async (req, res) => {
  try {
    const { id } = req.params;
    const helperId = req.userId;
    const { message, location } = req.body;

    if (!helperId) {
      return res.status(401).json({
        success: false,
        message: 'No user in request (missing or invalid token)'
      });
    }

    const request = await Request.findById(id).populate('user', 'username');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Request is not available - already assigned or completed'
      });
    }

    // Check if helper already requested
    const alreadyRequested = request.pendingHelpers.some(
      ph => ph.user.toString() === helperId
    );

    if (alreadyRequested) {
      return res.status(400).json({
        success: false,
        message: 'You have already requested to help with this request'
      });
    }

    // Add helper to pending list with their current location
    const helperData = {
      user: helperId,
      requestedAt: Date.now(),
      message: message || ''
    };

    // Add location if provided
    if (location && typeof location.lat === 'number' && typeof location.lng === 'number') {
      helperData.location = {
        lat: location.lat,
        lng: location.lng
      };
    }

    request.pendingHelpers.push(helperData);

    await request.save();

    const populatedRequest = await Request.findById(request._id)
      .populate('user', 'username email phone')
      .populate('pendingHelpers.user', 'username email phone averageRating ratingCount');

    // Emit socket event to the requester
    const io = req.app.get('io');
    if (io) {
      const latestHelper = populatedRequest.pendingHelpers[populatedRequest.pendingHelpers.length - 1];
      io.to(`user:${String(request.user._id)}`).emit('helperRequestReceived', {
        requestId: request._id,
        helper: latestHelper.user,
        helperLocation: latestHelper.location,
        message: latestHelper.message,
        requestedAt: latestHelper.requestedAt,
        requestLocation: request.location,
        problemType: getProblemTypeLabel(request.problemType)
      });
      console.log(`Emitted helper request notification to user ${request.user._id}`);
    } else {
      console.warn('⚠️ Socket.IO not available, real-time notification skipped for helper request');
    }

    res.json({
      success: true,
      message: `Your help request has been sent to ${request.user.username}. Waiting for confirmation.`,
      data: populatedRequest
    });
  } catch (err) {
    console.error('Error requesting to help:', err);
    res.status(500).json({
      success: false,
      message: 'Server error requesting to help',
      error: err.message
    });
  }
};

// Helper function to get problem type label
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

// Step 2: Requester confirms a helper (sets helper and changes status to assigned)
exports.confirmHelper = async (req, res) => {
  try {
    const { id } = req.params;
    const { helperId } = req.body;
    const requesterId = req.userId;

    if (!requesterId) {
      return res.status(401).json({
        success: false,
        message: 'No user in request (missing or invalid token)'
      });
    }

    if (!helperId) {
      return res.status(400).json({
        success: false,
        message: 'Helper ID is required'
      });
    }

    const request = await Request.findById(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    // Verify requester is the owner
    if (request.user.toString() !== requesterId) {
      return res.status(403).json({
        success: false,
        message: 'Only the request owner can confirm a helper'
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Request is not available for assignment'
      });
    }

    // Check if helper is in pending list
    const helperInPending = request.pendingHelpers.find(
      ph => ph.user.toString() === helperId
    );

    if (!helperInPending) {
      return res.status(400).json({
        success: false,
        message: 'This helper has not requested to help with this request'
      });
    }

    // Assign helper and update status
    request.helper = helperId;
    request.status = 'assigned';
    request.assignedAt = Date.now();
    await request.save();

    const populatedRequest = await Request.findById(request._id)
      .populate('user', 'username email phone')
      .populate('helper', 'username email phone averageRating ratingCount');

    // Emit Socket.IO event to notify the helper that they were confirmed
    const io = req.app.get('io');
    if (io) {
      io.to(`user:${String(helperId)}`).emit('helperConfirmed', {
        requestId: populatedRequest._id,
        request: populatedRequest,
        message: `You've been confirmed to help ${populatedRequest.user.username}!`
      });
      console.log(`✅ Notified helper ${helperId} of confirmation`);
    } else {
      console.warn('⚠️ Socket.IO not available, real-time notification skipped for helper confirmation');
    }

    res.json({
      success: true,
      message: 'Helper confirmed successfully',
      data: populatedRequest
    });
  } catch (err) {
    console.error('Error confirming helper:', err);
    res.status(500).json({
      success: false,
      message: 'Server error confirming helper',
      error: err.message
    });
  }
};

// Step 3: Requester rejects a helper (removes from pendingHelpers)
exports.rejectHelper = async (req, res) => {
  try {
    const { id } = req.params;
    const { helperId } = req.body;
    const requesterId = req.userId;

    if (!requesterId) {
      return res.status(401).json({
        success: false,
        message: 'No user in request (missing or invalid token)'
      });
    }

    if (!helperId) {
      return res.status(400).json({
        success: false,
        message: 'Helper ID is required'
      });
    }

    const request = await Request.findById(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    // Verify requester is the owner
    if (request.user.toString() !== requesterId) {
      return res.status(403).json({
        success: false,
        message: 'Only the request owner can reject a helper'
      });
    }

    // Remove helper from pending list
    const initialLength = request.pendingHelpers.length;
    request.pendingHelpers = request.pendingHelpers.filter(
      ph => ph.user.toString() !== helperId
    );

    if (request.pendingHelpers.length === initialLength) {
      return res.status(400).json({
        success: false,
        message: 'Helper not found in pending list'
      });
    }

    await request.save();

    res.json({
      success: true,
      message: 'Helper rejected successfully',
      data: request
    });
  } catch (err) {
    console.error('Error rejecting helper:', err);
    res.status(500).json({
      success: false,
      message: 'Server error rejecting helper',
      error: err.message
    });
  }
};

// Legacy endpoint - keep for backward compatibility but update behavior
exports.assignHelper = async (req, res) => {
  try {
    const { id } = req.params;
    const helperId = req.userId;

    if (!helperId) {
      return res.status(401).json({
        success: false,
        message: 'No user in request (missing or invalid token)'
      });
    }

    const request = await Request.findById(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Request is not available for assignment'
      });
    }

    // Check if already requested
    const alreadyRequested = request.pendingHelpers.some(
      ph => ph.user.toString() === helperId
    );

    if (alreadyRequested) {
      return res.status(400).json({
        success: false,
        message: 'You have already requested to help with this request'
      });
    }

    // Add to pending helpers instead of directly assigning
    request.pendingHelpers.push({
      user: helperId,
      requestedAt: Date.now()
    });

    await request.save();

    const populatedRequest = await Request.findById(request._id)
      .populate('user', 'username email phone')
      .populate('pendingHelpers.user', 'username email phone averageRating ratingCount');

    // Emit Socket.IO event to notify the requester that a helper wants to help
    const io = req.app.get('io');
    if (io) {
      const helperInfo = populatedRequest.pendingHelpers.find(
        ph => ph.user._id.toString() === helperId
      );
      io.to(`user:${String(request.user)}`).emit('helperRequestReceived', {
        requestId: populatedRequest._id,
        helper: helperInfo?.user,
        request: populatedRequest,
        message: `${helperInfo?.user.username || 'Someone'} wants to help you!`
      });
      console.log(`🔔 Notified requester ${request.user} of new helper request`);
    } else {
      console.warn('⚠️ Socket.IO not available, real-time notification skipped for helper request');
    }

    res.json({
      success: true,
      message: 'Help request sent. Waiting for requester confirmation.',
      data: populatedRequest
    });
  } catch (err) {
    console.error('Error assigning helper:', err);
    res.status(500).json({
      success: false,
      message: 'Server error assigning helper',
      error: err.message
    });
  }
};

// Add photos to a request
exports.addPhotos = async (req, res) => {
  try {
    const { id } = req.params;
    const { photos } = req.body;

    if (!photos || !Array.isArray(photos) || photos.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Photos array is required'
      });
    }

    const request = await Request.findById(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    // Verify user owns this request
    if (request.user.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this request'
      });
    }

    const newPhotos = photos.map(url => ({
      url,
      uploadedAt: Date.now()
    }));

    request.photos.push(...newPhotos);
    await request.save();

    res.json({
      success: true,
      data: request
    });

    // Broadcast photos change as an update
    try {
      const io = req.app.get('io');
      if (io && request) {
        // Optionally populate minimal user/helper for broadcast
        const minimal = await Request.findById(request._id)
          .populate('user', 'username')
          .populate('helper', 'username');
        io.emit('requestUpdated', sanitizeRequest(minimal || request));
      }
    } catch (e) {
      console.warn('⚠️ Failed to emit requestUpdated (addPhotos):', e.message);
    }
  } catch (err) {
    console.error('Error adding photos:', err);
    res.status(500).json({
      success: false,
      message: 'Server error adding photos',
      error: err.message
    });
  }
};

// Delete a request
exports.deleteRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const request = await Request.findById(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    // Verify user owns this request
    if (request.user.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this request'
      });
    }

    await Request.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Request deleted successfully'
    });

    // Broadcast deletion so clients can remove marker
    try {
      const io = req.app.get('io');
      if (io) {
        io.emit('requestDeleted', { _id: String(id) });
      }
    } catch (e) {
      console.warn('⚠️ Failed to emit requestDeleted:', e.message);
    }
  } catch (err) {
    console.error('Error deleting request:', err);
    res.status(500).json({
      success: false,
      message: 'Server error deleting request',
      error: err.message
    });
  }
};

// Update payment information
exports.updatePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { offeredAmount, currency, isPaid, paymentMethod } = req.body;

    const request = await Request.findById(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    // Verify user owns this request or is the helper
    if (request.user.toString() !== req.userId && request.helper?.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update payment for this request'
      });
    }

    // Update payment fields
    if (offeredAmount !== undefined) {
      if (typeof offeredAmount !== 'number' || offeredAmount < 0) {
        return res.status(400).json({
          success: false,
          message: 'Offered amount must be a positive number'
        });
      }
      request.payment.offeredAmount = offeredAmount;
    }

    if (currency) {
      request.payment.currency = currency;
    }

    if (isPaid !== undefined) {
      request.payment.isPaid = isPaid;
      if (isPaid) {
        request.payment.paidAt = Date.now();
      }
    }

    if (paymentMethod) {
      request.payment.paymentMethod = paymentMethod;
    }

    await request.save();

    const populatedRequest = await Request.findById(request._id)
      .populate('user', 'username email phone')
      .populate('helper', 'username email phone');

    res.json({
      success: true,
      data: populatedRequest
    });

    // Broadcast update
    try {
      const io = req.app.get('io');
      if (io && populatedRequest) {
        io.emit('requestUpdated', sanitizeRequest(populatedRequest));
      }
    } catch (e) {
      console.warn('⚠️ Failed to emit requestUpdated (payment):', e.message);
    }
  } catch (err) {
    console.error('Error updating payment:', err);
    res.status(500).json({
      success: false,
      message: 'Server error updating payment',
      error: err.message
    });
  }
};

// General update for a request
exports.updateRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'No user in request (missing or invalid token)'
      });
    }

    const request = await Request.findById(id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    // Check permissions - user must be owner or helper
    const isOwner = request.user.toString() === userId;
    const isHelper = request.helper && request.helper.toString() === userId;
    
    if (!isOwner && !isHelper) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this request'
      });
    }

    // Update the request
    const updatedRequest = await Request.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    )
      .populate('user', 'username email phone')
      .populate('helper', 'username email phone');

    res.json({
      success: true,
      message: 'Request updated successfully',
      data: updatedRequest
    });

    // Broadcast update
    try {
      const io = req.app.get('io');
      if (io && updatedRequest) {
        io.emit('requestUpdated', sanitizeRequest(updatedRequest));
      }
    } catch (e) {
      console.warn('⚠️ Failed to emit requestUpdated (general):', e.message);
    }
  } catch (err) {
    console.error('Error updating request:', err);
    res.status(500).json({
      success: false,
      message: 'Server error updating request',
      error: err.message
    });
  }
};