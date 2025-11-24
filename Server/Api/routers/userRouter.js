const express = require('express');
const{ register, login, getLocationFromIP, getMe } = require('../Controllers/userController');
const { getRatingsByHelper } = require('../Controllers/ratingController');
const authMiddleware = require('../authMiddleware');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authMiddleware, getMe);
router.get('/location/ip', getLocationFromIP);

// Get all ratings for a specific helper
router.get('/:id/ratings', getRatingsByHelper);

module.exports = router;