const Conversation = require('../models/chatModel');
const verifyToken = require('../utils/verifyToken');
const chatService = require('../services/chatService');
const { isConversationParticipant } = require('../utils/conversationUtils');

// Socket.IO authentication middleware
const authenticateSocket = (socket, next) => {
  try {
    const rawToken = socket.handshake.auth.token || socket.handshake.headers.authorization;
    
    const { decoded, userId } = verifyToken(rawToken);
    socket.userId = userId;
    next();
  } catch (error) {
    if (error.code === 'NO_TOKEN') {
      return next(new Error('Authentication error: No token provided'));
    }
    if (error.name === 'JsonWebTokenError') {
      return next(new Error('Authentication error: Invalid token'));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new Error('Authentication error: Token expired'));
    }
    return next(new Error('Authentication error: Invalid token'));
  }
};

// Initialize chat socket handlers
const initializeChatSockets = (io) => {
  // Use authentication middleware
  io.use(authenticateSocket);

  io.on('connection', (socket) => {
    console.log('✅ New client connected:', socket.id);
    socket.join(`user:${socket.userId}`);
    console.log(`User ${socket.userId} joined their room`);

    // Note: Removed insecure 'join' and client-sourced global broadcasts ('newRequest', 'toggleHelper')

    // Join a specific conversation room
    socket.on('join_conversation', async (conversationId) => {
      try {
        const conversation = await Conversation.findById(conversationId);
        
        if (!conversation) {
          return socket.emit('chat:error', { message: 'Conversation not found' });
        }

        // Verify user is part of this conversation
        if (!isConversationParticipant(conversation, socket.userId)) {
          return socket.emit('chat:error', { message: 'Access denied' });
        }

        socket.join(`conversation:${conversationId}`);
        socket.emit('joined_conversation', { conversationId });
      } catch (error) {
        console.error('Error joining conversation:', error);
        socket.emit('chat:error', { message: 'Failed to join conversation' });
      }
    });

    socket.on('leave_conversation', (conversationId) => {
      socket.leave(`conversation:${conversationId}`);
      socket.emit('left_conversation', { conversationId });
    });

    // Send a message
    socket.on('send_message', async (data) => {
      try {
        const { conversationId, content, isSystemMessage, systemMessageType, requestId } = data;

        if (!content || !content.trim()) {
          return socket.emit('chat:error', { message: 'Message content is required' });
        }

        // Use chat service to append message
        const { conversation, message } = await chatService.appendMessage({
          conversationId,
          senderId: socket.userId,
          content: content.trim(),
          isSystemMessage,
          systemMessageType,
          requestId
        });

        // Emit to all users in this conversation
        io.to(`conversation:${conversationId}`).emit('new_message', {
          conversationId,
          message
        });
      } catch (error) {
        if (error.code === 'CONVERSATION_NOT_FOUND') {
          return socket.emit('chat:error', { message: 'Conversation not found' });
        }
        if (error.code === 'NOT_PARTICIPANT') {
          return socket.emit('chat:error', { message: 'Access denied' });
        }
        console.error('Error sending message:', error);
        socket.emit('chat:error', { message: 'Failed to send message' });
      }
    });

    // Mark messages as read
    socket.on('mark_as_read', async (data) => {
      try {
        const { conversationId } = data;

        // Use chat service to mark messages as read
        const conversation = await chatService.markConversationRead({
          conversationId,
          userId: socket.userId
        });

        // Notify other user that messages were read
        const otherUserId = conversation.user.toString() === socket.userId 
          ? conversation.helper.toString() 
          : conversation.user.toString();
        
        io.to(`user:${otherUserId}`).emit('messages_read', {
          conversationId,
          readBy: socket.userId
        });

        socket.emit('marked_as_read', { conversationId });
      } catch (error) {
        if (error.code === 'CONVERSATION_NOT_FOUND') {
          return socket.emit('chat:error', { message: 'Conversation not found' });
        }
        if (error.code === 'NOT_PARTICIPANT') {
          return socket.emit('chat:error', { message: 'Access denied' });
        }
        console.error('Error marking messages as read:', error);
        socket.emit('chat:error', { message: 'Failed to mark messages as read' });
      }
    });

    // User is typing indicator
    socket.on('typing', (data) => {
      const { conversationId, isTyping } = data || {};
      const room = `conversation:${conversationId}`;
      // Verify socket joined the conversation room to prevent noise/abuse
      if (!conversationId || !socket.rooms.has(room)) return;
      socket.volatile.to(room).emit('user_typing', {
        conversationId,
        userId: socket.userId,
        isTyping
      });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);
    });

    // Error handling for socket-level errors
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });
};

module.exports = initializeChatSockets;
