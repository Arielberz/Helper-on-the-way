/*
  קובץ זה אחראי על:
  - טיפול בבקשות HTTP לדירוגים: יצירה, שליפה, עדכון
  - קבלת דירוגים לפי מסייע וחישוב ממוצעים
  - בדיקת דירוגים ממתינים לבקשות
  - אכיפת הרשאות: רק מבקש יכול לדרג מסייע

  הקובץ משמש את:
  - נתיב הדירוגים (ratingRouter)
  - נתיב המשתמשים (userRouter) להצגת דירוגי מסייע
  - הצד הקליינט לתצוגת דירוגים

  הקובץ אינו:
  - מכיל לוגיקה עסקית (זה ב-ratingsService)
*/

const Rating = require('../models/ratingModel');
const Request = require('../models/requestsModel');
const User = require('../models/userModel');
const sendResponse = require('../utils/sendResponse');
const ratingsService = require('../services/ratingsService');

exports.createRating = async (req, res) => {
    try {
        const { requestId, score, review } = req.body;
        const raterId = req.userId;

        if (!requestId || !score) {
            return sendResponse(res, 400, false, 'Request ID and score are required');
        }

        if (!Number.isInteger(score) || score < 1 || score > 5) {
            return sendResponse(res, 400, false, 'Score must be an integer between 1 and 5');
        }

        const request = await Request.findById(requestId).populate('user helper');
        if (!request) {
            return sendResponse(res, 404, false, 'Request not found');
        }

        if (request.status !== 'completed') {
            return sendResponse(res, 400, false, 'Only completed requests can be rated');
        }

        if (request.user._id.toString() !== raterId) {
            return sendResponse(res, 403, false, 'Only the request owner can rate the helper');
        }

        if (!request.helper) {
            return sendResponse(res, 400, false, 'No helper assigned to this request');
        }

        const helperId = request.helper._id;

        const existingRating = await Rating.findOne({ request: requestId });
        if (existingRating) {
            return sendResponse(res, 409, false, 'This request has already been rated. Use update to modify the rating.');
        }

        const result = await ratingsService.createRating({
            helperId,
            raterId,
            requestId,
            score,
            review: review || ''
        });

        sendResponse(res, 201, true, 'Rating created successfully', result);
    } catch (error) {
        console.error('Error creating rating:', error);
        sendResponse(res, 500, false, 'Server error while creating rating', error.message);
    }
};

exports.getRatingsByHelper = async (req, res) => {
    try {
        const { id: helperId } = req.params;
        const { page = 1, limit = 10 } = req.query;

        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);

        if (pageNum < 1 || limitNum < 1 || limitNum > 100) {
            return sendResponse(res, 400, false, 'Invalid pagination parameters');
        }

        const skip = (pageNum - 1) * limitNum;

        const [ratings, totalCount, helper] = await Promise.all([
            Rating.find({ helper: helperId })
                .populate('request', 'problemType createdAt')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limitNum),
            Rating.countDocuments({ helper: helperId }),
            User.findById(helperId, 'username averageRating ratingCount')
        ]);

        if (!helper) {
            return sendResponse(res, 404, false, 'Helper not found');
        }

        const totalPages = Math.ceil(totalCount / limitNum);

        sendResponse(res, 200, true, 'Ratings retrieved successfully', {
            helper: {
                id: helper._id,
                username: helper.username,
                averageRating: helper.averageRating,
                ratingCount: helper.ratingCount
            },
            ratings,
            pagination: {
                currentPage: pageNum,
                totalPages,
                totalCount,
                limit: limitNum,
                hasNextPage: pageNum < totalPages,
                hasPrevPage: pageNum > 1
            }
        });
    } catch (error) {
        console.error('Error getting ratings:', error);
        sendResponse(res, 500, false, 'Server error while retrieving ratings', error.message);
    }
};

exports.updateRating = async (req, res) => {
    try {
        const { id: ratingId } = req.params;
        const { score, review } = req.body;
        const raterId = req.userId;

        const rating = await Rating.findById(ratingId);
        if (!rating) {
            return sendResponse(res, 404, false, 'Rating not found');
        }

        if (rating.rater.toString() !== raterId) {
            return sendResponse(res, 403, false, 'You can only update your own ratings');
        }

        if (score !== undefined) {
            if (!Number.isInteger(score) || score < 1 || score > 5) {
                return sendResponse(res, 400, false, 'Score must be an integer between 1 and 5');
            }
        }

        const updatedRating = await ratingsService.updateRating(ratingId, { score, review });

        sendResponse(res, 200, true, 'Rating updated successfully', updatedRating);
    } catch (error) {
        console.error('Error updating rating:', error);
        sendResponse(res, 500, false, 'Server error while updating rating', error.message);
    }
};

exports.deleteRating = async (req, res) => {
    try {
        const { id: ratingId } = req.params;
        const raterId = req.userId;

        const rating = await Rating.findById(ratingId);
        if (!rating) {
            return sendResponse(res, 404, false, 'Rating not found');
        }

        if (rating.rater.toString() !== raterId) {
            return sendResponse(res, 403, false, 'You can only delete your own ratings');
        }

        const deleted = await ratingsService.deleteRating(ratingId);

        if (!deleted) {
            return sendResponse(res, 404, false, 'Rating not found');
        }

        sendResponse(res, 200, true, 'Rating deleted successfully');
    } catch (error) {
        console.error('Error deleting rating:', error);
        sendResponse(res, 500, false, 'Server error while deleting rating', error.message);
    }
};

exports.getRatingById = async (req, res) => {
    try {
        const { id: ratingId } = req.params;

        const rating = await Rating.findById(ratingId)
            .populate('helper', 'username email averageRating ratingCount')
            .populate('rater', 'username')
            .populate('request', 'problemType description status');

        if (!rating) {
            return sendResponse(res, 404, false, 'Rating not found');
        }

        sendResponse(res, 200, true, 'Rating retrieved successfully', rating);
    } catch (error) {
        console.error('Error getting rating:', error);
        sendResponse(res, 500, false, 'Server error while retrieving rating', error.message);
    }
};

exports.checkIfRated = async (req, res) => {
    try {
        const { requestId } = req.params;
        const userId = req.userId;

        const rating = await Rating.findOne({ request: requestId, rater: userId });

        sendResponse(res, 200, true, 'Rating check completed', {
            alreadyRated: !!rating,
            rating: rating || null
        });
    } catch (error) {
        console.error('Error checking rating:', error);
        sendResponse(res, 500, false, 'Server error while checking rating', error.message);
    }
};
