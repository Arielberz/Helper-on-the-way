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
        unique: true  // Each request can only be rated once
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

// Update the updatedAt timestamp on save
ratingSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Compound index to ensure a user can only rate a request once
ratingSchema.index({ request: 1, rater: 1 }, { unique: true });

// Index for querying ratings by helper
ratingSchema.index({ helper: 1, createdAt: -1 });

module.exports = mongoose.model('Rating', ratingSchema);
