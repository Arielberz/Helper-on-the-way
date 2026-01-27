/*
  קובץ זה אחראי על:
  - טיפול בבקשות HTTP למנהלים: ניהול משתמשים, דיווחים, סטטיסטיקות
  - חסימת וביטול חסימת משתמשים, מחיקת משתמשים
  - טיפול בדיווחים על משתמשים ועדכון סטטוסם
  - לוח בקרה עם נתונים סטטיסטיים על המערכת

  הקובץ משמש את:
  - נתיב המנהל (adminRouter) עם מידלווייר מנהל
  - פאנל מנהל בצד הקליינט

  הקובץ אינו:
  - מטפל באימות מנהלים - זה במידלווייר adminMiddleware
*/

const User = require('../models/userModel');
const Request = require('../models/requestsModel');
const Transaction = require('../models/transactionModel');
const Report = require('../models/reportModel');
const sendResponse = require('../utils/sendResponse');
const { getCommissionRatePercentage } = require('../utils/commissionUtils');

exports.getOverview = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const blockedUsers = await User.countDocuments({ isBlocked: true });
        const activeRequests = await Request.countDocuments({ status: 'active' });
        const finishedRequests = await Request.countDocuments({ status: 'finished' });
        const openReports = await Report.countDocuments({ status: { $in: ['pending', 'in_review'] } });
        
        const volumeResult = await Transaction.aggregate([
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const totalVolume = volumeResult.length > 0 ? volumeResult[0].total : 0;

        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
        
        const usersByMonth = await User.aggregate([
            { $match: { createdAt: { $gte: twelveMonthsAgo } } },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        const barData = usersByMonth.map(item => ({
            month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
            count: item.count
        }));

        const requestsByType = await Request.aggregate([
            {
                $group: {
                    _id: '$problemType',
                    count: { $sum: 1 }
                }
            }
        ]);

        const pieData = requestsByType.map(item => ({
            name: item._id || 'Unknown',
            value: item.count
        }));

        sendResponse(res, 200, true, 'Dashboard overview retrieved', {
            counters: {
                totalUsers,
                blockedUsers,
                activeRequests,
                finishedRequests,
                openReports,
                totalVolume: parseFloat(totalVolume.toFixed(2))
            },
            barData,
            pieData
        });
    } catch (error) {
        console.error('Admin overview error:', error);
        sendResponse(res, 500, false, 'Server error', null);
    }
};

exports.getUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const users = await User.find()
            .select('-password -emailVerificationCode -resetPasswordToken')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await User.countDocuments();

        sendResponse(res, 200, true, 'Users retrieved', {
            users,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get users error:', error);
        sendResponse(res, 500, false, 'Server error', null);
    }
};

exports.getRequests = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const requests = await Request.find()
            .populate('user', 'username email avatar')
            .populate('helper', 'username email avatar')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Request.countDocuments();

        sendResponse(res, 200, true, 'Requests retrieved', {
            requests,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get requests error:', error);
        sendResponse(res, 500, false, 'Server error', null);
    }
};

exports.getTransactions = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const transactions = await Transaction.find()
            .populate('user', 'username email avatar')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Transaction.countDocuments();

        sendResponse(res, 200, true, 'Transactions retrieved', {
            transactions,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get transactions error:', error);
        sendResponse(res, 500, false, 'Server error', null);
    }
};

exports.getReports = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const reports = await Report.find()
            .populate('reportedBy', 'username email avatar')
            .populate('reportedUser', 'username email avatar')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Report.countDocuments();

        sendResponse(res, 200, true, 'Reports retrieved', {
            reports,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get reports error:', error);
        sendResponse(res, 500, false, 'Server error', null);
    }
};

exports.updateReportStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, reviewNotes, blockUser } = req.body;

        if (!status || !['pending', 'in_review', 'closed', 'resolved', 'dismissed'].includes(status)) {
            return sendResponse(res, 400, false, 'Invalid status');
        }

        const report = await Report.findById(id).populate('reportedUser');
        if (!report) {
            return sendResponse(res, 404, false, 'Report not found');
        }

        report.status = status;
        if (reviewNotes) {
            report.reviewNotes = reviewNotes;
        }
        if (status === 'closed' || status === 'in_review' || status === 'resolved' || status === 'dismissed') {
            report.reviewedAt = new Date();
        }

        if (blockUser && report.reportedUser) {
            const user = await User.findById(report.reportedUser._id);
            if (user && !user.isBlocked && user.role !== 'admin') {
                user.isBlocked = true;
                user.blockedAt = new Date();
                user.blockReason = reviewNotes || 'Reported by another user for violating platform terms';
                await user.save();

                report.actionTaken = 'user_blocked';
                report.actionTakenBy = req.userId;
                report.status = 'resolved';
            }
        } else if (status === 'dismissed') {
            report.actionTaken = 'report_dismissed';
            report.actionTakenBy = req.userId;
        } else if (status === 'resolved' && !blockUser) {
            report.actionTaken = 'warning';
            report.actionTakenBy = req.userId;
        }

        await report.save();

        sendResponse(res, 200, true, 'Report updated successfully', { report });
    } catch (error) {
        console.error('Update report error:', error);
        sendResponse(res, 500, false, 'Server error', null);
    }
};

exports.getStats = async (req, res) => {
    try {
        const usersByRole = await User.aggregate([
            { $group: { _id: '$role', count: { $sum: 1 } } }
        ]);

        const requestsByStatus = await Request.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        const reportsByStatus = await Report.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        const avgRatingResult = await User.aggregate([
            { $group: { _id: null, avgRating: { $avg: '$averageRating' } } }
        ]);
        const avgRating = avgRatingResult.length > 0 ? avgRatingResult[0].avgRating : 0;

        sendResponse(res, 200, true, 'Statistics retrieved', {
            usersByRole,
            requestsByStatus,
            reportsByStatus,
            avgUserRating: parseFloat(avgRating.toFixed(2))
        });
    } catch (error) {
        console.error('Get stats error:', error);
        sendResponse(res, 500, false, 'Server error', null);
    }
};

exports.blockUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason, reportId } = req.body;

        const user = await User.findById(id);
        if (!user) {
            return sendResponse(res, 404, false, 'User not found');
        }

        if (user.role === 'admin') {
            return sendResponse(res, 403, false, 'Cannot block admin users');
        }

        if (user.isBlocked) {
            return sendResponse(res, 400, false, 'User is already blocked');
        }

        user.isBlocked = true;
        user.blockedAt = new Date();
        user.blockReason = reason || 'Violated platform terms';
        await user.save();

        if (reportId) {
            const report = await Report.findById(reportId);
            if (report) {
                report.actionTaken = 'user_blocked';
                report.actionTakenBy = req.userId;
                report.status = 'resolved';
                report.reviewedAt = new Date();
                await report.save();
            }
        }

        sendResponse(res, 200, true, 'User blocked successfully', { 
            userId: user._id,
            username: user.username,
            blockedAt: user.blockedAt
        });
    } catch (error) {
        console.error('Block user error:', error);
        sendResponse(res, 500, false, 'Server error', null);
    }
};

exports.unblockUser = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id);
        if (!user) {
            return sendResponse(res, 404, false, 'User not found');
        }

        if (!user.isBlocked) {
            return sendResponse(res, 400, false, 'User is not blocked');
        }

        user.isBlocked = false;
        user.blockedAt = null;
        user.blockReason = null;
        await user.save();

        sendResponse(res, 200, true, 'User unblocked successfully', { 
            userId: user._id,
            username: user.username
        });
    } catch (error) {
        console.error('Unblock user error:', error);
        sendResponse(res, 500, false, 'Server error', null);
    }
};

exports.getCommissionStats = async (req, res) => {
    try {
        const commissionsData = await Transaction.aggregate([
            {
                $match: {
                    'commission.amount': { $exists: true, $ne: null },
                    status: 'completed'
                }
            },
            {
                $group: {
                    _id: null,
                    totalCommission: { $sum: '$commission.amount' },
                    totalTransactions: { $sum: 1 },
                    avgCommission: { $avg: '$commission.amount' },
                    totalHelperPayouts: { $sum: '$amount' }
                }
            }
        ]);

        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

        const commissionByMonth = await Transaction.aggregate([
            {
                $match: {
                    'commission.amount': { $exists: true, $ne: null },
                    status: 'completed',
                    createdAt: { $gte: twelveMonthsAgo }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    totalCommission: { $sum: '$commission.amount' },
                    transactionCount: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        const monthlyData = commissionByMonth.map(item => ({
            month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
            commission: parseFloat(item.totalCommission.toFixed(2)),
            transactions: item.transactionCount
        }));

        const stats = commissionsData.length > 0 ? commissionsData[0] : {
            totalCommission: 0,
            totalTransactions: 0,
            avgCommission: 0,
            totalHelperPayouts: 0
        };

        const totalVolume = stats.totalCommission + stats.totalHelperPayouts;

        sendResponse(res, 200, true, 'Commission statistics retrieved', {
            currentRate: getCommissionRatePercentage(),
            summary: {
                totalCommission: parseFloat(stats.totalCommission.toFixed(2)),
                totalTransactions: stats.totalTransactions,
                avgCommission: parseFloat(stats.avgCommission.toFixed(2)),
                totalHelperPayouts: parseFloat(stats.totalHelperPayouts.toFixed(2)),
                totalVolume: parseFloat(totalVolume.toFixed(2))
            },
            monthlyData
        });
    } catch (error) {
        console.error('Get commission stats error:', error);
        sendResponse(res, 500, false, 'Server error', null);
    }
};
