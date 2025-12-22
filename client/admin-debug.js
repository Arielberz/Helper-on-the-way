/**
 * Admin Debug Helper
 * 
 * Open browser console and run this to check your admin status:
 * 1. Copy all code below
 * 2. Paste into browser console (F12)
 * 3. Press Enter
 */

console.log('=== ADMIN DEBUG INFO ===');
console.log('');

// Check if logged in
const token = localStorage.getItem('token');
const userStr = localStorage.getItem('user');

console.log('1. Authentication Status:');
console.log('   Token exists:', !!token);
console.log('   Token:', token ? token.substring(0, 20) + '...' : 'NOT FOUND');
console.log('');

// Check user data
console.log('2. User Data:');
if (userStr) {
  try {
    const user = JSON.parse(userStr);
    console.log('   User object:', user);
    console.log('   Username:', user.username);
    console.log('   Email:', user.email);
    console.log('   Role:', user.role);
    console.log('   User ID:', user.id);
    console.log('');
    
    console.log('3. Admin Access Check:');
    if (user.role === 'admin') {
      console.log('   ✅ You have admin role!');
      console.log('   You should be able to access /admin');
    } else {
      console.log('   ❌ You do NOT have admin role');
      console.log('   Current role:', user.role || 'undefined');
      console.log('');
      console.log('   SOLUTION:');
      console.log('   1. Make sure you registered with: info.helperontheway@gmail.com');
      console.log('   2. The backend must have ADMIN_EMAIL=info.helperontheway@gmail.com in .env');
      console.log('   3. You may need to re-register with this email');
      console.log('   4. After registration, the role should be "admin"');
    }
  } catch (e) {
    console.error('   Error parsing user data:', e);
  }
} else {
  console.log('   ❌ No user data found in localStorage');
  console.log('   Please log in first');
}

console.log('');
console.log('4. Current Location:');
console.log('   Path:', window.location.pathname);
console.log('');

console.log('======================');
console.log('');
console.log('To access admin dashboard:');
console.log('1. Make sure your role is "admin" (see above)');
console.log('2. Navigate to: /admin');
console.log('3. If redirected, your account is not admin');
