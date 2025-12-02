const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Schema for individual messages
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
  }
});

// Schema for conversations
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

// Update timestamps on save
conversationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  if (this.messages && this.messages.length > 0) {
    this.lastMessageAt = this.messages[this.messages.length - 1].timestamp;
  }
  next();
});

// Indexes for efficient queries
conversationSchema.index({ user: 1, lastMessageAt: -1 });
conversationSchema.index({ helper: 1, lastMessageAt: -1 });
conversationSchema.index({ request: 1 });
conversationSchema.index({ isActive: 1, lastMessageAt: -1 });

module.exports = mongoose.model('Conversation', conversationSchema);
