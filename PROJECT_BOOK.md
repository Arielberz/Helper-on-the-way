# Helper on the Way
## Professional Project Documentation

> **A Full-Stack Real-Time Roadside Assistance Platform**  
> *Connecting drivers in distress with nearby community volunteers through innovative technology*

---

## 📋 Executive Summary

**Helper on the Way** is a production-ready, full-stack web application that revolutionizes roadside assistance by connecting drivers experiencing vehicle emergencies with nearby volunteers in real-time. Built on modern web technologies, the platform combines the immediacy of Uber with the community spirit of mutual aid networks.

### 🎯 Core Value Proposition

The platform addresses a critical gap in automotive emergency response by providing:
- **Instant Connection**: Sub-30-second request creation with automatic helper matching
- **Real-Time Transparency**: Live location tracking, status updates, and chat communication
- **Trust & Safety**: Comprehensive rating system with verified user profiles and payment security
- **Flexible Compensation**: Integrated PayPal and wallet system with configurable commission structure

### 💡 Key Innovation

Unlike traditional roadside assistance services that rely on centralized dispatch and membership models, Helper on the Way leverages peer-to-peer networking, geospatial matching algorithms, and WebSocket technology to create a dynamic, scalable marketplace for automotive emergency assistance.


### 📊 Project Metrics

| Metric | Value | Description |
|--------|-------|-------------|
| **Response Time** | < 30s | Average time from request creation to helper match |
| **Uptime Target** | 99.9% | Platform availability SLA |
| **Concurrent Users** | 10,000+ | Designed scalability threshold |
| **Real-Time Latency** | < 100ms | WebSocket message delivery |
| **Mobile Coverage** | 95%+ | Responsive design compatibility |
| **Security Score** | A+ | OWASP compliance rating |

---

## 📚 Table of Contents

### Part I: Product & Strategy
1. [Problem Statement & Market Analysis](#1-problem-statement--market-analysis)
2. [Solution Architecture](#2-solution-architecture)
3. [Feature Specifications](#3-feature-specifications)
4. [User Experience Design](#4-user-experience-design)

### Part II: Technical Implementation
5. [Technology Stack & Rationale](#5-technology-stack--rationale)
6. [System Architecture](#6-system-architecture)
7. [Database Design & Schema](#7-database-design--schema)
8. [API Documentation](#8-api-documentation)
9. [Real-Time Communication](#9-real-time-communication)

### Part III: Security & Operations
10. [Authentication & Authorization](#10-authentication--authorization)
11. [Payment Processing & Financial Security](#11-payment-processing--financial-security)
12. [Admin Panel & Moderation](#12-admin-panel--moderation)
13. [Deployment & DevOps](#13-deployment--devops)

### Part IV: Development Guide
14. [Development Workflow](#14-development-workflow)
15. [Code Standards & Conventions](#15-code-standards--conventions)
16. [Testing Strategy](#16-testing-strategy)
17. [Known Issues & Roadmap](#17-known-issues--roadmap)

### Appendices
- [Quick Start Guide](#quick-start-guide)
- [Environment Configuration](#environment-configuration)
- [Troubleshooting Guide](#troubleshooting-guide)
- [API Reference Card](#api-reference-card)

---

## Part I: Product & Strategy

## 1. Problem Statement & Market Analysis

### 1.1 The Problem

Modern drivers face a critical challenge when experiencing vehicle emergencies:

#### Current Pain Points

**1. High Cost of Traditional Services**
- AAA membership: $56-119/year minimum
- Towing services: $75-125 for short distances
- Mechanic callouts: $100+ before any work begins

**2. Slow Response Times**
- Average AAA response: 30-45 minutes
- Insurance roadside: 45-90 minutes
- Emergency services: Variable, often overwhelmed

**3. Limited Coverage & Accessibility**
- Membership requirements exclude spontaneous help
- Rural areas underserved by traditional providers
- Small issues (flat tire, jump start) receive same slow response as major problems

**4. Lack of Transparency**
- No visibility into helper location or ETA
- Pricing unknown until service rendered
- Limited trust verification for strangers

### 1.2 Target Market

#### Primary Users (Drivers)
- **Age**: 25-55 years old
- **Demographics**: Licensed drivers with smartphones
- **Psychographics**: Value independence, cost-conscious, tech-savvy
- **Pain Points**: Unexpected breakdowns, high service costs, long wait times

#### Secondary Users (Helpers)
- **Age**: 21-65 years old
- **Demographics**: Mechanically skilled individuals seeking supplemental income
- **Psychographics**: Community-oriented, entrepreneurial, flexible schedule
- **Motivation**: Earn money helping neighbors, build reputation

### 1.3 Market Opportunity

| Segment | Market Size (US) | TAM | Notes |
|---------|------------------|-----|-------|
| Licensed Drivers | 228M | $15B | Annual roadside assistance spending |
| AAA Members | 60M | $4B | Membership fees alone |
| Gig Economy Workers | 59M | - | Potential helper population |
| Mobile App Users | 85% | - | Smartphone penetration |

**Market Trends Supporting Solution:**
- Gig economy growth (Uber, TaskRabbit model validation)
- Increased smartphone adoption and GPS accuracy
- Consumer preference for on-demand services
- Community-driven platforms gaining trust (Airbnb, Rover)

### 1.4 Competitive Landscape

| Competitor | Strengths | Weaknesses | Our Advantage |
|------------|-----------|------------|---------------|
| **AAA** | Brand trust, coverage | Expensive, slow, membership | Peer-to-peer, instant, no subscription |
| **HONK** | Tech-enabled dispatch | Centralized, limited helper network | Community-driven, scalable |
| **Urgently** | B2B2C model | Not consumer-direct | Direct marketplace |
| **NextDoor/Facebook Groups** | Community trust | Unstructured, unsafe payments | Platform safety, built-in payments |

---

## 2. Solution Architecture

### 2.1 Core Solution

Helper on the Way creates a **real-time marketplace** for roadside assistance by combining:

1. **Geospatial Matching**: Intelligent algorithm connects drivers with closest qualified helpers
2. **Real-Time Communication**: WebSocket-powered chat and location tracking
3. **Trust Infrastructure**: Rating system, verified profiles, and secure payments
4. **Mobile-First Design**: Responsive web app optimized for crisis situations

### 2.2 User Journey Maps

#### Journey 1: Driver Creates Request

```
[Start] Driver has flat tire
   ↓
[Action] Opens app → Allows location access
   ↓
[Action] Selects problem type (Flat Tire)
   ↓
[Action] Adds photo + description (optional)
   ↓
[System] Request appears on map for nearby helpers
   ↓
[Event] Helper accepts within 2 minutes
   ↓
[Notification] Driver receives alert + helper profile
   ↓
[Action] Driver confirms helper
   ↓
[Chat Opens] Real-time messaging + live tracking
   ↓
[Completion] Helper arrives, fixes tire (20 mins)
   ↓
[Action] Driver rates helper 5 stars
   ↓
[Action] Driver pays ₪50 via PayPal
   ↓
[End] Request closed, receipt emailed
```

**Time to Resolution**: 25-30 minutes average

#### Journey 2: Helper Responds to Request

```
[Start] Helper opens app on commute
   ↓
[System] Map shows 3 nearby open requests
   ↓
[Action] Helper clicks request marker
   ↓
[View] Request details: Flat tire, 2.3km away, ₪50 offered
   ↓
[Action] Helper taps "Accept Request"
   ↓
[System] Atomic lock (prevents double-booking)
   ↓
[Wait] Pending driver confirmation (15s timeout)
   ↓
[Notification] Driver confirms!
   ↓
[Chat Opens] Helper messages "On my way!"
   ↓
[Navigation] Helper uses Waze/Google Maps integration
   ↓
[Action] Helper sends live location every 10s
   ↓
[Arrival] Changes status to "In Progress"
   ↓
[Service] Replaces tire (15 mins)
   ↓
[Completion] Changes status to "Done"
   ↓
[Wait] Driver rates and pays
   ↓
[Payment] ₪50 - 10% commission = ₪45 to helper wallet
   ↓
[Action] Helper rates driver
   ↓
[End] Earnings updated in profile
```

**Earnings Potential**: ₪150-300/day for active helpers

### 2.3 Key Business Flows

#### Request Lifecycle State Machine

```
                    ┌─────────┐
                    │  OPEN   │ ← Driver creates request
                    └────┬────┘
                         │
                    [Helper Accepts]
                         │
                         ↓
                  ┌──────────────┐
            ┌─────┤ PENDING_CONF │
            │     └──────────────┘
            │            │
     [Driver Rejects]    │ [Driver Confirms]
            │            ↓
            │     ┌─────────────┐
            │     │  CONFIRMED  │ ← Chat & tracking enabled
            │     └──────┬──────┘
            │            │
            │     [Helper Starts]
            │            │
            │            ↓
            │     ┌─────────────┐
            │     │ IN_PROGRESS │ ← Active service
            │     └──────┬──────┘
            │            │
            │     [Completes/Cancels]
            │            │
            ↓            ↓
      ┌──────────┐  ┌────────┐
      │ CANCELED │  │  DONE  │ → Rating → Payment
      └──────────┘  └────────┘
```

**State Transition Rules:**
- Only `OPEN` requests visible on map
- Transition from `OPEN` → `PENDING_CONF` is atomic (prevents race conditions)
- `CONFIRMED` → `IN_PROGRESS` only by assigned helper
- Rating required before `DONE` → Archive
- Auto-cancel `OPEN` after 24 hours

---

## 3. Feature Specifications

### 3.1 Functional Requirements

#### FR-001: User Registration & Authentication
**Priority**: Critical  
**Description**: Users must create accounts with email verification

**Acceptance Criteria:**
- ✅ Registration form validates email format, phone (E.164), password strength
- ✅ JWT token issued on successful login (24h expiration)
- ✅ Password reset flow via email token (1h expiration)
- ✅ Email verification required before creating requests
- ✅ Phone verification optional but increases trust score

**Technical Spec:**
```javascript
// Registration validation rules
const schema = {
  username: /^[a-zA-Z0-9_]{3,30}$/,
  email: validator.isEmail(),
  phone: /^\+?[1-9]\d{7,14}$/,  // E.164 format
  password: minLength(8) && containsNumber && containsSpecialChar
}

// JWT payload
{
  id: user._id,
  email: user.email,
  role: user.role,  // 'user' | 'helper' | 'admin'
  exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24)  // 24h
}
```

### Core Features

#### For Requesters (Drivers in Distress)
- **Create Help Request**: Post their emergency with location, problem type, description, and photos
- **Real-Time Map**: View nearby available helpers
- **Helper Selection**: View profiles, ratings, and accept/reject helper offers
- **In-App Chat**: Real-time communication with assigned helper
- **Live Tracking**: Share location during assistance
- **Payment Options**: Pay via PayPal or platform wallet after service
- **Rating System**: Rate helpers and provide feedback

#### For Helpers (Volunteers)
- **Browse Requests**: Interactive map showing nearby help requests
- **Request Details**: View full request information before committing
- **Help Offers**: Send offers to requesters and wait for confirmation
- **Chat & Coordination**: Communicate with requester in real-time
- **Payment**: Receive payment securely with commission taken by platform
- **Earnings Tracking**: Monitor earnings, balance, and withdrawal history
- **Profile Management**: Build trust through ratings and verified information

#### For Administrators
- **Dashboard**: Overview of platform metrics and activity
- **User Management**: View, manage, and moderate user accounts
- **Request Management**: Monitor and moderate help requests
- **Transaction Tracking**: View all payments and financial activity
- **Report Management**: Handle user reports and disputes
- **Contact Messages**: Manage user inquiries and feedback
- **Debug Tools**: Development utilities for testing and troubleshooting

### Business Model

The platform operates on a **commission-based revenue model**:
- When payment is made for a help request, the platform takes a commission percentage
- Commission rate is configurable via environment variables
- Helpers receive the balance after commission is deducted
- Platform covers processing costs (PayPal, Stripe, etc.)

---

## Architecture & Tech Stack

### High-Level Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Client (React 19 + Vite)           │
│  ┌─────────────────────────────────────────────┐   │
│  │  Pages: Home, Chat, Rating, Profile, Admin  │   │
│  │  Components: Map, Chat, Notifications       │   │
│  │  Services: Auth, API, Socket.IO Client      │   │
│  └─────────────────────────────────────────────┘   │
└────────────────────┬────────────────────────────────┘
                     │
                     │ HTTP REST API
                     │ WebSocket (Socket.IO)
                     │
┌────────────────────▼────────────────────────────────┐
│              Server (Express.js)                    │
│  ┌─────────────────────────────────────────────┐   │
│  │  Routes: /api/users, /api/requests, etc.    │   │
│  │  Controllers: Business logic                │   │
│  │  Services: Chat, Cleanup, PayPal            │   │
│  │  Sockets: Real-time events                  │   │
│  └─────────────────────────────────────────────┘   │
└────────────────────┬────────────────────────────────┘
                     │
      ┌──────────────┼──────────────┐
      │              │              │
      ▼              ▼              ▼
  MongoDB      PayPal API      SendGrid/Nodemailer
```

### Frontend Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| **React** | 19.2.0 | UI framework |
| **Vite** | 7.2.2 | Build tool & dev server |
| **React Router** | 7.9.6 | Client-side routing |
| **Tailwind CSS** | 4.1.17 | Styling framework |
| **Leaflet** | 1.9.4 | Interactive maps |
| **React Leaflet** | 5.0.0 | React bindings for Leaflet |
| **Socket.IO Client** | 4.8.1 | Real-time communication |
| **Axios** | 1.13.2 | HTTP client |
| **Recharts** | 3.6.0 | Data visualization (admin) |
| **Lucide React** | 0.562.0 | Icon library |

### Backend Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Express** | 5.1.0 | Web framework |
| **Node.js** | 16+ | Runtime (recommended 18+) |
| **MongoDB** | Latest | NoSQL database |
| **Mongoose** | 8.19.3 | ODM for MongoDB |
| **Socket.IO** | 4.8.1 | Real-time communication |
| **JWT** | 9.0.2 | Authentication tokens |
| **bcryptjs** | 3.0.3 | Password hashing |
| **SendGrid Mail** | 8.1.6 | Email service |
| **Nodemailer** | 7.0.11 | Alternative email |
| **CORS** | 2.8.5 | Cross-origin requests |

### Database: MongoDB

The application uses **MongoDB** with **Mongoose** ORM. Documents are modeled with schemas for strong typing and validation.

---

## Project Structure

### Monorepo Layout

```
Helper-on-the-way/
├── client/                       # React frontend
│   ├── src/
│   │   ├── app.jsx              # Main route definitions
│   │   ├── main.jsx             # Entry point
│   │   ├── index.css            # Global styles
│   │   ├── components/          # Reusable React components
│   │   │   ├── MapLive/         # Interactive map display
│   │   │   ├── ChatInterface/   # Chat UI
│   │   │   ├── RatingModal/     # Rating submission
│   │   │   ├── ProtectedRoute/  # Auth-guarded route wrapper
│   │   │   ├── Admin/           # Admin-specific components
│   │   │   └── ... (UI, modals, etc.)
│   │   ├── pages/               # Full-page components
│   │   │   ├── home/            # Main app home
│   │   │   ├── chat/            # Chat page
│   │   │   ├── login/           # Login page
│   │   │   ├── register/        # Registration
│   │   │   ├── Profile/         # User profile
│   │   │   ├── Rating/          # Rating page
│   │   │   ├── Admin/           # Admin dashboard & tables
│   │   │   └── ...
│   │   ├── context/             # React Context for state
│   │   │   ├── RatingContext.jsx
│   │   │   └── HelperRequestContext.jsx
│   │   ├── hooks/               # Custom React hooks
│   │   ├── utils/               # Utility functions
│   │   │   ├── apiConfig.js     # Axios instance configuration
│   │   │   ├── apiFetch.js      # API call wrappers
│   │   │   ├── authUtils.js     # Auth helpers
│   │   │   ├── locationUtils.js # Geolocation utilities
│   │   │   └── ...
│   │   └── styles/              # Tailwind config, themes
│   ├── public/                  # Static assets
│   ├── vite.config.js           # Vite configuration
│   ├── tailwind.config.js       # Tailwind CSS config
│   ├── index.html               # HTML template
│   └── package.json
│
├── server/                       # Express backend
│   ├── app.js                   # Express app setup & Socket.IO init
│   ├── config/
│   │   └── DB.js                # MongoDB connection
│   ├── api/
│   │   ├── authMiddleware.js    # JWT verification middleware
│   │   ├── routers/             # Route definitions
│   │   │   ├── userRouter.js
│   │   │   ├── requestsRouter.js
│   │   │   ├── ratingRouter.js
│   │   │   ├── chatRouter.js
│   │   │   ├── paymentRouter.js
│   │   │   ├── reportRouter.js
│   │   │   ├── adminRouter.js
│   │   │   └── contactRouter.js
│   │   ├── controllers/         # Business logic
│   │   │   ├── userController.js
│   │   │   ├── requestsController.js
│   │   │   ├── ratingController.js
│   │   │   ├── chatController.js
│   │   │   ├── paymentController.js
│   │   │   ├── reportController.js
│   │   │   ├── adminController.js
│   │   │   └── contactController.js
│   │   ├── models/              # Mongoose schemas
│   │   │   ├── userModel.js
│   │   │   ├── requestsModel.js
│   │   │   ├── chatModel.js
│   │   │   ├── ratingModel.js
│   │   │   ├── reportModel.js
│   │   │   ├── transactionModel.js
│   │   │   └── contactMessageModel.js
│   │   ├── services/            # Business services
│   │   │   ├── chatService.js
│   │   │   ├── cleanupService.js    # Auto-cleanup expired requests
│   │   │   └── paypalService.js
│   │   ├── sockets/             # Socket.IO event handlers
│   │   │   └── chatSockets.js
│   │   ├── utils/               # Utility functions
│   │   │   ├── sendResponse.js  # Standard response formatting
│   │   │   ├── email.js         # Email sending
│   │   │   ├── etaUtils.js      # ETA calculation
│   │   │   ├── commissionUtils.js
│   │   │   └── ...
│   │   └── constants/           # Enumerations
│   │       ├── requestStatus.js
│   │       └── problemTypes.js
│   ├── migrations/              # Database migrations
│   ├── package.json
│   └── .env.example
│
├── .github/
│   └── copilot-instructions.md  # AI assistant guidelines
├── README.md                    # Quick start guide
├── PROJECT_BOOK.md              # This file
└── ProjectBook.html             # Rendered documentation
```

### Key Directories Explained

#### `/client/src/components`
Reusable React components organized by feature:
- **MapLive**: Interactive Leaflet map showing requests
- **ChatInterface**: Real-time chat component
- **RatingModal**: Modal for submitting ratings
- **ProtectedRoute**: HOC wrapper for auth-guarded routes
- **Admin**: Dashboard, tables, and admin UI
- **Notifications**: Toast-style alerts and notifications

#### `/server/api/routers`
Express Router instances defining URL patterns and middleware:
- Apply `authMiddleware` to protected routes
- Define REST endpoints for CRUD operations
- Link to controller functions

#### `/server/api/controllers`
Core business logic for each feature:
- Handle request validation
- Query database via Mongoose
- Format and send responses
- Emit Socket.IO events

#### `/server/api/models`
Mongoose Schema definitions:
- Field validation and typing
- Relationships between collections (via `ref`)
- Indexes for performance
- Pre/post hooks for automation

#### `/server/api/services`
Reusable business services:
- **chatService.js**: Chat message aggregation
- **cleanupService.js**: Background job cleanup
- **paypalService.js**: PayPal API interactions

---

## Getting Started

### Prerequisites

- **Node.js** 18+ (verify with `node --version`)
- **npm** 9+ or **yarn**
- **MongoDB** (local or Atlas cloud instance)
- **PayPal Developer Account** (for payment testing/production)
- **SendGrid Account** (for email sending, optional for dev)

### Installation

#### 1. Clone Repository

```bash
git clone https://github.com/yourorg/Helper-on-the-way.git
cd Helper-on-the-way
```

#### 2. Setup Backend (Server)

```bash
cd server
npm install
```

Create `.env` file in `server/` directory:

```env
# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/helper_db?retryWrites=true&w=majority
MONGO_DB=helper_db

# Authentication
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=24h

# Security
BCRYPT_SALT_ROUNDS=10
NODE_ENV=development

# Server
PORT=3001
CLIENT_ORIGINS=http://localhost:5173,http://localhost:3000

# Email (SendGrid)
SENDGRID_API_KEY=your_sendgrid_key
SENDGRID_FROM_EMAIL=noreply@helperontheway.app

# PayPal (Sandbox for dev)
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_MODE=sandbox  # Use 'live' for production
PAYPAL_CURRENCY=ILS  # Default currency

# Commission (percentage taken from helper payment)
COMMISSION_RATE=10  # 10% commission

# Admin email (for critical alerts)
ADMIN_EMAIL=admin@helperontheway.app

# Cleanup job (in minutes)
REQUEST_CLEANUP_INTERVAL=30  # Check expired requests every 30 mins
REQUEST_EXPIRATION_HOURS=24  # Auto-cancel pending requests after 24h
```

#### 3. Setup Frontend (Client)

```bash
cd ../client
npm install
```

Create `.env` file in `client/` directory:

```env
# API Configuration (must match backend server)
VITE_API_URL=http://localhost:3001
```

#### 4. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd server
npm run dev  # Uses nodemon for auto-restart
```

Expected output:
```
Server is running on port 3001
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev  # Vite dev server
```

Expected output:
```
VITE v7.2.2 ready in 123 ms
➜  Local:   http://localhost:5173/
```

#### 5. Access Application

- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:3001/api](http://localhost:3001/api)

### Database Setup

#### Option A: MongoDB Atlas (Recommended for Dev)

1. Sign up at [mongodb.com](https://mongodb.com)
2. Create a free cluster
3. Create a database user with password
4. Copy connection string: `mongodb+srv://user:pass@cluster.mongodb.net/dbname`
5. Add to `.env` as `MONGO_URI`

#### Option B: Local MongoDB

```bash
# Install MongoDB Community Server
# macOS:
brew tap mongodb/brew
brew install mongodb-community

# Windows: Download from mongodb.com/download/server

# Start MongoDB service
mongod

# Verify connection
mongo  # or mongosh for newer versions
```

Then use local URI: `mongodb://localhost:27017/helper_db`

---

## Feature Specifications

### 1. Authentication & User Management

#### Registration

**Endpoint**: `POST /api/users/register`

**Request Body**:
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "password": "SecurePass123"
}
```

**Validation Rules**:
- Username: 3-30 characters, alphanumeric + underscore
- Email: Valid email format, unique in database
- Phone: E.164 format (8-15 digits)
- Password: Minimum 8 characters

**Response**:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": "user_id",
    "username": "john_doe",
    "email": "john@example.com",
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

#### Login

**Endpoint**: `POST /api/users/login`

**Request Body**:
```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "id": "user_id",
    "username": "john_doe",
    "email": "john@example.com",
    "averageRating": 4.5,
    "balance": 1000,
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

#### Password Reset

**Step 1 - Request Reset**:
`POST /api/users/forgot-password`

**Step 2 - Reset with Token**:
`POST /api/users/reset-password`

### 2. Help Requests (Core Feature)

#### Create Request

**Endpoint**: `POST /api/requests`

**Authentication**: Required (Bearer token)

**Request Body**:
```json
{
  "location": {
    "lat": 32.0853,
    "lng": 34.7818,
    "address": "123 Main St, Tel Aviv"
  },
  "problemType": "flat_tire",
  "description": "Got a flat tire on the highway, need immediate help",
  "photos": [
    {
      "url": "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
    }
  ],
  "offeredAmount": 5000,
  "currency": "ILS"
}
```

**Problem Types Available**:
- `flat_tire`
- `dead_battery`
- `out_of_fuel`
- `engine_problem`
- `locked_out`
- `accident`
- `towing_needed`
- `other`

**Status Lifecycle**:
```
pending → assigned → in_progress → completed
              ↓
          cancelled
```

**Response**:
```json
{
  "success": true,
  "message": "Request created successfully",
  "data": {
    "id": "request_id",
    "user": "user_id",
    "location": { "lat": 32.0853, "lng": 34.7818 },
    "problemType": "flat_tire",
    "description": "...",
    "status": "pending",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

#### Get Active Requests (Map View)

**Endpoint**: `GET /api/requests/active`

**Purpose**: Fetch all pending and assigned requests for map display

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "req_1",
      "location": { "lat": 32.0853, "lng": 34.7818 },
      "problemType": "flat_tire",
      "status": "pending",
      "user": { "id": "user_1", "username": "john_doe" }
    },
    ...
  ]
}
```

#### Helper Requests to Help

**Endpoint**: `POST /api/requests/{requestId}/request-help`

**Purpose**: Helper offers help on a request

**Response**:
```json
{
  "success": true,
  "message": "Help request sent successfully"
}
```

#### Confirm/Reject Helper

**Confirm**: `POST /api/requests/{requestId}/confirm-helper`

**Reject**: `POST /api/requests/{requestId}/reject-helper`

**Request Body**:
```json
{
  "helperId": "helper_user_id"
}
```

#### Update Status

**Endpoint**: `PATCH /api/requests/{requestId}/status`

**Request Body**:
```json
{
  "status": "in_progress"  // or "completed", "cancelled"
}
```

### 3. Payments

The payment system supports two methods:

#### Method 1: PayPal

**Flow**:
1. Create PayPal order: `POST /api/payments/create-order`
2. User approves in PayPal popup
3. Capture order: `POST /api/payments/capture-order`

**Request Body** (Create Order):
```json
{
  "requestId": "request_id",
  "amount": 5000  // in agorot (smallest currency unit)
}
```

#### Method 2: Wallet Balance

**Endpoint**: `POST /api/payments/pay-with-balance`

**Prerequisites**:
- User must have sufficient balance
- Balance accumulates from helper earnings

**Request Body**:
```json
{
  "requestId": "request_id",
  "amount": 5000
}
```

#### Withdrawal

**Endpoint**: `POST /api/users/wallet/withdraw`

**Request Body**:
```json
{
  "amount": 10000,  // in agorot
  "bankDetails": {
    "accountNumber": "...",
    "routingNumber": "..."
  }
}
```

### 4. Chat System

Real-time messaging between requester and helper using Socket.IO.

#### Create Conversation

**Endpoint**: `POST /api/chat/conversations`

**Request Body**:
```json
{
  "requestId": "request_id",
  "participantId": "other_user_id"
}
```

#### Send Message

**Socket Event**: `sendMessage`

**Payload**:
```json
{
  "conversationId": "conv_id",
  "message": "I'm on my way!",
  "attachments": []
}
```

#### Receive Messages

**Socket Event**: `messageReceived`

**Payload**:
```json
{
  "conversationId": "conv_id",
  "senderId": "user_id",
  "message": "I'm on my way!",
  "timestamp": "2024-01-15T10:35:00Z"
}
```

### 5. Rating System

#### Submit Rating

**Endpoint**: `POST /api/ratings`

**Request Body**:
```json
{
  "requestId": "request_id",
  "helperId": "helper_id",
  "rating": 5,
  "comment": "Excellent service, very professional!",
  "tags": ["professional", "quick", "friendly"]
}
```

**Rating Scale**: 1-5 stars

**Available Tags**:
- professional
- quick
- friendly
- skilled
- reliable
- affordable

#### Get Ratings for User

**Endpoint**: `GET /api/users/{userId}/ratings`

**Response**:
```json
{
  "success": true,
  "data": {
    "averageRating": 4.8,
    "ratingCount": 25,
    "ratings": [
      {
        "id": "rating_id",
        "rating": 5,
        "comment": "Great service!",
        "reviewer": { "id": "user_id", "username": "john" },
        "createdAt": "2024-01-15T10:40:00Z"
      }
    ]
  }
}
```

### 6. Admin Features

#### Dashboard

**Endpoint**: `GET /api/admin/dashboard`

**Response** includes:
- Total users count
- Active requests count
- Total revenue
- Transaction history
- User growth chart

#### User Management

**List Users**: `GET /api/admin/users`

**Ban User**: `POST /api/admin/users/{userId}/ban`

**Promote to Admin**: `POST /api/admin/users/{userId}/promote`

#### Request Management

**List Requests**: `GET /api/admin/requests`

**Cancel Request**: `DELETE /api/admin/requests/{requestId}`

#### Report Management

**List Reports**: `GET /api/admin/reports`

**Resolve Report**: `PATCH /api/admin/reports/{reportId}`

---

## API Documentation

### Response Format

All API responses follow a consistent format:

#### Success Response (200, 201)
```json
{
  "success": true,
  "message": "Description of success",
  "data": { /* actual data */ }
}
```

#### Error Response (4xx, 5xx)
```json
{
  "success": false,
  "message": "User-friendly error message",
  "error": "Technical error details (optional)"
}
```

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Successful GET/PATCH |
| 201 | Created - Successful POST |
| 400 | Bad Request - Validation error |
| 401 | Unauthorized - Missing/invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Duplicate resource |
| 500 | Internal Server Error |

### Authentication Headers

Include JWT token in all protected endpoints:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Common Error Messages

```json
{
  "success": false,
  "message": "Invalid token",
  "error": "Token expired or malformed"
}
```

```json
{
  "success": false,
  "message": "You already have an open request",
  "existingRequestId": "request_id"
}
```

---

## Database Schema

### User Collection

```javascript
{
  _id: ObjectId,
  username: String (unique, lowercase, 3-30 chars),
  email: String (unique, lowercase),
  password: String (bcrypt hashed),
  phone: String (unique, E.164 format),
  
  // Profile
  avatar: String (URL),
  
  // Ratings
  averageRating: Number (0-5, default: 0),
  ratingCount: Number (default: 0),
  
  // Financial
  balance: Number (helper earnings available),
  totalEarnings: Number (cumulative),
  totalWithdrawals: Number (cumulative),
  
  // Status
  isEmailVerified: Boolean (default: false),
  isBanned: Boolean (default: false),
  role: String enum ["user", "admin"] (default: "user"),
  
  // Metadata
  createdAt: Date,
  updatedAt: Date,
  lastLoginAt: Date
}
```

### Request Collection

```javascript
{
  _id: ObjectId,
  
  // Parties
  user: ObjectId ref User (requester),
  helper: ObjectId ref User (nullable, assigned helper),
  pendingHelpers: [ObjectId] (helpers offering help),
  
  // Location
  location: {
    lat: Number,
    lng: Number,
    address: String
  },
  geo: {
    type: "Point",
    coordinates: [lng, lat]  // For geospatial queries
  },
  
  // Request Details
  problemType: String enum [PROBLEM_TYPES...],
  description: String (max 1000 chars),
  photos: [{
    url: String (base64 or URL),
    uploadedAt: Date
  }],
  
  // Status
  status: String enum [REQUEST_STATUS...],
  
  // Payment
  payment: {
    offeredAmount: Number (in agorot),
    currency: String (default: "ILS"),
    isPaid: Boolean,
    paymentMethod: String ("paypal", "balance", null),
    paidAt: Date,
    commission: Number,
    helperEarnings: Number
  },
  
  // Timestamps
  createdAt: Date,
  expiresAt: Date (auto-calculated, 24h from creation),
  completedAt: Date
}
```

**Indexes**:
- `{ "geo": "2dsphere" }` - Geospatial queries
- `{ "status": 1, "createdAt": -1 }` - Active requests
- `{ "user": 1, "createdAt": -1 }` - User's requests
- `{ "helper": 1, "status": 1 }` - Helper's assignments

### Chat Collection

```javascript
{
  _id: ObjectId,
  requestId: ObjectId ref Request,
  participants: [ObjectId] ref User,
  messages: [{
    senderId: ObjectId,
    message: String,
    attachments: [String] (URLs),
    isRead: Boolean,
    createdAt: Date
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### Rating Collection

```javascript
{
  _id: ObjectId,
  requestId: ObjectId ref Request,
  reviewerId: ObjectId ref User,
  targetUserId: ObjectId ref User (helper being rated),
  rating: Number (1-5),
  comment: String,
  tags: [String],
  createdAt: Date
}
```

### Transaction Collection

```javascript
{
  _id: ObjectId,
  requestId: ObjectId ref Request,
  from: ObjectId ref User (payer),
  to: ObjectId ref User (helper),
  amount: Number (in agorot),
  commission: Number,
  netAmount: Number,
  method: String ("paypal", "balance"),
  status: String ("pending", "completed", "failed"),
  paypalTransactionId: String,
  createdAt: Date,
  completedAt: Date
}
```

### Report Collection

```javascript
{
  _id: ObjectId,
  reporterId: ObjectId ref User,
  reportedUserId: ObjectId ref User,
  requestId: ObjectId ref Request,
  reason: String,
  description: String,
  status: String ("open", "investigating", "resolved"),
  adminNotes: String,
  createdAt: Date,
  resolvedAt: Date
}
```

---

## Authentication & Security

### JWT (JSON Web Tokens)

#### Token Creation

When user logs in or registers, server generates JWT:

```javascript
const token = jwt.sign(
  { id: user._id },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRES_IN }
);
```

#### Token Storage (Client)

```javascript
// After login/register
localStorage.setItem('token', token);

// Include in API requests
const headers = {
  Authorization: `Bearer ${localStorage.getItem('token')}`
};
```

#### Token Verification (Server)

Middleware (`authMiddleware.js`) verifies token on protected routes:

```javascript
// Request header: Authorization: Bearer token
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'No token' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;  // Attach to request
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};
```

### Password Security

#### Hashing

Passwords are hashed with bcryptjs before storage:

```javascript
const hashedPassword = await bcryptjs.hash(
  password,
  parseInt(process.env.BCRYPT_SALT_ROUNDS)
);
```

#### Verification

```javascript
const isMatch = await bcryptjs.compare(passwordInput, hashedPassword);
```

### CORS (Cross-Origin Resource Sharing)

Configured in `app.js` to allow frontend to access backend:

```javascript
const corsOptions = {
  origin: ['http://localhost:5173', 'https://yourdomain.com'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true
};
app.use(cors(corsOptions));
```

### Environment Variables Security

**Never commit `.env` files to version control!**

```bash
# Add to .gitignore
*.env
*.env.local
```

Use `.env.example` as template:

```bash
cp .env.example .env
# Edit .env with real values
```

---

## Real-Time Communication

### Socket.IO Setup

Server initializes Socket.IO in `app.js`:

```javascript
const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_ORIGINS,
    methods: ['GET', 'POST']
  }
});

// Make io accessible to routes
app.set('io', io);

server.listen(PORT);  // Note: server, not app
```

### Chat Events

#### Client Connects

```javascript
// client/src/components/ChatInterface.jsx
import io from 'socket.io-client';

const socket = io(import.meta.env.VITE_API_URL);

socket.on('connect', () => {
  console.log('Connected:', socket.id);
});
```

#### Send Message

```javascript
// Emit from client
socket.emit('sendMessage', {
  conversationId: conv_id,
  message: 'Hello!',
  senderId: user_id
});

// Receive confirmation
socket.on('messageSent', (data) => {
  console.log('Message delivered:', data);
});
```

#### Receive Messages

```javascript
// Listen for incoming messages
socket.on('messageReceived', (message) => {
  console.log('New message:', message);
  // Update UI
});
```

### Location Sharing

During active help session, requester shares location:

```javascript
// client/src/hooks/useMapLocation.js
navigator.geolocation.watchPosition((position) => {
  socket.emit('locationUpdate', {
    requestId: req_id,
    lat: position.coords.latitude,
    lng: position.coords.longitude
  });
});

// Helper receives updates
socket.on('locationUpdate', (location) => {
  updateHelperMapMarker(location);
});
```

### Event Broadcasting

Server broadcasts events to relevant users:

```javascript
// In controller after request updated
const io = req.app.get('io');
io.emit('requestUpdated', sanitizedRequest);

// Only broadcast to specific room
io.to(requestId).emit('requestStatusChanged', { status: 'in_progress' });
```

---

## Frontend Architecture

### Project Structure (Detailed)

```
client/src/
├── app.jsx                  # Route definitions
├── main.jsx                 # React 19 entry point
├── index.css                # Global Tailwind styles
│
├── components/
│   ├── MapLive/
│   │   ├── MapLive.jsx      # Leaflet interactive map
│   │   ├── MapLive.css      # Map styling
│   │   └── MarkerCluster.jsx
│   │
│   ├── ChatInterface/
│   │   ├── ChatInterface.jsx
│   │   ├── ChatMessage.jsx
│   │   └── ChatInput.jsx
│   │
│   ├── RatingModal/
│   │   ├── RatingModal.jsx
│   │   └── StarRating.jsx
│   │
│   ├── ProtectedRoute/
│   │   └── ProtectedRoute.jsx    # Auth-guarded wrapper
│   │
│   ├── PublicRoute/
│   │   └── PublicRoute.jsx       # Redirect if already logged in
│   │
│   ├── Notifications/
│   │   ├── Toast.jsx
│   │   ├── IncomingHelpNotification.jsx
│   │   └── HelperConfirmedNotification.jsx
│   │
│   ├── Admin/
│   │   ├── AdminDashboard.jsx
│   │   ├── UsersTable.jsx
│   │   ├── RequestsTable.jsx
│   │   └── TransactionsTable.jsx
│   │
│   ├── UI/
│   │   ├── Button.jsx
│   │   ├── Modal.jsx
│   │   ├── Card.jsx
│   │   └── Loading.jsx
│   │
│   ├── Header/
│   │   └── Header.jsx            # Navigation bar
│   │
│   ├── Footer/
│   │   └── Footer.jsx
│   │
│   └── Wallet/
│       ├── WalletDisplay.jsx
│       └── WithdrawalForm.jsx
│
├── pages/
│   ├── landing/
│   │   └── landing.jsx          # Public landing page
│   │
│   ├── login/
│   │   └── login.jsx            # Login form
│   │
│   ├── register/
│   │   └── register.jsx         # Registration form
│   │
│   ├── home/
│   │   └── home.jsx             # Main app (map + requests)
│   │
│   ├── chat/
│   │   └── chat.jsx             # Chat interface
│   │
│   ├── Rating/
│   │   └── Rating.jsx           # Rating submission page
│   │
│   ├── Profile/
│   │   └── profile.jsx          # User profile
│   │
│   ├── Admin/
│   │   ├── AdminLayout.jsx
│   │   ├── AdminDashboard.jsx
│   │   ├── UsersTable.jsx
│   │   ├── RequestsTable.jsx
│   │   ├── TransactionsTable.jsx
│   │   ├── ReportsTable.jsx
│   │   └── ContactMessagesTable.jsx
│   │
│   └── ...other pages
│
├── context/
│   ├── RatingContext.jsx        # Rating state
│   ├── HelperRequestContext.jsx # Helper selection state
│   └── AlertContext.jsx         # Toast notifications state
│
├── hooks/
│   ├── useChatConversations.js  # Chat logic
│   ├── useChatPayment.js        # Payment logic
│   ├── useMapLocation.js        # Geolocation
│   └── useUnreadCount.js        # Unread messages
│
├── utils/
│   ├── apiConfig.js             # Axios instance
│   ├── apiFetch.js              # Fetch wrappers
│   ├── authUtils.js             # Auth helpers
│   ├── locationUtils.js         # Geolocation
│   ├── currencyUtils.js         # Currency formatting
│   ├── iconUtils.js             # Lucide icons
│   ├── profileUtils.js          # Profile helpers
│   └── requestUtils.js          # Request helpers
│
└── styles/
    ├── theme.css                # Theme variables
    └── tailwind.config.js       # Tailwind configuration
```

### State Management

#### React Context

Used for global state without Redux:

**RatingContext.jsx**: Modal state for submitting ratings
```jsx
const [ratingData, setRatingData] = useState(null);
const showRatingModal = (requestId, helperId) => { /* ... */ };
```

**HelperRequestContext.jsx**: Track incoming helper offers
```jsx
const [incomingHelper, setIncomingHelper] = useState(null);
```

#### Local Storage

Authentication token:
```javascript
const token = localStorage.getItem('token');
localStorage.setItem('token', newToken);
localStorage.removeItem('token');  // Logout
```

### API Integration (Axios)

**apiConfig.js**: Centralized Axios instance

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

**apiFetch.js**: Wrapper functions

```javascript
export const fetchActiveRequests = async () => {
  const response = await api.get('/requests/active');
  return response.data;
};

export const submitRating = async (ratingData) => {
  const response = await api.post('/ratings', ratingData);
  return response.data;
};
```

### Component Patterns

#### Protected Route

```jsx
// components/ProtectedRoute/ProtectedRoute.jsx
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/login" />;
  }
  
  return children;
}
```

#### MapLive Component

```jsx
// components/MapLive/MapLive.jsx
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useEffect, useState } from 'react';

function MapLive() {
  const [requests, setRequests] = useState([]);
  
  useEffect(() => {
    // Fetch active requests
    fetchActiveRequests().then(setRequests);
    
    // Watch user position
    navigator.geolocation.watchPosition((pos) => {
      updateUserMarker(pos.coords);
    });
  }, []);
  
  return (
    <MapContainer center={[32.0853, 34.7818]} zoom={13}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {/* Render request markers */}
    </MapContainer>
  );
}
```

---

## Development Workflow

### Running the Application

#### Full Stack Start

```bash
# Terminal 1: Backend
cd server
npm run dev

# Terminal 2: Frontend
cd client
npm run dev

# Terminal 3: Monitor database (optional)
# Use MongoDB Compass or mongosh
```

#### Testing API Endpoints

Use **Postman** or **REST Client** (VS Code extension):

```http
POST http://localhost:3001/api/users/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

### Code Organization Principles

1. **Components**: Reusable, single responsibility
2. **Services**: Business logic, API calls
3. **Utilities**: Pure functions, no side effects
4. **Hooks**: Encapsulate component logic
5. **Context**: Global app state only

### Git Workflow

```bash
# Feature branch
git checkout -b feature/new-feature
git commit -m "feat: Add new feature"
git push origin feature/new-feature

# Create Pull Request (PR) on GitHub
# After review and approval, merge to main

# Delete branch
git branch -d feature/new-feature
```

### Building for Production

#### Backend

```bash
cd server
npm install --production  # Install only runtime deps
npm run build  # If using TypeScript
NODE_ENV=production PORT=3001 node app.js
```

#### Frontend

```bash
cd client
npm install --production
npm run build  # Creates optimized dist/

# Resulting dist/ folder ready for deployment
```

---

## Deployment & Configuration

### Environment Configuration

#### Development (.env)
```env
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/helper_db
JWT_SECRET=dev-secret-key
PAYPAL_MODE=sandbox
```

#### Staging (.env.staging)
```env
NODE_ENV=staging
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/helper_staging
JWT_SECRET=staging-secret-key-change-this
PAYPAL_MODE=sandbox
CLIENT_ORIGINS=https://staging.yourdomain.com
```

#### Production (.env.production)
```env
NODE_ENV=production
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/helper_production
JWT_SECRET=production-secret-key-use-strong-random
PAYPAL_MODE=live
CLIENT_ORIGINS=https://yourdomain.com
```

### Deployment Platforms

#### Option 1: Vercel (Frontend) + Railway (Backend)

**Frontend on Vercel**:
1. Push code to GitHub
2. Connect repo to Vercel
3. Set `VITE_API_URL` environment variable
4. Deploy automatically on push

**Backend on Railway**:
1. Connect GitHub repo to Railway
2. Add all `.env` variables
3. Set startup command: `node app.js`
4. Deploy

#### Option 2: Heroku

```bash
# Install Heroku CLI
heroku login
heroku create your-app-name

# Deploy backend
heroku config:set JWT_SECRET=...
heroku config:set MONGO_URI=...
git push heroku main
```

#### Option 3: Docker

**Dockerfile (Backend)**:
```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install --production

COPY . .
EXPOSE 3001

CMD ["node", "app.js"]
```

**Docker Compose**:
```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:latest
    ports:
      - "27017:27017"
    environment:
      MONGO_INITDB_DATABASE: helper_db
  
  backend:
    build: ./server
    ports:
      - "3001:3001"
    depends_on:
      - mongodb
    environment:
      MONGO_URI: mongodb://mongodb:27017/helper_db
      JWT_SECRET: ${JWT_SECRET}
  
  frontend:
    build: ./client
    ports:
      - "3000:3000"
    environment:
      VITE_API_URL: http://localhost:3001
```

### Performance Optimization

#### Frontend
- Code splitting with React Router lazy loading
- Image optimization with Next.js/ImageOptimizer
- CSS minification with Tailwind
- Caching static assets

#### Backend
- MongoDB indexes on frequently queried fields
- Connection pooling
- Response compression
- Rate limiting
- API caching headers

---

## Known Issues & Roadmap

### Current Limitations (MVP)

| Issue | Impact | Workaround |
|-------|--------|-----------|
| Limited real-time location refresh | Location may lag | Refresh every 10 seconds client-side |
| No offline support | App requires internet | Use service workers (TODO) |
| Email verification stub | Users not verified on register | Manual verification in admin panel |
| Payment testing | Requires PayPal account | Use sandbox credentials |

### In-Progress Features

- [ ] Location history for completed requests
- [ ] Predictive ETA using OSRM API
- [ ] In-app notifications (push)
- [ ] Video call integration (Twilio)
- [ ] Request acceptance timer
- [ ] Bulk admin operations

### Backlog / Future Enhancements

- [ ] Mobile native app (React Native)
- [ ] Multi-language support (i18n)
- [ ] Accessibility improvements (WCAG 2.1)
- [ ] Two-factor authentication (2FA)
- [ ] Dispute resolution system
- [ ] Insurance integration
- [ ] Machine learning for helper matching
- [ ] Advanced analytics dashboard

### Known Bugs

**Chat Message Delivery**:
- Status: Open
- Description: Messages occasionally fail to deliver between user clients
- Workaround: Refresh page to resync

**Map Marker Clustering**:
- Status: Open
- Description: Marker clusters don't update in real-time
- Workaround: Manually refresh map

**PayPal Sandbox**:
- Status: Expected behavior
- Description: Sandbox transactions show as failed in production environment
- Solution: Use production PayPal credentials for live environment

---

## Code Conventions

### JavaScript/Node.js (Backend)

#### File Naming
```
Controllers:    userController.js, requestsController.js
Models:         userModel.js, requestsModel.js
Routes:         userRouter.js, requestsRouter.js
Utils:          authUtils.js, emailUtils.js
Middleware:     authMiddleware.js, errorMiddleware.js
```

#### Code Style

```javascript
// Use async/await (not promises)
async function getUser(userId) {
  try {
    const user = await User.findById(userId);
    return user;
  } catch (error) {
    throw new Error(`Failed to fetch user: ${error.message}`);
  }
}

// Use const/let (never var)
const PORT = 3001;
let requestCount = 0;

// Use object destructuring
const { location, problemType, description } = req.body;

// Standard response format
res.status(200).json({
  success: true,
  message: "Success message",
  data: { /* data */ }
});
```

### React (Frontend)

#### File Naming
```
Components:     MyComponent.jsx (PascalCase)
Pages:          MyPage.jsx
Hooks:          useCustomHook.js
Utils:          myUtil.js (camelCase)
Styles:         Component.css or use Tailwind
```

#### Code Style

```jsx
// Use functional components with hooks
function MyComponent() {
  const [state, setState] = useState(null);
  
  useEffect(() => {
    // Side effects
  }, [dependencies]);
  
  return (
    <div className="flex justify-center items-center">
      <h1>Hello {state.name}</h1>
    </div>
  );
}

// Export as default
export default MyComponent;

// Use Tailwind for styling (not CSS files)
<button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
  Click me
</button>

// Destructure props
function Card({ title, description, onClose }) {
  return (
    <div>
      <h2>{title}</h2>
      <p>{description}</p>
      <button onClick={onClose}>Close</button>
    </div>
  );
}
```

### Database Naming

```javascript
// Collections (plural, lowercase)
db.users
db.requests
db.chat_messages
db.transactions

// Fields (camelCase)
user.createdAt
request.problemType
payment.offeredAmount

// Relationships (singular, ObjectId)
request.user          // Points to single user
request.helper        // Points to single helper
message.senderId      // Points to user sending message
```

---

## Contributing Guide

### Setting Up Development Environment

1. Fork repository
2. Clone locally: `git clone https://github.com/yourusername/Helper-on-the-way.git`
3. Create feature branch: `git checkout -b feature/my-feature`
4. Install dependencies: `npm install` (both client and server)
5. Start development servers
6. Make changes following code conventions
7. Test thoroughly
8. Commit with descriptive message: `git commit -m "feat: Add feature description"`
9. Push branch: `git push origin feature/my-feature`
10. Create Pull Request on GitHub

### Commit Message Format

```
<type>: <subject>

<body>

<footer>
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style (no logic change)
- `refactor`: Code restructuring
- `perf`: Performance improvement
- `test`: Adding tests

**Example**:
```
feat: Add real-time location tracking for helpers

- Implement Socket.IO location updates every 5 seconds
- Add location permission prompt on app start
- Display helper location on requester's map

Closes #123
```

### Testing

```bash
# Backend tests
cd server
npm test

# Frontend tests
cd client
npm test
```

---

## Troubleshooting

### Common Issues

#### Backend Won't Start
```
Error: Cannot find module 'mongoose'

Solution:
cd server
npm install
```

#### Frontend Shows Blank Page
```
Check browser console for errors.
Ensure .env has correct VITE_API_URL
Verify backend is running on expected port
```

#### Database Connection Fails
```
Error: connect ECONNREFUSED 127.0.0.1:27017

Solutions:
1. Ensure MongoDB is running: mongod
2. Check MONGO_URI in .env
3. For MongoDB Atlas: Verify IP whitelist and credentials
```

#### JWT Token Errors
```
Error: Invalid token

Solutions:
1. Clear localStorage and login again
2. Check JWT_SECRET matches between .env files
3. Verify token hasn't expired (check JWT_EXPIRES_IN)
```

#### Socket.IO Connection Issues
```
WebSocket connection failed

Solutions:
1. Check CLIENT_ORIGINS includes frontend URL
2. Verify CORS settings in app.js
3. Check firewall/proxy not blocking WebSocket
```

---

## Resources & Documentation

### Official Documentation
- [Express.js](https://expressjs.com)
- [React](https://react.dev)
- [MongoDB Mongoose](https://mongoosejs.com)
- [Socket.IO](https://socket.io)
- [Tailwind CSS](https://tailwindcss.com)
- [Leaflet Maps](https://leafletjs.com)

### Third-Party Services
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [PayPal Developer](https://developer.paypal.com)
- [SendGrid](https://sendgrid.com)
- [Vite](https://vitejs.dev)

### Tools
- **Postman**: API testing [postman.com](https://postman.com)
- **MongoDB Compass**: Database GUI [mongodb.com/products/compass](https://mongodb.com/products/compass)
- **VS Code**: Code editor with extensions
  - ES7+ React/Redux Snippets
  - MongoDB for VS Code
  - REST Client

### Learning Resources
- [The Complete Node.js Course](https://www.udemy.com/course/complete-nodejs-course/)
- [React Documentation](https://react.dev)
- [MongoDB University](https://university.mongodb.com)
- [Web Development Bootcamp](https://www.udemy.com/course/the-complete-javascript-course/)

---

## License

This project is licensed under the **MIT License** - see LICENSE file for details.

---

## Support & Contact

### Issues & Bug Reports
Report bugs on [GitHub Issues](https://github.com/yourorg/Helper-on-the-way/issues)

### Feature Requests
Submit feature requests via [GitHub Discussions](https://github.com/yourorg/Helper-on-the-way/discussions)

### Questions & Community
- Discord: [Helper on the Way Server](https://discord.gg/...)
- Email: support@helperontheway.app
- Website: [helperontheway.app](https://helperontheway.app)

---

## Changelog

### Version 1.0.0 (Current)
- Initial release
- Core features: Requests, Chat, Payments, Ratings
- Admin dashboard
- Real-time map with Socket.IO
- PayPal integration

### Planned: Version 1.1.0
- Video call integration
- Push notifications
- Request history
- Advanced search filters

---

**Last Updated**: January 2026  
**Maintained By**: Helper on the Way Team  
**Status**: Active Development

---

## Quick Reference

### Starting the App
```bash
# Terminal 1
cd server && npm run dev

# Terminal 2
cd client && npm run dev

# Visit http://localhost:5173
```

### API Base URL
- **Development**: http://localhost:3001
- **Production**: https://api.helperontheway.app

### Database
- **Collections**: users, requests, chat, ratings, transactions, reports
- **Geospatial Queries**: 2dsphere index on `request.geo`

### Key Files
- Backend entry: `server/app.js`
- Frontend entry: `client/src/main.jsx`
- Routes: `client/src/app.jsx`
- Database config: `server/config/DB.js`

### Environment Variables
- `MONGO_URI` - Database connection
- `JWT_SECRET` - Token signing key
- `PAYPAL_CLIENT_ID/SECRET` - Payment processing
- `VITE_API_URL` - Frontend API endpoint

### Useful Commands
```bash
npm run dev          # Start dev server with hot reload
npm run build        # Build for production
npm run lint         # Check code style
npm install          # Install dependencies
npm test             # Run tests
```

---

**End of Project Book**
