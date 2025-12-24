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