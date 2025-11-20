const Request = require('../models/requestsModel');

// Create a new roadside assistance request
exports.createRequest = async (req, res) => {
  try {
    const { location, problemType, description, photos, priority, offeredAmount, currency } = req.body;

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
      priority: priority || 'medium',
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
      .populate('user', 'name email phone');

    res.status(201).json({
      success: true,
      data: populatedRequest
    });
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
      .populate('user', 'name email phone')
      .populate('helper', 'name email phone')
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
      .populate('user', 'name phone')
      .populate('helper', 'name phone')
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
      .populate('user', 'name email phone')
      .populate('helper', 'name email phone');

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
      .populate('helper', 'name phone')
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
    const { status, estimatedArrival } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const validStatuses = ['pending', 'assigned', 'in_progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    const updateData = { status };
    
    if (status === 'completed') {
      updateData.completedAt = Date.now();
    }
    
    if (estimatedArrival) {
      updateData.estimatedArrival = estimatedArrival;
    }

    const request = await Request.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('user', 'name email phone')
      .populate('helper', 'name email phone');

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
    console.error('Error updating request status:', err);
    res.status(500).json({
      success: false,
      message: 'Server error updating request status',
      error: err.message
    });
  }
};

// Assign a helper to a request
exports.assignHelper = async (req, res) => {
  try {
    const { id } = req.params;
    const helperId = req.userId; // The logged-in user (helper) assigns themselves

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

    request.helper = helperId;
    request.status = 'assigned';
    request.assignedAt = Date.now();
    await request.save();

    const populatedRequest = await Request.findById(request._id)
      .populate('user', 'name email phone')
      .populate('helper', 'name email phone');

    res.json({
      success: true,
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
      .populate('user', 'name email phone')
      .populate('helper', 'name email phone');

    res.json({
      success: true,
      data: populatedRequest
    });
  } catch (err) {
    console.error('Error updating payment:', err);
    res.status(500).json({
      success: false,
      message: 'Server error updating payment',
      error: err.message
    });
  }
};