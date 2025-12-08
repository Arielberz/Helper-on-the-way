const express = require('express');
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../authMiddleware');
const router = express.Router();

// PayPal payment routes
router.post('/create-order', authMiddleware, paymentController.createOrder);
router.post('/capture-order', authMiddleware, paymentController.captureOrder);

// Balance payment route
router.post('/pay-with-balance', authMiddleware, paymentController.payWithBalance);

module.exports = router;
