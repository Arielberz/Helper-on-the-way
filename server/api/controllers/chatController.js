const Conversation = require('../models/chatModel');
const Request = require('../models/requestsModel');
/*
  קובץ זה אחראי על:
  - טיפול בבקשות HTTP לשיחות: שליפת שיחות והודעות
  - יצירת שיחות, שליחת הודעות, סימון כנקרא
  - קבלת מספר הודעות שלא נקראו
  - קורא לשירות chatService ללוגיקה עסקית

  הקובץ משמש את:
  - נתיב הצ'אט (chatRouter)
  - הצד הקליינט לניהול שיחות

  הקובץ אינו:
  - מטפל בשיחות בזמן אמת - זה ב-chatSockets
*/

const sendResponse = require('../utils/sendResponse');
const chatService = require('../services/chatService');
const { isConversationParticipant } = require('../utils/conversationUtils');

exports.getUserConversations = async (req, res) => {
  try {
    const userId = req.userId;

    const conversations = await Conversation.find({
      $or: [{ user: userId }, { helper: userId }],
      isActive: true
    })
      .populate('user', 'username email avatar')
      .populate('helper', 'username email avatar')
      .populate('request', 'problemType status location payment etaData')
      .sort({ lastMessageAt: -1 });

    sendResponse(res, 200, true, 'conversations retrieved successfully', { conversations });
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, false, 'server error');
  }
};

exports.getConversationById = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.userId;

    const conversation = await Conversation.findById(conversationId)
      .populate('user', 'username email avatar')
      .populate('helper', 'username email avatar')
      .populate('request', 'problemType status location description payment etaData');

    if (!conversation) {
      return sendResponse(res, 404, false, 'conversation not found');
    }

    if (!isConversationParticipant(conversation, userId)) {
      return sendResponse(res, 403, false, 'access denied');
    }

    sendResponse(res, 200, true, 'conversation retrieved successfully', { conversation });
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, false, 'server error');
  }
};

exports.getOrCreateConversation = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.userId;

    const request = await Request.findById(requestId);
    if (!request) {
      return sendResponse(res, 404, false, 'request not found');
    }

    if (
      request.user.toString() !== userId &&
      (!request.helper || request.helper.toString() !== userId)
    ) {
      return sendResponse(res, 403, false, 'access denied');
    }

    let conversation = await Conversation.findOne({ request: requestId })
      .populate('user', 'username email avatar')
      .populate('helper', 'username email avatar')
      .populate('request', 'problemType status location description payment etaData');

    if (!conversation) {
      let helperId = request.helper;
      if (!helperId) {
        if (request.user.toString() === userId) {
          return sendResponse(res, 400, false, 'you cannot be the helper for your own request');
        }
        helperId = userId;
      }

      conversation = new Conversation({
        request: requestId,
        user: request.user,
        helper: helperId,
        messages: []
      });

      await conversation.save();
      
      conversation = await Conversation.findById(conversation._id)
        .populate('user', 'username email avatar')
        .populate('helper', 'username email avatar')
        .populate('request', 'problemType status location description payment etaData');
    }

    sendResponse(res, 200, true, 'conversation retrieved successfully', { conversation });
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, false, 'server error');
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { content } = req.body;
    const userId = req.userId;

    if (!content || !content.trim()) {
      return sendResponse(res, 400, false, 'message content is required');
    }

    const { conversation, message } = await chatService.appendMessage({
      conversationId,
      senderId: userId,
      content: content.trim()
    });

    const updatedConversation = await Conversation.findById(conversationId)
      .populate('user', 'username email')
      .populate('helper', 'username email')
      .populate('request', 'problemType status location payment etaData');

    sendResponse(res, 201, true, 'message sent successfully', { conversation: updatedConversation });
  } catch (error) {
    if (error.code === 'CONVERSATION_NOT_FOUND') {
      return sendResponse(res, 404, false, 'conversation not found');
    }
    if (error.code === 'NOT_PARTICIPANT') {
      return sendResponse(res, 403, false, 'access denied');
    }
    console.error(error);
    sendResponse(res, 500, false, 'server error');
  }
};

exports.markMessagesAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.userId;

    const conversation = await chatService.markConversationRead({
      conversationId,
      userId
    });

    try {
      const io = req.app.get('io');
      if (io) {
        const otherUserId = conversation.user.toString() === userId
          ? conversation.helper.toString()
          : conversation.user.toString();
        io.to(`user:${String(otherUserId)}`).emit('messages_read', { conversationId, readBy: userId });
      }
    } catch (e) {
      console.warn('⚠️ Failed to emit messages_read from REST path:', e.message);
    }

    sendResponse(res, 200, true, 'messages marked as read');
  } catch (error) {
    if (error.code === 'CONVERSATION_NOT_FOUND') {
      return sendResponse(res, 404, false, 'conversation not found');
    }
    if (error.code === 'NOT_PARTICIPANT') {
      return sendResponse(res, 403, false, 'access denied');
    }
    console.error(error);
    sendResponse(res, 500, false, 'server error');
  }
};

exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.userId;

    const conversations = await Conversation.find({
      $or: [{ user: userId }, { helper: userId }],
      isActive: true
    });

    let unreadCount = 0;
    conversations.forEach(conversation => {
      conversation.messages.forEach(message => {
        if (message.sender.toString() !== userId && !message.read) {
          unreadCount++;
        }
      });
    });

    sendResponse(res, 200, true, 'unread count retrieved', { unreadCount });
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, false, 'server error');
  }
};

exports.archiveConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.userId;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return sendResponse(res, 404, false, 'conversation not found');
    }

    if (!isConversationParticipant(conversation, userId)) {
      return sendResponse(res, 403, false, 'access denied');
    }

    conversation.isActive = false;
    await conversation.save();

    sendResponse(res, 200, true, 'conversation archived successfully');
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, false, 'server error');
  }
};

exports.deleteConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.userId;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return sendResponse(res, 404, false, 'conversation not found');
    }

    if (!isConversationParticipant(conversation, userId)) {
      return sendResponse(res, 403, false, 'access denied');
    }

    await Conversation.findByIdAndDelete(conversationId);

    sendResponse(res, 200, true, 'conversation and all messages deleted successfully');
  } catch (error) {
    console.error('Error deleting conversation:', error);
    sendResponse(res, 500, false, 'server error');
  }
};
