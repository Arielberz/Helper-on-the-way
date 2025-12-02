const express = require('express');
const router = express.Router();
const authMiddleware = require('../authMiddleware');
const requestsController = require('../controllers/requestsController');
const {
  createRequest,
  getRequests,
  getActiveRequests,
  getRequestById,
  getMyRequests,
  updateRequestStatus,
  assignHelper,
  requestToHelp,
  confirmHelper,
  rejectHelper,
  addPhotos,
  deleteRequest,
  updatePayment,
  getRoute
} = requestsController;

// Create a new roadside assistance request
router.post('/', authMiddleware, createRequest);

// Get all requests (with optional filters)
router.get('/', authMiddleware, getRequests);

// Get active requests for real-time map display
router.get('/active', authMiddleware, getActiveRequests);

// Get current user's requests
router.get('/my-requests', authMiddleware, getMyRequests);

// Get driving route from OSRM API
router.get('/route', authMiddleware, getRoute);

// Get a specific request by ID
router.get('/:id', authMiddleware, getRequestById);

// Update request status
router.patch('/:id/status', authMiddleware, updateRequestStatus);

// NEW: Helper requests to help (adds to pending list)
router.post('/:id/request-help', authMiddleware, requestToHelp);

// NEW: Requester confirms a helper
router.post('/:id/confirm-helper', authMiddleware, confirmHelper);

// NEW: Requester rejects a helper
router.post('/:id/reject-helper', authMiddleware, rejectHelper);

// Legacy: Assign helper to a request (now adds to pending)
router.post('/:id/assign', authMiddleware, assignHelper);

// Accept a request (helper) - also adds to pending
router.patch('/:id/accept', authMiddleware, assignHelper);

// General update for a request
router.patch('/:id', authMiddleware, require('../controllers/requestsController').updateRequest);

// Add photos to a request
router.post('/:id/photos', authMiddleware, addPhotos);

// Update payment information
router.patch('/:id/payment', authMiddleware, updatePayment);

// Delete a request
router.delete('/:id', authMiddleware, deleteRequest);

module.exports = router;