/*
  קובץ זה אחראי על:
  - הגדרת כל הנתיבים הקשורים לתשלומים
  - נתיבים: PayPal, ארנק, משיכות, עסקאות
  - חיבור בין הקונטרולר לאפליקציה הראשית
  - כל הנתיבים דורשים אימות

  הקובץ משמש את:
  - app.js (רושם את הראוטר)
  - הצד הקליינט לעסקאות כספיות

  הקובץ אינו:
  - מכיל לוגיקה - זה בקונטרולר ובשירותים
*/

const express = require('express');
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../authMiddleware');
const router = express.Router();

router.post('/create-order', authMiddleware, paymentController.createOrder);
router.post('/capture-order', authMiddleware, paymentController.captureOrder);

router.post('/pay-with-balance', authMiddleware, paymentController.payWithBalance);

module.exports = router;
