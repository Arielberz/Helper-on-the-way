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
