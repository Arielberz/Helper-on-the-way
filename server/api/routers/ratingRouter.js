const express = require('express');
const ratingController = require('../controllers/ratingController');
const authMiddleware = require('../authMiddleware');

const router = express.Router();

// Create a new rating (protected - must be authenticated)
router.post('/', authMiddleware, ratingController.createRating);

// Check if a request has been rated (protected)
router.get('/:requestId/check', authMiddleware, ratingController.checkIfRated);

// Get a specific rating by ID (public) - MUST be after /check route
router.get('/:id', ratingController.getRatingById);

// Update a rating (protected - must be the rating owner)
router.put('/:id', authMiddleware, ratingController.updateRating);

// Delete a rating (protected - must be the rating owner)
router.delete('/:id', authMiddleware, ratingController.deleteRating);

// Get all ratings for a specific helper (public)
// Note: This route is defined in the main app.js as /api/users/:id/ratings
// to keep RESTful convention, but we export this function for use there

module.exports = router;
module.exports.getRatingsByHelper = ratingController.getRatingsByHelper;
