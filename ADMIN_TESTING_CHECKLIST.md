# Admin Dashboard Testing Checklist

## Pre-Testing Setup
- [ ] Server `.env` file configured with `ADMIN_EMAIL`
- [ ] Server running on port 3001
- [ ] Client running on port 5173
- [ ] MongoDB connected

## Backend Tests

### Authentication & Authorization
- [ ] Regular user can register
- [ ] User with admin email gets `role: 'admin'`
- [ ] Regular user gets `role: 'user'`
- [ ] `/api/admin/*` routes return 401 without token
- [ ] `/api/admin/*` routes return 403 for non-admin users
- [ ] `/api/admin/*` routes return 200 for admin users

### Admin Endpoints
- [ ] `GET /api/admin/overview` returns stats and chart data
- [ ] `GET /api/admin/users` returns user list with pagination
- [ ] `GET /api/admin/requests` returns request list with pagination
- [ ] `GET /api/admin/transactions` returns transaction list with pagination
- [ ] `GET /api/admin/reports` returns report list with pagination
- [ ] `PATCH /api/admin/reports/:id` updates report status
- [ ] `GET /api/admin/stats` returns additional statistics

## Frontend Tests

### Route Protection
- [ ] `/admin` redirects non-admin to `/`
- [ ] `/admin` shows dashboard for admin
- [ ] `/admin/users` accessible by admin
- [ ] `/admin/requests` accessible by admin
- [ ] `/admin/transactions` accessible by admin
- [ ] `/admin/reports` accessible by admin

### Dashboard Page (`/admin`)
- [ ] Shows 5 statistic cards
- [ ] Cards display correct numbers
- [ ] Bar chart renders
- [ ] Pie chart renders
- [ ] Charts show data from API
- [ ] Loading state shows initially
- [ ] Error state shows if API fails

### Users Table (`/admin/users`)
- [ ] Table displays user list
- [ ] Search bar works
- [ ] Pagination buttons work
- [ ] Shows user avatars
- [ ] Shows user email, phone, rating
- [ ] Shows balance and role
- [ ] Shows verification status
- [ ] Previous/Next buttons disable appropriately

### Requests Table (`/admin/requests`)
- [ ] Table displays request list
- [ ] Search bar works
- [ ] Pagination works
- [ ] Shows requester info
- [ ] Shows helper info (if assigned)
- [ ] Status badges color-coded
- [ ] Shows price and date

### Transactions Table (`/admin/transactions`)
- [ ] Table displays transaction list
- [ ] Search bar works
- [ ] Pagination works
- [ ] Shows user info
- [ ] Transaction type badges color-coded
- [ ] Amount shows with +/- and color
- [ ] Shows status and date

### Reports Table (`/admin/reports`)
- [ ] Table displays report list
- [ ] Search bar works
- [ ] Pagination works
- [ ] Shows reporter and reported user
- [ ] Shows reason and description
- [ ] Status badges color-coded
- [ ] "Review" button shows for pending reports
- [ ] "Close" button shows for pending/in_review reports
- [ ] Clicking "Review" updates status to "in_review"
- [ ] Clicking "Close" updates status to "closed"
- [ ] Button disables while updating

### UI/UX
- [ ] Sidebar navigation works
- [ ] Active route highlighted in sidebar
- [ ] Logout button works
- [ ] Mobile menu (hamburger) works on small screens
- [ ] Overlay closes mobile menu
- [ ] All pages responsive on mobile
- [ ] Dark theme colors correct
- [ ] Purple/indigo accents present
- [ ] Icons display correctly
- [ ] Loading spinners show during data fetch

## Chart Tests

### Bar Chart
- [ ] Chart renders with data
- [ ] X-axis shows months
- [ ] Y-axis shows user count
- [ ] Bars are purple gradient
- [ ] Tooltip shows on hover
- [ ] Grid lines visible
- [ ] Responsive to container size

### Pie Chart
- [ ] Chart renders with data
- [ ] Segments colored correctly
- [ ] Percentages show inside segments
- [ ] Legend displays below chart
- [ ] Tooltip shows on hover
- [ ] Responsive to container size

## Error Handling

### Backend
- [ ] Invalid token returns 401
- [ ] Non-admin token returns 403
- [ ] Invalid report ID returns 404
- [ ] Invalid status value returns 400
- [ ] Database errors return 500

### Frontend
- [ ] No token redirects to login
- [ ] Non-admin role redirects to home
- [ ] API errors show error message
- [ ] Failed data fetch shows error state
- [ ] Network errors handled gracefully

## Security Tests

### Access Control
- [ ] Cannot access admin without login
- [ ] Cannot access admin with regular user account
- [ ] Admin email check case-insensitive
- [ ] JWT token required for all admin APIs
- [ ] Role checked on every admin API call

### Data Security
- [ ] Passwords not returned in API responses
- [ ] Sensitive user data protected
- [ ] Admin can only read data (no delete/ban yet)

## Performance Tests

- [ ] Dashboard loads in < 2 seconds
- [ ] Tables load in < 1 second
- [ ] Pagination response quick
- [ ] Search filters instantly
- [ ] Charts render smoothly
- [ ] No memory leaks on navigation

## Browser Compatibility

- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

## Responsive Design

### Desktop (1920px+)
- [ ] Sidebar always visible
- [ ] Charts side by side
- [ ] Tables full width
- [ ] No horizontal scroll

### Laptop (1024px+)
- [ ] Sidebar always visible
- [ ] Charts side by side
- [ ] Tables scroll if needed

### Tablet (768px+)
- [ ] Sidebar toggleable
- [ ] Charts stack vertically
- [ ] Tables scroll horizontally
- [ ] Stats cards 2 columns

### Mobile (375px+)
- [ ] Sidebar toggleable (hamburger)
- [ ] Charts stack vertically
- [ ] Tables scroll horizontally
- [ ] Stats cards 1 column
- [ ] All buttons tappable

## Edge Cases

- [ ] Empty data shows "No data available"
- [ ] Large datasets paginated correctly
- [ ] Search with no results shows message
- [ ] Charts with 1 data point render
- [ ] Charts with 100+ data points render
- [ ] Very long usernames truncate
- [ ] Very long descriptions truncate

## Integration Tests

- [ ] Create user → appears in admin users table
- [ ] Create request → appears in admin requests table
- [ ] Create transaction → appears in admin transactions table
- [ ] Create report → appears in admin reports table
- [ ] Update report → status changes in table
- [ ] Delete user → removed from users table (if delete implemented)

## Documentation

- [ ] ADMIN_QUICK_SETUP.md accurate
- [ ] ADMIN_DASHBOARD.md complete
- [ ] ADMIN_README.md helpful
- [ ] Code comments present
- [ ] API endpoints documented
- [ ] Environment variables documented

## Final Checks

- [ ] No console errors
- [ ] No console warnings
- [ ] No ESLint errors
- [ ] All dependencies installed
- [ ] .env.example created
- [ ] Git ignore updated (if needed)
- [ ] README updated with admin info

---

## Test Results

Date: _____________

Tested by: _____________

### Critical Issues Found:
- None / List issues

### Minor Issues Found:
- None / List issues

### Overall Status:
- [ ] All tests passed ✅
- [ ] Some tests failed ⚠️
- [ ] Major issues found ❌

### Notes:
_______________________________
_______________________________
_______________________________

---

## Quick Test Commands

### Test Admin API (replace TOKEN with actual JWT)
```bash
# Get overview
curl -H "Authorization: Bearer TOKEN" http://localhost:3001/api/admin/overview

# Get users
curl -H "Authorization: Bearer TOKEN" http://localhost:3001/api/admin/users

# Update report
curl -X PATCH -H "Authorization: Bearer TOKEN" -H "Content-Type: application/json" \
  -d '{"status":"in_review"}' http://localhost:3001/api/admin/reports/REPORT_ID
```

### Test Frontend Routes
```
http://localhost:5173/admin
http://localhost:5173/admin/users
http://localhost:5173/admin/requests
http://localhost:5173/admin/transactions
http://localhost:5173/admin/reports
```

### Create Test Data (in MongoDB)
```javascript
// Insert test users
db.users.insertMany([...]);

// Insert test requests
db.requests.insertMany([...]);

// Insert test reports
db.reports.insertMany([...]);
```

---

**Testing Tips:**
1. Test with both admin and regular user accounts
2. Test on multiple screen sizes
3. Test with empty database
4. Test with lots of data (1000+ records)
5. Test network failures (disconnect internet)
6. Test with slow 3G network
7. Check browser console for errors
8. Use browser dev tools Network tab
9. Monitor backend logs
10. Test all user flows end-to-end
