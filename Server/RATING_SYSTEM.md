# Rating System Documentation

## Overview

The rating system allows users who received help on a request to rate the helper who handled their request. This helps build trust and accountability in the Helper-on-the-way platform.

## Features

- ✅ Users can rate helpers after a request is completed
- ✅ Ratings include a numeric score (1-5) and optional text review
- ✅ Helper profiles automatically display average rating and total rating count
- ✅ Only the request owner can rate their helper
- ✅ Requests can only be rated after status is "completed"
- ✅ Each request can only be rated once
- ✅ Users can update or delete their own ratings
- ✅ JWT-based authentication protects rating endpoints

## Database Schema

### User Model Updates
Added to existing `User` model:
```javascript
{
  averageRating: Number (0-5, default: 0),
  ratingCount: Number (default: 0)
}
```

### Rating Model
```javascript
{
  helper: ObjectId (ref: User),        // The helper being rated
  rater: ObjectId (ref: User),         // The user giving the rating
  request: ObjectId (ref: Request),    // The related request
  score: Number (1-5, required),       // Rating score
  review: String (max 500 chars),      // Optional review text
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `{ request: 1 }` - unique (one rating per request)
- `{ request: 1, rater: 1 }` - unique compound index
- `{ helper: 1, createdAt: -1 }` - for querying helper ratings

## API Endpoints

### 1. Create a Rating
**POST** `/api/ratings`

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "requestId": "507f1f77bcf86cd799439011",
  "score": 5,
  "review": "Great helper! Very professional and quick."
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Rating created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "helper": {
      "_id": "507f1f77bcf86cd799439013",
      "username": "john_helper",
      "email": "john@example.com"
    },
    "rater": {
      "_id": "507f1f77bcf86cd799439014",
      "username": "jane_user",
      "email": "jane@example.com"
    },
    "request": {
      "_id": "507f1f77bcf86cd799439011",
      "problemType": "flat_tire",
      "description": "Need help with flat tire"
    },
    "score": 5,
    "review": "Great helper! Very professional and quick.",
    "createdAt": "2025-11-20T10:30:00.000Z",
    "updatedAt": "2025-11-20T10:30:00.000Z"
  }
}
```

**Error Responses:**
- `400` - Missing required fields or invalid score
- `400` - Request not completed yet
- `403` - User is not the request owner
- `404` - Request not found
- `409` - Request already rated

---

### 2. Get Ratings for a Helper
**GET** `/api/users/:id/ratings`

**Authentication:** Not required (public)

**Query Parameters:**
- `page` (optional, default: 1) - Page number
- `limit` (optional, default: 10, max: 100) - Items per page

**Success Response (200):**
```json
{
  "success": true,
  "message": "Ratings retrieved successfully",
  "data": {
    "helper": {
      "id": "507f1f77bcf86cd799439013",
      "username": "john_helper",
      "averageRating": 4.75,
      "ratingCount": 8
    },
    "ratings": [
      {
        "_id": "507f1f77bcf86cd799439012",
        "rater": {
          "_id": "507f1f77bcf86cd799439014",
          "username": "jane_user"
        },
        "request": {
          "_id": "507f1f77bcf86cd799439011",
          "problemType": "flat_tire",
          "createdAt": "2025-11-20T10:00:00.000Z"
        },
        "score": 5,
        "review": "Great helper! Very professional and quick.",
        "createdAt": "2025-11-20T10:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalCount": 8,
      "limit": 10,
      "hasNextPage": false,
      "hasPrevPage": false
    }
  }
}
```

---

### 3. Get a Specific Rating
**GET** `/api/ratings/:id`

**Authentication:** Not required (public)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Rating retrieved successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "helper": {
      "_id": "507f1f77bcf86cd799439013",
      "username": "john_helper",
      "email": "john@example.com",
      "averageRating": 4.75,
      "ratingCount": 8
    },
    "rater": {
      "_id": "507f1f77bcf86cd799439014",
      "username": "jane_user"
    },
    "request": {
      "_id": "507f1f77bcf86cd799439011",
      "problemType": "flat_tire",
      "description": "Need help with flat tire",
      "status": "completed"
    },
    "score": 5,
    "review": "Great helper! Very professional and quick.",
    "createdAt": "2025-11-20T10:30:00.000Z",
    "updatedAt": "2025-11-20T10:30:00.000Z"
  }
}
```

---

### 4. Update a Rating
**PUT** `/api/ratings/:id`

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "score": 4,
  "review": "Updated review text"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Rating updated successfully",
  "data": {
    // ... updated rating object
  }
}
```

**Error Responses:**
- `400` - Invalid score
- `403` - User is not the rating owner
- `404` - Rating not found

---

### 5. Delete a Rating
**DELETE** `/api/ratings/:id`

**Authentication:** Required (Bearer token)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Rating deleted successfully"
}
```

**Error Responses:**
- `403` - User is not the rating owner
- `404` - Rating not found

---

## Usage Flow

### 1. Complete a Request
```javascript
// Request must be marked as completed first
// This is done through the existing request management system
```

### 2. User Rates the Helper
```javascript
const token = localStorage.getItem('token');

const response = await fetch('http://localhost:3001/api/ratings', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    requestId: '507f1f77bcf86cd799439011',
    score: 5,
    review: 'Excellent service!'
  })
});

const data = await response.json();
console.log(data);
```

### 3. View Helper Ratings (Public)
```javascript
const helperId = '507f1f77bcf86cd799439013';
const response = await fetch(`http://localhost:3001/api/users/${helperId}/ratings?page=1&limit=10`);

const data = await response.json();
console.log('Average Rating:', data.data.helper.averageRating);
console.log('Total Ratings:', data.data.helper.ratingCount);
console.log('Ratings:', data.data.ratings);
```

### 4. Update a Rating
```javascript
const token = localStorage.getItem('token');
const ratingId = '507f1f77bcf86cd799439012';

const response = await fetch(`http://localhost:3001/api/ratings/${ratingId}`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    score: 4,
    review: 'Updated: Good service'
  })
});

const data = await response.json();
```

## Authorization Rules

1. **Creating a rating:**
   - User must be authenticated
   - User must be the owner of the request (the one who asked for help)
   - Request must have status "completed"
   - Request must not already have a rating

2. **Updating a rating:**
   - User must be authenticated
   - User must be the owner of the rating (the one who created it)

3. **Deleting a rating:**
   - User must be authenticated
   - User must be the owner of the rating

4. **Viewing ratings:**
   - No authentication required (public endpoint)

## Automatic Updates

When a rating is created, updated, or deleted:
1. The system automatically recalculates the helper's average rating
2. Updates the helper's `averageRating` field (rounded to 2 decimal places)
3. Updates the helper's `ratingCount` field

## Validation Rules

- **Score:** Must be an integer between 1 and 5 (inclusive)
- **Review:** Optional, maximum 500 characters
- **Request Status:** Must be "completed" to be rated
- **Uniqueness:** Each request can only have one rating

## Error Handling

All endpoints follow the consistent error response format:
```json
{
  "success": false,
  "message": "Error description"
}
```

Common HTTP status codes:
- `200` - Success (GET, PUT, DELETE)
- `201` - Created (POST)
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate rating)
- `500` - Server Error

## Integration with Existing Systems

### User Model
The existing User model has been extended with:
- `averageRating` (Number, 0-5)
- `ratingCount` (Number)

These fields are automatically managed by the rating system.

### Request Model
No changes required to the Request model. The rating system references the existing Request model through the `request` field in ratings.

### Authentication
Uses the existing `authMiddleware.js` which sets `req.userId` from the JWT token.

## Testing the API

You can test the endpoints using tools like Postman, curl, or from the frontend:

### Example curl commands:

**Create a rating:**
```bash
curl -X POST http://localhost:3001/api/ratings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "requestId": "507f1f77bcf86cd799439011",
    "score": 5,
    "review": "Excellent helper!"
  }'
```

**Get helper ratings:**
```bash
curl http://localhost:3001/api/users/507f1f77bcf86cd799439013/ratings?page=1&limit=10
```

## Frontend Integration Tips

### Display Helper Rating in UI
```jsx
function HelperProfile({ helperId }) {
  const [helperData, setHelperData] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/users/${helperId}/ratings`)
      .then(res => res.json())
      .then(data => setHelperData(data.data));
  }, [helperId]);

  if (!helperData) return <div>Loading...</div>;

  return (
    <div>
      <h2>{helperData.helper.username}</h2>
      <div>
        ⭐ {helperData.helper.averageRating.toFixed(2)} 
        ({helperData.helper.ratingCount} ratings)
      </div>
    </div>
  );
}
```

### Rating Form Component
```jsx
function RatingForm({ requestId, onSubmit }) {
  const [score, setScore] = useState(5);
  const [review, setReview] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE}/api/ratings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ requestId, score, review })
    });

    const data = await response.json();
    if (data.success) {
      onSubmit(data.data);
    } else {
      alert(data.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Score (1-5):
        <input 
          type="number" 
          min="1" 
          max="5" 
          value={score}
          onChange={(e) => setScore(parseInt(e.target.value))}
        />
      </label>
      <label>
        Review (optional):
        <textarea 
          value={review}
          onChange={(e) => setReview(e.target.value)}
          maxLength={500}
        />
      </label>
      <button type="submit">Submit Rating</button>
    </form>
  );
}
```

## Notes

- The rating system is fully integrated with the existing authentication and authorization infrastructure
- All routes follow RESTful conventions
- The code reuses existing patterns from `userController.js` and `requestsController.js`
- Helper ratings are automatically kept in sync when ratings are created, updated, or deleted
- The system prevents duplicate ratings per request using database-level unique indexes
