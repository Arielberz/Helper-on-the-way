# Helper Request Notification Debug Guide

> **Note:** This guide contains legacy code examples. The app now uses centralized auth utilities (`getToken()`, `getUserId()` from `utils/authUtils.js`) instead of direct localStorage access. Use browser DevTools > Application > Local Storage to inspect stored values.

## Issue: Not Receiving Helper Request Popup

When someone clicks "I want to help" on your request, you should see a popup notification. If you're not seeing it, follow this debugging guide.

## How It Works

```
User A creates help request
    ↓
User B clicks marker → "Send Help Request" button
    ↓
POST /api/requests/:id/request-help
    ↓
Server adds User B to pendingHelpers array
    ↓
Server emits Socket.IO event: 'helperRequestReceived' → to User A's socket room
    ↓
User A's HelperRequestContext receives event
    ↓
GlobalHelperRequestModal displays popup
```

## Debugging Steps

### 1. Check if Socket.IO is Connected (Client-Side)

Open Browser Console and check for socket messages. You should see in the server console:
```
✅ Socket connected for helper requests: <socket-id>
User <user-id> connected with socket <socket-id>
```

**If not connected:**
- Check if token exists: `localStorage.getItem('token')`
- Check VITE_API_URL: `import.meta.env.VITE_API_URL`
- Look for connection errors in console

### 2. Verify Server is Running Socket.IO

Check server terminal output for:
```bash
Server is running on port 3001
Socket.IO is ready for connections
```

### 3. Test Socket Connection

**In Browser Console (User A - the requester):**
```javascript
// Check if socket context exists
const token = localStorage.getItem('token');
console.log('Token:', token ? 'exists' : 'missing');

// Check userId
console.log('User ID:', localStorage.getItem('userId'));
```

### 4. Check if Event is Being Emitted (Server-Side)

When User B clicks "Send Help Request", the server terminal should show:
```
Emitted helper request notification to user <user-id>
```

**If you DON'T see this message:**
- The `request-help` API endpoint might not be working
- Check if `io` is available: `req.app.get('io')`
- Verify request.user._id matches User A's ID

### 5. Verify User is in the Correct Socket Room

Server joins users to rooms with format: `user:<userId>`

**Server should log:**
```
User <user-id> connected with socket <socket-id>
```

### 6. Test the Full Flow Manually

**User A (Requester) - Open Console:**
```javascript
// 1. Check you're logged in
console.log('Token:', localStorage.getItem('token'));
console.log('User ID:', localStorage.getItem('userId'));

// 2. Manually test receiving an event (simulate server emission)
// This won't work unless you have socket reference, but shows the pattern
```

**User B (Helper) - Send Request:**
1. Click on User A's marker
2. Click "Send Help Request" button
3. Check server terminal for: `Emitted helper request notification to user X`
4. User A should immediately see popup

### 7. Common Issues

#### Issue: "No token found, skipping socket connection"
**Solution:** User must be logged in. Check:
```javascript
localStorage.getItem('token');
```

#### Issue: Socket connects but no events received
**Possible causes:**
1. User A's `userId` doesn't match the `user` field in the request
2. Socket room name mismatch
3. Server `io` not properly passed to routes

**Check server code:**
```javascript
// In App.js
app.set('io', io);  // ✅ Must be before routes

// In requestsController.js
const io = req.app.get('io');
if (io) {
  io.to(`user:${request.user._id.toString()}`).emit('helperRequestReceived', data);
}
```

#### Issue: Popup appears but data is missing
**Check:** Server is sending complete data object:
```javascript
{
  requestId: request._id,
  helper: { _id, username, email, phone, averageRating },
  helperLocation: { lat, lng },
  message: "...",
  requestedAt: timestamp,
  requestLocation: { lat, lng },
  problemType: "Flat Tire"
}
```

### 8. Enable Debug Logging (Temporary)

**Client - HelperRequestContext.jsx:**
```javascript
// Listen for helper request notifications
newSocket.on('helperRequestReceived', (data) => {
  console.log('🔔 NEW HELPER REQUEST:', data);  // ADD THIS
  setPendingRequest(data);
});
```

**Server - requestsController.js (line ~390):**
```javascript
console.log(`✅ Emitting to room: user:${request.user._id.toString()}`);
console.log(`📦 Event data:`, {
  requestId: request._id,
  helper: latestHelper.user,
  // ... rest of data
});
io.to(`user:${request.user._id.toString()}`).emit('helperRequestReceived', { /*...*/ });
```

### 9. Quick Test with Browser DevTools

**Open 2 browser windows side-by-side:**

**Window 1 (User A - Requester):**
1. Login as User A
2. Create a help request
3. Open DevTools Console
4. Look for: "Socket connected for helper requests"

**Window 2 (User B - Helper):**
1. Login as User B  
2. Find User A's marker on map
3. Click marker → Click "Send Help Request"
4. Watch Window 1 - popup should appear immediately

### 10. Restart Server

Sometimes socket connections get stuck. Restart the server:
```bash
# In Server directory
npm start
# or
node app.js
```

## Success Indicators

✅ **Working correctly when:**
1. Server logs: `User <id> connected with socket <socket-id>`
2. Server logs: `Emitted helper request notification to user <id>`
3. User A sees popup immediately after User B clicks "Send Help Request"
4. Popup shows helper's name, rating, location, and message

## Still Not Working?

**Check these files:**
1. `Server/App.js` - Socket.IO initialization and room joining
2. `Server/Api/Controllers/requestsController.js` - Line ~381-391 (emit event)
3. `client/src/context/HelperRequestContext.jsx` - Socket connection
4. `client/src/components/GlobalHelperRequestModal/GlobalHelperRequestModal.jsx` - Modal display
5. `client/src/App.jsx` - Must have `<GlobalHelperRequestModal />` component

**Verify .env files:**
```bash
# Server/.env
JWT_SECRET=your_secret
PORT=3001

# client/.env
VITE_API_URL=http://localhost:3001
```
