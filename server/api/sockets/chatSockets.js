const Conversation = require('../models/chatModel');
const Request = require('../models/requestsModel');
const verifyToken = require('../utils/verifyToken');
const chatService = require('../services/chatService');
const { isConversationParticipant } = require('../utils/conversationUtils');
const { calculateETAWithDistance } = require('../utils/etaUtils');

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

    socket.join(`user:${socket.userId}`);


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

    // ========== ETA FEATURE ==========
    // Helper sends location updates for ETA calculation
    socket.on('helperLocationUpdate', async (data) => {
      try {

        const { requestId, latitude, longitude } = data;
        
        if (!requestId || typeof latitude !== 'number' || typeof longitude !== 'number') {
          console.warn('⚠️ Invalid location data:', data);
          return socket.emit('eta:error', { message: 'Invalid location data' });
        }
        
        // Validate coordinates
        if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
          return socket.emit('eta:error', { message: 'Invalid coordinates' });
        }
        
        // Fetch the request
        const request = await Request.findById(requestId).populate('user', 'username');
        
        if (!request) {
          return socket.emit('eta:error', { message: 'Request not found' });
        }
        
        // Verify helper is assigned to this request
        if (request.helper?.toString() !== socket.userId) {
          return socket.emit('eta:error', { message: 'Not authorized' });
        }
        
        // Only calculate ETA for assigned requests
        if (request.status !== 'assigned') {
          return;
        }
        
        // Calculate ETA and distance using OSRM
        const etaResult = await calculateETAWithDistance(
          latitude,
          longitude,
          request.location.lat,
          request.location.lng
        );
        
        const now = Date.now();
        const etaPayload = {
          requestId,
          etaSeconds: etaResult.etaSeconds,
          distanceMeters: etaResult.distanceMeters,
          distanceKm: etaResult.distanceMeters / 1000,
          etaMinutes: etaResult.etaSeconds / 60,
          helperLocation: { lat: latitude, lng: longitude },
          timestamp: now
        };
        
        // Store ETA in database for persistence
        await Request.findByIdAndUpdate(requestId, {
          etaData: {
            etaSeconds: etaResult.etaSeconds,
            distanceMeters: etaResult.distanceMeters,
            helperLocation: { lat: latitude, lng: longitude },
            updatedAt: now
          }
        });
        
        // Emit ETA to requester's personal room
        io.to(`user:${request.user._id}`).emit('etaUpdated', etaPayload);
        
        // Also emit to the conversation room so requester gets it even if only in chat
        const conversation = await Conversation.findOne({ request: requestId });
        if (conversation) {
          io.to(`conversation:${conversation._id}`).emit('etaUpdated', etaPayload);
        }

        
      } catch (error) {
        console.error('Error handling helper location update:', error);
        socket.emit('eta:error', { message: 'Failed to update ETA' });
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {

    });

    // Error handling for socket-level errors
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });
};

module.exports = initializeChatSockets;
