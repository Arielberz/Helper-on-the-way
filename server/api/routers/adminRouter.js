const express = require('express');
const router = express.Router();
const authMiddleware = require('../authMiddleware');
const { adminOnly } = require('../authMiddleware');
const adminController = require('../controllers/adminController');
const contactController = require('../controllers/contactController');

// All admin routes require authentication and admin role
router.use(authMiddleware);
router.use(adminOnly);

// Dashboard overview
router.get('/overview', adminController.getOverview);

// User management
router.get('/users', adminController.getUsers);
router.post('/users/:id/block', adminController.blockUser);
router.post('/users/:id/unblock', adminController.unblockUser);

// Request management
router.get('/requests', adminController.getRequests);

// Transaction management
router.get('/transactions', adminController.getTransactions);

// Report management
router.get('/reports', adminController.getReports);
router.patch('/reports/:id', adminController.updateReportStatus);

// Additional statistics
router.get('/stats', adminController.getStats);
router.get('/commission-stats', adminController.getCommissionStats);

// Contact message management
router.get('/contact-messages', contactController.getAllContactMessages);
router.patch('/contact-messages/:id/read', contactController.markMessageAsRead);
router.delete('/contact-messages/:id', contactController.deleteContactMessage);

module.exports = router;
