const Conversation = require('../models/chatModel');
const Request = require('../models/requestsModel');
const sendResponse = require('../utils/sendResponse');
const chatService = require('../services/chatService');
const { isConversationParticipant } = require('../utils/conversationUtils');

// Get all conversations for a user (both as requester and helper)
exports.getUserConversations = async (req, res) => {
  try {
    const userId = req.userId;

    const conversations = await Conversation.find({
      $or: [{ user: userId }, { helper: userId }],
      isActive: true
    })
      .populate('user', 'username email avatar')
      .populate('helper', 'username email avatar')
      .populate('request', 'problemType status location payment')
      .sort({ lastMessageAt: -1 });

    sendResponse(res, 200, true, 'conversations retrieved successfully', { conversations });
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, false, 'server error');
  }
};

// Get a specific conversation by ID
exports.getConversationById = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.userId;

    const conversation = await Conversation.findById(conversationId)
      .populate('user', 'username email avatar')
      .populate('helper', 'username email avatar')
      .populate('request', 'problemType status location description payment');

    if (!conversation) {
      return sendResponse(res, 404, false, 'conversation not found');
    }

    // Check if user is part of this conversation
    if (!isConversationParticipant(conversation, userId)) {
      return sendResponse(res, 403, false, 'access denied');
    }

    sendResponse(res, 200, true, 'conversation retrieved successfully', { conversation });
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, false, 'server error');
  }
};

// Get or create a conversation for a request
exports.getOrCreateConversation = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.userId;

    // Find the request
    const request = await Request.findById(requestId);
    if (!request) {
      return sendResponse(res, 404, false, 'request not found');
    }

    // Check if user is part of this request (either as requester or helper)
    if (
      request.user.toString() !== userId &&
      (!request.helper || request.helper.toString() !== userId)
    ) {
      return sendResponse(res, 403, false, 'access denied');
    }

    // Check if a conversation already exists for this request
    let conversation = await Conversation.findOne({ request: requestId })
      .populate('user', 'username email avatar')
      .populate('helper', 'username email avatar')
      .populate('request', 'problemType status location description payment');

    if (!conversation) {
      // Determine helper - either the assigned helper or the current user (if they're trying to help)
      let helperId = request.helper;
      
      // If no helper assigned yet, assign current user as helper if they're not the requester
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
      
      // Populate fields after saving
      conversation = await Conversation.findById(conversation._id)
        .populate('user', 'username email avatar')
        .populate('helper', 'username email avatar')
        .populate('request', 'problemType status location description payment');
    }

    sendResponse(res, 200, true, 'conversation retrieved successfully', { conversation });
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, false, 'server error');
  }
};

// Send a message (mainly for REST fallback, socket.io is preferred)
exports.sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { content } = req.body;
    const userId = req.userId;

    if (!content || !content.trim()) {
      return sendResponse(res, 400, false, 'message content is required');
    }

    // Use chat service to append message
    const { conversation, message } = await chatService.appendMessage({
      conversationId,
      senderId: userId,
      content: content.trim()
    });

    const updatedConversation = await Conversation.findById(conversationId)
      .populate('user', 'username email')
      .populate('helper', 'username email')
      .populate('request', 'problemType status location payment');

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

// Mark messages as read
exports.markMessagesAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.userId;

    // Use chat service to mark messages as read
    const conversation = await chatService.markConversationRead({
      conversationId,
      userId
    });

    // Emit socket notification to the other user as well
    try {
      const io = req.app.get('io');
      if (io) {
        const otherUserId = conversation.user.toString() === userId
          ? conversation.helper.toString()
          : conversation.user.toString();
        io.to(`user:${String(otherUserId)}`).emit('messages_read', { conversationId, readBy: userId });
      }
    } catch (e) {
      // Non-fatal: logging only
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

// Get unread message count
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

// Archive/close a conversation
exports.archiveConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.userId;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return sendResponse(res, 404, false, 'conversation not found');
    }

    // Verify user is part of conversation
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

// Delete a conversation (including all its messages)
exports.deleteConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.userId;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return sendResponse(res, 404, false, 'conversation not found');
    }

    // Verify user is part of conversation
    if (!isConversationParticipant(conversation, userId)) {
      return sendResponse(res, 403, false, 'access denied');
    }

    // Log the deletion for debugging
    console.log(`Deleting conversation ${conversationId} with ${conversation.messages.length} messages`);

    // Delete the entire conversation document (including all embedded messages)
    const result = await Conversation.findByIdAndDelete(conversationId);
    
    if (!result) {
      return sendResponse(res, 500, false, 'failed to delete conversation');
    }

    console.log(`Successfully deleted conversation ${conversationId}`);
    sendResponse(res, 200, true, 'conversation and all messages deleted successfully');
  } catch (error) {
    console.error('Error deleting conversation:', error);
    sendResponse(res, 500, false, 'server error');
  }
};
