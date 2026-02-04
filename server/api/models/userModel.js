/*
  קובץ זה אחראי על:
  - הגדרת סכימת המשתמש במסד הנתונים
  - שדות: שם משתמש, אימייל, טלפון, סיסמה מוצפנת, סטטוס מנהל וחסימה
  - ולידציות ואינדקסים לשדות ייחודיים
  - תמיכה בתמונת פרופיל, קודי אימות ואיפוס סיסמה

  הקובץ משמש את:
  - שירות המשתמשים והקונטרולר שלהם
  - מידלווייר האימות (authMiddleware)
  - מודלים אחרים שמפנים למשתמשים (requests, chat, rating)

  הקובץ אינו:
  - מכיל לוגיקה עסקית - זה נמצא בשירותים ובקונטרולרים
*/

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    email:{
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    ratingCount: {
        type: Number,
        default: 0,
        min: 0
    },
    avatar: {
        type: String,
        default: null
    },
    balance: {
        type: Number,
        default: 0,
        min: 0,
        required: true
    },
    totalEarnings: {
        type: Number,
        default: 0,
        min: 0,
        required: true
    },
    totalWithdrawals: {
        type: Number,
        default: 0,
        min: 0,
        required: true
    },
    emailVerified: {
        type: Boolean,
        default: false
    },
    emailVerificationCode: {
        type: String
    },
    emailVerificationExpires: {
        type: Date
    },
    phoneVerified: {
        type: Boolean,
        default: false
    },
    phoneVerifiedAt: {
        type: Date
    },
    resetPasswordToken: {
        type: String
    },
    resetPasswordExpires: {
        type: Date
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    blockedAt: {
        type: Date
    },
    blockReason: {
        type: String
    },
    termsAccepted: {
        type: Boolean,
        default: false
    },
    termsAcceptedAt: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', userSchema);