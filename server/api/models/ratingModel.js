/*
  קובץ זה אחראי על:
  - הגדרת סכימת דירוגי המסייעים במסד הנתונים
  - שדות: מדרג, מסייע, מבקש, בקשת סיוע, תגובה
  - ולידציה לדירוג ייחודי אחד לכל בקשה
  - אינדקסים לחיפוש דירוגים לפי מסייע

  הקובץ משמש את:
  - שירות וקונטרולר הדירוגים
  - נתיבי המשתמשים לתצוגת דירוגי מסייעים
  - הצד הקליינט להצגת דירוגים

  הקובץ אינו:
  - מטפל בחישוב ממוצעים - זה נעשה בשירות הדירוגים
*/

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ratingSchema = new Schema({
    helper: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    rater: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    request: {
        type: Schema.Types.ObjectId,
        ref: 'Request',
        required: true,
        index: true,
        unique: true
    },
    score: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
        validate: {
            validator: Number.isInteger,
            message: 'Score must be an integer between 1 and 5'
        }
    },
    review: {
        type: String,
        trim: true,
        maxlength: 500,
        default: ''
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

ratingSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

ratingSchema.index({ request: 1, rater: 1 }, { unique: true });

ratingSchema.index({ helper: 1, createdAt: -1 });

module.exports = mongoose.model('Rating', ratingSchema);
