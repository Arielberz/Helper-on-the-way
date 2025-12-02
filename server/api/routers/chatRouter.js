const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const authMiddleware = require('../authMiddleware');

// All routes require authentication
router.use(authMiddleware);

// Get all conversations for the authenticated user
router.get('/conversations', chatController.getUserConversations);

// Get unread message count
router.get('/unread-count', chatController.getUnreadCount);

// Get or create a conversation for a specific request
router.get('/conversation/request/:requestId', chatController.getOrCreateConversation);

// Get a specific conversation by ID
router.get('/conversation/:conversationId', chatController.getConversationById);

// Send a message (REST fallback, socket.io preferred)
router.post('/conversation/:conversationId/message', chatController.sendMessage);

// Mark messages as read
router.patch('/conversation/:conversationId/read', chatController.markMessagesAsRead);

// Archive/close a conversation
router.patch('/conversation/:conversationId/archive', chatController.archiveConversation);

// Delete a conversation
router.delete('/conversation/:conversationId', chatController.deleteConversation);

module.exports = router;
