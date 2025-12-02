const express = require('express');
const router = express.Router();
const reportController = require('../Controllers/reportController');
const authMiddleware = require('../authMiddleware');

// All routes require authentication
router.use(authMiddleware);

// Create a new report
router.post('/report', reportController.createReport);

// Get user's own reports
router.get('/my-reports', reportController.getUserReports);

// Get all reports (admin only - would need admin check)
router.get('/all', reportController.getAllReports);

module.exports = router;
