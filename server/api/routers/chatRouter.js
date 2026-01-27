/*
  קובץ זה אחראי על:
  - הגדרת כל הנתיבים הקשורים לצ'אט
  - נתיבים: שיחות, הודעות, סימון כנקרא
  - חיבור בין הקונטרולר לאפליקציה הראשית
  - כל הנתיבים דורשים אימות

  הקובץ משמש את:
  - app.js (רושם את הראוטר)
  - הצד הקליינט לניהול שיחות

  הקובץ אינו:
  - מכיל לוגיקה - זה בקונטרולר ובשירותים
*/

const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const authMiddleware = require('../authMiddleware');

router.use(authMiddleware);

router.get('/conversations', chatController.getUserConversations);

router.get('/unread-count', chatController.getUnreadCount);

router.get('/conversation/request/:requestId', chatController.getOrCreateConversation);

router.get('/conversation/:conversationId', chatController.getConversationById);

router.post('/conversation/:conversationId/message', chatController.sendMessage);

router.patch('/conversation/:conversationId/read', chatController.markMessagesAsRead);

router.patch('/conversation/:conversationId/archive', chatController.archiveConversation);

router.delete('/conversation/:conversationId', chatController.deleteConversation);

module.exports = router;
