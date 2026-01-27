/*
  קובץ זה אחראי על:
  - הגדרת סכימת בקשת הסיוע במסד הנתונים
  - שדות: מבקש, מסייע, מיקום, סטטוס, סוג בעיה, תשלום, תיאור
  - אינדקסים גיאוגרפיים לחיפוש בקשות קרובות
  - מחזור חיים של בקשה: ממתינה → משוייכת → בטיפול → הושלמה/בוטלה

  הקובץ משמש את:
  - שירות וקונטרולר הבקשות
  - שירות הצ'אט (לקישור בין בקשה לשיחה)
  - שירות הניקיון האוטומטי

  הקובץ אינו:
  - מטפל בלוגיקת שיוך או עדכונים - זה בשירותים ובקונטרולרים
*/

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
    },
    helperAmount: {
      type: Number,
      default: 0,
    },
    commissionAmount: {
      type: Number,
      default: 0,
    },
    commissionRate: {
      type: Number,
      default: 10,
    },
    currency: {
      type: String,
      default: 'ILS',
      enum: ['ILS']
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

requestSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  if (this.location && typeof this.location.lat === 'number' && typeof this.location.lng === 'number') {
    this.geo = { type: 'Point', coordinates: [this.location.lng, this.location.lat] };
  }
  
  if (this.payment && this.payment.offeredAmount > 0) {
    const commissionRate = this.payment.commissionRate || 10;
    const totalIls = this.payment.offeredAmount;
    
    const commissionIls = totalIls * (commissionRate / 100);
    const helperIls = totalIls - commissionIls;
    
    this.payment.helperAmount = helperIls;
    this.payment.commissionAmount = commissionIls;
  } else if (this.payment) {
    this.payment.helperAmount = 0;
    this.payment.commissionAmount = 0;
  }
  
  next();
});

requestSchema.index({ 'location.lat': 1, 'location.lng': 1 });
requestSchema.index({ status: 1, createdAt: -1 });
requestSchema.index({ user: 1, createdAt: -1 });
requestSchema.index({ helper: 1, createdAt: -1 });
requestSchema.index({ geo: '2dsphere' });

module.exports = mongoose.model('Request', requestSchema);