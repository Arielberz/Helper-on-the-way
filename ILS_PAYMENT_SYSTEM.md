# ILS Payment System Implementation

## Overview
This document describes the implementation of the Israeli Shekel (ILS) payment system for Helper on the Way. All amounts are stored internally in **agorot** (Israeli cents) to avoid floating-point errors, and PayPal is configured to charge in ILS currency.

## Key Concept: Agorot

**1 ILS = 100 agorot**

- **Backend Storage**: All amounts in the database are stored as **integers in agorot**
- **Example**: 50 ILS = 5,000 agorot
- **Why**: Avoids floating-point arithmetic errors and ensures precise calculations

## Architecture

### Backend Components

#### 1. Currency Converter Utility
**Location**: `server/api/utils/currencyConverter.js`

Functions:
- `ilsToAgorot(ilsNumber)` - Converts ILS to agorot (integer)
- `agorotToIls(agorot)` - Converts agorot to ILS (number)
- `agorotToIlsString(agorot)` - Converts agorot to ILS string with 2 decimals (e.g., "50.00")
- `isValidAgorotAmount(agorot)` - Validates agorot amount

```javascript
const { ilsToAgorot, agorotToIlsString } = require('../utils/currencyConverter');

// Convert 50 ILS to agorot
const agorot = ilsToAgorot(50); // Returns 5000

// Convert 5000 agorot to ILS string for PayPal
const ilsString = agorotToIlsString(5000); // Returns "50.00"
```

#### 2. PayPal Service
**Location**: `server/api/services/paypalService.js`

Functions:
- `createPayPalOrder(amountAgorot, requestId, description, returnUrl, cancelUrl)`
  - Creates PayPal order with **currency_code: "ILS"**
  - Converts agorot to ILS string using `agorotToIlsString()`
  - Returns PayPal order object with approval URL

- `capturePayPalOrder(orderId)`
  - Captures the PayPal payment after user approval
  - Validates that currency is ILS
  - Returns capture data

- `getPayPalOrderDetails(orderId)`
  - Retrieves order details from PayPal

**Critical Implementation Details:**
```javascript
{
    intent: 'CAPTURE',
    purchase_units: [{
        amount: {
            currency_code: 'ILS',  // ✅ Must be ILS
            value: "50.00"         // ✅ Properly formatted from agorot
        }
    }]
}
```

#### 3. Payment Controller
**Location**: `server/api/controllers/paymentController.js`

**Key Changes:**
1. Imports currency converter and PayPal service
2. **createOrder**: 
   - Gets amount from request (already in agorot)
   - Validates amount using `isValidAgorotAmount()`
   - Calls `createPayPalOrder()` with agorot amount
   - Backend controls the final amount (frontend can't override)

3. **captureOrder**:
   - Captures PayPal payment
   - **Validates currency is ILS**
   - Converts captured ILS to agorot using `ilsToAgorot()`
   - Verifies amount matches expected amount
   - Calculates commission in agorot
   - Updates request and helper wallet

```javascript
// Verify currency is ILS
if (capturedCurrency !== 'ILS') {
    return sendResponse(res, 400, false, `Wrong currency: ${capturedCurrency}`);
}

// Convert and validate amount
const capturedIls = parseFloat(capturedValueString);
const capturedAgorot = ilsToAgorot(capturedIls);

if (Math.abs(capturedAgorot - expectedAgorot) > 1) {
    return sendResponse(res, 400, false, "Amount mismatch");
}
```

#### 4. Requests Model
**Location**: `server/api/models/requestsModel.js`

**Payment Schema:**
```javascript
payment: {
    offeredAmount: {
        type: Number,
        default: 0,
        // NOTE: Stored in agorot (1 ILS = 100 agorot)
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
    currency: {
        type: String,
        default: 'ILS',
        enum: ['ILS']  // Only ILS supported
    },
    // ... other fields
}
```

**Pre-save Hook:**
Automatically calculates commission and helper amount in agorot:
```javascript
const totalAgorot = this.payment.offeredAmount;
const commissionAgorot = Math.round(totalAgorot * (commissionRate / 100));
const helperAgorot = totalAgorot - commissionAgorot;
```

### Frontend Components

#### 1. Currency Utils
**Location**: `client/src/utils/currencyUtils.js`

Provides frontend utilities for converting between ILS and agorot:
- `ilsToAgorot(ilsAmount)` - Convert ILS to agorot
- `agorotToIls(agorot)` - Convert agorot to ILS
- `formatAgorotAsIls(agorot)` - Format with ₪ symbol
- `formatIls(ilsAmount)` - Format ILS with ₪ symbol

#### 2. Payment Modal
**Location**: `client/src/pages/chat/components/PaymentModal.jsx`

**Key Change:**
- Frontend **does NOT send amount** to backend
- Backend calculates amount from the request record
- This prevents frontend manipulation of payment amounts

```javascript
// ✅ Correct: Backend calculates amount
const response = await fetch(`${API_BASE}/api/payments/create-order`, {
    method: 'POST',
    body: JSON.stringify({
        requestId  // Only send request ID
    }),
});

// ❌ Wrong: Don't send amount from frontend
body: JSON.stringify({
    requestId,
    amount  // DON'T DO THIS
})
```

#### 3. PayPal Success Page
**Location**: `client/src/pages/PayPal/PayPalSuccess.jsx`

Handles payment capture after user approves on PayPal:
```javascript
await fetch(`${API_BASE}/api/payments/capture-order`, {
    method: 'POST',
    body: JSON.stringify({
        orderId: paypalToken,  // From PayPal redirect
        requestId
    }),
});
```

## Payment Flow

### 1. Create Request (with offered amount)
```
Frontend → POST /api/requests
Body: {
    location: { lat, lng },
    problemType: "flat_tire",
    offeredAmount: 5000,  // 50 ILS in agorot
    currency: "ILS"
}

Database stores: offeredAmount = 5000 (agorot)
```

### 2. User Initiates Payment
```
Frontend (PaymentModal) → POST /api/payments/create-order
Body: {
    requestId: "abc123"
    // Amount NOT sent - backend gets it from request
}

Backend:
1. Finds request by ID
2. Gets offeredAmount (5000 agorot)
3. Validates amount
4. Converts to ILS string: "50.00"
5. Creates PayPal order with currency_code: "ILS"
6. Returns approval URL

Response: {
    orderId: "xyz789",
    approvalUrl: "https://paypal.com/...",
    amount: {
        agorot: 5000,
        ils: 50,
        currency: "ILS"
    }
}
```

### 3. User Approves on PayPal
```
User redirected to PayPal → Approves payment in ILS
PayPal redirects back → /paypal/success?token=xyz789&requestId=abc123
```

### 4. Capture Payment
```
Frontend (PayPalSuccess) → POST /api/payments/capture-order
Body: {
    orderId: "xyz789",
    requestId: "abc123"
}

Backend:
1. Calls PayPal API to capture
2. Validates currency_code === "ILS"
3. Converts captured "50.00" ILS to 5000 agorot
4. Verifies 5000 === request.payment.offeredAmount
5. Calculates commission (10%) = 500 agorot
6. Helper gets 4500 agorot = 45 ILS
7. Updates request, credits helper wallet
8. Creates transaction records

Response: {
    totalAmount: 50,
    helperAmount: 45,
    commissionAmount: 5,
    currency: "ILS"
}
```

## Security & Validation

### Amount Validation
1. **Backend is the source of truth** - frontend can't override payment amounts
2. **Agorot validation** - ensures amounts are positive integers
3. **Currency validation** - ensures captured payment is in ILS
4. **Amount matching** - verifies captured amount matches expected amount

### Logging
Both PayPal service and payment controller include extensive logging:
- 🔵 Blue logs for info
- ✅ Green checks for success
- ❌ Red X for errors

```javascript
console.log('🔵 Creating PayPal order:', {
    amount_agorot: 5000,
    amount_ils: "50.00",
    currency: 'ILS'
});

console.log('✅ PayPal order created:', {
    order_id: "xyz",
    currency: "ILS",
    value: "50.00"
});
```

## Testing Checklist

### Backend Tests
- [ ] Create order with 5000 agorot → PayPal shows 50.00 ILS
- [ ] Capture payment → Validates ILS currency
- [ ] Capture payment → Amount matches (5000 agorot)
- [ ] Commission calculated correctly (10%)
- [ ] Helper wallet credited with correct ILS amount (45.00)
- [ ] Transaction records created

### Frontend Tests
- [ ] Create request with amount in agorot
- [ ] Display amount correctly (50₪ from 5000 agorot)
- [ ] PayPal payment button creates order
- [ ] Redirects to PayPal with ILS currency
- [ ] Payment success page captures and redirects
- [ ] Balance payment still works

### Integration Tests
- [ ] End-to-end: Create request → Pay with PayPal → Helper receives funds
- [ ] Currency shows as ILS throughout flow
- [ ] PayPal checkout shows ILS (not USD)
- [ ] All logs show correct currency and amounts

## Common Issues & Solutions

### Issue: PayPal still shows USD
**Check:**
1. PayPal JS SDK includes `currency=ILS` parameter
2. Orders API request includes `currency_code: "ILS"`
3. Backend logs show ILS in order creation
4. Sandbox account supports ILS

**Solution:**
- Ensure PayPal service explicitly sets `currency_code: 'ILS'`
- Check PayPal dashboard for currency support
- Use sandbox account that supports ILS

### Issue: Amount mismatch error
**Check:**
1. Request has correct offeredAmount in agorot
2. Frontend sends requestId (not amount)
3. Backend calculates amount from request
4. Captured amount matches expected amount

**Solution:**
- Log amounts at each step
- Verify agorot → ILS → agorot conversions
- Check for floating-point precision issues

### Issue: Commission calculation wrong
**Check:**
1. Commission rate is correct (10%)
2. Calculations done in agorot (not ILS)
3. Rounding is correct

**Solution:**
- Use integer math in agorot
- Convert to ILS only for display/PayPal

## Environment Variables

Required in `server/.env`:
```bash
# PayPal Configuration
PAYPAL_CLIENT_ID=your_client_id
PAYPAL_CLIENT_SECRET=your_client_secret
PAYPAL_MODE=sandbox  # or 'live' for production

# App Configuration
CLIENT_URL=http://localhost:5173
```

## Migration Notes

If you have existing data with amounts in ILS (not agorot):

1. **Create migration script**:
```javascript
// server/migrations/convertToAgorot.js
const Request = require('../api/models/requestsModel');

async function migrateToAgorot() {
    const requests = await Request.find({ 'payment.offeredAmount': { $exists: true } });
    
    for (const request of requests) {
        if (request.payment.offeredAmount > 0 && request.payment.offeredAmount < 10000) {
            // Likely in ILS, convert to agorot
            const agorot = Math.round(request.payment.offeredAmount * 100);
            request.payment.offeredAmount = agorot;
            
            if (request.payment.helperAmount) {
                request.payment.helperAmount = Math.round(request.payment.helperAmount * 100);
            }
            if (request.payment.commissionAmount) {
                request.payment.commissionAmount = Math.round(request.payment.commissionAmount * 100);
            }
            
            await request.save();
            console.log(`Migrated request ${request._id}: ${request.payment.offeredAmount} agorot`);
        }
    }
}
```

2. **Run migration**:
```bash
cd server
node migrations/convertToAgorot.js
```

## Summary

✅ **Backend**: All amounts stored in agorot (integer cents)  
✅ **PayPal**: Orders created with `currency_code: "ILS"` and properly formatted amounts  
✅ **Security**: Backend validates amounts and currency, frontend can't override  
✅ **Logging**: Comprehensive logging for debugging  
✅ **Frontend**: Display utilities for converting agorot to ILS with ₪ symbol  

The system now properly charges users in Israeli Shekels (ILS) end-to-end, with no possibility of charging in USD by mistake.
