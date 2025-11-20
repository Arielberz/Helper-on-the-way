# Chat System Testing Guide

Complete step-by-step guide to test the real-time chat functionality.

---

## Prerequisites

- ✅ Server running on `http://localhost:3001`
- ✅ MongoDB running and connected
- ✅ Postman installed (or any REST client)
- ✅ 2 different browsers (Chrome & Firefox recommended)

---

## Part 1: Setup with Postman

### Step 1: Login as User (Person Needing Help)

```
Method: POST
URL: http://localhost:3001/api/users/login

Headers:
  Content-Type: application/json

Body (raw JSON):
{
  "identifier": "user@example.com",
  "password": "password123"
}
```

**Response Example:**
```json
{
  "success": true,
  "message": "login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3M...",
    "user": {
      "id": "673abc123def456789",
      "username": "johndoe",
      "email": "user@example.com"
    }
  }
}
```

**✅ SAVE:** Copy the `token` value → This is your **USER_TOKEN**

---

### Step 2: Login as Helper

```
Method: POST
URL: http://localhost:3001/api/users/login

Headers:
  Content-Type: application/json

Body (raw JSON):
{
  "identifier": "helper@example.com",
  "password": "helperpass123"
}
```

**✅ SAVE:** Copy the `token` value → This is your **HELPER_TOKEN**

---

### Step 3: Create a Help Request

```
Method: POST
URL: http://localhost:3001/api/requests

Headers:
  Content-Type: application/json
  Authorization: Bearer USER_TOKEN

Body (raw JSON):
{
  "location": {
    "lat": 40.7128,
    "lng": -74.0060,
    "address": "New York, NY"
  },
  "problemType": "flat_tire",
  "description": "I have a flat tire and need help changing it!",
  "priority": "high"
}
```

**Response Example:**
```json
{
  "success": true,
  "data": {
    "_id": "691f0a10f934d0462c82e3ac",
    "user": "673abc123def456789",
    "problemType": "flat_tire",
    "status": "pending",
    "location": {
      "lat": 40.7128,
      "lng": -74.006,
      "address": "New York, NY"
    }
  }
}
```

**✅ SAVE:** Copy the `_id` value → This is your **REQUEST_ID**

---

### Step 4: Helper Accepts the Request

```
Method: PATCH
URL: http://localhost:3001/api/requests/691f0a10f934d0462c82e3ac/accept
                                      ↑ Replace with YOUR REQUEST_ID

Headers:
  Authorization: Bearer HELPER_TOKEN

Body: (empty - no body needed)
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "691f0a10f934d0462c82e3ac",
    "status": "assigned",
    "helper": "673def456abc789123",
    "assignedAt": "2025-11-20T10:30:00.000Z"
  }
}
```

**✅ VERIFY:** Status should be "assigned" and helper should be populated

---

### Step 5: Get or Create Conversation

**Option A: Using User's Token**
```
Method: GET
URL: http://localhost:3001/api/chat/conversation/request/691f0a10f934d0462c82e3ac
                                                         ↑ YOUR REQUEST_ID

Headers:
  Authorization: Bearer USER_TOKEN
```

**Option B: Using Helper's Token** (same result)
```
Method: GET
URL: http://localhost:3001/api/chat/conversation/request/691f0a10f934d0462c82e3ac

Headers:
  Authorization: Bearer HELPER_TOKEN
```

**Response:**
```json
{
  "success": true,
  "message": "conversation retrieved successfully",
  "data": {
    "conversation": {
      "_id": "674e9876543210fedcba9876",
      "request": "691f0a10f934d0462c82e3ac",
      "user": {
        "_id": "673abc123def456789",
        "username": "johndoe",
        "email": "user@example.com"
      },
      "helper": {
        "_id": "673def456abc789123",
        "username": "janehelper",
        "email": "helper@example.com"
      },
      "messages": [],
      "isActive": true,
      "lastMessageAt": "2025-11-20T10:30:00.000Z",
      "createdAt": "2025-11-20T10:30:00.000Z"
    }
  }
}
```

**✅ SAVE:** Copy `conversation._id` → This is your **CONVERSATION_ID**

---

## Part 2: Test with HTML Interface

### Step 6: Open the HTML Test File

1. Navigate to: `c:\Users\noaml\Desktop\helper\Helper-on-the-way\Server\test-chat.html`
2. **Right-click** → Open with **Google Chrome**
3. **Right-click** → Open with **Firefox** (or use Chrome Incognito)

**You should now have 2 browser windows open with the chat interface.**

---

### Step 7: Connect Browser #1 (User)

**In Chrome:**

1. **Paste TOKEN:**
   - Find the input field that says "Paste your JWT Token here"
   - Paste your **USER_TOKEN**
   - Click **"🔌 Connect"** button

2. **Wait for connection:**
   - You should see a green badge: **"✓ Connected to Server"**
   - Check browser console (F12) for: `✓ Connected to server`

3. **Join Conversation:**
   - Find the input field "Enter Conversation ID"
   - Paste your **CONVERSATION_ID**
   - Click **"🚪 Join Conversation"** button
   - You should see: **"✓ Joined conversation: [ID]"**

---

### Step 8: Connect Browser #2 (Helper)

**In Firefox:**

1. **Paste TOKEN:**
   - Paste your **HELPER_TOKEN**
   - Click **"🔌 Connect"** button

2. **Wait for connection:**
   - Green badge: **"✓ Connected to Server"**

3. **Join SAME Conversation:**
   - Paste the **SAME CONVERSATION_ID** (from Step 5)
   - Click **"🚪 Join Conversation"** button
   - Yellow badge: **"✓ Joined conversation: [ID]"**

---

### Step 9: Send Messages! 💬

**In Browser #1 (User - Chrome):**

1. Type in the message input: `"Hello! I'm stuck with a flat tire."`
2. Click **"📤 Send"** or press **Enter**
3. Message appears on the **right side** (blue gradient, your message)

**In Browser #2 (Helper - Firefox):**

1. The message appears **instantly** on the **left side** (white background)
2. Type a reply: `"I'm on my way! I'll be there in 10 minutes."`
3. Click **"📤 Send"**

**In Browser #1 (User - Chrome):**

1. The helper's message appears **instantly** on the **left side**
2. Type: `"Thank you so much!"`
3. Send it

**Keep chatting back and forth!** ✅

---

## Part 3: Test Advanced Features

### Test Typing Indicators

1. **In Browser #1:** Start typing (don't send)
2. **In Browser #2:** Watch for "⌨️ Other user is typing..." below the chat window
3. Indicator disappears after 2-3 seconds of inactivity

---

### Test Mark as Read

1. **Send several messages** from Browser #1
2. **In Browser #2:** Click **"✓ Mark as Read"** button
3. Check the console: `✓ You marked messages as read`

---

### Test Get All Conversations

1. **In either browser:** Click **"📋 Get All Conversations"** button
2. Open **Developer Console** (F12)
3. Look for the conversations array in the console log
4. You should see your conversation with message history

---

### Test Leave Conversation

1. **In Browser #1:** Click **"🚪 Leave Conversation"** button
2. The conversation info badge disappears
3. Try sending a message → Should show error "Please join a conversation first"
4. **Rejoin** by entering the conversation ID again

---

### Test Disconnect/Reconnect

1. **In Browser #1:** Click **"🔌 Disconnect"** button
2. Status changes to: **"✗ Disconnected"**
3. Try sending a message → Error shown
4. **Reconnect:** Paste token again and click Connect
5. Join conversation again
6. Continue chatting!

---

## Part 4: Test REST API Endpoints (Optional)

### Send Message via REST (instead of Socket.IO)

```
Method: POST
URL: http://localhost:3001/api/chat/conversation/674e9876543210fedcba9876/message
                                                   ↑ YOUR CONVERSATION_ID

Headers:
  Content-Type: application/json
  Authorization: Bearer USER_TOKEN

Body (raw JSON):
{
  "content": "This message was sent via REST API!"
}
```

**✅ CHECK:** Message should appear in both browser windows instantly!

---

### Get Specific Conversation

```
Method: GET
URL: http://localhost:3001/api/chat/conversation/674e9876543210fedcba9876

Headers:
  Authorization: Bearer USER_TOKEN
```

**Response includes:**
- All messages in the conversation
- User and helper details
- Timestamps and read status

---

### Get All Conversations

```
Method: GET
URL: http://localhost:3001/api/chat/conversations

Headers:
  Authorization: Bearer USER_TOKEN
```

**Returns array of all conversations** for the authenticated user.

---

### Get Unread Message Count

```
Method: GET
URL: http://localhost:3001/api/chat/unread-count

Headers:
  Authorization: Bearer USER_TOKEN
```

**Response:**
```json
{
  "success": true,
  "message": "unread count retrieved",
  "data": {
    "unreadCount": 3
  }
}
```

---

### Mark Messages as Read (REST)

```
Method: PATCH
URL: http://localhost:3001/api/chat/conversation/674e9876543210fedcba9876/read

Headers:
  Authorization: Bearer USER_TOKEN
```

---

### Archive Conversation

```
Method: PATCH
URL: http://localhost:3001/api/chat/conversation/674e9876543210fedcba9876/archive

Headers:
  Authorization: Bearer USER_TOKEN
```

---

## 🎯 Success Checklist

- [ ] **Server Running:** Port 3001 listening
- [ ] **MongoDB Connected:** Database accessible
- [ ] **User Logged In:** Got USER_TOKEN
- [ ] **Helper Logged In:** Got HELPER_TOKEN
- [ ] **Request Created:** Got REQUEST_ID
- [ ] **Helper Accepted:** Request status is "assigned"
- [ ] **Conversation Created:** Got CONVERSATION_ID
- [ ] **Browser #1 Connected:** User connected via Socket.IO
- [ ] **Browser #2 Connected:** Helper connected via Socket.IO
- [ ] **Both Joined Same Conversation:** Yellow badges showing
- [ ] **Messages Sent:** Real-time delivery working
- [ ] **Messages Received:** Instant display in both browsers
- [ ] **Typing Indicators Working:** Shows when typing
- [ ] **Mark as Read Working:** Button updates status
- [ ] **REST API Working:** Can send via Postman too

---

## 🐛 Troubleshooting

### Problem: "Cannot connect to Socket.IO"

**Solutions:**
- Verify server is running: `node app.js`
- Check server console for errors
- Ensure port 3001 is not blocked by firewall
- Open browser console (F12) and check for errors

---

### Problem: "Authentication error: No token provided"

**Solutions:**
- Make sure you pasted the FULL token (starts with "eyJ...")
- Don't include "Bearer " in the input field (just the token)
- Token might be expired - login again for a fresh token

---

### Problem: "Conversation not found"

**Solutions:**
- Verify the helper is assigned to the request first
- Check that you're using the correct REQUEST_ID
- Make sure request status is "assigned" or "in_progress"
- Try calling GET `/api/chat/conversation/request/:requestId` again

---

### Problem: Messages not appearing in other browser

**Solutions:**
- Both browsers must join the SAME conversation ID
- Check both browsers are showing "✓ Connected" status
- Open console (F12) in both browsers and check for errors
- Verify Socket.IO is loaded (check Network tab)

---

### Problem: "Access denied" when getting conversation

**Solutions:**
- User must be either the requester OR the helper
- Check that the token matches one of the participants
- Verify helper was properly assigned to the request

---

### Problem: Server crashes or errors

**Solutions:**
- Check MongoDB is running
- Verify all environment variables in `.env`
- Check server console for specific error messages
- Restart the server: `Ctrl+C` then `node app.js`

---

## 📊 Expected Console Output

### Server Console
```
Server is running on port 3001
Socket.IO is ready for connections
MongoDB connected successfully
User connected: 673abc123def456789
User 673abc123def456789 joined conversation 674e9876543210fedcba9876
Message sent in conversation 674e9876543210fedcba9876 by user 673abc123def456789
```

### Browser Console (F12)
```
✓ Connected to server
Socket ID: abc123xyz
Joining conversation: 674e9876543210fedcba9876
✓ Joined conversation: 674e9876543210fedcba9876
💬 New message received: { conversationId: '...', message: {...} }
Message sent: Hello!
```

---

## 🎉 What Success Looks Like

1. **Two browsers** open side by side
2. **Both showing "Connected"** status
3. **Type in Browser #1** → Message appears instantly in Browser #2
4. **Type in Browser #2** → Message appears instantly in Browser #1
5. **Typing indicators** show when the other person types
6. **Messages persist** - refresh browser and messages are still there
7. **Postman calls work** - REST API messages appear in browsers too

---

## 📝 Test Data Examples

### User Account
- Email: `user@example.com`
- Password: `password123`
- Role: Regular User (needs help)

### Helper Account
- Email: `helper@example.com`
- Password: `helperpass123`
- Role: Helper (provides assistance)

### Sample Request
```json
{
  "location": {
    "lat": 40.7128,
    "lng": -74.0060,
    "address": "Times Square, New York, NY"
  },
  "problemType": "flat_tire",
  "description": "I have a flat tire on my front right wheel",
  "priority": "high"
}
```

### Sample Messages
- User: "Hello! I need help with a flat tire."
- Helper: "I'm on my way! What's your exact location?"
- User: "I'm at Times Square, near the red building."
- Helper: "Perfect, I'll be there in 5 minutes."
- User: "Thank you so much!"

---

## 🚀 Next Steps

After successful testing:

1. **Integrate with Frontend:** Use Socket.IO client in React
2. **Add Notifications:** Browser notifications for new messages
3. **Add File Upload:** Send images in chat
4. **Add Emojis:** Emoji support in messages
5. **Add Voice Messages:** Record and send audio
6. **Add Location Sharing:** Share real-time location in chat

---

## 📚 Additional Resources

- **API Documentation:** `CHAT_API_DOCUMENTATION.md`
- **Implementation Summary:** `CHAT_IMPLEMENTATION_SUMMARY.md`
- **Socket.IO Docs:** https://socket.io/docs/v4/
- **Postman Collections:** Can be exported for easy sharing

---

**Happy Testing! 🎊**

If you encounter any issues not covered in this guide, check the server logs and browser console for detailed error messages.
