const Report = require('../models/reportModel');
const User = require('../models/userModel');
const Conversation = require('../models/chatModel');
const sendResponse = require('../utils/sendResponse');
const { isConversationParticipant } = require('../utils/conversationUtils');

// Create a new report
exports.createReport = async (req, res) => {
  try {
    const { reportedUserId, conversationId, reason, description } = req.body;
    const reportedBy = req.userId;

    // Validate required fields
    if (!reportedUserId || !reason || !description) {
      return sendResponse(res, 400, false, 'Missing required fields');
    }

    // Check if reported user exists
    const reportedUser = await User.findById(reportedUserId);
    if (!reportedUser) {
      return sendResponse(res, 404, false, 'Reported user not found');
    }

    // Prevent self-reporting
    if (reportedUserId === reportedBy) {
      return sendResponse(res, 400, false, 'Cannot report yourself');
    }

    // If conversation is provided, verify it exists and user is part of it
    if (conversationId) {
      const conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        return sendResponse(res, 404, false, 'Conversation not found');
      }

      // Verify reporter is part of the conversation
      if (!isConversationParticipant(conversation, reportedBy)) {
        return sendResponse(res, 403, false, 'You are not part of this conversation');
      }
    }

    // Create the report
    const report = new Report({
      reportedBy,
      reportedUser: reportedUserId,
      conversation: conversationId || null,
      reason,
      description,
      status: 'pending'
    });

    await report.save();



    sendResponse(res, 201, true, 'Report submitted successfully. We will review it shortly.', { reportId: report._id });
  } catch (error) {
    console.error('Error creating report:', error);
    sendResponse(res, 500, false, 'Server error');
  }
};

// Get all reports (admin only - would need admin middleware)
exports.getAllReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('reportedBy', 'username email')
      .populate('reportedUser', 'username email')
      .populate('conversation')
      .sort({ createdAt: -1 });

    sendResponse(res, 200, true, 'Reports retrieved successfully', { reports });
  } catch (error) {
    console.error('Error fetching reports:', error);
    sendResponse(res, 500, false, 'Server error');
  }
};

// Get reports created by user
exports.getUserReports = async (req, res) => {
  try {
    const userId = req.userId;

    const reports = await Report.find({ reportedBy: userId })
      .populate('reportedUser', 'username')
      .sort({ createdAt: -1 });

    sendResponse(res, 200, true, 'Your reports retrieved successfully', { reports });
  } catch (error) {
    console.error('Error fetching user reports:', error);
    sendResponse(res, 500, false, 'Server error');
  }
};

module.exports = exports;
