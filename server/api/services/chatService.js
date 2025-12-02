/**
 * Chat Service - Shared business logic for chat operations
 * Used by both HTTP controllers and Socket.IO handlers
 */
const Conversation = require('../models/chatModel');

/**
 * Append a new message to a conversation
 * @param {Object} params - Parameters object
 * @param {String} params.conversationId - Conversation ID
 * @param {String} params.senderId - User ID of the sender
 * @param {String} params.content - Message content
 * @returns {Object} { conversation, message } - Updated conversation and the new message
 * @throws {Error} With code property for specific error handling
 */
async function appendMessage({ conversationId, senderId, content }) {
  const conversation = await Conversation.findById(conversationId);
  
  if (!conversation) {
    const err = new Error('Conversation not found');
    err.code = 'CONVERSATION_NOT_FOUND';
    throw err;
  }

  // Verify user is a participant
  const isParticipant =
    conversation.user.toString() === senderId ||
    conversation.helper.toString() === senderId;

  if (!isParticipant) {
    const err = new Error('User not authorized for this conversation');
    err.code = 'NOT_PARTICIPANT';
    throw err;
  }

  // Create new message
  const message = {
    sender: senderId,
    content,
    timestamp: new Date(),
    read: false
  };

  conversation.messages.push(message);
  await conversation.save();

  // Return the saved message (with _id)
  const savedMessage = conversation.messages[conversation.messages.length - 1];
  
  return { conversation, message: savedMessage };
}

/**
 * Mark messages as read in a conversation
 * @param {Object} params - Parameters object
 * @param {String} params.conversationId - Conversation ID
 * @param {String} params.userId - User ID marking messages as read
 * @returns {Object} conversation - Updated conversation
 * @throws {Error} With code property for specific error handling
 */
async function markConversationRead({ conversationId, userId }) {
  const conversation = await Conversation.findById(conversationId);
  
  if (!conversation) {
    const err = new Error('Conversation not found');
    err.code = 'CONVERSATION_NOT_FOUND';
    throw err;
  }

  // Verify user is a participant
  const isParticipant =
    conversation.user.toString() === userId ||
    conversation.helper.toString() === userId;

  if (!isParticipant) {
    const err = new Error('User not authorized for this conversation');
    err.code = 'NOT_PARTICIPANT';
    throw err;
  }

  // Mark all messages not sent by this user as read
  let updated = false;
  for (const msg of conversation.messages) {
    if (msg.sender.toString() !== userId && !msg.read) {
      msg.read = true;
      updated = true;
    }
  }

  if (updated) {
    await conversation.save();
  }

  return conversation;
}

module.exports = {
  appendMessage,
  markConversationRead
};
