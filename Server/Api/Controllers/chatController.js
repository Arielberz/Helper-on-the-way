const Conversation = require('../models/chatModel');
const Request = require('../models/requestsModel');

function sendResponse(res, status, success, message, data = null) {
  res.status(status).json({ success, message, data });
}

// Get all conversations for a user (both as requester and helper)
exports.getUserConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    const conversations = await Conversation.find({
      $or: [{ user: userId }, { helper: userId }],
      isActive: true
    })
      .populate('user', 'username email')
      .populate('helper', 'username email')
      .populate('request', 'problemType status location')
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
    const userId = req.user.id;

    const conversation = await Conversation.findById(conversationId)
      .populate('user', 'username email')
      .populate('helper', 'username email')
      .populate('request', 'problemType status location description');

    if (!conversation) {
      return sendResponse(res, 404, false, 'conversation not found');
    }

    // Check if user is part of this conversation
    if (
      conversation.user._id.toString() !== userId &&
      conversation.helper._id.toString() !== userId
    ) {
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
    const userId = req.user.id;

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
      .populate('user', 'username email')
      .populate('helper', 'username email')
      .populate('request', 'problemType status location description');

    if (!conversation) {
      // Create new conversation only if there's a helper assigned
      if (!request.helper) {
        return sendResponse(res, 400, false, 'no helper assigned to this request yet');
      }

      conversation = new Conversation({
        request: requestId,
        user: request.user,
        helper: request.helper,
        messages: []
      });

      await conversation.save();
      
      // Populate fields after saving
      conversation = await Conversation.findById(conversation._id)
        .populate('user', 'username email')
        .populate('helper', 'username email')
        .populate('request', 'problemType status location description');
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
    const userId = req.user.id;

    if (!content || !content.trim()) {
      return sendResponse(res, 400, false, 'message content is required');
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return sendResponse(res, 404, false, 'conversation not found');
    }

    // Verify user is part of conversation
    if (
      conversation.user.toString() !== userId &&
      conversation.helper.toString() !== userId
    ) {
      return sendResponse(res, 403, false, 'access denied');
    }

    // Add message
    conversation.messages.push({
      sender: userId,
      content: content.trim(),
      timestamp: new Date()
    });

    await conversation.save();

    const updatedConversation = await Conversation.findById(conversationId)
      .populate('user', 'username email')
      .populate('helper', 'username email')
      .populate('request', 'problemType status location');

    sendResponse(res, 201, true, 'message sent successfully', { conversation: updatedConversation });
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, false, 'server error');
  }
};

// Mark messages as read
exports.markMessagesAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return sendResponse(res, 404, false, 'conversation not found');
    }

    // Verify user is part of conversation
    if (
      conversation.user.toString() !== userId &&
      conversation.helper.toString() !== userId
    ) {
      return sendResponse(res, 403, false, 'access denied');
    }

    // Mark all messages not sent by this user as read
    conversation.messages.forEach(message => {
      if (message.sender.toString() !== userId) {
        message.read = true;
      }
    });

    await conversation.save();

    sendResponse(res, 200, true, 'messages marked as read');
  } catch (error) {
    console.error(error);
    sendResponse(res, 500, false, 'server error');
  }
};

// Get unread message count
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

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
    const userId = req.user.id;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return sendResponse(res, 404, false, 'conversation not found');
    }

    // Verify user is part of conversation
    if (
      conversation.user.toString() !== userId &&
      conversation.helper.toString() !== userId
    ) {
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
