const express = require('express');
const userController = require('../controllers/userController');
const { getRatingsByHelper } = require('../controllers/ratingController');
const authMiddleware = require('../authMiddleware');
const router = express.Router();

router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/me', authMiddleware, userController.getMe);
router.get('/location/ip', userController.getLocationFromIP);

// Get all ratings for a specific helper
router.get('/:id/ratings', getRatingsByHelper);

module.exports = router;