const express = require('express');
const{ register, login, getLocationFromIP } = require('../Controllers/userController');
const { getRatingsByHelper } = require('../Controllers/ratingController');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/location/ip', getLocationFromIP);

// Get all ratings for a specific helper
router.get('/:id/ratings', getRatingsByHelper);

module.exports = router;