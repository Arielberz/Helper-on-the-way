import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE } from "../../utils/apiConfig";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE}/api/users/forgot-password`, {
        email: email.trim()
      });

      if (response.data.success) {
        setSuccess(response.data.message);
        setEmail("");
      }
    } catch (err) {
      const serverMsg = err.response?.data?.message;
      let msg = "שגיאה בשליחת בקשת איפוס סיסמה. נסה שוב.";
      
      if (serverMsg === "email is required") {
        msg = "יש למלא כתובת אימייל";
      } else if (serverMsg === "invalid email format") {
        msg = "כתובת אימייל לא תקינה";
      } else if (typeof serverMsg === "string" && serverMsg.trim()) {
        msg = serverMsg;
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
        onClick={() => navigate('/login')}
        aria-label="חזרה להתחברות"
      >
        ← חזרה להתחברות
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

          <div className="text-3xl font-bold text-center text-gray-800 mb-2">שכחת סיסמה?</div>
          <p className="text-center text-gray-600 text-sm mb-6">
            הזן את כתובת האימייל שלך ונשלח לך קישור לאיפוס הסיסמה
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-center text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-center text-sm">
              {success}
            </div>
          )}

          {/* אימייל */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">כתובת אימייל</label>
            <input
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              required
            />
          </div>

          <button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            type="submit"
            disabled={loading}
          >
            {loading ? "שולח..." : "שלח קישור לאיפוס סיסמה"}
          </button>
        </form>

        <div className="mt-6 text-center text-gray-600">
          נזכרת בסיסמה?{" "}
          <Link to="/login" className="text-blue-600 hover:text-blue-800 font-semibold hover:underline transition-colors duration-200">
            התחבר כאן
          </Link>
        </div>
      </div>
    </div>
  );
}
