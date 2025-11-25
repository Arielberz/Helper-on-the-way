# Rating System - Testing Checklist

## Prerequisites
- [ ] Server running on port 3001
- [ ] Client running on port 5173 (or configured port)
- [ ] MongoDB connected
- [ ] Two test accounts created (User A and User B)

## Test Scenario: Complete Rating Flow

### Phase 1: Create and Complete a Request
- [ ] **User A**: Login
- [ ] **User A**: Create help request
  - Problem type: "Flat Tire"
  - Location: Any address
  - Status should be: "pending"
- [ ] **User B**: Login
- [ ] **User B**: View map, see User A's request
- [ ] **User B**: Assign self as helper
  - Request status → "assigned"
- [ ] **User B**: Update status to "in_progress"
- [ ] **User B**: Update status to "completed"

### Phase 2: Submit Rating
- [ ] **User A**: Go to Profile page
- [ ] **User A**: Scroll to "הפעילות שלי" section
- [ ] **User A**: Find the completed request
- [ ] **User A**: Verify yellow "דרג את העוזר" button appears
- [ ] **User A**: Click rating button
- [ ] **User A**: RatingModal opens
- [ ] **User A**: Click on 5th star (מצוין!)
- [ ] **User A**: Type review: "שירות מעולה, ממליץ בחום!"
- [ ] **User A**: Click "שלח דירוג"
- [ ] **User A**: See success message
- [ ] **User A**: Modal closes

### Phase 3: Verify Rating Display
- [ ] **User B**: Go to Profile page
- [ ] **User B**: See rating section shows:
  - [ ] 5.0 average rating
  - [ ] 5 golden stars (⭐⭐⭐⭐⭐)
  - [ ] "(1 דירוג)" text
  - [ ] "הצג דירוגים (1)" button
- [ ] **User B**: Click "הצג דירוגים"
- [ ] **User B**: Expandable list shows:
  - [ ] User A's username
  - [ ] Avatar circle with first letter
  - [ ] 5 stars
  - [ ] Review text
  - [ ] Date of rating
  - [ ] Problem type (Flat Tire)

### Phase 4: Test Restrictions
- [ ] **User A**: Try to rate same request again
  - [ ] Button should not appear (or show "כבר דירגת")
- [ ] **User B**: Try to rate their own help
  - [ ] Should not see rating button on helped requests
- [ ] **User A**: Create new pending request
  - [ ] No rating button (not completed)
- [ ] **User A**: Create completed request without helper
  - [ ] No rating button (no helper)

### Phase 5: Test Multiple Ratings
- [ ] Create second completed request
- [ ] **User A**: Rate with 4 stars and different review
- [ ] **User B**: Check profile shows:
  - [ ] Average: 4.5 stars
  - [ ] "(2 דירוגים)"
  - [ ] Two ratings in list
- [ ] Create third completed request
- [ ] **User A**: Rate with 3 stars
- [ ] **User B**: Verify average updates: (5+4+3)/3 = 4.0

### Phase 6: Test Edge Cases
- [ ] Test with no ratings (new user)
  - [ ] Should show "אין דירוגים"
  - [ ] No ratings list appears
- [ ] Test with very long review (500 chars)
  - [ ] Should accept full text
  - [ ] Display properly in list
- [ ] Test without review (optional field)
  - [ ] Should submit successfully
  - [ ] Review section empty in list
- [ ] Test rating without stars selected
  - [ ] Should show error: "אנא בחר דירוג"

## API Testing (Optional)

### Test with cURL or Postman

**Create Rating**
```bash
curl -X POST http://localhost:3001/api/ratings \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "requestId": "REQUEST_ID",
    "score": 5,
    "review": "Great service!"
  }'
```

**Get User Ratings**
```bash
curl http://localhost:3001/api/users/USER_ID/ratings
```

**Get Specific Rating**
```bash
curl http://localhost:3001/api/ratings/RATING_ID
```

## Expected Results

### Database Check
After creating ratings, verify in MongoDB:
```javascript
// Ratings collection should have:
{
  helper: ObjectId,
  rater: ObjectId,
  request: ObjectId,
  score: 5,
  review: "...",
  createdAt: Date,
  updatedAt: Date
}

// User document should have:
{
  averageRating: 4.5,
  ratingCount: 2
}
```

### Console Logs
Watch for:
- "Rating created successfully"
- "Rating retrieved successfully"
- Rating data in browser console
- No errors in server logs

## Common Issues & Solutions

### Button Doesn't Show
- Check request status is "completed"
- Verify helper is assigned
- Refresh profile page
- Check browser console for errors

### Rating Not Saving
- Check auth token in localStorage
- Verify server is running
- Check MongoDB connection
- Look for validation errors

### Average Not Updating
- Check `updateHelperRating()` function
- Verify MongoDB update query
- Check for calculation errors
- Refresh helper's profile

### Stars Not Clickable
- Check z-index (should be 1002)
- Verify modal is rendering
- Check onClick handlers
- Look for CSS conflicts

## Performance Testing

- [ ] Test with 100+ ratings per user
- [ ] Verify pagination works
- [ ] Check load times
- [ ] Test concurrent ratings

## Accessibility Testing

- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Focus states visible
- [ ] Error messages clear

## Mobile Testing

- [ ] Rating modal responsive
- [ ] Stars easy to tap
- [ ] Text input comfortable
- [ ] Layout doesn't break

---

## Sign-Off

- [ ] All basic tests pass ✅
- [ ] No console errors
- [ ] UI looks good
- [ ] Performance acceptable
- [ ] Ready for production

**Tested by:** _____________  
**Date:** _____________  
**Notes:** _____________
