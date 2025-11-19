const express = require('express');
const router = express.Router();
const authMiddleware = require('../authMiddleware');
const { createLocation, getLocations } = require('../Controllers/locationController');

router.get('/', authMiddleware, getLocations);
router.post('/', authMiddleware, createLocation);

module.exports = router;