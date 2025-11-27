import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";



export default function Login() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const API_URL = import.meta.env.VITE_API_URL;

    try {
      const response = await axios.post(`${API_URL}/api/users/login`, {
        identifier,
        password
      });

      if (response.data.success) {
        // Store token in localStorage
        localStorage.setItem("token", response.data.data.token);
        if (response.data.data.user) {
          localStorage.setItem("user", JSON.stringify(response.data.data.user));
          // Store userId for Socket.IO room management
          localStorage.setItem("userId", response.data.data.user.id);
        }
        // Redirect to home page
        navigate("/home");
      }
    } catch (err) {
      const serverMsg = err.response?.data?.message;
      let msg = "שגיאה בהתחברות. נסה שוב.";
      switch (serverMsg) {
        case "identifier and password are required":
          msg = "יש לספק מזהה (אימייל/טלפון/שם משתמש) וסיסמה";
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

        {/* אימייל/טלפון/שם משתמש */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">אימייל / טלפון / שם משתמש</label>
          <input 
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none" 
            type="text" 
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
          />
        </div>

        {/* סיסמה */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">סיסמה</label>
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