const express = require('express');
const router = express.Router();
const authMiddleware = require('../authMiddleware');
const {
  createRequest,
  getRequests,
  getActiveRequests,
  getRequestById,
  getMyRequests,
  updateRequestStatus,
  assignHelper,
  addPhotos,
  deleteRequest,
  updatePayment
} = require('../Controllers/requestsController');

// Create a new roadside assistance request
router.post('/', authMiddleware, createRequest);

// Get all requests (with optional filters)
router.get('/', authMiddleware, getRequests);

// Get active requests for real-time map display
router.get('/active', authMiddleware, getActiveRequests);

// Get current user's requests
router.get('/my-requests', authMiddleware, getMyRequests);

// Get a specific request by ID
router.get('/:id', authMiddleware, getRequestById);

// Update request status
router.patch('/:id/status', authMiddleware, updateRequestStatus);

// Assign helper to a request
router.post('/:id/assign', authMiddleware, assignHelper);

// Add photos to a request
router.post('/:id/photos', authMiddleware, addPhotos);

// Update payment information
router.patch('/:id/payment', authMiddleware, updatePayment);

// Delete a request
router.delete('/:id', authMiddleware, deleteRequest);

module.exports = router;