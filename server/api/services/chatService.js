/*
  קובץ זה אחראי על:
  - לוגיקה עסקית של צ'אט: יצירת שיחות, שליחת הודעות
  - שאילות מורכבות למסד הנתונים
  - סימון הודעות כנקראות וביטול סימון
  - חישוב הודעות שלא נקראו
  - אכיפת הרשאות למשתתפים בשיחה

  הקובץ משמש את:
  - chatController.js
  - chatSockets.js (לשיחות בזמן אמת)
  - requestsService.js (יוצר שיחות לבקשות)

  הקובץ אינו:
  - מטפל בבקשות HTTP - זה בקונטרולר
  - משדר הודעות Socket.IO - זה ב-sockets
*/

const Conversation = require('../models/chatModel');

async function appendMessage({ conversationId, senderId, content, isSystemMessage, systemMessageType, requestId }) {
  const conversation = await Conversation.findById(conversationId);
  
  if (!conversation) {
    const err = new Error('Conversation not found');
    err.code = 'CONVERSATION_NOT_FOUND';
    throw err;
  }

  const isParticipant =
    conversation.user.toString() === senderId ||
    conversation.helper.toString() === senderId;

  if (!isParticipant) {
    const err = new Error('User not authorized for this conversation');
    err.code = 'NOT_PARTICIPANT';
    throw err;
  }

  const message = {
    sender: senderId,
    content,
    timestamp: new Date(),
    read: false
  };

  if (isSystemMessage) {
    message.isSystemMessage = true;
    if (systemMessageType) {
      message.systemMessageType = systemMessageType;
    }
    if (requestId) {
      message.requestId = requestId;
    }
  }

  conversation.messages.push(message);
  await conversation.save();

  const savedMessage = conversation.messages[conversation.messages.length - 1];
  
  return { conversation, message: savedMessage };
}

async function markConversationRead({ conversationId, userId }) {
  const conversation = await Conversation.findById(conversationId);
  
  if (!conversation) {
    const err = new Error('Conversation not found');
    err.code = 'CONVERSATION_NOT_FOUND';
    throw err;
  }

  const isParticipant =
    conversation.user.toString() === userId ||
    conversation.helper.toString() === userId;

  if (!isParticipant) {
    const err = new Error('User not authorized for this conversation');
    err.code = 'NOT_PARTICIPANT';
    throw err;
  }

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
