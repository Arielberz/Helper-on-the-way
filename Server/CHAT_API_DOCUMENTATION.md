# Chat API Documentation

## Overview
The chat system allows helpers and users to communicate in real-time about assistance requests. Each conversation is tied to a specific request and includes both REST API endpoints and Socket.IO for real-time messaging.

## Features
- Real-time messaging using Socket.IO
- REST API fallback for message operations
- Conversation history stored in MongoDB
- Automatic conversation creation when a helper is assigned
- Read receipts
- Typing indicators
- Unread message counts
- Conversation archiving

## Data Models

### Conversation Schema
```javascript
{
  request: ObjectId,        // Reference to Request
  user: ObjectId,           // Reference to user who needs help
  helper: ObjectId,         // Reference to helper
  messages: [Message],      // Array of messages
  lastMessageAt: Date,      // Timestamp of last message
  isActive: Boolean,        // Whether conversation is active
  createdAt: Date,
  updatedAt: Date
}
```

### Message Schema
```javascript
{
  sender: ObjectId,         // Reference to User who sent message
  content: String,          // Message content (max 5000 chars)
  timestamp: Date,          // When message was sent
  read: Boolean            // Whether message has been read
}
```

## REST API Endpoints

All endpoints require authentication via Bearer token in Authorization header.

### 1. Get All Conversations
**GET** `/api/chat/conversations`

Returns all conversations for the authenticated user (both as requester and helper).

**Response:**
```json
{
  "success": true,
  "message": "conversations retrieved successfully",
  "data": {
    "conversations": [
      {
        "_id": "conversationId",
        "request": { "problemType": "flat_tire", "status": "in_progress" },
        "user": { "username": "john_doe", "email": "john@example.com" },
        "helper": { "username": "helper_joe", "email": "joe@example.com" },
        "messages": [...],
        "lastMessageAt": "2025-11-20T10:30:00Z",
        "isActive": true
      }
    ]
  }
}
```

### 2. Get Unread Message Count
**GET** `/api/chat/unread-count`

Returns the total number of unread messages for the authenticated user.

**Response:**
```json
{
  "success": true,
  "message": "unread count retrieved",
  "data": {
    "unreadCount": 5
  }
}
```

### 3. Get or Create Conversation for Request
**GET** `/api/chat/conversation/request/:requestId`

Gets existing conversation or creates a new one for a specific request.

**Response:**
```json
{
  "success": true,
  "message": "conversation retrieved successfully",
  "data": {
    "conversation": { /* conversation object */ }
  }
}
```

### 4. Get Specific Conversation
**GET** `/api/chat/conversation/:conversationId`

Gets a specific conversation by ID with full details.

**Response:**
```json
{
  "success": true,
  "message": "conversation retrieved successfully",
  "data": {
    "conversation": { /* conversation object with populated fields */ }
  }
}
```

### 5. Send Message (REST fallback)
**POST** `/api/chat/conversation/:conversationId/message`

Sends a message via REST API (Socket.IO is preferred for real-time).

**Request Body:**
```json
{
  "content": "Hello, I'm on my way!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "message sent successfully",
  "data": {
    "conversation": { /* updated conversation */ }
  }
}
```

### 6. Mark Messages as Read
**PATCH** `/api/chat/conversation/:conversationId/read`

Marks all unread messages in a conversation as read for the authenticated user.

**Response:**
```json
{
  "success": true,
  "message": "messages marked as read"
}
```

### 7. Archive Conversation
**PATCH** `/api/chat/conversation/:conversationId/archive`

Archives/closes a conversation.

**Response:**
```json
{
  "success": true,
  "message": "conversation archived successfully"
}
```

## Socket.IO Events

### Connection
Connect to the Socket.IO server with authentication:

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3001', {
  auth: {
    token: 'your-jwt-token'
  }
});
```

### Client → Server Events

#### 1. join_conversation
Join a conversation room to receive real-time updates.

```javascript
socket.emit('join_conversation', conversationId);
```

**Server Response:**
```javascript
socket.on('joined_conversation', (data) => {
  console.log('Joined conversation:', data.conversationId);
});
```

#### 2. leave_conversation
Leave a conversation room.

```javascript
socket.emit('leave_conversation', conversationId);
```

**Server Response:**
```javascript
socket.on('left_conversation', (data) => {
  console.log('Left conversation:', data.conversationId);
});
```

#### 3. send_message
Send a message in real-time.

```javascript
socket.emit('send_message', {
  conversationId: 'conversationId',
  content: 'Hello!'
});
```

#### 4. mark_as_read
Mark messages as read.

```javascript
socket.emit('mark_as_read', {
  conversationId: 'conversationId'
});
```

**Server Response:**
```javascript
socket.on('marked_as_read', (data) => {
  console.log('Messages marked as read in:', data.conversationId);
});
```

#### 5. typing
Send typing indicator.

```javascript
socket.emit('typing', {
  conversationId: 'conversationId',
  isTyping: true
});
```

### Server → Client Events

#### 1. new_message
Received when a new message is sent in a conversation you're in.

```javascript
socket.on('new_message', (data) => {
  console.log('New message:', data.message);
  // data = { conversationId, message: { sender, content, timestamp, read } }
});
```

#### 2. message_notification
Received when someone sends you a message (for notifications).

```javascript
socket.on('message_notification', (data) => {
  console.log('New message from:', data.from);
  // data = { conversationId, message, from }
});
```

#### 3. messages_read
Received when the other user reads your messages.

```javascript
socket.on('messages_read', (data) => {
  console.log('Messages read by:', data.readBy);
  // data = { conversationId, readBy }
});
```

#### 4. user_typing
Received when the other user is typing.

```javascript
socket.on('user_typing', (data) => {
  console.log('User typing:', data.isTyping);
  // data = { conversationId, userId, isTyping }
});
```

#### 5. error
Received when an error occurs.

```javascript
socket.on('error', (data) => {
  console.error('Socket error:', data.message);
});
```

## Usage Flow

### For Users Requesting Help

1. User creates a request (via requests API)
2. Helper accepts the request
3. User fetches conversation: `GET /api/chat/conversation/request/:requestId`
4. User connects to Socket.IO and joins conversation
5. User sends/receives messages in real-time

### For Helpers

1. Helper sees available requests
2. Helper accepts a request (request is assigned to them)
3. Helper fetches conversation: `GET /api/chat/conversation/request/:requestId`
4. Helper connects to Socket.IO and joins conversation
5. Helper sends/receives messages in real-time

### Example Client Implementation

```javascript
import io from 'socket.io-client';
import axios from 'axios';

class ChatService {
  constructor(token) {
    this.token = token;
    this.socket = null;
    this.baseURL = 'http://localhost:3001';
  }

  // Connect to Socket.IO
  connect() {
    this.socket = io(this.baseURL, {
      auth: { token: this.token }
    });

    this.socket.on('connect', () => {
      console.log('Connected to chat server');
    });

    this.socket.on('new_message', this.handleNewMessage);
    this.socket.on('message_notification', this.handleNotification);
    this.socket.on('user_typing', this.handleTyping);
  }

  // Join a conversation
  joinConversation(conversationId) {
    this.socket.emit('join_conversation', conversationId);
  }

  // Send a message
  sendMessage(conversationId, content) {
    this.socket.emit('send_message', { conversationId, content });
  }

  // Typing indicator
  setTyping(conversationId, isTyping) {
    this.socket.emit('typing', { conversationId, isTyping });
  }

  // Mark as read
  markAsRead(conversationId) {
    this.socket.emit('mark_as_read', { conversationId });
  }

  // Get all conversations (REST)
  async getConversations() {
    const response = await axios.get(`${this.baseURL}/api/chat/conversations`, {
      headers: { Authorization: `Bearer ${this.token}` }
    });
    return response.data.data.conversations;
  }

  // Event handlers
  handleNewMessage(data) {
    console.log('New message:', data);
  }

  handleNotification(data) {
    // Show notification
    console.log('Notification:', data);
  }

  handleTyping(data) {
    console.log('User typing:', data);
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}

// Usage
const chat = new ChatService('your-jwt-token');
chat.connect();
chat.joinConversation('conversationId');
chat.sendMessage('conversationId', 'Hello!');
```

## Access Control

- Users can only access conversations where they are either the requester or the helper
- Conversations are automatically created when a helper is assigned to a request
- Both parties must be authenticated to send/receive messages

## Error Handling

Common error responses:
- `401`: Authentication error (invalid/missing token)
- `403`: Access denied (not part of conversation)
- `404`: Conversation/request not found
- `400`: Bad request (missing/invalid data)
- `500`: Server error

## Best Practices

1. **Use Socket.IO for real-time messaging** - REST endpoints are fallbacks
2. **Join conversation rooms** - Always join before expecting real-time updates
3. **Handle reconnection** - Socket.IO handles reconnection automatically
4. **Mark messages as read** - Call this when user views the conversation
5. **Clean up** - Leave conversation rooms and disconnect socket when done
6. **Show typing indicators** - Enhance UX with typing events
7. **Handle notifications** - Use message_notification for push notifications
