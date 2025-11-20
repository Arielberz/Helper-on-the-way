# cURL Commands for Rating System API

## 1. Register User (Get Token)

```bash
curl -X POST http://localhost:3001/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "phone": "+972501234567"
  }'
```

Save the token from response!

---

## 2. Login

```bash
curl -X POST http://localhost:3001/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "test@example.com",
    "password": "password123"
  }'
```

---

## 3. Create a Rating

```bash
curl -X POST http://localhost:3001/api/ratings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "requestId": "673d8e5f8a1b2c3d4e5f6abc",
    "score": 5,
    "review": "Excellent helper! Very professional."
  }'
```

---

## 4. Get All Ratings for a Helper

```bash
curl -X GET "http://localhost:3001/api/users/HELPER_ID_HERE/ratings?page=1&limit=10"
```

---

## 5. Get Specific Rating

```bash
curl -X GET http://localhost:3001/api/ratings/RATING_ID_HERE
```

---

## 6. Update Rating

```bash
curl -X PUT http://localhost:3001/api/ratings/RATING_ID_HERE \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "score": 4,
    "review": "Updated review text"
  }'
```

---

## 7. Delete Rating

```bash
curl -X DELETE http://localhost:3001/api/ratings/RATING_ID_HERE \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Pretty Print JSON (Add to any command)

```bash
curl ... | jq '.'
```

Or use Python:

```bash
curl ... | python -m json.tool
```

---

## Save Response to File

```bash
curl ... > response.json
```

---

## Show Response Headers

```bash
curl -i ...
```

---

## Verbose Output (Debug)

```bash
curl -v ...
```
