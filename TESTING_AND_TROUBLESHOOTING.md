# Testing & Troubleshooting Guide

## 📋 Table of Contents
1. [Testing Tools](#testing-tools)
2. [API Testing](#api-testing)
3. [Socket.IO Testing](#socketio-testing)
4. [Common Issues](#common-issues)
5. [Debugging Tips](#debugging-tips)
6. [Development Workflow](#development-workflow)

---

## 🛠️ Testing Tools

### Required Tools
- **Postman** - API endpoint testing
- **Browser DevTools** - Network and console debugging
- **MongoDB Compass** - Database inspection
- **VS Code** - Debugging with breakpoints

### Optional Tools
- **Socket.IO Client Tool** - Test socket events
- **curl** - Command-line API testing
- **React DevTools** - Component inspection

---

## 🧪 API Testing

### Using Postman

#### 1. Register a User
```http
POST http://localhost:3001/api/users/register
Content-Type: application/json

{
  "username": "testuser1",
  "email": "test1@example.com",
  "password": "password123",
  "phone": "+972501234567"
}
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "user registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "673d8e5f...",
      "username": "testuser1",
      "email": "test1@example.com"
    }
  }
}
```

**📝 Save the token** for authenticated requests!

---

#### 2. Login
```http
POST http://localhost:3001/api/users/login
Content-Type: application/json

{
  "identifier": "test1@example.com",
  "password": "password123"
}
```

---

#### 3. Create Help Request (Authenticated)
```http
POST http://localhost:3001/api/requests
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "problemType": "flat_tire",
  "location": {
    "lat": 32.0853,
    "lng": 34.7818,
    "address": "Tel Aviv, Israel"
  },
  "description": "Need help changing flat tire"
}
```

---

#### 4. Volunteer to Help
```http
POST http://localhost:3001/api/requests/REQUEST_ID/volunteer
Authorization: Bearer HELPER_TOKEN
```

---

#### 5. Confirm Helper
```http
POST http://localhost:3001/api/requests/REQUEST_ID/confirm-helper
Authorization: Bearer REQUESTER_TOKEN
Content-Type: application/json

{
  "helperId": "HELPER_USER_ID"
}
```

---

#### 6. Submit Rating
```http
POST http://localhost:3001/api/ratings/rate
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "helperId": "HELPER_USER_ID",
  "requestId": "REQUEST_ID",
  "rating": 5,
  "comment": "Great helper! Very professional."
}
```

---

### Using curl

#### Register User
```bash
curl -X POST http://localhost:3001/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser1",
    "email": "test1@example.com",
    "password": "password123",
    "phone": "+972501234567"
  }'
```

#### Login
```bash
curl -X POST http://localhost:3001/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "test1@example.com",
    "password": "password123"
  }'
```

#### Get Conversations (Authenticated)
```bash
curl -X GET http://localhost:3001/api/chat/conversations \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### Delete Conversation
```bash
curl -X DELETE http://localhost:3001/api/chat/conversation/CONVERSATION_ID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### Submit Report
```bash
curl -X POST http://localhost:3001/api/reports/report \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reportedUser": "USER_ID",
    "conversation": "CONVERSATION_ID",
    "reason": "illegal_activity",
    "description": "User requested illegal services"
  }'
```

---

## 🔌 Socket.IO Testing

### Testing in Browser Console

#### 1. Connect to Socket
```javascript
const socket = io('http://localhost:3001', {
  auth: { token: 'YOUR_JWT_TOKEN' }
});

socket.on('connect', () => {
  console.log('✅ Connected:', socket.id);
});

socket.on('connect_error', (error) => {
  console.error('❌ Connection Error:', error);
});
```

---

#### 2. Join Conversation
```javascript
socket.emit('join_conversation', {
  conversationId: 'YOUR_CONVERSATION_ID'
});

socket.on('joined_conversation', (data) => {
  console.log('✅ Joined conversation:', data);
});
```

---

#### 3. Send Message
```javascript
socket.emit('send_message', {
  conversationId: 'YOUR_CONVERSATION_ID',
  content: 'Hello from console!'
});

socket.on('new_message', (message) => {
  console.log('📨 New message:', message);
});
```

---

#### 4. Listen for Notifications
```javascript
socket.on('helperRequestReceived', (data) => {
  console.log('🔔 Helper request:', data);
});

socket.on('helperConfirmed', (data) => {
  console.log('✅ Helper confirmed:', data);
});

socket.on('requestAdded', (request) => {
  console.log('🆕 New request:', request);
});
```

---

### Testing Socket Events in Sequence

**Scenario: Complete Helper Assignment Flow**

```javascript
// Terminal 1: Requester
const requesterSocket = io('http://localhost:3001', {
  auth: { token: REQUESTER_TOKEN }
});

// Listen for helper requests
requesterSocket.on('helperRequestReceived', (data) => {
  console.log('📥 Received helper request:', data.helper.username);
});

// Terminal 2: Helper
const helperSocket = io('http://localhost:3001', {
  auth: { token: HELPER_TOKEN }
});

// Listen for confirmation
helperSocket.on('helperConfirmed', (data) => {
  console.log('✅ Confirmed by:', data.requester.username);
});

// Listen for new requests
helperSocket.on('requestAdded', (request) => {
  console.log('🆕 New request:', request.problemType);
});
```

---

## ❌ Common Issues

### Issue 1: "Cannot resolve import 'Header'"

**Error:**
```
Failed to resolve import '../../components/header/Header'
```

**Cause:** Header component was deleted but imports remain

**Solution:**
```bash
# Search for all Header imports
grep -r "import.*Header" client/src/

# Remove the imports manually or:
# Find and remove from each file
```

---

### Issue 2: Mongoose Model Overwrite Error

**Error:**
```
OverwriteModelError: Cannot overwrite `User` model once compiled.
```

**Cause:** Model being compiled multiple times during hot reload

**Solution:**
Update all model files:
```javascript
// ❌ Before
module.exports = mongoose.model('User', userSchema);

// ✅ After
module.exports = mongoose.models.User || mongoose.model('User', userSchema);
```

---

### Issue 3: Socket Not Connecting

**Symptoms:**
- No socket.id in console
- Events not firing
- Connection indicator shows red/gray

**Debugging Steps:**

1. **Check token in localStorage:**
```javascript
console.log('Token:', localStorage.getItem('token'));
```

2. **Verify backend is running:**
```bash
curl http://localhost:3001/api/users/login
```

3. **Check CORS configuration:**
```javascript
// Server/App.js
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    credentials: true
  }
});
```

4. **Check socket initialization:**
```javascript
// Should only create ONE socket instance
useEffect(() => {
  const newSocket = io('http://localhost:3001', {
    auth: { token: localStorage.getItem('token') }
  });
  setSocket(newSocket);
  
  return () => newSocket.disconnect();
}, []); // Empty dependency array!
```

---

### Issue 4: Location Permission Denied

**Symptoms:**
- Cannot get user location
- Map not centering
- Distance calculations failing

**Solutions:**

1. **Browser Settings:**
   - Chrome: Settings → Privacy → Site Settings → Location → Allow
   - Firefox: Preferences → Privacy → Permissions → Location → Settings
   - Safari: Preferences → Websites → Location

2. **HTTPS Requirement:**
   - Geolocation requires HTTPS in production
   - Use `localhost` for development (allowed without HTTPS)

3. **Fallback Implementation:**
```javascript
navigator.geolocation.getCurrentPosition(
  (position) => {
    // Success
    setLocation({
      lat: position.coords.latitude,
      lng: position.coords.longitude
    });
  },
  (error) => {
    // Error - use fallback
    if (error.code === error.PERMISSION_DENIED) {
      // Use default location or IP-based
      setLocation({ lat: 32.0853, lng: 34.7818 }); // Tel Aviv
    }
  },
  { timeout: 10000, enableHighAccuracy: true }
);
```

---

### Issue 5: Messages Not Sending

**Debugging Checklist:**

1. **Socket connected?**
```javascript
console.log('Socket connected:', socket?.connected);
```

2. **Joined conversation?**
```javascript
socket.emit('join_conversation', { conversationId });
```

3. **Authorization valid?**
```javascript
// Check token expiration
const token = localStorage.getItem('token');
const decoded = jwt_decode(token);
console.log('Token expires:', new Date(decoded.exp * 1000));
```

4. **Backend receiving events?**
```javascript
// Server/api/sockets/chatSockets.js
socket.on('send_message', (data) => {
  console.log('📨 Received message:', data);
  // ...
});
```

---

### Issue 6: Rating Not Updating

**Symptoms:**
- Rating submitted successfully
- Helper's average rating not changing
- Total ratings count incorrect

**Solution:**

Check rating calculation logic:
```javascript
// Server/Api/Controllers/ratingController.js
exports.createRating = async (req, res) => {
  // Save rating
  const rating = await Rating.create({ ... });
  
  // Recalculate helper's average
  const allRatings = await Rating.find({ helper: req.body.helperId });
  const avgRating = allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length;
  
  // Update helper's profile
  await User.findByIdAndUpdate(req.body.helperId, {
    averageRating: avgRating,
    totalRatings: allRatings.length
  });
};
```

---

### Issue 7: Delete Not Working

**Symptoms:**
- Delete button clicked
- No error shown
- Conversation still exists

**Debugging:**

1. **Check authorization:**
```javascript
// Are you a participant?
const conversation = await Conversation.findById(conversationId);
console.log('User ID:', req.user._id);
console.log('Participants:', conversation.user, conversation.helper);
```

2. **Check deletion:**
```javascript
const deleted = await Conversation.findByIdAndDelete(conversationId);
console.log('Deleted:', deleted ? 'Yes' : 'No');
console.log('Message count:', deleted.messages.length);
```

3. **Frontend refresh:**
```javascript
// After successful delete
setConversations(prev => prev.filter(c => c._id !== conversationId));
```

---

## 🔍 Debugging Tips

### React DevTools

1. **Install Extension:**
   - Chrome: [React Developer Tools](https://chrome.google.com/webstore)
   - Firefox: [React DevTools](https://addons.mozilla.org/firefox/)

2. **Inspect Context:**
   - Open DevTools → Components
   - Find Context providers
   - View current state values

3. **Track Re-renders:**
   - Settings → Highlight updates
   - Identify unnecessary re-renders

---

### Console Logging Best Practices

```javascript
// ❌ Bad: Generic logs
console.log('data:', data);

// ✅ Good: Descriptive logs with emojis
console.log('📨 Message received:', {
  sender: message.sender,
  content: message.content,
  timestamp: new Date(message.timestamp)
});

// ✅ Group related logs
console.group('🔔 Notification System');
console.log('Socket connected:', socket.connected);
console.log('User ID:', userId);
console.log('Listening for events:', ['helperRequestReceived', 'helperConfirmed']);
console.groupEnd();

// ✅ Conditional logging
if (process.env.NODE_ENV === 'development') {
  console.log('🐛 Debug:', debugData);
}
```

---

### Network Tab Debugging

1. **Filter by type:**
   - XHR: API requests
   - WS: WebSocket (Socket.IO)

2. **Check request headers:**
   - Authorization token present?
   - Content-Type correct?

3. **Inspect response:**
   - Status code (200, 400, 401, 500)
   - Response body
   - Error messages

---

### MongoDB Debugging

**Common Queries:**

```javascript
// Find user by email
db.users.findOne({ email: "test@example.com" })

// Find all pending requests
db.requests.find({ status: "pending" })

// Find conversations for user
db.conversations.find({
  $or: [
    { user: ObjectId("USER_ID") },
    { helper: ObjectId("USER_ID") }
  ]
})

// Count unread messages
db.conversations.aggregate([
  { $unwind: "$messages" },
  { $match: {
    "messages.read": false,
    "messages.sender": { $ne: ObjectId("USER_ID") }
  }},
  { $count: "unreadCount" }
])

// Get helper's average rating
db.ratings.aggregate([
  { $match: { helper: ObjectId("HELPER_ID") } },
  { $group: {
    _id: null,
    avgRating: { $avg: "$rating" },
    count: { $sum: 1 }
  }}
])
```

---

## 🔧 Development Workflow

### Starting Development

```bash
# Terminal 1: Backend
cd Server
node App.js
# Server running on http://localhost:3001

# Terminal 2: Frontend
cd client
npm run dev
# Client running on http://localhost:5173

# Terminal 3: MongoDB (if local)
mongod
# Database running on mongodb://localhost:27017
```

---

### Testing Workflow

1. **Backend Changes:**
   - Restart server: `Ctrl+C` → `node App.js`
   - Test endpoints with Postman
   - Check MongoDB for data changes

2. **Frontend Changes:**
   - Vite hot-reloads automatically
   - Clear browser cache if needed: `Cmd+Shift+R` (Mac) / `Ctrl+Shift+R` (Windows)
   - Check React DevTools for state

3. **Socket Changes:**
   - Restart both frontend and backend
   - Test events in browser console
   - Monitor Network → WS tab

---

### Pre-Deployment Checklist

- [ ] All tests passing
- [ ] No console errors
- [ ] API endpoints working
- [ ] Socket events firing correctly
- [ ] Database connections stable
- [ ] Environment variables set
- [ ] CORS configured for production
- [ ] Authentication working
- [ ] Error handling in place
- [ ] Mobile responsive
- [ ] Performance optimized

---

## 🆘 Getting Help

### Error Message Format

When asking for help, include:

```
**Environment:**
- OS: macOS/Windows/Linux
- Node version: 18.x
- Browser: Chrome 120

**Error:**
[Paste full error message]

**Steps to Reproduce:**
1. Navigate to /chat
2. Click delete button
3. Error appears

**Expected:** Conversation deletes
**Actual:** Error "Unauthorized"

**Code Snippet:**
[Paste relevant code]
```

---

### Useful Commands

```bash
# Check Node version
node --version

# Check npm version
npm --version

# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check MongoDB connection
mongosh
> show dbs
> use helper-on-the-way
> show collections

# Check processes on port 3001
lsof -i :3001

# Kill process on port
kill -9 PID_NUMBER

# Git status
git status
git log --oneline -5
```

---

**Last Updated**: December 1, 2025  
**Version**: 2.0  
**Happy Testing! 🧪**
