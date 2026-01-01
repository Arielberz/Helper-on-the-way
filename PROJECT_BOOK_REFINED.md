# Helper on the Way
## Professional Project Documentation

> **A Full-Stack Real-Time Roadside Assistance Platform**  
> *Connecting drivers in distress with nearby community volunteers through innovative technology*

**Author:** Ariel Menachem Barzon  
**Repository:** [Arielberz/Helper-on-the-way](https://github.com/Arielberz/Helper-on-the-way)  
**Last Updated:** January 2026  
**Project Status:** Production-Ready MVP

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

Unlike traditional roadside assistance services that rely on centralized dispatch and membership models, Helper on the Way leverages:
- Peer-to-peer networking with geospatial matching algorithms
- WebSocket technology for real-time updates
- Community-driven trust through bilateral rating systems
- Zero upfront costs with optional post-service payments

### 📊 Project Metrics at a Glance

| Metric | Target | Description |
|--------|--------|-------------|
| **Response Time** | < 30s | Average time from request creation to helper match |
| **Platform Uptime** | 99.9% | Availability SLA target |
| **Concurrent Users** | 10,000+ | Designed scalability threshold |
| **Real-Time Latency** | < 100ms | WebSocket message delivery |
| **Mobile Coverage** | 95%+ | Responsive design compatibility |
| **Security Grade** | A+ | OWASP compliance rating |

---

## 📚 Table of Contents

### Part I: Product & Strategy
1. [Problem Statement & Market Analysis](#1-problem-statement--market-analysis)
2. [Solution Architecture Overview](#2-solution-architecture-overview)
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
14. [Quick Start Guide](#14-quick-start-guide)
15. [Development Workflow](#15-development-workflow)
16. [Code Standards & Conventions](#16-code-standards--conventions)
17. [Testing & Quality Assurance](#17-testing--quality-assurance)

### Part V: Project Management
18. [Known Issues & Technical Debt](#18-known-issues--technical-debt)
19. [Roadmap & Future Enhancements](#19-roadmap--future-enhancements)
20. [Performance Optimization](#20-performance-optimization)

### Appendices
- [Appendix A: Environment Configuration](#appendix-a-environment-configuration)
- [Appendix B: API Reference Card](#appendix-b-api-reference-card)
- [Appendix C: Troubleshooting Guide](#appendix-c-troubleshooting-guide)
- [Appendix D: Database Indexes](#appendix-d-database-indexes)

---

# Part I: Product & Strategy

## 1. Problem Statement & Market Analysis

### 1.1 The Problem

Modern drivers face a critical challenge when experiencing vehicle emergencies. Traditional solutions are expensive, slow, and often inaccessible.

#### Current Pain Points

**💰 High Cost of Traditional Services**
- AAA membership: $56-119/year minimum
- Towing services: $75-125 for short distances  
- Mechanic callouts: $100+ before any work begins
- Insurance roadside assistance: Often requires premium tier

**⏰ Slow Response Times**
- Average AAA response: 30-45 minutes in urban areas
- Insurance roadside: 45-90 minutes average
- Rural areas: 2+ hours common
- Peak times (holidays): 3+ hour waits reported

**🚫 Limited Coverage & Accessibility**
- Membership requirements exclude spontaneous help
- Rural areas underserved by traditional providers
- Small issues (flat tire, jump start) receive same slow response as major problems
- Language barriers in emergency situations

**❓ Lack of Transparency**
- No visibility into helper location or accurate ETA
- Pricing unknown until service rendered
- Limited trust verification for strangers
- No way to rate service quality

### 1.2 Target Market

#### Primary Users: Drivers in Distress

**Demographics:**
- Age: 25-55 years old (primary), 18-75 (secondary)
- Licensed drivers with smartphones
- Urban and suburban areas initially
- All income levels (but cost-conscious)

**Psychographics:**
- Value independence and self-reliance
- Tech-savvy enough to use ride-sharing apps
- Appreciate community-driven solutions
- Prioritize speed over traditional "brand names"

**Pain Points:**
- Unexpected breakdowns cause stress and schedule disruption
- Current solutions too expensive for frequent needs
- Distrust of unlicensed tow truck drivers
- Need transparency in pricing and timing

#### Secondary Users: Helpers/Volunteers

**Demographics:**
- Age: 21-65 years old
- Mechanically skilled individuals
- Access to basic tools (jack, jumper cables, etc.)
- Clean driving record and vehicle

**Psychographics:**
- Community-oriented, helpful personality
- Entrepreneurial mindset (gig economy appeal)
- Flexible schedule (students, retirees, self-employed)
- Value reputation building

**Motivations:**
- Earn supplemental income ($50-300/day potential)
- Help neighbors in need
- Build professional reputation
- Flexible work on own schedule

### 1.3 Market Opportunity

#### Total Addressable Market (TAM)

| Segment | Market Size (US) | Annual Value | Global Potential |
|---------|------------------|--------------|------------------|
| **Licensed Drivers** | 228 million | $15 billion | $60+ billion |
| **AAA Members** | 60 million | $4 billion | N/A (US/Canada only) |
| **Roadside Incidents** | 69 million/year | N/A | 200+ million/year |
| **Gig Economy Workers** | 59 million | N/A | Potential helper pool |
| **Smartphone Users** | 85% penetration | N/A | Platform requirement |

**Key Statistics:**
- 1 in 3 drivers experiences a breakdown annually
- Average cost per incident: $200-400 (towing + service)
- 40% of breakdowns are "minor" (tire, battery, fuel)
- Millennial/Gen Z preference for on-demand services: 73%

#### Market Trends Supporting Solution

1. **Gig Economy Explosion**
   - Uber/Lyft validation of peer-to-peer model
   - TaskRabbit success in local services
   - Comfort with stranger transactions via apps

2. **On-Demand Service Expectation**
   - Consumer expectation of instant gratification
   - Real-time tracking now standard (Uber, DoorDash)
   - Transparency reduces anxiety in emergencies

3. **Community Platforms Gaining Trust**
   - Airbnb: Strangers in your home
   - Rover: Strangers with your pets
   - Nextdoor: Neighborhood networking

4. **Mobile-First Behavior**
   - 95% of users have phone during emergencies
   - GPS accuracy within 5 meters standard
   - Payment apps (Venmo, PayPal) ubiquitous

### 1.4 Competitive Analysis

#### Direct Competitors

| Competitor | Model | Strengths | Weaknesses | Our Differentiation |
|------------|-------|-----------|------------|---------------------|
| **AAA** | Membership subscription | Brand trust, wide coverage, roadside + towing | Expensive ($60-120/year), slow (30-45 min), requires membership | No subscription, faster matching, community-driven |
| **HONK** | Tech-enabled dispatch | Modern platform, B2B partnerships | Still centralized, limited helper network, business-focused | True peer-to-peer, direct consumer marketplace |
| **Urgently** | B2B2C digital roadside | Insurance partnerships, good tech | Not consumer-facing, tied to existing services | Direct-to-consumer, independent platform |
| **Allstate/Insurance Roadside** | Insurance add-on | Bundled with insurance, reliable | Requires specific insurance, slow, expensive ($10-20/month) | No insurance requirement, cheaper, faster |

#### Indirect Competitors

| Alternative | How Users Currently Solve | Why We're Better |
|-------------|----------------------------|------------------|
| **Facebook Groups / Nextdoor** | Post for help, wait for response | Unstructured, unsafe payments, no matching algorithm, no tracking |
| **Calling Friends/Family** | Phone contacts for help | Limited by social network, guilt factor, unpredictable availability |
| **Random Tow Trucks** | Flagging passing trucks | Unsafe, price gouging common, no accountability |
| **Walking to Gas Station** | Self-service for simple issues | Dangerous (highway), time-consuming, doesn't solve many problems |

#### Competitive Advantages Summary

1. **Speed**: Geospatial matching + push notifications = < 5 min to accept
2. **Cost**: No membership, helpers set rates, typically 40-60% cheaper
3. **Trust**: Bilateral ratings + verified profiles + chat history
4. **Transparency**: Live tracking + chat + status updates
5. **Accessibility**: No membership barrier, pay only when used
6. **Community**: Helpers earn income, drivers save money, win-win

---

## 2. Solution Architecture Overview

### 2.1 Core Solution Components

Helper on the Way creates a **real-time marketplace** for roadside assistance by combining:

#### 1. Geospatial Matching Engine
- MongoDB 2dsphere indexes for ultra-fast proximity queries
- Ranking algorithm considers: distance (70%), rating (20%), response time (10%)
- Configurable search radius (default 20km, auto-expands if no matches)
- Real-time availability updates via WebSocket

#### 2. Real-Time Communication Stack
- **Socket.IO** for instant bidirectional messaging
- Persistent chat rooms per request (survives page refresh)
- Live location streaming (10-second interval throttling)
- Status change broadcasts to all participants

#### 3. Trust & Safety Infrastructure
- Bilateral rating system (both parties rate each other)
- Weighted average favoring recent interactions
- Profile verification (email mandatory, phone optional)
- Report system with admin moderation

#### 4. Flexible Payment System
- **Primary**: PayPal integration (ILS, USD, EUR support)
- **Secondary**: Platform wallet with balance tracking
- Configurable commission (default 10%)
- Secure server-side payment verification

### 2.2 High-Level User Flows

#### Flow 1: Driver Creates Request → Helper Responds

```
┌──────────────────────────────────────────────────────────────────┐
│ DRIVER JOURNEY                                                    │
└──────────────────────────────────────────────────────────────────┘

[1] Driver experiences flat tire on highway
     ↓
[2] Opens Helper on the Way app
     ↓
[3] App requests location permission → Granted
     ↓
[4] Driver taps "Create Request"
     ↓
[5] Selects problem type: "Flat Tire"
     ↓
[6] Takes photo of tire (optional)
     ↓
[7] Enters offered payment: ₪50 (optional)
     ↓
[8] Taps "Post Request" → Submitted in < 30 seconds
     ↓
[9] Request appears on map for nearby helpers
     ↓ (System searches 20km radius)
     ↓
[10] Helper "David" accepts (2.3 km away, 4.8★ rating)
     ↓
[11] Driver receives push notification
     ↓
[12] Driver views David's profile:
     - 4.8★ rating (127 helps)
     - "Experienced with tire changes"
     - Photo of tools
     ↓
[13] Driver taps "Confirm Helper"
     ↓ (Chat opens automatically)
     ↓
[14] Live tracking shows David approaching
     - ETA: 8 minutes
     - Updates every 10 seconds
     ↓
[15] David arrives, changes tire (15 minutes)
     ↓
[16] David marks "Completed"
     ↓
[17] Driver rates David 5★ + "Super fast and professional!"
     ↓
[18] Driver pays ₪50 via PayPal
     - Platform takes 10% commission (₪5)
     - David receives ₪45 in wallet
     ↓
[19] Request archived, both receive email receipts

Total time: ~25 minutes from breakdown to resolution
```

```
┌──────────────────────────────────────────────────────────────────┐
│ HELPER JOURNEY                                                    │
└──────────────────────────────────────────────────────────────────┘

[1] Helper "David" opens app during evening commute
     ↓
[2] Map shows 3 open requests nearby:
     - Flat tire, 2.3 km, ₪50 offered
     - Dead battery, 5.7 km, ₪40 offered
     - Out of fuel, 12 km, ₪30 offered
     ↓
[3] David taps closest marker (flat tire)
     ↓
[4] Views request details:
     - Location: Highway 4, Northbound
     - Problem: Front-left flat tire
     - Driver: Sarah K. (4.2★, 8 requests)
     - Photo: Shows tire damage
     - Offered: ₪50
     ↓
[5] David checks time/location → Decides to help
     ↓
[6] Taps "Accept Request"
     ↓ (Atomic lock prevents double-booking)
     ↓
[7] System shows "Waiting for driver confirmation..."
     - 2-minute timeout (auto-cancel if driver rejects)
     ↓
[8] Driver confirms! Chat opens
     ↓
[9] David sends message: "Hi! On my way, 8 mins"
     ↓
[10] David enables live location sharing
     ↓
[11] Uses integrated Waze/Google Maps navigation
     ↓
[12] Arrives at location (ETA was accurate!)
     ↓
[13] Changes tire (has portable jack + lug wrench)
     ↓
[14] David taps "Mark Complete"
     ↓
[15] Waits for driver to rate and pay
     ↓
[16] Receives 5★ rating + ₪45 in wallet (after commission)
     ↓
[17] David rates driver 5★ + "Friendly and patient"
     ↓
[18] Earnings updated: Balance now ₪225

David's active time: 35 minutes, Earned: ₪45 (₪77/hour effective rate)
```

### 2.3 Request Lifecycle State Machine

The system enforces a strict state machine to prevent race conditions and ensure data consistency:

```
┌─────────┐
│  OPEN   │  ← Driver creates request
└────┬────┘    Visible on map to helpers within radius
     │
     │ [Helper Accepts]
     ↓
┌──────────────┐
│ PENDING_CONF │  ← Awaiting driver confirmation
└───────┬──────┘    2-minute timeout
        │
        ├─[Driver Rejects]──→ Back to OPEN (helper notified)
        │
        │ [Driver Confirms]
        ↓
   ┌──────────┐
   │ CONFIRMED│  ← Chat + Location tracking enabled
   └─────┬────┘    Both parties can message
         │
         │ [Helper Starts Work]
         ↓
   ┌─────────────┐
   │ IN_PROGRESS │  ← Active assistance
   └──────┬──────┘    Helper at location
          │
          ├─[Helper/Driver Cancels]──→ CANCELED
          │
          │ [Helper Completes]
          ↓
     ┌────────┐
     │  DONE  │  ← Awaiting rating
     └────┬───┘    30-minute timeout
          │
          │ [Both Rate Each Other]
          ↓
    ┌─────────┐
    │ ARCHIVED│  ← Payment optional, then archived
    └─────────┘    No longer editable
```

**State Transition Rules:**
- Only `OPEN` and `PENDING_CONF` visible on map (different colors)
- Transition `OPEN` → `PENDING_CONF` is **atomic** (MongoDB findOneAndUpdate with status check)
- Only assigned helper can transition `CONFIRMED` → `IN_PROGRESS`
- Either party can cancel during `CONFIRMED` or `IN_PROGRESS`
- Both parties must rate before archival (enforced in UI)
- Requests auto-cancel if `OPEN` for > 24 hours
- Requests auto-archive if `DONE` for > 7 days (with/without payment)

### 2.4 Key Business Logic Decisions

#### Why This Architecture?

**1. Atomic State Transitions Prevent Race Conditions**
```javascript
// Pseudocode for accepting a request
const request = await Request.findOneAndUpdate(
  { _id: requestId, status: 'open' },  // ← Only match if still open!
  { 
    $set: { 
      status: 'pending_conf', 
      helperId: userId, 
      acceptedAt: new Date() 
    } 
  },
  { new: true }  // Return updated document
);

if (!request) {
  throw new ConflictError('Request already accepted by another helper');
}
```
This prevents two helpers from accepting simultaneously.

**2. Two-Stage Confirmation Builds Trust**
- Helper accepts → Driver confirms (not automatic)
- Allows driver to vet helper profile
- Prevents accidental accepts or malicious actors
- 2-minute timeout keeps process moving

**3. Chat + Tracking in Separate Socket Rooms**
```javascript
// Each request gets a unique Socket.IO room
const roomId = `request:${requestId}`;

// Only driver and helper can join
socket.join(roomId);

// Messages only go to room participants
io.to(roomId).emit('chat:message', { text, sender });
```
Ensures privacy and scalability.

**4. Payment After Service (Not Before)**
- Reduces friction for drivers (no upfront commitment)
- Helpers rely on rating system for trust
- Platform can handle disputes with refunds
- Optional payment respects community help ethos

---

## 3. Feature Specifications

This section details every major feature with acceptance criteria, technical specs, and design decisions.

### 3.1 Feature Matrix

| Feature ID | Name | Priority | Status | User Type | Complexity |
|------------|------|----------|--------|-----------|------------|
| FR-001 | User Registration & Auth | Critical | ✅ Complete | Both | Medium |
| FR-002 | Create Help Request | Critical | ✅ Complete | Driver | High |
| FR-003 | Helper Discovery | Critical | ✅ Complete | Helper | High |
| FR-004 | Request Accept & Confirm | Critical | ✅ Complete | Both | High |
| FR-005 | Real-Time Chat | Critical | ✅ Complete | Both | High |
| FR-006 | Live Location Tracking | Critical | ✅ Complete | Helper | High |
| FR-007 | Rating System | High | ✅ Complete | Both | Medium |
| FR-008 | Payment Processing | High | ✅ Complete | Driver | High |
| FR-009 | Wallet & Payouts | High | ✅ Complete | Helper | High |
| FR-010 | Admin Dashboard | Medium | ✅ Complete | Admin | Medium |
| FR-011 | User Reports | Medium | ✅ Complete | Both | Low |
| FR-012 | Email Notifications | Low | ✅ Complete | Both | Low |
| FR-013 | Profile Management | Low | ✅ Complete | Both | Low |
| FR-014 | Request History | Low | ✅ Complete | Both | Low |

### 3.2 Detailed Feature Specifications

#### FR-001: User Registration & Authentication

**Priority:** Critical  
**Description:** Users must create accounts to use the platform

**User Stories:**
- As a driver, I want to register quickly so I can get help immediately
- As a helper, I want to create a profile to build my reputation
- As a user, I want secure login so my account is protected

**Acceptance Criteria:**
- ✅ Registration form validates all inputs before submission
- ✅ Email must be unique and valid format
- ✅ Phone number must be E.164 format (+1234567890)
- ✅ Password minimum 8 characters with number and special char
- ✅ JWT token issued on successful login (24h expiration)
- ✅ Token stored in localStorage (client-side)
- ✅ Protected routes redirect to login if no token
- ✅ Password reset flow via email (1-hour token expiration)
- ✅ Email verification required before creating requests (optional for MVP)

**Technical Specification:**

**Validation Rules:**
```javascript
const registrationSchema = {
  username: {
    regex: /^[a-zA-Z0-9_]{3,30}$/,
    message: '3-30 characters, alphanumeric + underscore only'
  },
  email: {
    validator: validator.isEmail(),
    unique: true,
    message: 'Valid email required'
  },
  phone: {
    regex: /^\+?[1-9]\d{7,14}$/,  // E.164 international format
    message: 'Valid international phone (8-15 digits)'
  },
  password: {
    minLength: 8,
    requirements: [/\d/, /[!@#$%^&*]/],  // Must contain number + special
    message: 'Min 8 chars with number and special character'
  }
};
```

**JWT Payload:**
```javascript
const token = jwt.sign(
  {
    id: user._id,
    email: user.email,
    role: user.role,  // 'user' | 'helper' | 'admin'
    iat: Math.floor(Date.now() / 1000)
  },
  process.env.JWT_SECRET,
  { expiresIn: '24h' }
);
```

**Password Hashing:**
```javascript
// Registration
const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;
const hashedPassword = await bcrypt.hash(password, saltRounds);

// Login
const isMatch = await bcrypt.compare(inputPassword, user.password);
```

**Endpoints:**
- `POST /api/users/register` - Create new account
- `POST /api/users/login` - Authenticate and get token
- `POST /api/users/forgot-password` - Request password reset email
- `POST /api/users/reset-password` - Reset with token
- `GET /api/users/me` - Get current user (requires auth)

**Security Measures:**
- Passwords never stored in plain text
- JWT secrets in environment variables
- Rate limiting on auth endpoints (10 attempts / 15 min)
- Email verification prevents spam accounts
- HttpOnly cookies option for token storage (optional enhancement)

---

#### FR-002: Create Help Request

**Priority:** Critical  
**Description:** Drivers broadcast emergencies with location and details

**User Stories:**
- As a driver, I want to create a request in under 30 seconds
- As a driver, I want to specify my exact problem type
- As a driver, I want to offer payment to attract helpers
- As a driver, I want to add photos to show the issue

**Acceptance Criteria:**
- ✅ Automatic geolocation capture via browser API
- ✅ Manual address entry fallback if geolocation denied
- ✅ Problem type selection from predefined enum
- ✅ Optional description field (max 500 characters)
- ✅ Photo upload support (max 3 images, 5MB each)
- ✅ Optional payment amount (₪0-500 range, ILS default)
- ✅ Request appears on map immediately after creation
- ✅ Request broadcasts to helpers within 20km radius
- ✅ Request auto-expires after 24h if not accepted

**Problem Types Enum:**
```javascript
const PROBLEM_TYPES = {
  FLAT_TIRE: {
    value: 'flat_tire',
    label: 'Flat Tire / Puncture',
    icon: '🛞',
    avgTime: 20  // minutes
  },
  DEAD_BATTERY: {
    value: 'dead_battery',
    label: 'Dead Battery / Jump Start',
    icon: '🔋',
    avgTime: 15
  },
  OUT_OF_FUEL: {
    value: 'out_of_fuel',
    label: 'Out of Fuel',
    icon: '⛽',
    avgTime: 30
  },
  ENGINE_PROBLEM: {
    value: 'engine_problem',
    label: 'Engine Won\'t Start',
    icon: '🔧',
    avgTime: 45
  },
  LOCKED_OUT: {
    value: 'locked_out',
    label: 'Locked Out of Car',
    icon: '🔑',
    avgTime: 25
  },
  ACCIDENT: {
    value: 'accident',
    label: 'Accident / Collision',
    icon: '⚠️',
    avgTime: 60
  },
  TOWING_NEEDED: {
    value: 'towing_needed',
    label: 'Towing Required',
    icon: '🚗',
    avgTime: 90
  },
  OTHER: {
    value: 'other',
    label: 'Other Issue',
    icon: '❓',
    avgTime: 30
  }
};
```

**Geolocation Flow:**
```javascript
// 1. Request browser geolocation
navigator.geolocation.getCurrentPosition(
  (position) => {
    const { latitude, longitude, accuracy } = position.coords;
    
    // 2. Reverse geocode to get address (OpenStreetMap Nominatim API)
    const address = await reverseGeocode(latitude, longitude);
    
    // 3. Populate form
    setLocation({ lat: latitude, lng: longitude, address, accuracy });
  },
  (error) => {
    // 4. Fallback to manual entry
    setManualEntryMode(true);
  },
  {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0
  }
);
```

**Request Data Model:**
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: 'User'),  // Driver who created request
  problemType: String (enum: PROBLEM_TYPES),
  description: String (max 500 chars),
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: [Number, Number],  // [lng, lat] for GeoJSON
    address: String
  },
  photos: [String],  // Array of Cloudinary URLs
  offeredAmount: Number (min: 0, max: 500),
  currency: String (default: 'ILS'),
  status: String (enum: STATUS_TYPES),
  helperId: ObjectId (ref: 'User'),  // Helper who accepted (null initially)
  acceptedAt: Date,
  confirmedAt: Date,
  completedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

**Geospatial Index:**
```javascript
// MongoDB 2dsphere index for proximity queries
requestSchema.index({ location: '2dsphere' });
requestSchema.index({ status: 1, createdAt: -1 });
requestSchema.index({ user: 1, createdAt: -1 });
requestSchema.index({ helperId: 1, status: 1 });
```

**Photo Upload Flow:**
1. Client selects image (max 5MB, JPEG/PNG only)
2. Client-side resize/compress (1920px max width)
3. Upload to Cloudinary via signed upload URL
4. Server validates upload, stores URL in request
5. Thumbnail generated automatically by Cloudinary

**Endpoints:**
- `POST /api/requests` - Create new request
- `GET /api/requests?status=open&lat=32.08&lng=34.78&radius=20` - Query nearby
- `GET /api/requests/:id` - Get request details
- `PATCH /api/requests/:id` - Update request (owner only)
- `DELETE /api/requests/:id` - Cancel request (owner only, if OPEN)

**Validation:**
```javascript
// Server-side validation
const createRequestValidator = [
  body('problemType').isIn(Object.values(PROBLEM_TYPES)),
  body('location.coordinates').isArray().isLength({ min: 2, max: 2 }),
  body('location.coordinates[0]').isFloat({ min: -180, max: 180 }),  // longitude
  body('location.coordinates[1]').isFloat({ min: -90, max: 90 }),    // latitude
  body('description').optional().isLength({ max: 500 }).trim(),
  body('offeredAmount').optional().isFloat({ min: 0, max: 500 }),
  body('photos').optional().isArray().isLength({ max: 3 })
];
```

---

#### FR-003: Helper Discovery & Matching

**Priority:** Critical  
**Description:** Intelligent matching of helpers to requests based on proximity, rating, and availability

**User Stories:**
- As a helper, I want to see only requests near me
- As a helper, I want to see request details before accepting
- As a system, I want to rank helpers to show best matches first
- As a driver, I want to ensure only one helper accepts my request

**Acceptance Criteria:**
- ✅ Geospatial query returns helpers within configurable radius (default 20km)
- ✅ Results sorted by composite score (distance + rating + response time)
- ✅ Helper sees full request details before accepting
- ✅ Atomic acceptance prevents race conditions (double-booking)
- ✅ Driver receives notification when helper accepts
- ✅ Driver has 2 minutes to confirm or reject helper
- ✅ If rejected, request returns to OPEN status for other helpers

**Matching Algorithm:**

```javascript
/**
 * Ranks helpers for a given request
 * Factors:
 * - Distance (70% weight): Closer is better
 * - Rating (20% weight): Higher rated helpers preferred
 * - Response Time (10% weight): Faster responders rewarded
 */
function rankHelpers(request, helpers) {
  return helpers.map(helper => {
    // Distance score (0-100): 0km = 100pts, 20km = 0pts
    const distance = calculateDistance(request.location, helper.location);
    const distanceScore = Math.max(0, 100 - (distance / 20) * 100);
    
    // Rating score (0-100): 5★ = 100pts, 0★ = 0pts
    const ratingScore = (helper.averageRating / 5) * 100;
    
    // Response time score (0-100): Based on average response speed
    // avgResponseTime in minutes, < 2 min = 100pts, > 10 min = 0pts
    const responseScore = Math.max(0, 100 - (helper.avgResponseTime / 10) * 100);
    
    // Weighted composite score
    const finalScore = (
      (distanceScore * 0.70) +
      (ratingScore * 0.20) +
      (responseScore * 0.10)
    );
    
    return {
      helper,
      distance,
      score: Math.round(finalScore),
      estimatedArrival: calculateETA(distance, helper.avgSpeed)
    };
  })
  .sort((a, b) => b.score - a.score)
  .slice(0, 50);  // Limit to top 50 for performance
}
```

**Geospatial Query:**
```javascript
// Find requests within radius
const nearbyRequests = await Request.find({
  status: 'open',
  location: {
    $near: {
      $geometry: {
        type: 'Point',
        coordinates: [helperLng, helperLat]  // [lng, lat] order!
      },
      $maxDistance: 20000  // 20km in meters
    }
  }
})
.populate('user', 'username averageRating profilePhoto')
.limit(100)
.lean();
```

**Atomic Accept Logic:**
```javascript
/**
 * Critical: Prevents two helpers from accepting same request
 * Uses MongoDB findOneAndUpdate with status condition
 */
async function acceptRequest(requestId, helperId) {
  const request = await Request.findOneAndUpdate(
    { 
      _id: requestId, 
      status: 'open'  // ← Only match if still open!
    },
    { 
      $set: { 
        status: 'pending_conf',
        helperId: helperId,
        acceptedAt: new Date(),
        expiresAt: new Date(Date.now() + 2 * 60 * 1000)  // 2-min timeout
      } 
    },
    { 
      new: true,  // Return updated document
      runValidators: true 
    }
  );
  
  if (!request) {
    throw new ConflictError('Request already accepted by another helper');
  }
  
  // Send notification to driver
  await notifyDriver(request.user, {
    type: 'helper_accepted',
    requestId: request._id,
    helperId: helperId
  });
  
  // Start 2-minute countdown (cancel if driver doesn't respond)
  scheduleConfirmationTimeout(request._id, 2 * 60 * 1000);
  
  return request;
}
```

**Confirmation/Rejection Flow:**
```javascript
// Driver confirms helper
async function confirmHelper(requestId, driverId) {
  const request = await Request.findOneAndUpdate(
    {
      _id: requestId,
      user: driverId,  // Ensure requester owns this
      status: 'pending_conf'
    },
    {
      $set: {
        status: 'confirmed',
        confirmedAt: new Date()
      }
    },
    { new: true }
  );
  
  if (!request) {
    throw new NotFoundError('Request not found or already processed');
  }
  
  // Create chat room
  await createChatRoom(requestId, driverId, request.helperId);
  
  // Notify helper
  await notifyHelper(request.helperId, {
    type: 'driver_confirmed',
    requestId: request._id
  });
  
  return request;
}

// Driver rejects helper
async function rejectHelper(requestId, driverId, reason) {
  const request = await Request.findOneAndUpdate(
    {
      _id: requestId,
      user: driverId,
      status: 'pending_conf'
    },
    {
      $set: {
        status: 'open',  // Back to open for other helpers
        helperId: null,
        acceptedAt: null,
        expiresAt: null
      },
      $push: {
        rejectedHelpers: request.helperId  // Track rejections
      }
    },
    { new: true }
  );
  
  // Notify rejected helper
  await notifyHelper(request.helperId, {
    type: 'driver_rejected',
    requestId: request._id,
    reason: reason
  });
  
  return request;
}
```

**Map Display Logic:**
```jsx
// Client-side: Display requests on map
function RequestsMap() {
  const [requests, setRequests] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  
  useEffect(() => {
    // Get user location
    navigator.geolocation.getCurrentPosition(pos => {
      setUserLocation({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude
      });
    });
  }, []);
  
  useEffect(() => {
    if (!userLocation) return;
    
    // Fetch nearby requests
    const fetchRequests = async () => {
      const { data } = await api.get('/requests', {
        params: {
          status: 'open',
          lat: userLocation.lat,
          lng: userLocation.lng,
          radius: 20  // km
        }
      });
      setRequests(data);
    };
    
    fetchRequests();
    
    // Listen for real-time updates
    socket.on('request:created', (newRequest) => {
      // Check if within radius
      const distance = calculateDistance(userLocation, newRequest.location);
      if (distance <= 20) {
        setRequests(prev => [...prev, newRequest]);
      }
    });
    
    socket.on('request:accepted', ({ requestId }) => {
      // Remove from map when someone else accepts
      setRequests(prev => prev.filter(r => r._id !== requestId));
    });
    
    return () => {
      socket.off('request:created');
      socket.off('request:accepted');
    };
  }, [userLocation]);
  
  return (
    <MapContainer center={userLocation} zoom={13}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      
      {requests.map(request => (
        <Marker 
          key={request._id}
          position={[request.location.coordinates[1], request.location.coordinates[0]]}
          icon={getIconForProblemType(request.problemType)}
        >
          <Popup>
            <RequestCard 
              request={request}
              onAccept={() => handleAccept(request._id)}
            />
          </Popup>
        </Marker>
      ))}
      
      {userLocation && (
        <Marker position={userLocation} icon={userLocationIcon} />
      )}
    </MapContainer>
  );
}
```

**Endpoints:**
- `GET /api/requests/nearby?lat={lat}&lng={lng}&radius={km}` - Find nearby requests
- `POST /api/requests/:id/accept` - Helper accepts request (atomic)
- `POST /api/requests/:id/confirm` - Driver confirms helper
- `POST /api/requests/:id/reject` - Driver rejects helper

**Performance Optimizations:**
- MongoDB geospatial index for O(log n) proximity queries
- Request pooling (query every 10s, not on every map move)
- Socket.IO rooms for targeted broadcasts (only notify helpers in radius)
- Pagination for helpers list (max 50 shown)

---

#### FR-004: Real-Time Chat

**Priority:** Critical  
**Description:** Live messaging between driver and helper during assistance

**User Stories:**
- As a driver, I want to message my helper for updates
- As a helper, I want to ask clarifying questions about the problem
- As a user, I want messages to arrive instantly (< 1 second)
- As a user, I want to see message history if I refresh the page

**Acceptance Criteria:**
- ✅ Chat opens automatically when request is confirmed
- ✅ Messages delivered via WebSocket with < 100ms latency
- ✅ Message history persisted in database
- ✅ Offline message queueing (delivery on reconnect)
- ✅ Typing indicators show when other party is typing
- ✅ Read receipts for delivered messages
- ✅ Quick reply buttons for common messages
- ✅ Emoji support in messages

**Chat Data Model:**
```javascript
const chatSchema = new Schema({
  requestId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Request', 
    required: true,
    unique: true  // One chat per request
  },
  participants: [{
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, enum: ['driver', 'helper'] },
    joinedAt: Date
  }],
  messages: [{
    _id: Schema.Types.ObjectId,
    sender: { type: Schema.Types.ObjectId, ref: 'User' },
    text: { type: String, maxlength: 1000 },
    type: { 
      type: String, 
      enum: ['text', 'system', 'location', 'photo'],
      default: 'text'
    },
    metadata: Schema.Types.Mixed,  // For location coords, photo URL, etc.
    timestamp: { type: Date, default: Date.now },
    read: { type: Boolean, default: false },
    delivered: { type: Boolean, default: false }
  }],
  createdAt: { type: Date, default: Date.now },
  lastMessageAt: Date
});

chatSchema.index({ requestId: 1 });
chatSchema.index({ 'participants.userId': 1 });
chatSchema.index({ 'messages.timestamp': -1 });
```

**Socket.IO Implementation:**

**Server-Side (chatSockets.js):**
```javascript
function initializeChatSockets(io) {
  io.on('connection', async (socket) => {
    const userId = socket.user.id;  // From auth middleware
    
    // Join all active chat rooms for this user
    const userChats = await Chat.find({ 
      'participants.userId': userId 
    }).select('requestId');
    
    userChats.forEach(chat => {
      socket.join(`request:${chat.requestId}`);
    });
    
    // Handle new message
    socket.on('chat:message', async ({ requestId, text }) => {
      try {
        // Validate user is participant
        const chat = await Chat.findOne({ 
          requestId,
          'participants.userId': userId
        });
        
        if (!chat) {
          return socket.emit('error', { message: 'Not authorized' });
        }
        
        // Save message to database
        const message = {
          _id: new mongoose.Types.ObjectId(),
          sender: userId,
          text: text.trim().substring(0, 1000),  // Sanitize + limit
          type: 'text',
          timestamp: new Date(),
          delivered: false,
          read: false
        };
        
        chat.messages.push(message);
        chat.lastMessageAt = message.timestamp;
        await chat.save();
        
        // Broadcast to room (including sender for confirmation)
        io.to(`request:${requestId}`).emit('chat:message', {
          requestId,
          message: {
            ...message,
            sender: {
              id: userId,
              username: socket.user.username
            }
          }
        });
        
        // Send push notification to other participant
        const otherParticipant = chat.participants.find(
          p => p.userId.toString() !== userId
        );
        await sendPushNotification(otherParticipant.userId, {
          title: 'New Message',
          body: text,
          data: { requestId, type: 'chat' }
        });
        
      } catch (error) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });
    
    // Handle typing indicator
    socket.on('chat:typing', ({ requestId, isTyping }) => {
      socket.to(`request:${requestId}`).emit('chat:typing', {
        userId,
        username: socket.user.username,
        isTyping
      });
    });
    
    // Handle read receipts
    socket.on('chat:read', async ({ requestId, messageIds }) => {
      await Chat.updateOne(
        { requestId },
        { 
          $set: { 
            'messages.$[msg].read': true 
          } 
        },
        { 
          arrayFilters: [{ 'msg._id': { $in: messageIds } }] 
        }
      );
      
      socket.to(`request:${requestId}`).emit('chat:read', {
        messageIds,
        userId
      });
    });
    
    // Handle location sharing
    socket.on('chat:location', async ({ requestId, lat, lng }) => {
      const message = {
        _id: new mongoose.Types.ObjectId(),
        sender: userId,
        type: 'location',
        metadata: { lat, lng, timestamp: new Date() },
        timestamp: new Date()
      };
      
      await Chat.findOneAndUpdate(
        { requestId },
        { 
          $push: { messages: message },
          $set: { lastMessageAt: message.timestamp }
        }
      );
      
      io.to(`request:${requestId}`).emit('chat:message', {
        requestId,
        message: {
          ...message,
          sender: { id: userId, username: socket.user.username }
        }
      });
    });
  });
}
```

**Client-Side (Chat Component):**
```jsx
function ChatWindow({ requestId }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const messagesEndRef = useRef(null);
  
  // Load message history on mount
  useEffect(() => {
    api.get(`/chat/${requestId}`)
      .then(({ data }) => setMessages(data.messages))
      .catch(console.error);
  }, [requestId]);
  
  // Listen for real-time messages
  useEffect(() => {
    socket.emit('chat:join', { requestId });
    
    socket.on('chat:message', ({ message }) => {
      setMessages(prev => [...prev, message]);
      
      // Mark as read if chat is open
      if (document.hasFocus()) {
        socket.emit('chat:read', { 
          requestId, 
          messageIds: [message._id] 
        });
      }
    });
    
    socket.on('chat:typing', ({ userId, isTyping }) => {
      if (userId !== currentUser.id) {
        setOtherUserTyping(isTyping);
        setTimeout(() => setOtherUserTyping(false), 3000);
      }
    });
    
    return () => {
      socket.off('chat:message');
      socket.off('chat:typing');
    };
  }, [requestId]);
  
  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Typing indicator
  useEffect(() => {
    if (inputText.length > 0) {
      socket.emit('chat:typing', { requestId, isTyping: true });
      
      const timeout = setTimeout(() => {
        socket.emit('chat:typing', { requestId, isTyping: false });
      }, 1000);
      
      return () => clearTimeout(timeout);
    }
  }, [inputText]);
  
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    
    const text = inputText.trim();
    setInputText('');
    
    // Optimistic UI update
    const tempId = Date.now();
    const optimisticMessage = {
      _id: tempId,
      sender: { id: currentUser.id, username: currentUser.username },
      text,
      timestamp: new Date(),
      pending: true
    };
    setMessages(prev => [...prev, optimisticMessage]);
    
    // Send via socket
    socket.emit('chat:message', { requestId, text });
    
    // Remove pending flag when confirmed
    socket.once('chat:message', ({ message }) => {
      setMessages(prev => 
        prev.map(m => m._id === tempId ? { ...message, pending: false } : m)
      );
    });
  };
  
  const sendQuickReply = (text) => {
    setInputText(text);
    // Auto-submit after 500ms
    setTimeout(() => {
      sendMessage({ preventDefault: () => {} });
    }, 500);
  };
  
  return (
    <div className="chat-window">
      <div className="chat-header">
        <h3>Chat with {otherUser.username}</h3>
        <span className="status">{otherUserTyping ? 'Typing...' : 'Online'}</span>
      </div>
      
      <div className="messages-container">
        {messages.map(msg => (
          <MessageBubble 
            key={msg._id} 
            message={msg} 
            isMine={msg.sender.id === currentUser.id}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="quick-replies">
        <button onClick={() => sendQuickReply("On my way!")}>
          🚗 On my way
        </button>
        <button onClick={() => sendQuickReply("5 minutes away")}>
          ⏱️ 5 mins
        </button>
        <button onClick={() => sendQuickReply("I've arrived")}>
          📍 Arrived
        </button>
      </div>
      
      <form onSubmit={sendMessage} className="chat-input">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type a message..."
          maxLength={1000}
        />
        <button type="submit" disabled={!inputText.trim()}>
          Send
        </button>
      </form>
    </div>
  );
}
```

**Quick Reply Templates:**
```javascript
const QUICK_REPLIES = {
  helper: [
    { text: "On my way!", icon: "🚗" },
    { text: "5 minutes away", icon: "⏱️" },
    { text: "I've arrived", icon: "📍" },
    { text: "What's your exact location?", icon: "❓" },
    { text: "Can you send a photo?", icon: "📸" }
  ],
  driver: [
    { text: "Thank you!", icon: "🙏" },
    { text: "I'm in the parking lot", icon: "🅿️" },
    { text: "Blue sedan", icon: "🚙" },
    { text: "How long will it take?", icon: "⏰" },
    { text: "All done, thanks!", icon: "✅" }
  ]
};
```

**Message Types:**
- **text**: Regular user message
- **system**: Automated notifications (e.g., "Helper is on the way")
- **location**: Shared GPS coordinates (rendered as map pin)
- **photo**: Shared image (rendered as thumbnail)

**Endpoints:**
- `GET /api/chat/:requestId` - Get message history
- `POST /api/chat/:requestId/messages` - Send message (REST fallback)
- `GET /api/chat/:requestId/unread` - Count unread messages

**Security:**
- Only request participants can access chat
- Messages sanitized to prevent XSS
- Rate limiting: Max 60 messages / minute / user
- WebSocket authentication via JWT in handshake

---

Due to length constraints, I'll continue with the remaining sections in a follow-up. This establishes the professional structure and depth. Would you like me to continue with the remaining features and sections?
