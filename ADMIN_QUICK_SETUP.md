# Admin Dashboard - Quick Setup Guide

## 🚀 Quick Start (5 minutes)

### Step 1: Configure Environment
1. Copy the example environment file:
   ```bash
   cd server
   cp .env.example .env
   ```

2. Edit `.env` and set your admin email:
   ```env
   ADMIN_EMAIL=your-admin-email@example.com
   ```

### Step 2: Install Dependencies
```bash
# Install server dependencies (if not already done)
cd server
npm install

# Install client dependencies (recharts & lucide-react already installed)
cd ../client
npm install
```

### Step 3: Start the Application
```bash
# Terminal 1 - Start server
cd server
node app.js

# Terminal 2 - Start client
cd client
npm run dev
```

### Step 4: Create Admin Account
1. Open browser to `http://localhost:5173/register`
2. Register with the email you set in `ADMIN_EMAIL`
3. Verify your email (check your inbox for verification code)
4. Login with your admin credentials

### Step 5: Access Admin Dashboard
1. After logging in, navigate to: `http://localhost:5173/admin`
2. You should see the admin dashboard! 🎉

## 📊 What You'll See

### Dashboard View (`/admin`)
- 5 Statistics Cards (Users, Requests, Reports, etc.)
- Bar Chart showing user growth
- Pie Chart showing request type distribution

### Users View (`/admin/users`)
- Complete list of all users
- Search functionality
- User details: avatar, email, phone, rating, balance, role, verification status
- Pagination

### Requests View (`/admin/requests`)
- All help requests
- Requester and helper info
- Status badges
- Search and pagination

### Transactions View (`/admin/transactions`)
- Financial transactions
- User details
- Transaction types and amounts
- Search and pagination

### Reports View (`/admin/reports`)
- User reports
- Action buttons: Mark as "In Review" or "Close"
- Reporter and reported user info
- Search and pagination

## 🎨 UI Features

- **Dark theme** with purple/indigo accents
- **Responsive design** - works on mobile, tablet, and desktop
- **Mobile sidebar** - hamburger menu on small screens
- **Real-time updates** - data refreshes on each page load
- **Search functionality** - on all table pages
- **Pagination** - handles large datasets efficiently

## 🔒 Security

- ✅ Role-based access control
- ✅ JWT authentication required
- ✅ Backend API protection with middleware
- ✅ Frontend route protection
- ✅ Admin email configurable via environment

## ⚙️ Customization

### Change Admin Email
Simply update `ADMIN_EMAIL` in `server/.env` and register a new user with that email.

### Change Dashboard Colors
Edit the Tailwind classes in the admin components:
- Primary: `bg-slate-900`, `bg-slate-800`, `bg-slate-700`
- Accent: `bg-purple-600`, `bg-indigo-600`

### Add More Statistics
Edit `server/api/controllers/adminController.js` > `getOverview()` function.

### Customize Charts
Edit:
- `client/src/components/Admin/UsersBarChart.jsx`
- `client/src/components/Admin/SourcesPieChart.jsx`

## 🐛 Troubleshooting

### Can't access admin dashboard
- Make sure you registered with the exact email in `ADMIN_EMAIL`
- Check browser console for errors
- Verify JWT token in localStorage

### Charts not showing
- Clear browser cache
- Check that recharts is installed: `npm list recharts`
- Verify API data format

### API returns 403
- Make sure you're logged in as admin
- Check that `ADMIN_EMAIL` matches your account
- Verify JWT token is valid

## 📚 Full Documentation

See `ADMIN_DASHBOARD.md` for complete documentation including:
- Detailed API endpoints
- Database models
- Security considerations
- Future enhancements

## 🎯 What's Next?

You now have a fully functional admin dashboard! You can:
1. Monitor user activity
2. Track requests and transactions
3. Manage user reports
4. View analytics and statistics

For additional features or customization, refer to the full documentation.

---

**Need help?** Check the main documentation or review the code comments in the admin files.
