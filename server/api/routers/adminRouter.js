/*
  קובץ זה אחראי על:
  - הגדרת כל הנתיבים הקשורים למנהלים
  - נתיבים: ניהול משתמשים, דיווחים, סטטיסטיקות
  - חיבור בין הקונטרולר לאפליקציה הראשית
  - כל הנתיבים דורשים אימות והרשאות מנהל

  הקובץ משמש את:
  - app.js (רושם את הראוטר)
  - פאנל מנהל בצד הקליינט

  הקובץ אינו:
  - מכיל לוגיקה - זה בקונטרולר
*/

const express = require('express');
const router = express.Router();
const authMiddleware = require('../authMiddleware');
const { adminOnly } = require('../authMiddleware');
const adminController = require('../controllers/adminController');
const contactController = require('../controllers/contactController');

router.use(authMiddleware);
router.use(adminOnly);

router.get('/overview', adminController.getOverview);

router.get('/users', adminController.getUsers);
router.post('/users/:id/block', adminController.blockUser);
router.post('/users/:id/unblock', adminController.unblockUser);

router.get('/requests', adminController.getRequests);

router.get('/transactions', adminController.getTransactions);

router.get('/reports', adminController.getReports);
router.patch('/reports/:id', adminController.updateReportStatus);

router.get('/stats', adminController.getStats);
router.get('/commission-stats', adminController.getCommissionStats);

router.get('/contact-messages', contactController.getAllContactMessages);
router.patch('/contact-messages/:id/read', contactController.markMessageAsRead);
router.delete('/contact-messages/:id', contactController.deleteContactMessage);

module.exports = router;
