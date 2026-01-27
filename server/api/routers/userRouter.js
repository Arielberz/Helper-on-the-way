/*
  קובץ זה אחראי על:
  - הגדרת כל הנתיבים הקשורים למשתמשים
  - נתיבים: רישום, התחברות, פרופיל, שחזור סיסמה
  - חיבור בין הקונטרולר לאפליקציה הראשית
  - שימוש במידלווייר אימות לנתיבים מוגנים

  הקובץ משמש את:
  - app.js (רושם את הראוטר)
  - הצד הקליינט לפעולות משתמש

  הקובץ אינו:
  - מכיל לוגיקה - זה בקונטרולר ובשירותים
*/

const express = require('express');
const userController = require('../controllers/userController');
const { getRatingsByHelper } = require('../controllers/ratingController');
const authMiddleware = require('../authMiddleware');
const router = express.Router();

router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/verify-email', userController.verifyEmail);
router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password', userController.resetPassword);
router.get('/me', authMiddleware, userController.getMe);
router.get('/location/ip', userController.getLocationFromIP);

router.post('/avatar', authMiddleware, userController.uploadAvatar);
router.delete('/avatar', authMiddleware, userController.deleteAvatar);

router.get('/wallet', authMiddleware, userController.getWallet);
router.post('/wallet/withdraw', authMiddleware, userController.requestWithdrawal);

router.get('/:id/ratings', getRatingsByHelper);

module.exports = router;