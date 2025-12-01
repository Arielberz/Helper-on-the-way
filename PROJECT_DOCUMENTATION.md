# Helper on the Way - Project Overview

## 📋 Table of Contents
1. [About the Project](#about-the-project)
2. [Tech Stack](#tech-stack)
3. [Getting Started](#getting-started)
4. [Project Structure](#project-structure)
5. [Core Features](#core-features)
6. [Documentation Files](#documentation-files)

---

## 🚗 About the Project

**Helper on the Way** is a real-time roadside assistance platform connecting users in need with nearby helpers. The application enables instant help requests, real-time location tracking, live chat, secure payments, and a comprehensive rating system.

### Key Capabilities
- 📍 **Live Location Tracking** - Google Maps integration with real-time updates
- 💬 **Real-time Chat** - Socket.IO powered instant messaging
- ⭐ **Rating System** - Comprehensive feedback and rating after each assistance
- 🔔 **Push Notifications** - Instant alerts for requests, confirmations, and messages
- 👥 **Two-Step Helper Assignment** - Request → Confirm → Chat flow
- 📱 **Mobile Responsive** - Works seamlessly on all devices
- 💳 **Payment Integration** - Secure payment handling

---

## 🛠 Tech Stack

### Frontend
- **React 18+** - Component-based UI
- **Vite** - Fast build tool and dev server
- **TailwindCSS** - Utility-first styling
- **React Router v6** - Client-side routing
- **Socket.IO Client** - Real-time communication

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **Socket.IO** - WebSocket server
- **JWT** - Authentication tokens

### APIs & Services
- **Google Maps API** - Location and mapping
- **Stripe** (planned) - Payment processing

---

## 🚀 Getting Started

### Prerequisites
```bash
Node.js >= 14
MongoDB running locally or cloud instance
Google Maps API key
```

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Arielberz/Helper-on-the-way.git
cd Helper-on-the-way
```

2. **Install dependencies**
```bash
# Backend
cd Server
npm install

# Frontend
cd ../client
npm install
```

3. **Environment Setup**

Create `.env` in `Server/` directory:
```env
MONGO_URI=mongodb://localhost:27017/helper-on-the-way
JWT_SECRET=your_secret_key_here
PORT=3001
```

Create `.env` in `client/` directory:
```env
VITE_API_URL=http://localhost:3001
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
```

4. **Run the application**
```bash
# Terminal 1 - Backend
cd Server
node App.js

# Terminal 2 - Frontend
cd client
npm run dev
```

5. **Access the app**
- Frontend: http://localhost:5173
- Backend: http://localhost:3001

---

## 📁 Project Structure

```
Helper-on-the-way/
├── client/                          # React frontend
│   ├── src/
│   │   ├── components/              # Reusable components
│   │   │   ├── GlobalHelperRequestModal/
│   │   │   ├── GlobalRatingModal/
│   │   │   ├── MapLive/
│   │   │   ├── NearbyRequestsButton/
│   │   │   ├── PendingHelpersMapButton/
│   │   │   └── RatingModal/
│   │   ├── context/                 # React Context providers
│   │   │   ├── HelperRequestContext.jsx
│   │   │   └── RatingContext.jsx
│   │   ├── pages/                   # Page components
│   │   │   ├── chat/
│   │   │   ├── home/
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── PendingHelpers/
│   │   │   ├── Profile/
│   │   │   └── Rating/
│   │   └── utils/                   # Utility functions
│   │       ├── authUtils.js
│   │       ├── locationUtils.js
│   │       └── requestUtils.js
│   └── package.json
│
├── Server/                          # Node.js backend
│   ├── api/
│   │   ├── Controllers/             # Business logic
│   │   │   ├── chatController.js
│   │   │   ├── ratingController.js
│   │   │   ├── reportController.js
│   │   │   ├── requestsController.js
│   │   │   └── userController.js
│   │   ├── models/                  # MongoDB schemas
│   │   │   ├── chatModel.js
│   │   │   ├── ratingModel.js
│   │   │   ├── reportModel.js
│   │   │   ├── requestsModel.js
│   │   │   └── userModel.js
│   │   ├── routers/                 # API routes
│   │   └── sockets/                 # Socket.IO handlers
│   ├── config/
│   │   └── DB.js                    # Database connection
│   └── App.js                       # Server entry point
│
└── Documentation/                   # All documentation
    ├── PROJECT_DOCUMENTATION.md     # This file
    ├── API_DOCUMENTATION.md         # API endpoints
    ├── FEATURES_AND_FIXES.md        # Recent updates
    └── TESTING_AND_TROUBLESHOOTING.md
```

---

## ✨ Core Features

### 1. User Authentication
- Register/Login with JWT tokens
- Protected routes and API endpoints
- Persistent login with localStorage

### 2. Help Request System
- Create help requests with problem type and location
- Real-time map showing active requests
- Helper availability toggle (online/offline)
- Distance calculation to nearby requests

### 3. Two-Step Helper Assignment
**Flow:**
1. **Request** - Helper clicks "I can help" on a request
2. **Pending** - Requester sees list of pending helpers with ratings and distance
3. **Confirm** - Requester confirms one helper
4. **Auto-Chat** - Chat opens automatically between them

### 4. Real-time Chat
- Socket.IO powered messaging
- Conversation tied to each request
- Read receipts and typing indicators
- Delete conversations (both frontend and backend)
- Report user functionality for inappropriate behavior
- Mobile-responsive with bottom nav bar

### 5. Rating System
- Rate helpers after request completion
- Star rating (1-5) with detailed categories
- Written reviews
- Average rating displayed on profiles
- Global rating modal appears automatically

### 6. Notification System
- Socket.IO real-time notifications
- Helper request received alerts
- Helper confirmed notifications
- Pending rating reminders
- Audio alerts for important events

### 7. Location & Maps
- Google Maps integration
- Real-time location tracking
- Distance calculations (Haversine formula)
- Nearby requests display
- Helper location updates

---

## 📚 Documentation Files

This project has comprehensive documentation split into focused files:

### 1. **PROJECT_DOCUMENTATION.md** (This File)
- Project overview and setup
- Tech stack and architecture
- Core features summary
- Quick start guide

### 2. **API_DOCUMENTATION.md**
- All REST API endpoints
- Socket.IO events
- Authentication details
- Request/Response examples
- MongoDB schemas

### 3. **FEATURES_AND_FIXES.md**
- Recent feature implementations
- Bug fixes and improvements
- Chat system updates
- Notification system fixes
- UI/UX enhancements

### 4. **TESTING_AND_TROUBLESHOOTING.md**
- Testing guides (Postman, curl)
- Common issues and solutions
- Socket.IO debugging
- Location troubleshooting
- Development tips

---

## 🔗 Quick Links

- **Main README**: See `/README.md` for project introduction
- **Server Documentation**: See `/Server/` for backend-specific docs
- **Client README**: See `/client/README.md` for frontend details

---

## 👥 Team

- **Development**: Arielberz
- **Repository**: https://github.com/Arielberz/Helper-on-the-way

---

## 📄 License

This project is private and proprietary.

---

**Last Updated**: December 1, 2025  
**Version**: 2.0  
**Branch**: main

### Architecture
- Real-time messaging using Socket.IO
- Messages stored in MongoDB as subdocuments within conversations
- Unread message tracking with automatic read receipts
- Auto-scroll to latest messages

### Features
- ✅ One-on-one conversations between requester and helper
- ✅ Real-time message delivery
- ✅ Unread message count with red dot indicator
- ✅ Message read status
- ✅ Conversation list with last message preview
- ✅ Auto-create conversation when helper is confirmed
- ✅ Delete conversations (with all messages)
- ✅ Report users for inappropriate behavior
- ✅ Mobile-responsive with bottom navigation

### Socket Events
```javascript
// Client → Server
socket.emit('join-conversation', { conversationId })
socket.emit('send-message', { conversationId, content })

// Server → Client
socket.on('new-message', (message) => {...})
socket.on('message-read', ({ conversationId, messageId }) => {...})
```

### API Endpoints
```
GET    /api/chat/conversations           - Get all user conversations
GET    /api/chat/conversation/:id        - Get specific conversation
GET    /api/chat/unread-count            - Get unread message count
POST   /api/chat/conversation/:id/message - Send message
PATCH  /api/chat/conversation/:id/read   - Mark messages as read
DELETE /api/chat/conversation/:id        - Delete conversation
```

### Report Endpoints
```
POST   /api/reports/report               - Submit user report
GET    /api/reports/my-reports           - Get user's reports
GET    /api/reports/all                  - Get all reports (admin)
```

---

## Rating System

### Flow
1. Request marked as 'completed'
2. Modal appears for requester to rate helper
3. Rating saved with comment
4. Helper's average rating updated automatically
5. Rating displayed on helper's profile

### Features
- ⭐ 1-5 star rating system
- 💬 Optional text comments
- 📊 Average rating calculation
- 🔢 Rating count display
- 🎯 Context-aware modals (appears after completion)

### API Endpoints
```
POST   /api/ratings/rate                - Submit rating
GET    /api/ratings/helper/:helperId    - Get helper's ratings
GET    /api/ratings/request/:requestId  - Get rating for request
```

### Models
```javascript
{
  requester: ObjectId (User),
  helper: ObjectId (User),
  request: ObjectId (Request),
  rating: Number (1-5),
  comment: String,
  createdAt: Date
}
```

---

## Helper Assignment System

### Two-Step Process
1. **Helper Expresses Interest**: Helper clicks "I want to help"
   - Added to `request.pendingHelpers` array
   - Requester gets notification
   
2. **Requester Confirms Helper**: Requester selects from pending helpers
   - Request status → 'assigned'
   - Chat conversation auto-created
   - Other pending helpers rejected

### Pending Helpers Page
- Displays all helpers who want to help
- Shows helper ratings and profile info
- Confirm/Reject buttons for each helper
- Auto-navigate to chat after confirmation
- Real-time updates via Socket.IO

### API Endpoints
```
POST   /api/requests/:id/volunteer      - Express interest to help
POST   /api/requests/:id/confirm-helper - Confirm specific helper
POST   /api/requests/:id/reject-helper  - Reject specific helper
GET    /api/requests/:id                - Get request with pending helpers
```

---

## Notification System

### Types
1. **Helper Request Popup**: Shows when someone needs help nearby
2. **Helper Confirmed**: Notifies helper they were selected
3. **Pending Rating**: Reminds to rate after completion
4. **Chat Messages**: New message indicators

### Features
- ✅ Global modals using React Context
- ✅ Socket.IO real-time notifications
- ✅ Persistent across page navigation
- ✅ Audio/visual alerts
- ✅ Action buttons (Accept, Decline, Rate, etc.)

### Socket Events
```javascript
socket.on('new-help-request', (request) => {...})
socket.on('helper-confirmed', (data) => {...})
socket.on('request-completed', (data) => {...})
```

---

## Location System

### Features
- 🌍 Real-time GPS tracking
- 📍 Google Maps integration
- 📡 Geolocation API
- 🔄 Auto-update location every 30 seconds
- 🗺️ Interactive map with markers
- 📍 Address lookup and reverse geocoding

### Error Handling
- Permission denied → Show error modal
- Location unavailable → Fallback to manual entry
- Timeout errors → Retry mechanism
- Network errors → Cached location

### Troubleshooting
1. **Enable Location Services** in system settings
2. **Allow Browser Permissions** for location access
3. **Check Internet Connection**
4. **Restart Browser** if issues persist

---

## Security

### Authentication
- JWT token-based authentication
- Token stored in localStorage
- Auto-logout on token expiration
- Protected routes with middleware

### Authorization
- Request ownership verification
- Helper assignment validation
- Chat conversation participant check
- Report submission validation

### Data Validation
- Input sanitization
- Schema validation with Mongoose
- XSS protection
- Rate limiting on API endpoints

### Best Practices
```javascript
// Always verify token
const authMiddleware = require('./authMiddleware')
router.use(authMiddleware)

// Verify ownership
if (request.user.toString() !== userId) {
  return res.status(403).json({ message: 'Forbidden' })
}

// Sanitize inputs
const description = req.body.description.trim()
```

---

## API Endpoints

### Users
```
POST   /api/users/register              - Create account
POST   /api/users/login                 - Login
GET    /api/users/profile               - Get profile
PUT    /api/users/profile               - Update profile
```

### Requests
```
POST   /api/requests                    - Create help request
GET    /api/requests                    - Get all requests
GET    /api/requests/:id                - Get specific request
PUT    /api/requests/:id                - Update request
DELETE /api/requests/:id                - Delete request
POST   /api/requests/:id/volunteer      - Express interest
POST   /api/requests/:id/confirm-helper - Confirm helper
POST   /api/requests/:id/reject-helper  - Reject helper
```

### Chat
```
GET    /api/chat/conversations          - Get conversations
GET    /api/chat/conversation/:id       - Get conversation
POST   /api/chat/conversation/:id/message - Send message
PATCH  /api/chat/conversation/:id/read  - Mark as read
DELETE /api/chat/conversation/:id       - Delete conversation
```

### Ratings
```
POST   /api/ratings/rate                - Submit rating
GET    /api/ratings/helper/:id          - Get helper ratings
GET    /api/ratings/request/:id         - Get request rating
```

### Reports
```
POST   /api/reports/report              - Report user
GET    /api/reports/my-reports          - Get my reports
GET    /api/reports/all                 - Get all reports (admin)
```

---

## Testing Guide

### Manual Testing Checklist

#### Chat System
- [ ] Create conversation
- [ ] Send messages
- [ ] Receive messages in real-time
- [ ] Mark messages as read
- [ ] Delete conversation
- [ ] Report user from chat

#### Rating System
- [ ] Complete request
- [ ] Rate helper (1-5 stars)
- [ ] Add comment
- [ ] View ratings on profile
- [ ] Calculate average correctly

#### Helper Assignment
- [ ] Express interest in request
- [ ] View pending helpers
- [ ] Confirm helper
- [ ] Reject helper
- [ ] Auto-create chat on confirmation

#### Location System
- [ ] Request location permission
- [ ] Display user on map
- [ ] Show nearby requests
- [ ] Update location in real-time
- [ ] Handle permission errors

#### Mobile Responsiveness
- [ ] Bottom navigation works
- [ ] Chat list menu opens
- [ ] Floating buttons hidden on mobile
- [ ] Modals display correctly
- [ ] Touch interactions work

### Testing with Postman
Import `Postman_Rating_System.json` for pre-configured API tests.

### Socket.IO Testing
```javascript
// Connect to socket
const socket = io('http://localhost:3001', {
  auth: { token: 'your-jwt-token' }
})

// Test events
socket.emit('join-conversation', { conversationId: 'xxx' })
socket.on('new-message', (msg) => console.log(msg))
```

---

## Troubleshooting

### Common Issues

**Chat messages not appearing**
- Check Socket.IO connection
- Verify token is valid
- Check browser console for errors
- Ensure conversation exists

**Location not updating**
- Enable location services
- Grant browser permission
- Check internet connection
- Clear browser cache

**Rating modal not showing**
- Verify request status is 'completed'
- Check RatingContext provider
- Ensure no existing rating
- Check browser console

**Delete conversation fails**
- Verify user is conversation participant
- Check authentication token
- Ensure conversation ID is valid
- Check server logs

**Report submission fails**
- Fill all required fields
- Check character limits
- Verify user exists
- Check authentication

---

## Development Setup

### Prerequisites
- Node.js v18+
- MongoDB
- Google Maps API key

### Installation
```bash
# Install dependencies
cd client && npm install
cd ../Server && npm install

# Set environment variables
# client/.env
VITE_API_URL=http://localhost:3001
VITE_GOOGLE_MAPS_API_KEY=your-key

# Server/.env
MONGODB_URI=your-mongodb-uri
JWT_SECRET=your-secret
PORT=3001

# Run development servers
cd client && npm run dev
cd Server && node app.js
```

### File Structure
```
Helper-on-the-way/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React Context providers
│   │   └── utils/          # Utility functions
│   └── public/             # Static assets
├── Server/                 # Node.js backend
│   ├── Api/
│   │   ├── Controllers/    # Request handlers
│   │   ├── models/         # Mongoose schemas
│   │   ├── routers/        # Express routes
│   │   └── sockets/        # Socket.IO handlers
│   └── config/             # Configuration files
└── Documentation/          # This file
```

---

## Future Improvements

### Planned Features
- [ ] Payment integration
- [ ] Admin dashboard for reports
- [ ] Push notifications
- [ ] Helper verification system
- [ ] Request history
- [ ] Advanced search filters
- [ ] Multi-language support
- [ ] Helper availability status
- [ ] Request categories
- [ ] Image attachments in chat

### Performance Optimizations
- [ ] Message pagination
- [ ] Image optimization
- [ ] Lazy loading
- [ ] Cache implementation
- [ ] Database indexing
- [ ] CDN for static assets

---

## Contact & Support

For issues or questions:
- Check the documentation first
- Review error logs in browser console
- Check server logs for backend issues
- Test API endpoints with Postman

---

*Last Updated: December 1, 2025*
