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
  // Live ETA tracking data
  etaData: {
    etaSeconds: {
      type: Number,
      default: null,
    },
    distanceMeters: {
      type: Number,
      default: null,
    },
    helperLocation: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
    },
    updatedAt: {
      type: Date,
      default: null,
    },
  },
  payment: {
    offeredAmount: {
      type: Number,
      default: 0,
      // NOTE: Stored in agorot (1 ILS = 100 agorot) to avoid floating-point errors
      // Example: 50 ILS = 5000 agorot
    },
    helperAmount: {
      type: Number,
      default: 0,
      // NOTE: Stored in agorot
    },
    commissionAmount: {
      type: Number,
      default: 0,
      // NOTE: Stored in agorot
    },
    commissionRate: {
      type: Number,
      default: 10, // 10% commission
    },
    currency: {
      type: String,
      default: 'ILS',
      enum: ['ILS']  // Only ILS supported
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
      enum: ['cash', 'credit_card', 'paypal', 'bank_transfer', 'balance', 'free', 'other'],
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
  
  // Calculate commission and helper amount automatically (amounts are in agorot)
  if (this.payment && this.payment.offeredAmount > 0) {
    const commissionRate = this.payment.commissionRate || 10;
    const totalAgorot = this.payment.offeredAmount;
    
    // Calculate commission in agorot
    const commissionAgorot = Math.round(totalAgorot * (commissionRate / 100));
    const helperAgorot = totalAgorot - commissionAgorot;
    
    this.payment.helperAmount = helperAgorot;
    this.payment.commissionAmount = commissionAgorot;
  } else if (this.payment) {
    this.payment.helperAmount = 0;
    this.payment.commissionAmount = 0;
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