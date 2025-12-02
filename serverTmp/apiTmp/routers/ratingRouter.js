const express = require('express');
const {
    createRating,
    getRatingsByHelper,
    updateRating,
    deleteRating,
    getRatingById,
    checkIfRated
} = require('../Controllers/ratingController');
const authMiddleware = require('../authMiddleware');

const router = express.Router();

// Create a new rating (protected - must be authenticated)
router.post('/', authMiddleware, createRating);

// Check if a request has been rated (protected)
router.get('/:requestId/check', authMiddleware, checkIfRated);

// Get a specific rating by ID (public) - MUST be after /check route
router.get('/:id', getRatingById);

// Update a rating (protected - must be the rating owner)
router.put('/:id', authMiddleware, updateRating);

// Delete a rating (protected - must be the rating owner)
router.delete('/:id', authMiddleware, deleteRating);

// Get all ratings for a specific helper (public)
// Note: This route is defined in the main app.js as /api/users/:id/ratings
// to keep RESTful convention, but we export this function for use there

module.exports = router;
module.exports.getRatingsByHelper = getRatingsByHelper;
