# 🎛️ Admin Dashboard System

> Complete admin panel with dark theme UI, analytics, and management tools

## ✨ Features

### 📊 Dashboard Overview
- **5 Real-time Statistics Cards**
  - Total Users
  - Active Requests  
  - Finished Requests
  - Open Reports
  - Total Transaction Volume

- **2 Dynamic Charts**
  - Bar Chart: User growth (last 12 months)
  - Pie Chart: Request type distribution

### 👥 User Management
- View all registered users
- Search by username/email
- See user ratings, balance, verification status
- Identify admin vs regular users

### 📋 Request Management
- Monitor all help requests
- Track request status (active, pending, finished, cancelled)
- View requester and helper details
- Filter by problem type

### 💳 Transaction Management
- Complete transaction history
- Transaction types: deposits, withdrawals, payments, refunds
- Amount tracking with color coding (+/-)
- Filter by user or transaction type

### 🚨 Report Management
- View user reports and complaints
- **Action Buttons:**
  - Mark as "In Review"
  - Close report
- Track report status
- See reporter and reported user details

## 🔒 Access Control

### Admin Role Assignment
```javascript
// Automatic admin role if email matches
ADMIN_EMAIL=admin@myproject.com
```

### Protection Layers
1. **Backend Middleware**: `authMiddleware` + `adminOnly`
2. **Frontend Guard**: Route protection in `AdminLayout`
3. **JWT Verification**: Token-based authentication

## 🎨 Design

### Dark Theme
```
Primary: #0f172a, #1e293b, #334155
Accent: Purple/Indigo gradients
```

### UI Components
- **Sidebar Navigation** (responsive)
- **Search Bars** on all tables
- **Pagination** for large datasets
- **Status Badges** with color coding
- **Action Buttons** for quick actions

### Responsive Design
- ✅ Desktop (1920px+)
- ✅ Laptop (1024px+)
- ✅ Tablet (768px+)
- ✅ Mobile (375px+)

## 🗂️ File Structure

### Backend
```
server/api/
├── controllers/adminController.js  ← Stats & data aggregation
├── routers/adminRouter.js          ← Protected admin routes
├── authMiddleware.js               ← adminOnly middleware
└── models/
    ├── userModel.js               ← + role field
    └── reportModel.js             ← + in_review, closed status
```

### Frontend
```
client/src/
├── pages/Admin/
│   ├── AdminLayout.jsx            ← Layout with sidebar
│   ├── AdminDashboard.jsx         ← Main dashboard view
│   ├── UsersTable.jsx             ← User management
│   ├── RequestsTable.jsx          ← Request management
│   ├── TransactionsTable.jsx      ← Transaction management
│   └── ReportsTable.jsx           ← Report management
└── components/Admin/
    ├── UsersBarChart.jsx          ← Recharts bar chart
    └── SourcesPieChart.jsx        ← Recharts pie chart
```

## 🚀 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/admin/overview` | GET | Dashboard stats & charts |
| `/api/admin/users` | GET | User list + pagination |
| `/api/admin/requests` | GET | Request list + pagination |
| `/api/admin/transactions` | GET | Transaction list + pagination |
| `/api/admin/reports` | GET | Report list + pagination |
| `/api/admin/reports/:id` | PATCH | Update report status |
| `/api/admin/stats` | GET | Additional statistics |

## 📦 Dependencies

```json
{
  "recharts": "^2.x.x",      // Charts
  "lucide-react": "^0.x.x"   // Icons (Search, Users, etc.)
}
```

## ⚡ Quick Setup

```bash
# 1. Set admin email in server/.env
ADMIN_EMAIL=your-email@example.com

# 2. Start server
cd server && node app.js

# 3. Start client
cd client && npm run dev

# 4. Register with admin email
# 5. Access /admin route
```

## 📸 UI Preview

```
┌──────────────────────────────────────────────────┐
│  Admin Panel                    admin@email.com  │
├──────────────────────────────────────────────────┤
│ Dashboard      │  ┌─────┐ ┌─────┐ ┌─────┐       │
│ Users          │  │ 150 │ │ 12  │ │ 340 │       │
│ Requests       │  └─────┘ └─────┘ └─────┘       │
│ Transactions   │  Users   Active  Finished       │
│ Reports        │                                 │
│                │  ┌─────────────┐ ┌───────────┐ │
│                │  │ Bar Chart   │ │ Pie Chart │ │
│ Logout         │  └─────────────┘ └───────────┘ │
└──────────────────────────────────────────────────┘
```

## 🎯 Usage Examples

### Check Dashboard Stats
```javascript
// GET /api/admin/overview
{
  "counters": {
    "totalUsers": 150,
    "activeRequests": 12,
    "finishedRequests": 340,
    "openReports": 3,
    "totalVolume": 12450.50
  }
}
```

### Update Report Status
```javascript
// PATCH /api/admin/reports/:id
{
  "status": "in_review",
  "reviewNotes": "Looking into this issue"
}
```

## 🛡️ Security Features

- ✅ JWT token verification
- ✅ Role-based access control
- ✅ Environment-based admin email
- ✅ Protected API endpoints
- ✅ Frontend route guards
- ✅ Secure password handling

## 📚 Documentation

- **Full Guide**: `ADMIN_DASHBOARD.md`
- **Quick Setup**: `ADMIN_QUICK_SETUP.md`
- **API Docs**: See controller files

## 🎨 Customization

### Change Colors
Edit Tailwind classes in admin components:
- `bg-slate-900/800/700` - backgrounds
- `bg-purple-600` - primary accent
- `bg-indigo-600` - secondary accent

### Add New Stats
Edit `adminController.js` > `getOverview()`:
```javascript
const newStat = await Model.countDocuments({ ... });
```

### Modify Charts
Edit chart components:
- `UsersBarChart.jsx` - bars, colors, axes
- `SourcesPieChart.jsx` - segments, colors, labels

## 🚨 Troubleshooting

| Issue | Solution |
|-------|----------|
| Can't access admin | Verify email matches `ADMIN_EMAIL` |
| Charts not showing | Check recharts installation |
| API 403 errors | Ensure logged in as admin |
| Data not loading | Check MongoDB connection |

## 🔮 Future Enhancements

- [ ] Ban/unban users
- [ ] Edit user details
- [ ] Delete requests
- [ ] Transaction refunds
- [ ] Export to CSV
- [ ] Real-time updates
- [ ] Admin activity logs
- [ ] Email notifications
- [ ] Advanced filters

---

**Built with:** Node.js, Express, MongoDB, React, Vite, TailwindCSS, Recharts

**Ready to use!** Follow the Quick Setup guide to get started.
