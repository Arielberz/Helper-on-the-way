const Rating = require('../models/ratingModel');
const Request = require('../models/requestsModel');
const User = require('../models/userModel');

function sendResponse(res, status, success, message, data = null) {
    res.status(status).json({ success, message, data });
}

/**
 * Helper function to recalculate and update a helper's average rating
 */
async function updateHelperRating(helperId) {
    try {
        const ratings = await Rating.find({ helper: helperId });
        
        if (ratings.length === 0) {
            await User.findByIdAndUpdate(helperId, {
                averageRating: 0,
                ratingCount: 0
            });
            return;
        }

        const totalScore = ratings.reduce((sum, rating) => sum + rating.score, 0);
        const averageRating = totalScore / ratings.length;

        await User.findByIdAndUpdate(helperId, {
            averageRating: Math.round(averageRating * 100) / 100, // Round to 2 decimal places
            ratingCount: ratings.length
        });
    } catch (error) {
        console.error('Error updating helper rating:', error);
        throw error;
    }
}

/**
 * Create a new rating
 * POST /api/ratings
 * Protected route - requires authentication
 */
exports.createRating = async (req, res) => {
    try {
        const { requestId, score, review } = req.body;
        const raterId = req.userId; // From auth middleware

        // Validate required fields
        if (!requestId || !score) {
            return sendResponse(res, 400, false, 'Request ID and score are required');
        }

        // Validate score
        if (!Number.isInteger(score) || score < 1 || score > 5) {
            return sendResponse(res, 400, false, 'Score must be an integer between 1 and 5');
        }

        // Find the request
        const request = await Request.findById(requestId).populate('user helper');
        if (!request) {
            return sendResponse(res, 404, false, 'Request not found');
        }

        // Check if the request is completed
        if (request.status !== 'completed') {
            return sendResponse(res, 400, false, 'Only completed requests can be rated');
        }

        // Check if the rater is the owner of the request
        if (request.user._id.toString() !== raterId) {
            return sendResponse(res, 403, false, 'Only the request owner can rate the helper');
        }

        // Check if there is a helper assigned
        if (!request.helper) {
            return sendResponse(res, 400, false, 'No helper assigned to this request');
        }

        const helperId = request.helper._id;

        // Check if a rating already exists for this request
        const existingRating = await Rating.findOne({ request: requestId });
        if (existingRating) {
            return sendResponse(res, 409, false, 'This request has already been rated. Use update to modify the rating.');
        }

        // Create the rating
        const newRating = new Rating({
            helper: helperId,
            rater: raterId,
            request: requestId,
            score,
            review: review || ''
        });

        await newRating.save();

        // Update helper's average rating
        await updateHelperRating(helperId);

        // Populate the rating with user and request details
        const populatedRating = await Rating.findById(newRating._id)
            .populate('helper', 'username email')
            .populate('rater', 'username email')
            .populate('request', 'problemType description');

        sendResponse(res, 201, true, 'Rating created successfully', populatedRating);
    } catch (error) {
        console.error('Error creating rating:', error);
        sendResponse(res, 500, false, 'Server error while creating rating', error.message);
    }
};

/**
 * Get all ratings for a specific helper
 * GET /api/users/:id/ratings
 * Public route
 */
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
                .populate('rater', 'username')
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

/**
 * Update an existing rating
 * PUT /api/ratings/:id
 * Protected route - requires authentication
 */
exports.updateRating = async (req, res) => {
    try {
        const { id: ratingId } = req.params;
        const { score, review } = req.body;
        const raterId = req.userId; // From auth middleware

        // Find the rating
        const rating = await Rating.findById(ratingId);
        if (!rating) {
            return sendResponse(res, 404, false, 'Rating not found');
        }

        // Check if the user is the owner of the rating
        if (rating.rater.toString() !== raterId) {
            return sendResponse(res, 403, false, 'You can only update your own ratings');
        }

        // Update fields if provided
        if (score !== undefined) {
            if (!Number.isInteger(score) || score < 1 || score > 5) {
                return sendResponse(res, 400, false, 'Score must be an integer between 1 and 5');
            }
            rating.score = score;
        }

        if (review !== undefined) {
            rating.review = review;
        }

        await rating.save();

        // Update helper's average rating
        await updateHelperRating(rating.helper);

        // Populate the updated rating
        const populatedRating = await Rating.findById(rating._id)
            .populate('helper', 'username email')
            .populate('rater', 'username email')
            .populate('request', 'problemType description');

        sendResponse(res, 200, true, 'Rating updated successfully', populatedRating);
    } catch (error) {
        console.error('Error updating rating:', error);
        sendResponse(res, 500, false, 'Server error while updating rating', error.message);
    }
};

/**
 * Delete a rating
 * DELETE /api/ratings/:id
 * Protected route - requires authentication
 */
exports.deleteRating = async (req, res) => {
    try {
        const { id: ratingId } = req.params;
        const raterId = req.userId; // From auth middleware

        // Find the rating
        const rating = await Rating.findById(ratingId);
        if (!rating) {
            return sendResponse(res, 404, false, 'Rating not found');
        }

        // Check if the user is the owner of the rating
        if (rating.rater.toString() !== raterId) {
            return sendResponse(res, 403, false, 'You can only delete your own ratings');
        }

        const helperId = rating.helper;

        await Rating.findByIdAndDelete(ratingId);

        // Update helper's average rating
        await updateHelperRating(helperId);

        sendResponse(res, 200, true, 'Rating deleted successfully');
    } catch (error) {
        console.error('Error deleting rating:', error);
        sendResponse(res, 500, false, 'Server error while deleting rating', error.message);
    }
};

/**
 * Get a specific rating by ID
 * GET /api/ratings/:id
 * Public route
 */
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
