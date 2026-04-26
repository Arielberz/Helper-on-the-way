# Helper on the Way

Real-time roadside assistance web app that connects drivers in distress with nearby volunteers. Think "Uber for roadside emergencies" with live map tracking, chat, payments, and ratings.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB running locally or connection string
- npm or yarn

### Installation & Verification

Run the complete verification suite (installs dependencies, builds client, starts server, performs health check):

```bash
npm run verify
```

This single command ensures everything works end-to-end.

### Development

**Start both client and server:**

```bash
# Terminal 1 - Server
cd server
npm install
node app

# Terminal 2 - Client  
cd client
npm install
npm run dev
```

**Or use root scripts:**

```bash
npm run install:all       # Install all dependencies
npm run dev:server        # Start server (port 3001)
npm run dev:client        # Start client (port 5173)
npm run build:client      # Build client for production
```

### Environment Setup

**Server `.env` (required):**
```env
MONGO_URI=mongodb://localhost:27017/helper-on-the-way
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=1h
BCRYPT_SALT_ROUNDS=10
PORT=3001
NODE_ENV=development
```

**Client `.env`:**
```env
VITE_API_URL=http://localhost:3001
```

## 📁 Project Structure

```
Helper-on-the-way/
├── client/               # React 19 + Vite frontend
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Route pages
│   │   ├── services/     # API service layer
│   │   ├── context/      # React contexts
│   │   ├── hooks/        # Custom React hooks
│   │   └── utils/        # Utility functions
│   └── package.json
├── server/               # Express.js backend
│   ├── api/
│   │   ├── controllers/  # Request handlers
│   │   ├── models/       # Mongoose schemas
│   │   ├── routers/      # API routes
│   │   ├── services/     # Business logic
│   │   ├── sockets/      # Socket.IO handlers
│   │   └── utils/        # Server utilities
│   └── package.json
├── scripts/              # Verification & automation
│   ├── verify.mjs        # End-to-end sanity check
│   └── README.md
└── package.json          # Root package with scripts
```

## 🔧 Tech Stack

**Frontend:**
- React 19
- React Router v7
- Leaflet (maps)
- Socket.IO client
- Tailwind CSS v4
- Vite

**Backend:**
- Express 5
- MongoDB + Mongoose
- Socket.IO server
- JWT authentication
- bcryptjs

**Real-time:**
- Socket.IO for live location tracking and chat

## ✅ Verification Script

The `npm run verify` command runs comprehensive checks:

1. ✅ Installs all dependencies (client + server)
2. ✅ Builds client successfully (Vite production build)
3. ✅ Starts server process
4. ✅ Waits for MongoDB connection
5. ✅ Verifies server responds on port 3001
6. ✅ Performs HTTP health check
7. ✅ Cleans up (stops server)

**Expected output:**
```
=================================
🔍 Project Verification Starting
=================================

🚀 Starting server...
✓ Server process launched

⏳ Waiting for server on port 3001...
✓ Server is responding on port 3001

🏥 Performing health check...
✓ Health check passed

=================================
✅ VERIFICATION PASSED
=================================
```

See [scripts/README.md](scripts/README.md) for detailed documentation.

## 🔑 Key Features

- **Live Map:** Full-screen interactive map with real-time help request markers
- **Socket.IO:** Real-time updates for requests, chat, and location tracking
- **Authentication:** JWT-based auth with bcrypt password hashing
- **Chat System:** Private conversations between requester and helper
- **Payment Integration:** Optional payment after help completion
- **Rating System:** Trust and reputation via user ratings
- **Mobile Responsive:** Works on all screen sizes

## 🔄 Requester Help Flow (End-to-End)

### Step 1: Requester Logs In & Opens Home
- **Frontend:** User navigates to `home.jsx` (displays `MapLive` component)
- **Component:** `MapLive.jsx` initializes Leaflet map and fetches active requests
- **API Call:** `GET /api/requests/active` → `requestsController.getActiveRequests()`

### Step 2: Requester Creates Help Request
- **Frontend:** User fills form in `HelpButton` component with:
  - Problem type (`flat_tire`, `dead_battery`, etc.)
  - Location (lat, lng, address)
  - Description and optional payment offer
- **Client Call:** `createRequest()` in `requests.service.js`
- **API Endpoint:** `POST /api/requests`
- **Backend Flow:**
  - `requestsController.createRequest()` validates phone verification
  - Calls `requestsService.createRequest()` which:
    - Checks for existing open request (status `pending` or `assigned`)
    - Creates new document in `Request` model with status `PENDING`
    - Returns populated request with user data
  - **Database:** Saves to MongoDB `requests` collection
  - **Response:** Returns created request with `_id`, status, user, location, payment info

### Step 3: Broadcast to Active Helpers & Map Update
- **Backend:** `broadcastRequestAdded()` emits Socket.IO event `requestAdded`
- **Frontend:** MapLive listens for `requestAdded` event and updates map markers
- **Map Display:** New request appears as marker with user avatar, problem type, payment info

### Step 4: Helper Discovers & Assigns to Request
- **Frontend:** Helper sees request on map, clicks marker or list
- **Helper Action:** Clicks "Request to Help" or assign button
- **Client Call:** `requestHelp(requestId)` in `requests.service.js`
- **API Endpoint:** `POST /api/requests/:id/request-help`
- **Backend Flow:**
  - `requestsController.requestToHelp()` validates helper is not requester
  - Calls `requestsService.requestToHelp()` which:
    - Adds helper to `pendingHelpers` array (with timestamp and message)
    - Does NOT change status yet
  - **Database:** Updates `Request` document with new helper in pending list
  - **Response:** Returns updated request
- **Notification:** Socket.IO notifies requester of incoming help request

### Step 5: Requester Confirms Helper & Status → ASSIGNED
- **Frontend:** Requester sees `IncomingHelpNotification` with helper details
- **Requester Action:** Clicks "Accept" to confirm helper
- **API Endpoint:** `POST /api/requests/:id/confirm-help`
- **Backend Flow:**
  - `requestsController.confirmHelp()` validates requester ownership
  - Calls `requestsService.confirmHelp()` which:
    - Sets `helper` field to confirmed helper ID
    - Changes status from `PENDING` → `ASSIGNED`
    - Clears `pendingHelpers` array
  - **Database:** Updates `Request.helper`, `Request.status = 'assigned'`
  - **Response:** Returns updated request
- **Socket Broadcast:** Both parties notified via `requestAssigned` event
- **Chat:** Conversation automatically created between requester and helper

### Step 6: Helper Starts Job & Status → IN_PROGRESS
- **Frontend:** Helper sees `HelperConfirmedNotification`
- **Helper Action:** Clicks "Start Work"
- **API Endpoint:** `PATCH /api/requests/:id/status` with `{ status: 'in_progress' }`
- **Backend Flow:**
  - `requestsController.updateRequestStatus()` validates helper ownership
  - Sets status `ASSIGNED` → `IN_PROGRESS`
  - Optionally sets `estimatedArrival` (ETA calculation via `etaUtils.js`)
  - **Database:** Updates `Request.status`, `Request.updatedAt`
  - **Response:** Returns updated request
- **Socket Broadcast:** `requestUpdate` event notifies both parties
- **Real-time Tracking:** Helper location updates sent via Socket.IO

### Step 7: Job Completion Flow
**Helper marks as complete:**
- **API Endpoint:** `PATCH /api/requests/:id/status` with `{ helperCompleted: true }`
- **Backend:**
  - Sets `helperCompletedAt` timestamp
  - Status remains `ASSIGNED` (awaiting requester confirmation)
  - **Database:** Updates `Request.helperCompletedAt`

**Requester confirms completion:**
- **Frontend:** Requester sees completion dialog
- **API Endpoint:** `PATCH /api/requests/:id/status` with `{ requesterConfirmed: true }`
- **Backend Flow:**
  - Validates `helperCompletedAt` exists
  - If payment not marked as paid → Status `CONFIRMED` (pending payment)
  - If payment paid → Status `COMPLETED`, sets `completedAt` timestamp
  - **Database:** Updates `Request.requesterConfirmedAt`, `Request.status`, `Request.completedAt`
  - **Response:** Returns updated request

### Step 8: Optional Payment Processing
- **Frontend:** `ChatPayment` component handles payment UI (Stripe/PayPal)
- **API Endpoint:** `PATCH /api/requests/:id/payment` with payment details
- **Backend Flow:**
  - `requestsController.updatePayment()` validates permissions
  - Updates `payment.isPaid = true` and `payment.paymentMethod`
  - If in `CONFIRMED` status → Changes to `COMPLETED`, sets `completedAt`
  - **Database:** Updates `Request.payment`
  - **Response:** Returns updated request

### Step 9: Rating & Feedback
- **Frontend:** `RatingModal` component displayed for both parties
- **API Endpoint:** `POST /api/ratings`
- **Backend:**
  - `ratingsController.createRating()` stores rating with:
    - `rater` (who gave the rating)
    - `ratee` (who is being rated)
    - `request` (reference to request)
    - `score` (1-5), `comment`, `categories`
  - Updates user's `averageRating` and `ratingCount`
  - **Database:** Saves to MongoDB `ratings` collection, updates `users` collection

### Step 10: Request Lifecycle Complete
- **Status:** Request in `COMPLETED` status
- **Database:** All fields populated (user, helper, payment, timestamps)
- **User Profiles:** Both users' ratings updated
- **UI:** Request removed from active requests, archived in user history

## 📝 API Endpoints

**Authentication (public):**
- `POST /api/users/register` - User registration
- `POST /api/users/login` - User login
- `POST /api/users/verify-email` - Email verification
- `POST /api/users/forgot-password` - Request password reset
- `POST /api/users/reset-password` - Reset password

**Requests (protected):**
- `POST /api/requests` - Create help request
- `GET /api/requests/active` - Get active requests for map
- `GET /api/requests/my-requests` - User's own requests
- `POST /api/requests/:id/assign` - Helper assigns themselves
- `PATCH /api/requests/:id/status` - Update request status
- `PATCH /api/requests/:id/payment` - Update payment info

**Chat (protected):**
- `GET /api/chat/conversations` - Get user's conversations
- `GET /api/chat/conversation/:id` - Get conversation details
- `POST /api/chat/conversation/:id/message` - Send message
- `PATCH /api/chat/conversation/:id/read` - Mark as read

See [.github/copilot-instructions.md](.github/copilot-instructions.md) for complete API documentation.

## 🧪 Development Notes

**Known Issues:**
- Socket.IO handlers exist but need full integration
- Chat and rating features are partially implemented
- MapLive expects socket events that need server-side implementation

**File Naming:**
- Server entry point: `app.js` (lowercase)
- Server folder: capital 'S' (`Server/`)
- React components: PascalCase
- Models/controllers: camelCase

**Authentication Flow:**
1. Login/register returns JWT token + user object
2. Client stores token in localStorage
3. Protected routes include `Authorization: Bearer <token>`
4. Server middleware verifies JWT and attaches `req.userId`

## 🤝 Contributing

This project uses Hebrew comments in code. Please preserve them when making changes.

## 📄 License

ISC
