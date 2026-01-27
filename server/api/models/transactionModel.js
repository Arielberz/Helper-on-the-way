/*
  קובץ זה אחראי על:
  - הגדרת סכימת העסקאות הכספיות במסד הנתונים
  - שדות: משתמש, סוג (הפקדה/משיכה), סכום, סטטוס, יד פייפאל
  - תמיכה בעמולות ויירואות שונים
  - מעקב היסטוריית תנועות בארנק המשתמש

  הקובץ משמש את:
  - שירות וקונטרולר התשלומים
  - שירות המשתמשים לייצוג יתרת הארנק
  - קונטרולר המנהל להצגת עסקאות

  הקובץ אינו:
  - מבצע עסקאות פייפאל - זה בשירות paypalService
*/

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const transactionSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    type: {
        type: String,
        enum: ['earning', 'withdrawal', 'refund', 'adjustment', 'payment'],
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    balanceBefore: {
        type: Number,
        required: true
    },
    balanceAfter: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'ILS'
    },
    description: {
        type: String,
        required: true
    },
    request: {
        type: Schema.Types.ObjectId,
        ref: 'Request',
        default: null
    },
    commission: {
        amount: {
            type: Number,
            default: null
        },
        rate: {
            type: Number,
            default: null
        }
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed', 'cancelled'],
        default: 'completed'
    },
    withdrawalDetails: {
        method: {
            type: String,
            enum: ['bank_transfer', 'paypal', 'cash', 'other'],
            default: null
        },
        accountInfo: {
            type: String,
            default: null
        },
        processedAt: {
            type: Date,
            default: null
        }
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    }
});

transactionSchema.index({ user: 1, createdAt: -1 });
transactionSchema.index({ user: 1, type: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
