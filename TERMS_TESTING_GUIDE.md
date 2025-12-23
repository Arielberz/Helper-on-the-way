# Terms & Privacy Consent - Testing Guide

## Quick Test Steps

### 1. Start the Application

**Backend:**
```bash
cd server
node app.js
```

**Frontend:**
```bash
cd client
npm run dev
```

### 2. Test Registration Flow

1. Navigate to `http://localhost:5173/register`
2. Fill in the registration form:
   - Username: `testuser123`
   - Email: `test@example.com`
   - Phone: `0521234567`
   - Password: `password123`
   - Confirm Password: `password123`
3. Click "הרשמה" button
4. **✅ Expected:** Terms consent modal appears

### 3. Test Modal Validation

1. Try clicking "המשך הרשמה" without checking the checkbox
2. **✅ Expected:** Error message appears: "חובה לאשר את תנאי השימוש ומדיניות הפרטיות כדי להמשיך."
3. Button should be disabled (greyed out)

### 4. Test Navigation Links

1. Click "צפה בתנאי השימוש המלאים" in the modal
2. **✅ Expected:** Navigate to `/terms` page showing full terms text
3. Click back button and return to register page
4. Open modal again and click "צפה במדיניות הפרטיות"
5. **✅ Expected:** Navigate to `/privacy` page showing privacy policy

### 5. Test Successful Registration

1. Return to register page
2. Fill form again (use different email if previous test succeeded)
3. Click "הרשמה"
4. In modal, check the consent checkbox
5. **✅ Expected:** Button becomes enabled (blue)
6. Click "המשך הרשמה"
7. **✅ Expected:** Modal closes, registration proceeds, email verification modal appears

### 6. Test Backend Validation

**Using curl or Postman:**

**Test Case A: Without termsAccepted**
```bash
curl -X POST http://localhost:3001/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "phone": "+972521234567",
    "password": "password123"
  }'
```
**✅ Expected Response:**
```json
{
  "success": false,
  "message": "Must accept Terms & Privacy"
}
```

**Test Case B: With termsAccepted=false**
```bash
curl -X POST http://localhost:3001/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "phone": "+972521234567",
    "password": "password123",
    "termsAccepted": false
  }'
```
**✅ Expected Response:**
```json
{
  "success": false,
  "message": "Must accept Terms & Privacy"
}
```

**Test Case C: With termsAccepted=true**
```bash
curl -X POST http://localhost:3001/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser2",
    "email": "test2@example.com",
    "phone": "+972521234568",
    "password": "password123",
    "termsAccepted": true
  }'
```
**✅ Expected Response:**
```json
{
  "success": true,
  "message": "User registered. Verification email sent...",
  "data": {
    "user": { ... }
  }
}
```

### 7. Verify Database

**MongoDB Query:**
```javascript
db.users.findOne({ email: "test2@example.com" })
```

**✅ Expected Fields:**
```json
{
  "_id": "...",
  "username": "testuser2",
  "email": "test2@example.com",
  "termsAccepted": true,
  "termsAcceptedAt": ISODate("2025-12-23T..."),
  ...
}
```

### 8. Test Mobile Responsiveness

1. Open browser DevTools (F12)
2. Toggle device toolbar (mobile view)
3. Test modal on various screen sizes:
   - iPhone SE (375px)
   - iPhone 12 Pro (390px)
   - iPad (768px)
4. **✅ Expected:** Modal is readable and functional on all sizes

### 9. Test RTL Layout

1. View `/terms` page
2. **✅ Expected:**
   - Text aligned right
   - Scroll bar on left side
   - Buttons positioned correctly for RTL
3. Repeat for `/privacy` page

### 10. Test Cancel Functionality

1. Fill registration form
2. Click "הרשמה" to open modal
3. Click "ביטול" button
4. **✅ Expected:**
   - Modal closes
   - User remains on register page
   - Form data is preserved
   - Can try again

## Optional: Migrate Existing Users

If you have existing users in the database, run the migration script:

```bash
cd server
node migrateTermsAcceptance.js
```

This will add the terms fields to all existing users (grandfathered as accepted).

## Common Issues & Solutions

### Issue: Modal doesn't appear
- **Check:** Browser console for errors
- **Check:** Import statement in Register.jsx
- **Fix:** Verify TermsConsentModal component exists

### Issue: Links don't work in modal
- **Check:** React Router is properly configured
- **Check:** Routes are added in app.jsx
- **Fix:** Verify `/terms` and `/privacy` routes exist

### Issue: Backend rejects registration
- **Check:** Request body includes `termsAccepted: true`
- **Check:** Backend console for error messages
- **Fix:** Verify controller validation logic

### Issue: Terms/Privacy text not displaying
- **Check:** TERMS_TEXT and PRIVACY_TEXT constants
- **Check:** whitespace-pre-wrap CSS class
- **Fix:** Verify text is properly formatted

## Success Criteria

✅ All 10 test steps pass without errors  
✅ Modal appears and functions correctly  
✅ Backend validation works  
✅ Database stores terms acceptance  
✅ Full pages render properly  
✅ Mobile responsive  
✅ RTL layout correct  

---

**Need Help?**
- Check browser console for errors
- Check server logs for backend issues
- Verify MongoDB connection
- Review TERMS_PRIVACY_IMPLEMENTATION.md for details
