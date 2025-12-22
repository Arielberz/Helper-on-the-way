# Admin Dashboard System Documentation

## Overview
This document describes the complete Admin Dashboard system implemented for the Helper on the Way project. The system provides comprehensive administrative control over users, requests, transactions, and reports.

## Features Implemented

### 1. Admin Access Control

#### Backend
- **User Model Updates** (`server/api/models/userModel.js`)
  - Added `role` field (enum: 'user', 'admin', default: 'user')
  
- **Admin Middleware** (`server/api/authMiddleware.js`)
  - `adminOnly` middleware: Verifies user has admin role
  - Returns 403 if user is not admin
  - Must be used after `authMiddleware`

- **User Registration** (`server/api/controllers/userController.js`)
  - Automatically assigns 'admin' role if email matches `ADMIN_EMAIL` from environment variables
  - Default admin email: `admin@myproject.com` (configurable via .env)
  - All other users get 'user' role

- **User Login** 
  - Returns user role in response
  - Role is stored in localStorage on frontend

#### Frontend
- **Route Protection** (`client/src/pages/Admin/AdminLayout.jsx`)
  - Checks if logged-in user has 'admin' role
  - Redirects to home page if not admin
  - Protects all admin routes

### 2. Admin Dashboard Design

#### Dark Theme with TailwindCSS
- Primary colors: `#0f172a` (slate-900), `#1e293b` (slate-800), `#334155` (slate-700)
- Purple/Indigo gradients for visual elements
- Fully responsive layout

#### Statistics Cards
Five main statistics displayed:
1. **Total Users** - Purple badge with Users icon
2. **Active Requests** - Blue badge with FileText icon
3. **Finished Requests** - Green badge with CheckCircle icon
4. **Open Reports** - Red badge with AlertCircle icon
5. **Total Volume** - Indigo badge with DollarSign icon (in $)

#### Charts
1. **Bar Chart** - User growth over the last 12 months
   - X-axis: Month (YYYY-MM format)
   - Y-axis: Number of users registered
   - Purple gradient bars
   
2. **Pie Chart** - Request types distribution
   - Shows breakdown by problem type
   - Color-coded segments
   - Percentage labels

#### Sidebar Navigation
- Dashboard (home)
- Users
- Requests
- Transactions
- Reports
- Logout button

### 3. Backend API Endpoints

All admin routes are protected with `authMiddleware` and `adminOnly` middleware.

#### Admin Router (`server/api/routers/adminRouter.js`)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/overview` | GET | Dashboard statistics and chart data |
| `/api/admin/users` | GET | List all users with pagination |
| `/api/admin/requests` | GET | List all requests with pagination |
| `/api/admin/transactions` | GET | List all transactions with pagination |
| `/api/admin/reports` | GET | List all reports with pagination |
| `/api/admin/reports/:id` | PATCH | Update report status |
| `/api/admin/stats` | GET | Additional statistics |

#### Overview Endpoint Response
```json
{
  "success": true,
  "message": "Dashboard overview retrieved",
  "data": {
    "counters": {
      "totalUsers": 150,
      "activeRequests": 12,
      "finishedRequests": 340,
      "openReports": 3,
      "totalVolume": 12450.50
    },
    "barData": [
      { "month": "2024-01", "count": 15 },
      { "month": "2024-02", "count": 23 }
    ],
    "pieData": [
      { "name": "car_trouble", "value": 45 },
      { "name": "flat_tire", "value": 32 }
    ]
  }
}
```

### 4. Frontend Components

#### Admin Layout (`client/src/pages/Admin/AdminLayout.jsx`)
- Sidebar navigation
- Mobile responsive with hamburger menu
- User email display
- Logout functionality
- Route protection logic

#### Admin Dashboard (`client/src/pages/Admin/AdminDashboard.jsx`)
- Fetches data from `/api/admin/overview`
- Displays 5 statistic cards
- Shows bar chart and pie chart
- Loading and error states

#### Chart Components
1. **UsersBarChart.jsx** - Recharts bar chart with purple gradient
2. **SourcesPieChart.jsx** - Recharts pie chart with multiple colors

#### Table Pages
1. **UsersTable.jsx**
   - Search by username or email
   - Displays avatar, email, phone, rating, balance, role, verification status
   - Pagination controls
   
2. **RequestsTable.jsx**
   - Search by username or problem type
   - Shows requester, helper, status, price, date
   - Color-coded status badges
   - Pagination controls
   
3. **TransactionsTable.jsx**
   - Search by username or type
   - Shows user, type, amount, status, date, description
   - Color-coded transaction types
   - Pagination controls
   
4. **ReportsTable.jsx**
   - Search by reported user or reason
   - Shows reporter, reported user, reason, status, date
   - Action buttons: "Review" and "Close"
   - Updates report status via API
   - Pagination controls

### 5. Report Management

#### Report Model Updates (`server/api/models/reportModel.js`)
- Added status values: `in_review`, `closed`
- Status enum: ['pending', 'in_review', 'closed', 'reviewed', 'resolved', 'dismissed']

#### Report Status Workflow
1. **Pending** - Initial state when report is created
2. **In Review** - Admin is reviewing the report
3. **Closed** - Report has been resolved/handled

#### Update Report Endpoint
```javascript
PATCH /api/admin/reports/:id
Body: {
  "status": "in_review" | "closed",
  "reviewNotes": "Optional notes"
}
```

### 6. Dependencies Installed

```json
{
  "recharts": "^2.x.x",    // For charts
  "lucide-react": "^0.x.x"  // For icons
}
```

## Setup Instructions

### 1. Configure Admin Email

Edit `server/.env` file:
```env
ADMIN_EMAIL=your-admin-email@example.com
```

### 2. Register Admin User

1. Go to registration page
2. Register with the email specified in `ADMIN_EMAIL`
3. User will automatically get 'admin' role
4. Verify email as normal

### 3. Access Admin Dashboard

1. Login with admin account
2. Navigate to `/admin` route
3. You should see the admin dashboard

## File Structure

```
server/
├── api/
│   ├── models/
│   │   ├── userModel.js         (+ role field)
│   │   └── reportModel.js       (+ in_review, closed statuses)
│   ├── controllers/
│   │   ├── userController.js    (+ admin role assignment)
│   │   └── adminController.js   (NEW)
│   ├── routers/
│   │   └── adminRouter.js       (NEW)
│   └── authMiddleware.js        (+ adminOnly middleware)
├── app.js                       (+ admin router)
└── .env.example                 (+ ADMIN_EMAIL)

client/
├── src/
│   ├── pages/
│   │   └── Admin/
│   │       ├── AdminLayout.jsx       (NEW)
│   │       ├── AdminDashboard.jsx    (NEW)
│   │       ├── UsersTable.jsx        (NEW)
│   │       ├── RequestsTable.jsx     (NEW)
│   │       ├── TransactionsTable.jsx (NEW)
│   │       └── ReportsTable.jsx      (NEW)
│   ├── components/
│   │   └── Admin/
│   │       ├── UsersBarChart.jsx     (NEW)
│   │       └── SourcesPieChart.jsx   (NEW)
│   └── app.jsx                  (+ admin routes)
└── package.json                 (+ recharts, lucide-react)
```

## Security Considerations

1. **Role-Based Access Control**
   - Admin role verified on both frontend and backend
   - Frontend redirects unauthorized users
   - Backend returns 403 for unauthorized API calls

2. **JWT Authentication**
   - All admin routes require valid JWT token
   - Token verified by `authMiddleware` before role check

3. **Admin Email Configuration**
   - Admin email stored in environment variables (not in code)
   - Easy to change without code modifications

4. **API Endpoint Protection**
   - All admin endpoints use `authMiddleware` + `adminOnly`
   - Prevents unauthorized access to sensitive data

## Customization

### Change Admin Email
1. Update `ADMIN_EMAIL` in server `.env` file
2. Register a new user with that email
3. User will automatically get admin role

### Add More Admin Roles
1. Update User model to add more role types
2. Modify `adminOnly` middleware to check for multiple roles
3. Add role-specific permissions as needed

### Customize Dashboard Stats
Edit `adminController.js` > `getOverview()` function to:
- Add new counters
- Modify chart data queries
- Add custom aggregations

### Modify Chart Appearance
Edit chart components:
- `UsersBarChart.jsx` - Change colors, axes, tooltips
- `SourcesPieChart.jsx` - Change colors, labels, legend

## Troubleshooting

### Admin user not getting admin role
- Check `ADMIN_EMAIL` in `.env` file
- Ensure email in registration matches exactly (case-insensitive)
- Check server logs for role assignment

### Admin routes returning 403
- Verify user role in localStorage
- Check JWT token is valid
- Ensure `adminOnly` middleware is applied to routes

### Charts not displaying
- Verify recharts is installed: `npm list recharts`
- Check browser console for errors
- Ensure data format matches chart expectations

### Dashboard data not loading
- Check API endpoint is accessible
- Verify MongoDB connection
- Check network tab for API errors
- Ensure models (User, Request, Transaction, Report) exist

## API Testing

Use these example requests to test admin endpoints:

### Get Dashboard Overview
```bash
curl -X GET http://localhost:3001/api/admin/overview \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"
```

### Get Users List
```bash
curl -X GET "http://localhost:3001/api/admin/users?page=1&limit=20" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"
```

### Update Report Status
```bash
curl -X PATCH http://localhost:3001/api/admin/reports/REPORT_ID \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "in_review"}'
```

## Future Enhancements

Potential improvements:
1. User management (ban/unban users)
2. Edit user details
3. Delete/cancel requests
4. Transaction refunds
5. Report notes and history
6. Email notifications to users
7. Export data to CSV/Excel
8. Advanced filtering and sorting
9. Real-time updates via WebSockets
10. Admin activity logs

## Support

For issues or questions:
1. Check this documentation
2. Review API responses for error messages
3. Check server logs
4. Verify environment configuration
