# Postman Requests for Rating System

## Setup Instructions

1. **Import Collection**: Import `Postman_Rating_System.json` into Postman
2. **Set Base URL**: The collection uses `http://localhost:3001` by default
3. **Variables**: The collection automatically saves tokens and IDs for you

---

## Manual Request Examples (Copy & Paste)

### 1️⃣ Register a User (Get Token)

**Method:** `POST`  
**URL:** `http://localhost:3001/api/users/register`  
**Headers:**
```
Content-Type: application/json
```
**Body (raw JSON):**
```json
{
  "username": "testuser1",
  "email": "test1@example.com",
  "password": "password123",
  "phone": "+972501234567"
}
```

**Expected Response (201):**
```json
{
  "success": true,
  "message": "user registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "673d8e5f8a1b2c3d4e5f6789",
      "username": "testuser1",
      "email": "test1@example.com",
      "phone": "+972501234567"
    }
  }
}
```

> 📝 **Save the token!** You'll need it for authenticated requests.

---

### 2️⃣ Register a Helper User

**Method:** `POST`  
**URL:** `http://localhost:3001/api/users/register`  
**Headers:**
```
Content-Type: application/json
```
**Body (raw JSON):**
```json
{
  "username": "helperuser",
  "email": "helper@example.com",
  "password": "password123",
  "phone": "+972509876543"
}
```

> 📝 **Save the helper's user ID** from the response - you'll need it to query their ratings.

---

### 3️⃣ Login

**Method:** `POST`  
**URL:** `http://localhost:3001/api/users/login`  
**Headers:**
```
Content-Type: application/json
```
**Body (raw JSON):**
```json
{
  "identifier": "test1@example.com",
  "password": "password123"
}
```

---

### 4️⃣ Create a Rating

**Method:** `POST`  
**URL:** `http://localhost:3001/api/ratings`  
**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN_HERE
```
**Body (raw JSON):**
```json
{
  "requestId": "673d8e5f8a1b2c3d4e5f6abc",
  "score": 5,
  "review": "Excellent helper! Very professional and arrived quickly. Highly recommended!"
}
```

**Prerequisites:**
- ✅ Request must exist
- ✅ Request status must be "completed"
- ✅ You must be the owner of the request (not the helper)
- ✅ Request must have a helper assigned
- ✅ Request hasn't been rated yet

**Expected Response (201):**
```json
{
  "success": true,
  "message": "Rating created successfully",
  "data": {
    "_id": "673d9a1b2c3d4e5f67890abc",
    "helper": {
      "_id": "673d8e5f8a1b2c3d4e5f6789",
      "username": "helperuser",
      "email": "helper@example.com"
    },
    "rater": {
      "_id": "673d8e5f8a1b2c3d4e5f678a",
      "username": "testuser1",
      "email": "test1@example.com"
    },
    "request": {
      "_id": "673d8e5f8a1b2c3d4e5f6abc",
      "problemType": "flat_tire",
      "description": "Need help with flat tire"
    },
    "score": 5,
    "review": "Excellent helper! Very professional...",
    "createdAt": "2025-11-20T10:30:00.000Z",
    "updatedAt": "2025-11-20T10:30:00.000Z"
  }
}
```

---

### 5️⃣ Get All Ratings for a Helper

**Method:** `GET`  
**URL:** `http://localhost:3001/api/users/673d8e5f8a1b2c3d4e5f6789/ratings?page=1&limit=10`  
**Headers:** None (public endpoint)

**Query Parameters:**
- `page` (optional, default: 1)
- `limit` (optional, default: 10, max: 100)

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Ratings retrieved successfully",
  "data": {
    "helper": {
      "id": "673d8e5f8a1b2c3d4e5f6789",
      "username": "helperuser",
      "averageRating": 4.75,
      "ratingCount": 8
    },
    "ratings": [
      {
        "_id": "673d9a1b2c3d4e5f67890abc",
        "rater": {
          "_id": "673d8e5f8a1b2c3d4e5f678a",
          "username": "testuser1"
        },
        "request": {
          "_id": "673d8e5f8a1b2c3d4e5f6abc",
          "problemType": "flat_tire",
          "createdAt": "2025-11-20T10:00:00.000Z"
        },
        "score": 5,
        "review": "Excellent helper!",
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

### 6️⃣ Get a Specific Rating by ID

**Method:** `GET`  
**URL:** `http://localhost:3001/api/ratings/673d9a1b2c3d4e5f67890abc`  
**Headers:** None (public endpoint)

---

### 7️⃣ Update a Rating

**Method:** `PUT`  
**URL:** `http://localhost:3001/api/ratings/673d9a1b2c3d4e5f67890abc`  
**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN_HERE
```
**Body (raw JSON):**
```json
{
  "score": 4,
  "review": "Updated: Good service, but could be faster."
}
```

**Note:** You can update just the score, just the review, or both.

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Rating updated successfully",
  "data": {
    // ... updated rating object
  }
}
```

---

### 8️⃣ Delete a Rating

**Method:** `DELETE`  
**URL:** `http://localhost:3001/api/ratings/673d9a1b2c3d4e5f67890abc`  
**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Rating deleted successfully"
}
```

---

## Error Response Examples

### Missing Token (401)
```json
{
  "success": false,
  "message": "Access denied. No token provided."
}
```

### Invalid Score (400)
```json
{
  "success": false,
  "message": "Score must be an integer between 1 and 5"
}
```

### Request Not Completed (400)
```json
{
  "success": false,
  "message": "Only completed requests can be rated"
}
```

### Not Request Owner (403)
```json
{
  "success": false,
  "message": "Only the request owner can rate the helper"
}
```

### Already Rated (409)
```json
{
  "success": false,
  "message": "This request has already been rated. Use update to modify the rating."
}
```

### Rating Not Found (404)
```json
{
  "success": false,
  "message": "Rating not found"
}
```

---

## Testing Flow

### Complete Testing Sequence:

1. **Register User 1** (request owner)
2. **Register User 2** (helper)
3. **Create a Request** as User 1
4. **Assign User 2** as helper to the request
5. **Mark Request as Completed**
6. **Login as User 1**
7. **Create Rating** for User 2 (helper)
8. **Get Ratings** for User 2 (check averageRating)
9. **Update Rating** (change score/review)
10. **Get Ratings Again** (verify averageRating updated)
11. **Delete Rating** (optional)

---

## Quick Test URLs (Replace IDs)

```bash
# Create Rating
POST http://localhost:3001/api/ratings

# Get helper ratings
GET http://localhost:3001/api/users/HELPER_ID_HERE/ratings

# Get specific rating
GET http://localhost:3001/api/ratings/RATING_ID_HERE

# Update rating
PUT http://localhost:3001/api/ratings/RATING_ID_HERE

# Delete rating
DELETE http://localhost:3001/api/ratings/RATING_ID_HERE
```

---

## Environment Variables

If using Postman Environment, set these:

| Variable | Example Value |
|----------|---------------|
| `base_url` | `http://localhost:3001` |
| `token` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `user_id` | `673d8e5f8a1b2c3d4e5f678a` |
| `helper_id` | `673d8e5f8a1b2c3d4e5f6789` |
| `request_id` | `673d8e5f8a1b2c3d4e5f6abc` |
| `rating_id` | `673d9a1b2c3d4e5f67890abc` |

Then use: `{{base_url}}/api/ratings` in your requests.

---

## Tips

✅ **Always save your token** after login/register  
✅ **Use the collection variables** for automatic ID management  
✅ **Test error cases** to ensure validation works  
✅ **Check helper's averageRating** after each rating  
✅ **Verify pagination** works with multiple ratings  

---

## Need Help?

Check `RATING_SYSTEM.md` for complete API documentation.
