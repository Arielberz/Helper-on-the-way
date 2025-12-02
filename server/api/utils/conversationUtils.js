/**
 * Conversation Utility Functions
 * Helper functions for conversation-related operations
 */

/**
 * Check if a user is a participant in a conversation
 * @param {Object} conversation - The conversation object
 * @param {String} userId - The user ID to check
 * @returns {Boolean} True if user is a participant (either user or helper)
 */
function isConversationParticipant(conversation, userId) {
  if (!conversation || !userId) return false;
  
  const userIdStr = userId.toString();
  
  return (
    conversation.user.toString() === userIdStr ||
    conversation.helper.toString() === userIdStr
  );
}

module.exports = {
  isConversationParticipant
};
