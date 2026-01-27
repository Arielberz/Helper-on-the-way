/*
  קובץ זה אחראי על:
  - הגדרת נתיבים לטופס צור הקשר
  - נתיב: שליחת הודעת צור קשר
  - חיבור בין הקונטרולר לאפליקציה הראשית
  - נתיב פתוח (ללא אימות)

  הקובץ משמש את:
  - app.js (רושם את הראוטר)
  - דף צור קשר בצד הקליינט

  הקובץ אינו:
  - מכיל לוגיקה - זה בקונטרולר
*/

const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');

router.post('/', contactController.submitContactMessage);

module.exports = router;
