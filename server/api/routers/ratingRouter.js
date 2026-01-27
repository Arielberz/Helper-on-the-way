/*
  קובץ זה אחראי על:
  - הגדרת כל הנתיבים הקשורים לדירוגים
  - נתיבים: יצירה, שליפה, עדכון דירוגים
  - חיבור בין הקונטרולר לאפליקציה הראשית
  - כל הנתיבים דורשים אימות

  הקובץ משמש את:
  - app.js (רושם את הראוטר)
  - הצד הקליינט לתצוגת דירוגים

  הקובץ אינו:
  - מכיל לוגיקה - זה בקונטרולר
*/

const express = require('express');
const ratingController = require('../controllers/ratingController');
const authMiddleware = require('../authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, ratingController.createRating);

router.get('/:requestId/check', authMiddleware, ratingController.checkIfRated);

router.get('/:id', ratingController.getRatingById);

router.put('/:id', authMiddleware, ratingController.updateRating);

router.delete('/:id', authMiddleware, ratingController.deleteRating);

module.exports = router;
module.exports.getRatingsByHelper = ratingController.getRatingsByHelper;
