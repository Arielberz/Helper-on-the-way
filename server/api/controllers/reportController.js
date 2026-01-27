/*
  קובץ זה אחראי על:
  - טיפול בבקשות HTTP לדיווחים על משתמשים
  - יצירת דיווחים חדשים ושליפת דיווחים קיימים
  - וולידציה שלא ניתן לדווח על עצמך
  - אכיפת הרשאות ובדיקות קיום משתמש

  הקובץ משמש את:
  - נתיב הדיווחים (reportRouter)
  - הצד הקליינט לדיווח על משתמשים

  הקובץ אינו:
  - מטפל בחסימת משתמשים - זה בקונטרולר המנהל
*/

const Report = require('../models/reportModel');
const User = require('../models/userModel');
const Conversation = require('../models/chatModel');
const sendResponse = require('../utils/sendResponse');
const { isConversationParticipant } = require('../utils/conversationUtils');

exports.createReport = async (req, res) => {
  try {
    const { reportedUserId, conversationId, reason, description } = req.body;
    const reportedBy = req.userId;

    if (!reportedUserId || !reason || !description) {
      return sendResponse(res, 400, false, 'Missing required fields');
    }

    const reportedUser = await User.findById(reportedUserId);
    if (!reportedUser) {
      return sendResponse(res, 404, false, 'Reported user not found');
    }

    if (reportedUserId === reportedBy) {
      return sendResponse(res, 400, false, 'Cannot report yourself');
    }

    if (conversationId) {
      const conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        return sendResponse(res, 404, false, 'Conversation not found');
      }

      if (!isConversationParticipant(conversation, reportedBy)) {
        return sendResponse(res, 403, false, 'You are not part of this conversation');
      }
    }

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
