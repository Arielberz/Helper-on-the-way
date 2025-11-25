# Rating System - Quick Start Guide

## For Users Who Need Help (Requesters)

### Step 1: After Your Request is Completed
Go to your **Profile** page and scroll to "הפעילות שלי" (My Activity)

### Step 2: Find Completed Request
Look for requests with status "✅ הושלם" (Completed)

### Step 3: Click "דרג את העוזר" (Rate the Helper)
A yellow button will appear below completed requests

### Step 4: Rate Your Experience
- Click on stars (1-5) to select rating
- Optionally write a review
- Click "שלח דירוג" (Send Rating)

### Step 5: Done!
Your rating is now visible on the helper's profile

---

## For Helpers

### View Your Ratings
Go to your **Profile** page to see:
- ⭐ Your average rating (e.g., 4.8)
- Total number of ratings
- Click "הצג דירוגים" to see all reviews

### Each Rating Shows:
- Who rated you
- Star rating (1-5)
- Their written review
- Date of rating
- What problem you helped with

---

## Rating Scale (Hebrew)

| Stars | Label | English |
|-------|-------|---------|
| ⭐ | גרוע | Terrible |
| ⭐⭐ | לא טוב | Not Good |
| ⭐⭐⭐ | בסדר | Okay |
| ⭐⭐⭐⭐ | טוב | Good |
| ⭐⭐⭐⭐⭐ | מצוין! | Excellent! |

---

## Important Rules

✅ **Can Rate When:**
- Request status is "completed"
- Helper was assigned
- You are the requester (person who asked for help)

❌ **Cannot Rate:**
- Pending, assigned, or in-progress requests
- Requests without helper
- Requests you helped with (can't rate yourself)
- Same request twice (one rating per request)

---

## Technical Notes

### API Endpoints
- `POST /api/ratings` - Create rating
- `GET /api/users/:id/ratings` - View user's ratings
- `GET /api/ratings/:id` - Get specific rating

### Database
- Ratings stored in MongoDB
- Average calculated automatically
- Updates in real-time

### Frontend
- Beautiful modal interface
- RTL support (Hebrew)
- Form validation
- Success/error messages

---

## Troubleshooting

**"This request has already been rated"**
- You can only rate each request once
- Check if you already rated this helper

**"Only completed requests can be rated"**
- Wait for helper to mark request as completed

**Button doesn't appear**
- Refresh your profile page
- Make sure request status is "completed"
- Verify helper was assigned

**Rating doesn't show immediately**
- Try refreshing the page
- Check browser console for errors

---

## Example Flow

```
1. User A needs help → Creates request
2. User B accepts → Becomes helper
3. User B helps → Marks completed
4. User A sees button → "דרג את העוזר"
5. User A rates 5⭐ → Writes "Great service!"
6. User B's profile → Shows 5.0 average
7. Future users → See User B's high rating
```

This encourages quality service! 🚗✨
