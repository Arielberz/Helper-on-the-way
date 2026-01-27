/*
  קובץ זה אחראי על:
  - הגדרת כל הנתיבים הקשורים לדיווחים
  - נתיבים: יצירת דיווח, שליפת דיווחים
  - חיבור בין הקונטרולר לאפליקציה הראשית
  - כל הנתיבים דורשים אימות

  הקובץ משמש את:
  - app.js (רושם את הראוטר)
  - הצד הקליינט לדיווח על משתמשים

  הקובץ אינו:
  - מכיל לוגיקה - זה בקונטרולר
*/

const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const authMiddleware = require('../authMiddleware');

router.use(authMiddleware);

router.post('/report', reportController.createReport);

router.get('/my-reports', reportController.getUserReports);

router.get('/all', reportController.getAllReports);

module.exports = router;
