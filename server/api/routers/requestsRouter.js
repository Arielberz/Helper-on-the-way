/*
  קובץ זה אחראי על:
  - הגדרת כל הנתיבים הקשורים לבקשות סיוע
  - נתיבים: יצירה, עדכון, שיוך, שליפה, מחיקה
  - חיבור בין הקונטרולר לאפליקציה הראשית
  - כל הנתיבים דורשים אימות

  הקובץ משמש את:
  - app.js (רושם את הראוטר)
  - הצד הקליינט לניהול בקשות

  הקובץ אינו:
  - מכיל לוגיקה - זה בקונטרולר ובשירותים
*/

const express = require('express');
const router = express.Router();
const authMiddleware = require('../authMiddleware');
const requestsController = require('../controllers/requestsController');
const {
  createRequest,
  getRequests,
  getActiveRequests,
  getRequestById,
  getMyRequests,
  updateRequestStatus,
  assignHelper,
  requestToHelp,
  confirmHelper,
  rejectHelper,
  cancelHelperAssignment,
  cancelRequest,
  addPhotos,
  deleteRequest,
  updatePayment,
  getRoute
} = requestsController;

router.post('/', authMiddleware, createRequest);

router.get('/', authMiddleware, getRequests);

router.get('/active', authMiddleware, getActiveRequests);

router.get('/my-requests', authMiddleware, getMyRequests);

router.get('/route', authMiddleware, getRoute);

router.get('/:id', authMiddleware, getRequestById);

router.patch('/:id/status', authMiddleware, updateRequestStatus);

router.post('/:id/request-help', authMiddleware, requestToHelp);

router.post('/:id/confirm-helper', authMiddleware, confirmHelper);

router.post('/:id/reject-helper', authMiddleware, rejectHelper);

router.post('/:id/cancel-help', authMiddleware, cancelHelperAssignment);

router.post('/:id/cancel', authMiddleware, cancelRequest);

router.post('/:id/assign', authMiddleware, assignHelper);

router.patch('/:id/accept', authMiddleware, assignHelper);

router.patch('/:id', authMiddleware, require('../controllers/requestsController').updateRequest);

router.post('/:id/photos', authMiddleware, addPhotos);

router.patch('/:id/payment', authMiddleware, updatePayment);

router.delete('/:id', authMiddleware, deleteRequest);

module.exports = router;