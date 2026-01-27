/*
  קובץ זה אחראי על:
  - דף debug למנהלים/מפתחים
  - כפתורי איפוס מטמון, מחיקת נתונים
  - כלים לבדיקה ותחזוקה

  הקובץ משמש את:
  - מפתחים לתחזוקה
  - אינו חשוף למשתמשים רגילים

  הקובץ אינו:
  - חלק מהמערכת הראשית - כלי עזר
  - מומלץ להסיר בפרודקשן
*/

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getToken } from '../../utils/authUtils';

function AdminDebugPage() {
  const [debugInfo, setDebugInfo] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = getToken();
    const userStr = localStorage.getItem('user');
    
    let user = null;
    if (userStr) {
      try {
        user = JSON.parse(userStr);
      } catch (e) {
        console.error('Error parsing user:', e);
      }
    }

    setDebugInfo({
      hasToken: !!token,
      token: token ? token.substring(0, 20) + '...' : 'NOT FOUND',
      user: user,
      currentPath: window.location.pathname,
    });
  }, []);

  if (!debugInfo) return <div className="p-8 text-white">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-900 p-8 text-white" dir="ltr">
      <h1 className="text-3xl font-bold mb-6">Admin Debug Information</h1>
      
      <div className="space-y-4 bg-slate-800 p-6 rounded-lg">
        <div>
          <h2 className="text-xl font-semibold mb-2">1. Authentication Status:</h2>
          <p>Token exists: <span className={debugInfo.hasToken ? 'text-green-400' : 'text-red-400'}>
            {debugInfo.hasToken ? '✅ YES' : '❌ NO'}
          </span></p>
          <p className="text-sm text-slate-400 mt-1">{debugInfo.token}</p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">2. User Information:</h2>
          {debugInfo.user ? (
            <div className="ml-4 space-y-1">
              <p>Username: <span className="text-blue-400">{debugInfo.user.username}</span></p>
              <p>Email: <span className="text-blue-400">{debugInfo.user.email}</span></p>
              <p>User ID: <span className="text-blue-400">{debugInfo.user.id}</span></p>
              <p>Role: <span className={debugInfo.user.role === 'admin' ? 'text-green-400 font-bold' : 'text-yellow-400'}>
                {debugInfo.user.role || 'undefined'}
              </span></p>
            </div>
          ) : (
            <p className="text-red-400">❌ No user data found</p>
          )}
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">3. Admin Access Check:</h2>
          {debugInfo.user?.role === 'admin' ? (
            <div className="text-green-400">
              <p>✅ You have admin role!</p>
              <p className="mt-2">You should be able to access the admin dashboard.</p>
            </div>
          ) : (
            <div className="text-red-400">
              <p>❌ You do NOT have admin role</p>
              <p className="mt-2">Current role: {debugInfo.user?.role || 'undefined'}</p>
              <div className="mt-4 bg-slate-700 p-4 rounded">
                <p className="font-semibold mb-2">SOLUTION:</p>
                <ol className="list-decimal ml-6 space-y-1 text-sm">
                  <li>Make sure server .env has: ADMIN_EMAIL=info.helperontheway@gmail.com</li>
                  <li>Restart the server after changing .env</li>
                  <li>You need to re-register with info.helperontheway@gmail.com</li>
                  <li>Or update your existing user role in MongoDB</li>
                </ol>
              </div>
            </div>
          )}
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-2">4. Current Location:</h2>
          <p>Path: <span className="text-blue-400">{debugInfo.currentPath}</span></p>
        </div>

        <div className="mt-6 space-x-4">
          <button
            onClick={() => navigate('/admin')}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded"
          >
            Try Admin Dashboard
          </button>
          <button
            onClick={() => navigate('/home')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
          >
            Go to Home
          </button>
          <button
            onClick={() => {
              localStorage.clear();
              navigate('/login');
            }}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded"
          >
            Logout & Clear Data
          </button>
        </div>
      </div>

      <div className="mt-6 bg-slate-800 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Full User Object:</h2>
        <pre className="text-xs bg-slate-900 p-4 rounded overflow-auto">
          {JSON.stringify(debugInfo.user, null, 2)}
        </pre>
      </div>
    </div>
  );
}

export default AdminDebugPage;
