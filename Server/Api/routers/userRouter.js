const express = require('express');
const{ register, login } = require('../Controllers/userController');
const { getRatingsByHelper } = require('../Controllers/ratingController');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);

// Get all ratings for a specific helper
router.get('/:id/ratings', getRatingsByHelper);

module.exports = router;