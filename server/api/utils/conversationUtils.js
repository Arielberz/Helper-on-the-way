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
  
  // Helper function to extract ID from either ObjectId or populated object
  const extractId = (field) => {
    if (!field) return null;
    // If populated, field will have _id property
    if (field._id) return field._id.toString();
    // If not populated, it's the ObjectId itself
    return field.toString();
  };
  
  // Check if user is the requester
  const conversationUserId = extractId(conversation.user);
  if (conversationUserId === userIdStr) {
    return true;
  }
  
  // Check if user is the helper (handle null/undefined helper)
  const conversationHelperId = extractId(conversation.helper);
  if (conversationHelperId === userIdStr) {
    return true;
  }
  
  return false;
}

module.exports = {
  isConversationParticipant
};
