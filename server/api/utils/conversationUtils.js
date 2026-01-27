/*
  קובץ זה אחראי על:
  - פונקציות עזר לניהול שיחות
  - בדיקה אם משתמש הוא משתתף בשיחה
  - אכיפת הרשאות לגישה לשיחות
  - ולידציות של משתתפים

  הקובץ משמש את:
  - chatController.js
  - chatSockets.js
  - reportController.js

  הקובץ אינו:
  - מבצע שאילות מסד נתונים - רק פונקציות עזר
*/

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
  
  const extractId = (field) => {
    if (!field) return null;
    if (field._id) return field._id.toString();
    return field.toString();
  };
  
  const conversationUserId = extractId(conversation.user);
  if (conversationUserId === userIdStr) {
    return true;
  }
  
  const conversationHelperId = extractId(conversation.helper);
  if (conversationHelperId === userIdStr) {
    return true;
  }
  
  return false;
}

module.exports = {
  isConversationParticipant
};
