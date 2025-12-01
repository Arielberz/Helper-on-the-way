# API Documentation

## 📋 Table of Contents
1. [Authentication](#authentication)
2. [User Endpoints](#user-endpoints)
3. [Request Endpoints](#request-endpoints)
4. [Chat Endpoints](#chat-endpoints)
5. [Rating Endpoints](#rating-endpoints)
6. [Report Endpoints](#report-endpoints)
7. [Socket.IO Events](#socketio-events)
8. [Database Models](#database-models)

---

## 🔐 Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### How to Get Token
Register or login to receive a JWT token. Store it in localStorage and include it in all API requests.

---

## 👤 User Endpoints

### Register
**POST** `/api/users/register`

Create a new user account.

**Request Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+972501234567"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "user registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "673d8e5f8a1b2c3d4e5f6789",
      "username": "john_doe",
      "email": "john@example.com",
      "phone": "+972501234567"
    }
  }
}
```

---

### Login
**POST** `/api/users/login`

Authenticate existing user.

**Request Body:**
```json
{
  "identifier": "john@example.com",  // email or username
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "login successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "673d8e5f8a1b2c3d4e5f6789",
      "username": "john_doe",
      "email": "john@example.com"
    }
  }
}
```

---

### Get User Profile
**GET** `/api/users/:id`

Get user profile by ID. 🔒 Requires authentication.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "673d8e5f8a1b2c3d4e5f6789",
      "username": "john_doe",
      "email": "john@example.com",
      "phone": "+972501234567",
      "isHelper": false,
      "averageRating": 4.5,
      "totalRatings": 12
    }
  }
}
```

---

### Update User Profile
**PUT** `/api/users/:id`

Update user information. 🔒 Requires authentication (own profile only).

**Request Body:**
```json
{
  "username": "new_username",
  "phone": "+972509876543",
  "email": "newemail@example.com"
}
```

---

## 🚨 Request Endpoints

### Create Help Request
**POST** `/api/requests`

Create a new help request. 🔒 Requires authentication.

**Request Body:**
```json
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

**Response (201):**
```json
{
  "success": true,
  "message": "request created successfully",
  "data": {
    "request": {
      "_id": "674a1b2c3d4e5f6789012345",
      "user": "673d8e5f8a1b2c3d4e5f6789",
      "problemType": "flat_tire",
      "location": {
        "lat": 32.0853,
        "lng": 34.7818,
        "address": "Tel Aviv, Israel"
      },
      "status": "pending",
      "pendingHelpers": [],
      "createdAt": "2025-12-01T10:30:00Z"
    }
  }
}
```

**Problem Types:**
- `flat_tire`
- `battery_dead`
- `out_of_gas`
- `engine_problem`
- `locked_out`
- `accident`
- `other`

---

### Get All Requests
**GET** `/api/requests`

Get all active help requests. 🔒 Requires authentication.

**Query Parameters:**
- `status` - Filter by status (pending, assigned, in_progress, completed, cancelled)
- `lat` - User latitude for distance calculation
- `lng` - User longitude for distance calculation

**Response (200):**
```json
{
  "success": true,
  "data": {
    "requests": [
      {
        "_id": "674a1b2c3d4e5f6789012345",
        "user": {
          "username": "john_doe",
          "phone": "+972501234567"
        },
        "problemType": "flat_tire",
        "location": {...},
        "status": "pending",
        "distance": 2.5,
        "createdAt": "2025-12-01T10:30:00Z"
      }
    ]
  }
}
```

---

### Volunteer to Help (Step 1)
**POST** `/api/requests/:requestId/volunteer`

Express interest in helping with a request. 🔒 Requires authentication.

**Response (200):**
```json
{
  "success": true,
  "message": "You have volunteered to help",
  "data": {
    "request": {...}
  }
}
```

**Socket Event Emitted:**
- `helperRequestReceived` → sent to requester

---

### Confirm Helper (Step 2)
**POST** `/api/requests/:requestId/confirm-helper`

Confirm a specific helper from pending list. 🔒 Requires authentication (requester only).

**Request Body:**
```json
{
  "helperId": "673d8e5f8a1b2c3d4e5f6789"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Helper confirmed successfully",
  "data": {
    "request": {...}
  }
}
```

**Socket Event Emitted:**
- `helperConfirmed` → sent to helper

---

### Reject Helper
**POST** `/api/requests/:requestId/reject-helper`

Reject a helper from pending list. 🔒 Requires authentication (requester only).

**Request Body:**
```json
{
  "helperId": "673d8e5f8a1b2c3d4e5f6789"
}
```

---

### Update Request Status
**PATCH** `/api/requests/:requestId/status`

Update request status. 🔒 Requires authentication.

**Request Body:**
```json
{
  "status": "completed"
}
```

**Valid Status Transitions:**
- `pending` → `assigned` (when helper confirmed)
- `assigned` → `in_progress` (helper on the way)
- `in_progress` → `completed` (help provided)
- Any status → `cancelled`

---

## 💬 Chat Endpoints

### Get All Conversations
**GET** `/api/chat/conversations`

Get all conversations for authenticated user. 🔒 Requires authentication.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "conversations": [
      {
        "_id": "675a1b2c3d4e5f6789012345",
        "request": {
          "_id": "674a1b2c3d4e5f6789012345",
          "problemType": "flat_tire"
        },
        "user": {
          "username": "john_doe",
          "email": "john@example.com"
        },
        "helper": {
          "username": "helper_joe",
          "email": "joe@example.com"
        },
        "messages": [...],
        "lastMessageAt": "2025-12-01T10:30:00Z",
        "isActive": true
      }
    ]
  }
}
```

---

### Get Conversation by Request
**GET** `/api/chat/conversation/request/:requestId`

Get or create conversation for a specific request. 🔒 Requires authentication.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "conversation": {...}
  }
}
```

---

### Get Unread Message Count
**GET** `/api/chat/unread-count`

Get total unread message count. 🔒 Requires authentication.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "unreadCount": 5
  }
}
```

---

### Send Message (REST)
**POST** `/api/chat/conversation/:conversationId/message`

Send a message (alternative to Socket.IO). 🔒 Requires authentication.

**Request Body:**
```json
{
  "content": "Hello, I'm on my way!"
}
```

---

### Mark Messages as Read
**PATCH** `/api/chat/conversation/:conversationId/read`

Mark all messages in conversation as read. 🔒 Requires authentication.

---

### Delete Conversation
**DELETE** `/api/chat/conversation/:conversationId`

Delete conversation and all its messages. 🔒 Requires authentication (participants only).

**Response (200):**
```json
{
  "success": true,
  "message": "conversation deleted successfully (X messages)",
  "data": {
    "deletedConversation": {...}
  }
}
```

---

## ⭐ Rating Endpoints

### Submit Rating
**POST** `/api/ratings/rate`

Rate a helper after request completion. 🔒 Requires authentication.

**Request Body:**
```json
{
  "helperId": "673d8e5f8a1b2c3d4e5f6789",
  "requestId": "674a1b2c3d4e5f6789012345",
  "rating": 5,
  "comment": "Great helper! Very professional and quick."
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "rating submitted successfully",
  "data": {
    "rating": {
      "_id": "676a1b2c3d4e5f6789012345",
      "requester": "673d8e5f8a1b2c3d4e5f6789",
      "helper": "673d8e5f8a1b2c3d4e5f6789",
      "request": "674a1b2c3d4e5f6789012345",
      "rating": 5,
      "comment": "Great helper!",
      "createdAt": "2025-12-01T11:00:00Z"
    }
  }
}
```

---

### Get Helper's Ratings
**GET** `/api/ratings/helper/:helperId`

Get all ratings for a specific helper. 🔒 Requires authentication.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "ratings": [...],
    "averageRating": 4.8,
    "totalRatings": 15
  }
}
```

---

### Get Rating for Request
**GET** `/api/ratings/request/:requestId`

Check if rating exists for a specific request. 🔒 Requires authentication.

---

## 🚫 Report Endpoints

### Submit Report
**POST** `/api/reports/report`

Report a user for inappropriate behavior. 🔒 Requires authentication.

**Request Body:**
```json
{
  "reportedUser": "673d8e5f8a1b2c3d4e5f6789",
  "conversation": "675a1b2c3d4e5f6789012345",
  "reason": "illegal_activity",
  "description": "User requested illegal services"
}
```

**Report Reasons:**
- `illegal_activity`
- `harassment`
- `inappropriate_content`
- `scam`
- `violence_threat`
- `other`

**Response (201):**
```json
{
  "success": true,
  "message": "report submitted successfully",
  "data": {
    "report": {...}
  }
}
```

---

### Get My Reports
**GET** `/api/reports/my-reports`

Get all reports submitted by authenticated user. 🔒 Requires authentication.

---

### Get All Reports (Admin)
**GET** `/api/reports/all`

Get all reports (admin endpoint). 🔒 Requires authentication + admin role.

---

## 🔌 Socket.IO Events

### Connection
```javascript
// Client connects with JWT token
io.connect('http://localhost:3001', {
  auth: { token: 'your_jwt_token' }
})
```

### Chat Events

#### Join Conversation
```javascript
// Client → Server
socket.emit('join_conversation', { conversationId })

// Server confirms
socket.on('joined_conversation', ({ conversationId }) => {...})
```

#### Send Message
```javascript
// Client → Server
socket.emit('send_message', {
  conversationId: '675a1b2c3d4e5f6789012345',
  content: 'Hello!'
})

// Server → All in conversation
socket.on('new_message', (message) => {
  // message = { _id, sender, content, timestamp, read }
})
```

#### Typing Indicator
```javascript
// Client → Server
socket.emit('typing', { conversationId, isTyping: true })

// Server → Other user
socket.on('user_typing', ({ userId, isTyping }) => {...})
```

#### Mark as Read
```javascript
// Client → Server
socket.emit('mark_as_read', { conversationId })

// Server → Other user
socket.on('messages_read', ({ conversationId, readBy }) => {...})
```

### Notification Events

#### Helper Request Received
```javascript
// Server → Requester when someone volunteers
socket.on('helperRequestReceived', ({ requestId, helper }) => {
  // Show GlobalHelperRequestModal
})
```

#### Helper Confirmed
```javascript
// Server → Helper when they're confirmed
socket.on('helperConfirmed', ({ requestId, requester }) => {
  // Show HelperConfirmedNotification
})
```

### Request Events

#### New Request Added
```javascript
// Server → All online helpers
socket.on('requestAdded', (request) => {
  // Update map with new marker
})
```

#### Request Updated
```javascript
// Server → Relevant users
socket.on('requestUpdated', (request) => {
  // Update UI with new status
})
```

---

## 🗄️ Database Models

### User Schema
```javascript
{
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },  // hashed
  phone: { type: String, required: true },
  isHelper: { type: Boolean, default: false },
  helperSettings: {
    isAvailable: Boolean,
    location: { lat: Number, lng: Number },
    radius: Number  // km
  },
  averageRating: { type: Number, default: 0 },
  totalRatings: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
}
```

### Request Schema
```javascript
{
  user: { type: ObjectId, ref: 'User', required: true },
  problemType: { type: String, enum: [...], required: true },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    address: String
  },
  description: String,
  status: {
    type: String,
    enum: ['pending', 'assigned', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  pendingHelpers: [{ type: ObjectId, ref: 'User' }],
  assignedHelper: { type: ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  completedAt: Date
}
```

### Conversation Schema
```javascript
{
  request: { type: ObjectId, ref: 'Request', required: true },
  user: { type: ObjectId, ref: 'User', required: true },
  helper: { type: ObjectId, ref: 'User', required: true },
  messages: [{
    sender: { type: ObjectId, ref: 'User' },
    content: { type: String, maxlength: 5000 },
    timestamp: { type: Date, default: Date.now },
    read: { type: Boolean, default: false }
  }],
  lastMessageAt: Date,
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
}
```

### Rating Schema
```javascript
{
  requester: { type: ObjectId, ref: 'User', required: true },
  helper: { type: ObjectId, ref: 'User', required: true },
  request: { type: ObjectId, ref: 'Request', required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, maxlength: 1000 },
  createdAt: { type: Date, default: Date.now }
}
```

### Report Schema
```javascript
{
  reportedBy: { type: ObjectId, ref: 'User', required: true },
  reportedUser: { type: ObjectId, ref: 'User', required: true },
  conversation: { type: ObjectId, ref: 'Conversation' },
  reason: {
    type: String,
    enum: ['illegal_activity', 'harassment', 'inappropriate_content', 'scam', 'violence_threat', 'other'],
    required: true
  },
  description: { type: String, maxlength: 1000 },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
    default: 'pending'
  },
  createdAt: { type: Date, default: Date.now }
}
```

---

## 🔧 Error Responses

All errors follow this format:

```json
{
  "success": false,
  "message": "error description",
  "error": "detailed error message"
}
```

**Common HTTP Status Codes:**
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate data)
- `500` - Internal Server Error

---

**Last Updated**: December 1, 2025  
**Base URL**: `http://localhost:3001/api`  
**Version**: 2.0
