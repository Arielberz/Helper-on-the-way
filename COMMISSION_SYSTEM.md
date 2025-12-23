# Commission System Documentation

## Overview
The platform charges a **10% commission** on all paid help requests. The commission is automatically calculated and deducted before crediting the helper's wallet.

## How It Works

### 1. Payment Flow
```
Requester pays → 100₪
Platform commission (10%) → 10₪
Helper receives → 90₪
```

### 2. Calculation Logic
- **Commission Rate**: 10% (configurable in `commissionUtils.js`)
- **Helper Amount**: Rounded to 1 decimal place (e.g., 89.7₪)
- **Commission**: Total - Helper Amount (remainder after rounding)

### 3. Database Schema

#### Request Model (`requestsModel.js`)
```javascript
payment: {
  offeredAmount: Number,      // Total amount requester pays
  helperAmount: Number,        // Amount helper receives (after commission)
  commissionAmount: Number,    // Platform commission
  commissionRate: Number,      // Commission percentage (default: 10)
  currency: String,
  isPaid: Boolean,
  paidAt: Date,
  paymentMethod: String
}
```

#### Transaction Model (`transactionModel.js`)
```javascript
{
  user: ObjectId,
  type: 'earning' | 'payment',
  amount: Number,              // Actual amount added/deducted
  commission: {
    amount: Number,            // Commission amount
    rate: Number               // Commission rate percentage
  },
  balanceBefore: Number,
  balanceAfter: Number,
  request: ObjectId
}
```

## Implementation

### Backend

#### 1. Commission Calculation (`commissionUtils.js`)
```javascript
const COMMISSION_RATE = 0.10; // 10%

function calculateCommission(totalAmount) {
  const approximateHelperAmount = totalAmount * (1 - COMMISSION_RATE);
  const helperAmount = roundToClean(approximateHelperAmount); // Round to 1 decimal
  const commissionAmount = totalAmount - helperAmount;
  
  return { commissionAmount, helperAmount };
}
```

#### 2. Payment Processing (`paymentController.js`)
- **PayPal Payment**: `captureOrder` function
- **Balance Payment**: `payWithBalance` function

Both functions:
1. Calculate commission using `calculateCommission()`
2. Credit helper's wallet with `helperAmount` only
3. Save commission details to request
4. Create transaction record with commission info

#### 3. Auto-calculation (`requestsModel.js` pre-save hook)
```javascript
requestSchema.pre('save', function(next) {
  if (this.payment && this.payment.offeredAmount > 0) {
    const commissionRate = this.payment.commissionRate || 10;
    const approximateHelperAmount = this.payment.offeredAmount * (1 - commissionRate / 100);
    this.payment.helperAmount = Math.round(approximateHelperAmount * 10) / 10;
    this.payment.commissionAmount = this.payment.offeredAmount - this.payment.helperAmount;
  }
  next();
});
```

### Frontend

#### 1. Display Helper Amount (`RequestMarkers.jsx`)
Shows the amount helper will receive (after commission):
```jsx
{m.payment?.offeredAmount > 0 && (
  <span className="popup-price">
    {m.payment.helperAmount || Math.round(m.payment.offeredAmount * 0.9 * 10) / 10}₪
  </span>
)}
```

#### 2. Payment Modal (`PaymentModal.jsx`)
Shows commission breakdown to requester:
```jsx
<div>
  <span>💵 העוזר יקבל:</span>
  <span>{request.payment.helperAmount}₪</span>
</div>
<div>
  <span>📊 עמלת פלטפורמה (10%):</span>
  <span>{request.payment.commissionAmount}₪</span>
</div>
```

## Key Points

✅ **Helper Always Sees Net Amount**: Helpers only see what they'll actually receive
✅ **Requester Sees Breakdown**: Payment modal shows commission split
✅ **Automatic Calculation**: Commission calculated on save (no manual updates needed)
✅ **Transaction Transparency**: All transactions record commission details
✅ **Rounded Amounts**: Helper receives clean amounts (rounded to 1 decimal)

## Testing

### Test Scenarios
1. **₪100 Payment**
   - Helper receives: ₪90
   - Commission: ₪10

2. **₪37 Payment**
   - Helper receives: ₪33.3
   - Commission: ₪3.7

3. **Free Help (₪0)**
   - No commission charged
   - Transaction marked as 'free'

### Verify
- Check helper's wallet balance after payment
- Review transaction records for commission field
- Confirm request's payment object has all fields populated

## Files Modified

**Backend:**
- `server/api/models/requestsModel.js` - Added payment fields + pre-save hook
- `server/api/controllers/paymentController.js` - Save commission details
- `server/api/utils/commissionUtils.js` - Commission calculation (already existed)

**Frontend:**
- `client/src/components/MapLive/components/RequestMarkers.jsx` - Display helper amount
- `client/src/pages/chat/components/PaymentModal.jsx` - Show commission breakdown
- `client/src/components/NearbyRequestsButton/components/NearbyRequestsList.jsx` - Display helper amount

## Future Enhancements

Potential improvements:
- Admin dashboard to view total commission earned
- Configurable commission rates per request type
- Helper tier system (lower commission for experienced helpers)
- Monthly commission reports
