const Conversation = require('../models/chatModel');
const jwt = require('jsonwebtoken');

// Socket.IO authentication middleware
const authenticateSocket = (socket, next) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.id || decoded.userId;
    next();
  } catch (error) {
    next(new Error('Authentication error: Invalid token'));
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
        if (
          conversation.user.toString() !== socket.userId &&
          conversation.helper.toString() !== socket.userId
        ) {
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
        const { conversationId, content } = data;

        if (!content || !content.trim()) {
          return socket.emit('chat:error', { message: 'Message content is required' });
        }

        const conversation = await Conversation.findById(conversationId);
        
        if (!conversation) {
          return socket.emit('chat:error', { message: 'Conversation not found' });
        }

        // Verify user is part of this conversation
        if (
          conversation.user.toString() !== socket.userId &&
          conversation.helper.toString() !== socket.userId
        ) {
          return socket.emit('chat:error', { message: 'Access denied' });
        }

        // Create new message
        const newMessage = {
          sender: socket.userId,
          content: content.trim(),
          timestamp: new Date(),
          read: false
        };

        conversation.messages.push(newMessage);
        await conversation.save();

        // Get the saved message (with _id)
        const savedMessage = conversation.messages[conversation.messages.length - 1];

        // Emit to all users in this conversation
        io.to(`conversation:${conversationId}`).emit('new_message', {
          conversationId,
          message: savedMessage
        });
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('chat:error', { message: 'Failed to send message' });
      }
    });

    // Mark messages as read
    socket.on('mark_as_read', async (data) => {
      try {
        const { conversationId } = data;

        const conversation = await Conversation.findById(conversationId);
        
        if (!conversation) {
          return socket.emit('chat:error', { message: 'Conversation not found' });
        }

        // Verify user is part of this conversation
        if (
          conversation.user.toString() !== socket.userId &&
          conversation.helper.toString() !== socket.userId
        ) {
          return socket.emit('chat:error', { message: 'Access denied' });
        }

        // Mark all messages not sent by this user as read
        let updated = false;
        conversation.messages.forEach(message => {
          if (message.sender.toString() !== socket.userId && !message.read) {
            message.read = true;
            updated = true;
          }
        });

        if (updated) {
          await conversation.save();
          
          // Notify other user that messages were read
          const otherUserId = conversation.user.toString() === socket.userId 
            ? conversation.helper.toString() 
            : conversation.user.toString();
          
          io.to(`user:${otherUserId}`).emit('messages_read', {
            conversationId,
            readBy: socket.userId
          });
        }

        socket.emit('marked_as_read', { conversationId });
      } catch (error) {
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
