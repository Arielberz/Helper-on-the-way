/*
  קובץ זה אחראי על:
  - לוגיקה עסקית לניהול דירוגים
  - חישוב ועדכון ממוצע דירוגים של מסייעים
  - יצירת דירוגים חדשים
  - עדכון דירוגים קיימים

  הקובץ משמש את:
  - ratingController - העברת לוגיקה עסקית מהקונטרולר
  - פעולות CRUD על דירוגים

  הקובץ אינו:
  - מטפל בבקשות HTTP (זה תפקיד הקונטרולר)
  - מבצע אימות והרשאות
*/

const Rating = require('../models/ratingModel');
const User = require('../models/userModel');

/**
 * עדכון ממוצע הדירוג של מסייע
 * @param {string} helperId - מזהה המסייע
 * @returns {Promise<void>}
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
            averageRating: Math.round(averageRating * 100) / 100,
            ratingCount: ratings.length
        });
    } catch (error) {
        console.error('Error updating helper rating:', error);
        throw error;
    }
}

/**
 * יצירת דירוג חדש
 * @param {Object} ratingData - נתוני הדירוג
 * @param {string} ratingData.helperId - מזהה המסייע
 * @param {string} ratingData.raterId - מזהה המדרג
 * @param {string} ratingData.requestId - מזהה הבקשה
 * @param {number} ratingData.score - ציון (1-5)
 * @param {string} ratingData.review - חוות דעת (אופציונלי)
 * @returns {Promise<Object>} הדירוג החדש והמסייע המעודכן
 */
async function createRating({ helperId, raterId, requestId, score, review = '' }) {
    const newRating = new Rating({
        helper: helperId,
        rater: raterId,
        request: requestId,
        score,
        review
    });

    await newRating.save();
    await updateHelperRating(helperId);

    const updatedHelper = await User.findById(helperId, 'username averageRating ratingCount');
    const populatedRating = await Rating.findById(newRating._id)
        .populate('helper', 'username email averageRating ratingCount')
        .populate('request', 'problemType description');

    return {
        rating: populatedRating,
        updatedHelper: {
            id: updatedHelper._id,
            username: updatedHelper.username,
            averageRating: updatedHelper.averageRating,
            ratingCount: updatedHelper.ratingCount
        }
    };
}

/**
 * עדכון דירוג קיים
 * @param {string} ratingId - מזהה הדירוג
 * @param {Object} updateData - נתונים לעדכון
 * @param {number} [updateData.score] - ציון חדש
 * @param {string} [updateData.review] - חוות דעת חדשה
 * @returns {Promise<Object>} הדירוג המעודכן
 */
async function updateRating(ratingId, { score, review }) {
    const rating = await Rating.findById(ratingId);
    
    if (!rating) {
        return null;
    }

    if (score !== undefined) {
        rating.score = score;
    }

    if (review !== undefined) {
        rating.review = review;
    }

    await rating.save();
    await updateHelperRating(rating.helper);

    const populatedRating = await Rating.findById(rating._id)
        .populate('helper', 'username email')
        .populate('rater', 'username email')
        .populate('request', 'problemType description');

    return populatedRating;
}

/**
 * מחיקת דירוג ועדכון מסייע
 * @param {string} ratingId - מזהה הדירוג
 * @returns {Promise<boolean>} האם המחיקה הצליחה
 */
async function deleteRating(ratingId) {
    const rating = await Rating.findById(ratingId);
    
    if (!rating) {
        return false;
    }

    const helperId = rating.helper;
    await Rating.findByIdAndDelete(ratingId);
    await updateHelperRating(helperId);

    return true;
}

module.exports = {
    updateHelperRating,
    createRating,
    updateRating,
    deleteRating
};
