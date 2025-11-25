const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const requestSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  location: {
    lat: {
      type: Number,
      required: true,
    },
    lng: {
      type: Number,
      required: true,
    },
    address: {
      type: String,
      default: '',
    }
  },
  problemType: {
    type: String,
    required: true,
    enum: [
      'flat_tire',
      'dead_battery',
      'out_of_fuel',
      'engine_problem',
      'locked_out',
      'accident',
      'towing_needed',
      'other'
    ]
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000,
  },
  photos: [
    {
      url: {
        type: String,
        required: true,
      },
      uploadedAt: {
        type: Date,
        default: Date.now,
      }
    }
  ],
  status: {
    type: String,
    required: true,
    enum: [
      'pending',
      'assigned',
      'in_progress',
      'completed',
      'cancelled'
    ],
    default: 'pending',
  },
  helper: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  assignedAt: {
    type: Date,
    default: null,
  },
  completedAt: {
    type: Date,
    default: null,
  },
  helperCompletedAt: {
    type: Date,
    default: null,
  },
  requesterConfirmedAt: {
    type: Date,
    default: null,
  },
  estimatedArrival: {
    type: Date,
    default: null,
  },
  payment: {
    offeredAmount: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      default: 'ILS',
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    paidAt: {
      type: Date,
      default: null,
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'credit_card', 'paypal', 'bank_transfer', 'other'],
      default: null,
    }
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
});

// Update the updatedAt timestamp on save
requestSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for geospatial queries
requestSchema.index({ 'location.lat': 1, 'location.lng': 1 });
requestSchema.index({ status: 1, createdAt: -1 });
requestSchema.index({ user: 1, createdAt: -1 });
requestSchema.index({ helper: 1, createdAt: -1 });

module.exports = mongoose.model('Request', requestSchema);