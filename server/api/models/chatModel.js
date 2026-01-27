/*
  קובץ זה אחראי על:
  - הגדרת סכימת שיחת הצ'אט במסד הנתונים
  - שתי סכימות: Conversation (שיחה) ו-Message (הודעה)
  - שדות לשיחה: משתתפים, בקשת סיוע, הודעה אחרונה, סטטוס קריאה
  - שדות להודעה: שולח, תוכן, זמן שליחה, סטטוס קריאה

  הקובץ משמש את:
  - שירות וקונטרולר הצ'אט
  - Socket.IO לשיחות בזמן אמת (chatSockets)
  - הצד הקליינט לתצוגת שיחות

  הקובץ אינו:
  - מטפל בשליחת הודעות - זה בשירות וב-sockets
*/

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const messageSchema = new Schema({
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 5000
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  read: {
    type: Boolean,
    default: false
  },
  isSystemMessage: {
    type: Boolean,
    default: false
  },
  systemMessageType: {
    type: String,
    enum: ['end_treatment', 'helper_assigned', 'payment_sent', 'payment_pending', 'payment_accepted', 'other'],
    required: false
  },
  requestId: {
    type: Schema.Types.ObjectId,
    ref: 'Request',
    required: false
  }
});

const conversationSchema = new Schema({
  request: {
    type: Schema.Types.ObjectId,
    ref: 'Request',
    required: true
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  helper: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  messages: [messageSchema],
  lastMessageAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

conversationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  if (this.messages && this.messages.length > 0) {
    this.lastMessageAt = this.messages[this.messages.length - 1].timestamp;
  }
  next();
});

conversationSchema.index({ user: 1, lastMessageAt: -1 });
conversationSchema.index({ helper: 1, lastMessageAt: -1 });
conversationSchema.index({ request: 1 });
conversationSchema.index({ isActive: 1, lastMessageAt: -1 });

module.exports = mongoose.model('Conversation', conversationSchema);
