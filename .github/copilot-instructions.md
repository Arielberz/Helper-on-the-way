# Helper on the Way - AI Coding Agent Instructions

## Project Overview
Real-time roadside assistance web app connecting drivers in distress with nearby volunteers. Think "Uber for roadside emergencies" with live map tracking, chat, payments, and ratings.

## Architecture

### Monorepo Structure
- `client/` - React 19 + Vite frontend with Tailwind CSS
- `Server/` - Express.js backend with MongoDB (note: capital 'S')
- Shared features: JWT auth, Socket.IO real-time updates, REST API

### Tech Stack
**Frontend:** React 19, React Router v7, Leaflet maps, Socket.IO client, Axios, Tailwind CSS v4  
**Backend:** Express 5, MongoDB/Mongoose, JWT, bcryptjs, Socket.IO server  
**Real-time:** Socket.IO for live location tracking and chat (sockets not yet implemented)

## Key Patterns & Conventions

### File Naming & Casing
- **Server entry point is `app.js`** (lowercase) but package.json references `App.js` (capital A) - use `node app` to run
- React components use PascalCase: `MapLive.jsx`, `ProtectedRoute.jsx`
- Models/controllers use camelCase: `userModel.js`, `requestsController.js`
- Server folder has capital 'S', config folder lowercase

### Authentication Flow
1. Login/register returns JWT token + sanitized user object
2. Client stores token in `localStorage.getItem("token")`
3. Protected routes check token existence (client-side only, no validation)
4. API requests include header: `Authorization: Bearer ${token}`
5. Server middleware (`authMiddleware.js`) verifies JWT and attaches `req.userId` and `req.user`

**Critical:** JWT payload uses `id` field, but middleware normalizes to both `req.userId` and `req.user.id`

### Data Models

#### Request Schema (`requestsModel.js`)
Core entity representing help requests with:
- **Status lifecycle:** `pending` → `assigned` → `in_progress` → `completed`/`cancelled`
- **ProblemType enum:** `flat_tire`, `dead_battery`, `out_of_fuel`, `engine_problem`, `locked_out`, `accident`, `towing_needed`, `other`
- **Refs:** `user` (requester), `helper` (assigned volunteer, nullable)
- **Location:** Embedded object with `lat`, `lng`, `address`
- **Payment:** Optional embedded object with `offeredAmount`, `currency` (default: ILS), `isPaid`, `paymentMethod`
- **Indexes:** Geospatial on location, status+createdAt, user+createdAt, helper+createdAt

#### User Schema (`userModel.js`)
- Fields: `username`, `email`, `phone`, `password` (bcrypt hashed), `createdAt`
- All unique, lowercase, trimmed
- Validation in controller: 3-30 chars username, E.164 phone format (8-15 digits), email regex
- Password min 8 chars, hashed with `BCRYPT_SALT_ROUNDS` env var (default 10)

### API Design

#### Response Format
```javascript
// Success
{ success: true, message: "...", data: {...} }

// Error  
{ success: false, message: "...", error: "..." }
```

#### Routes Pattern
- User: `POST /api/users/register`, `POST /api/users/login` (no auth)
- Requests: All under `/api/requests` with auth middleware
  - `POST /` - Create request
  - `GET /active` - Get pending/assigned/in_progress requests for map
  - `GET /my-requests` - User's own requests
  - `POST /:id/assign` - Helper assigns themselves (sets `req.userId` as helper)
  - `PATCH /:id/status` - Update status
  - `PATCH /:id/payment` - Update payment (requester or helper only)

#### Auth Middleware Usage
Apply `authMiddleware` to all protected routes. It populates `req.userId` from JWT. Controllers verify ownership by comparing `request.user.toString() !== req.userId`.

### Frontend Patterns

#### Environment Variables
- Use `import.meta.env.VITE_API_URL` for API base URL (Vite convention)
- Set in `.env` file as `VITE_API_URL=http://localhost:3001`

#### Protected Routes
Wrapper component `ProtectedRoute` checks localStorage token and redirects to `/login` if missing. **No JWT validation on client** - relies on server auth middleware.

#### Map Integration (MapLive.jsx)
- Uses React Leaflet with OpenStreetMap tiles
- Fetches user GPS via `navigator.geolocation.watchPosition`
- Socket.IO client connects to backend for real-time marker updates
- Currently references `/api/locations` endpoint (not implemented server-side yet)
- Pattern: `socket.on('locationAdded')` listens for broadcasts, `socket.emit('newLocation')` sends updates

### Development Workflow

#### Running the App
**Server:**
```powershell
cd Server
node app  # Note: lowercase 'app' despite package.json saying App.js
```
Listens on `PORT` env var or 3001. Requires `.env` with `MONGO_URI`, `JWT_SECRET`.

**Client:**
```powershell
cd client
npm run dev  # Vite dev server, typically port 5173
```

#### Environment Setup
**Server `.env`:**
- `MONGO_URI` - MongoDB connection string (required)
- `MONGO_DB` - Database name (optional)
- `JWT_SECRET` - Secret for signing tokens (required)
- `JWT_EXPIRES_IN` - Token expiration (default: `1h`)
- `BCRYPT_SALT_ROUNDS` - Hashing rounds (default: 10)
- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Set to `production` for secure cookies

**Client `.env`:**
- `VITE_API_URL` - Backend URL (e.g., `http://localhost:3001`)

#### Known Issues
- Socket.IO handlers (`chatSockets.js`, `mapSockets.js`) exist but are empty - not integrated in `app.js`
- Chat and rating routers/controllers exist but commented out in `app.js`
- MapLive references `/api/locations` endpoint that doesn't exist (likely should use `/api/requests/active`)
- Some placeholder routes in `App.jsx` (About, Services, Contact) have no real implementation

## Incomplete Features (WIP)
The following are stubbed but not functional:
- **Chat system:** Models/controllers/sockets defined but not wired up
- **Rating system:** Similar to chat - files exist but empty/commented
- **Socket.IO integration:** No `socket.io` server instance created in `app.js`, client expects it
- **Real-time location sharing:** MapLive expects socket events that server doesn't emit

When working on these, integrate Socket.IO server in `app.js`:
```javascript
const http = require('http');
const { Server } = require('socket.io');
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
// Then use server.listen() instead of app.listen()
```

## Code Style
- **No semicolons in React components**, semicolons in server-side JS
- Use `async/await` for async operations
- Controller pattern: `try/catch` with `sendResponse(res, status, success, message, data)`
- Normalize user input (lowercase email/username, strip phone formatting) in controllers
- Populate refs in responses: `.populate('user', 'name email phone')`
- Use Mongoose pre-save hooks for auto-updating `updatedAt` timestamps

## Common Pitfalls
1. Don't confuse `req.userId` (set by middleware) with `req.user.id` - both exist but prefer `req.userId`
2. Remember to call `toString()` when comparing Mongoose ObjectIds
3. Client token is stored in localStorage, not cookies (despite server cookie logic existing)
4. Server case sensitivity: `Server/` folder, `app.js` file
5. Socket.IO not yet configured server-side despite client expecting it
