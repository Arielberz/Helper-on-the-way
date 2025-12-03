const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const REQUEST_STATUS = require('../constants/requestStatus');
const PROBLEM_TYPES = require('../constants/problemTypes');

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
  geo: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      index: '2dsphere',
      default: undefined
    }
  },
  problemType: {
    type: String,
    required: true,
    enum: [
      PROBLEM_TYPES.FLAT_TIRE,
      PROBLEM_TYPES.DEAD_BATTERY,
      PROBLEM_TYPES.OUT_OF_FUEL,
      PROBLEM_TYPES.ENGINE_PROBLEM,
      PROBLEM_TYPES.LOCKED_OUT,
      PROBLEM_TYPES.ACCIDENT,
      PROBLEM_TYPES.TOWING_NEEDED,
      PROBLEM_TYPES.OTHER
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
      REQUEST_STATUS.PENDING,
      REQUEST_STATUS.ASSIGNED,
      REQUEST_STATUS.IN_PROGRESS,
      REQUEST_STATUS.COMPLETED,
      REQUEST_STATUS.CANCELLED
    ],
    default: REQUEST_STATUS.PENDING,
  },
  helper: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  pendingHelpers: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      requestedAt: {
        type: Date,
        default: Date.now,
      },
      message: {
        type: String,
        maxlength: 500,
        default: '',
      },
      location: {
        lat: {
          type: Number,
          default: null,
        },
        lng: {
          type: Number,
          default: null,
        }
      }
    }
  ],
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
  if (this.location && typeof this.location.lat === 'number' && typeof this.location.lng === 'number') {
    this.geo = { type: 'Point', coordinates: [this.location.lng, this.location.lat] };
  }
  next();
});

// Index for geospatial queries
requestSchema.index({ 'location.lat': 1, 'location.lng': 1 });
requestSchema.index({ status: 1, createdAt: -1 });
requestSchema.index({ user: 1, createdAt: -1 });
requestSchema.index({ helper: 1, createdAt: -1 });
requestSchema.index({ geo: '2dsphere' });

module.exports = mongoose.model('Request', requestSchema);