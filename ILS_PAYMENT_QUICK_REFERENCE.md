# ILS Payment System - Quick Reference

## For Developers

### Converting Between ILS and Agorot

**Backend** (`server/api/utils/currencyConverter.js`):
```javascript
const { ilsToAgorot, agorotToIls, agorotToIlsString } = require('../utils/currencyConverter');

// ILS to agorot
const agorot = ilsToAgorot(50);  // 5000

// Agorot to ILS (number)
const ils = agorotToIls(5000);  // 50

// Agorot to ILS string (for PayPal)
const ilsString = agorotToIlsString(5000);  // "50.00"
```

**Frontend** (`client/src/utils/currencyUtils.js`):
```javascript
import { ilsToAgorot, agorotToIls, formatAgorotAsIls } from '../utils/currencyUtils';

// ILS to agorot
const agorot = ilsToAgorot(50);  // 5000

// Agorot to ILS
const ils = agorotToIls(5000);  // 50

// Format for display
const formatted = formatAgorotAsIls(5000);  // "50.00₪"
```

### Database Schema

All payment amounts are stored in **agorot** (integer):
```javascript
payment: {
    offeredAmount: 5000,      // 50 ILS in agorot
    helperAmount: 4500,       // 45 ILS in agorot
    commissionAmount: 500,    // 5 ILS in agorot
    currency: "ILS"
}
```

### Creating a Request with Payment

```javascript
// Frontend
const requestData = {
    location: { lat: 32.0853, lng: 34.7818 },
    problemType: "flat_tire",
    description: "Need help...",
    offeredAmount: ilsToAgorot(50),  // Convert 50 ILS to 5000 agorot
    currency: "ILS"
};

await fetch(`${API_BASE}/api/requests`, {
    method: 'POST',
    body: JSON.stringify(requestData)
});
```

### Creating PayPal Payment

**Frontend** (simplified - don't send amount):
```javascript
// Only send request ID - backend gets amount from request
await fetch(`${API_BASE}/api/payments/create-order`, {
    method: 'POST',
    body: JSON.stringify({ requestId })
});
```

**Backend** (automatic):
```javascript
// Backend automatically:
// 1. Gets offeredAmount from request (in agorot)
// 2. Converts to ILS string: agorotToIlsString(5000) → "50.00"
// 3. Creates PayPal order with currency_code: "ILS"
```

### Displaying Amounts

**Show amount in ILS with symbol**:
```javascript
import { agorotToIls, formatAgorotAsIls } from '../utils/currencyUtils';

// Simple display
const amount = agorotToIls(request.payment.offeredAmount);  // 50
<p>{amount}₪</p>

// Formatted display
const formatted = formatAgorotAsIls(request.payment.offeredAmount);  // "50.00₪"
<p>{formatted}</p>
```

## Quick Checklist for New Payment Features

When adding new payment-related features:

- [ ] Store amounts in **agorot** (not ILS) in database
- [ ] Convert to ILS for display using `agorotToIls()`
- [ ] Convert to ILS string for PayPal using `agorotToIlsString()`
- [ ] Always set `currency: "ILS"` in database and PayPal
- [ ] Validate amounts are positive integers (agorot)
- [ ] Backend controls final payment amount (not frontend)
- [ ] Log currency and amounts at each step
- [ ] Test with sample amounts (e.g., 50 ILS = 5000 agorot)

## Common Conversions

| ILS | Agorot |
|-----|--------|
| 10  | 1,000  |
| 20  | 2,000  |
| 50  | 5,000  |
| 100 | 10,000 |
| 200 | 20,000 |

## Testing Commands

**Create a test payment**:
```bash
# Using curl
curl -X POST http://localhost:3001/api/payments/create-order \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"requestId": "REQUEST_ID"}'
```

**Check PayPal order**:
```bash
# Should show currency_code: "ILS" and value: "50.00"
curl -X GET https://api-m.sandbox.paypal.com/v2/checkout/orders/ORDER_ID \
  -H "Authorization: Bearer PAYPAL_TOKEN"
```

## Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| "Invalid payment amount" | Amount not a valid integer in agorot | Use `ilsToAgorot()` to convert |
| "Wrong currency: USD" | PayPal captured in USD instead of ILS | Check PayPal order creation, ensure `currency_code: "ILS"` |
| "Amount mismatch" | Captured amount doesn't match expected | Verify request has correct `offeredAmount` in agorot |
| "Cannot use PayPal for free help" | Trying to pay 0 amount with PayPal | Use "Confirm Completion" button instead |

## Key Files

**Backend**:
- `server/api/utils/currencyConverter.js` - Conversion utilities
- `server/api/services/paypalService.js` - PayPal integration with ILS
- `server/api/controllers/paymentController.js` - Payment logic
- `server/api/models/requestsModel.js` - Request schema (amounts in agorot)

**Frontend**:
- `client/src/utils/currencyUtils.js` - Frontend conversion utilities
- `client/src/pages/chat/components/PaymentModal.jsx` - Payment UI
- `client/src/pages/PayPal/PayPalSuccess.jsx` - Payment capture

## Contact

For questions or issues with the payment system, refer to:
- Full documentation: `ILS_PAYMENT_SYSTEM.md`
- PayPal API docs: https://developer.paypal.com/docs/api/orders/v2/
