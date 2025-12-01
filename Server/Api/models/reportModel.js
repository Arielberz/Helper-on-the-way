const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reportSchema = new Schema({
  reportedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reportedUser: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  conversation: {
    type: Schema.Types.ObjectId,
    ref: 'Conversation',
    required: false
  },
  reason: {
    type: String,
    required: true,
    enum: [
      'illegal_activity',
      'harassment',
      'inappropriate_content',
      'scam',
      'violence_threat',
      'other'
    ]
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  reviewedAt: {
    type: Date
  },
  reviewNotes: {
    type: String
  }
});

module.exports = mongoose.model('Report', reportSchema);
