/*
  קובץ זה אחראי על:
  - דף התחברות למשתמשים קיימים
  - אימות עם שם משתמש/אימייל/טלפון וסיסמה
  - שמירת טוקן JWT ב-localStorage
  - המרת טלפון אוטומטית מ-05 ל-+9725

  הקובץ משמש את:
  - משתמשים שרוצים להתחבר למערכת
  - ניתוב מ-PublicRoute כשמשתמש מנסה לגשת לדף מוגן

  הקובץ אינו:
  - מאמת סיסמה בצד לקוח - נעשה בשרת
  - מנהל סשנים - רק התחברות
*/

import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { setAuthData } from "../../utils/authUtils";
import { login as loginUser } from "../../services/users.service";



export default function Login() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.expired) {
      setError(location.state.message || "ההתחברות שלך פגה. אנא התחבר שוב.");
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let identifierToSend = identifier.trim();
      if (identifierToSend.startsWith('05') && /^05\d{8}$/.test(identifierToSend)) {
        identifierToSend = '+972' + identifierToSend.substring(1);
      }
      
      const response = await loginUser({
        identifier: identifierToSend,
        password
      });

      if (response.success) {
        localStorage.setItem("token", response.data.token);
        if (response.data.user) {
          localStorage.setItem("user", JSON.stringify(response.data.user));
          localStorage.setItem("userId", response.data.user.id);
        }
        
        if (response.data.user?.role === 'admin') {
          navigate("/admin");
        } else {
          navigate("/home");
        }
      }
    } catch (err) {
      const serverMsg = err.message;
      let msg = "שגיאה בהתחברות. נסה שוב.";
      
      if (serverMsg && serverMsg.includes('blocked')) {
        msg = serverMsg;
      } else {
        switch (serverMsg) {
          case "identifier and password are required":
            msg = "יש לספק מזהה (אימייל/טלפון) וסיסמה";
            break;
          case "please use email or phone to login":
            msg = "אנא השתמש באימייל או בטלפון להתחברות";
            break;
          case "invalid credentials":
            msg = "פרטי ההתחברות שגויים";
            break;
          case "server misconfiguration: missing JWT secret":
            msg = "שגיאת שרת: הגדרה חסרה. נסו מאוחר יותר";
            break;
          default:
            if (typeof serverMsg === "string" && serverMsg.trim()) {
              msg = serverMsg;
            }
        }
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4" dir="rtl" lang="he">
      <button
        type="button"
        className="fixed top-6 right-6 bg-white hover:bg-gray-100 text-gray-700 font-semibold py-2 px-4 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg z-10"
        onClick={() => navigate('/')}
        aria-label="חזרה לעמוד הראשי"
      >
        ← חזרה
      </button>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
        <form onSubmit={handleSubmit} className="space-y-6">

        {/* לוגו */}
         <div className="flex justify-center mb-4">
          <img
            src="./helper-logo.jpeg"
            alt="HELPER ON THE WAY - סולידריות בכבישים"
            className="h-24 w-24 object-contain rounded-full"
          />
        </div>


        <div className="text-3xl font-bold text-center text-gray-800 mb-6">התחברות</div>

        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-center text-sm">{error}</div>}

        {/* אימייל/טלפון */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">אימייל / טלפון</label>
          <input 
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none" 
            type="text" 
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="example@email.com או 0501234567"
            required
          />
        </div>

        {/* סיסמה */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="block text-sm font-medium text-gray-700">סיסמה</label>
            <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-200">
              שכחת סיסמה?
            </Link>
          </div>
          <input 
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none" 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed" 
          type="submit" 
          disabled={loading}
        >
          {loading ? "מתחבר..." : "כניסה"}
        </button>

        </form>

        <div className="mt-6 text-center text-gray-600">
          אין לך חשבון?{" "}
          <Link to="/register" className="text-blue-600 hover:text-blue-800 font-semibold hover:underline transition-colors duration-200">להרשמה</Link>
        </div>

      </div>
    </div>
  );
}