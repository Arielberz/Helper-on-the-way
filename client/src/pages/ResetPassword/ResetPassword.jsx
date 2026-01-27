/*
  קובץ זה אחראי על:
  - דף איפוס סיסמה - שלב שני (הזנת סיסמה חדשה)
  - קבלת טוקן איפוס מה-URL
  - וולידציה ואישור סיסמאות תואמות

  הקובץ משמש את:
  - משתמשים שלחצו על קישור באימייל
  - ניתוב מקישור שחזור סיסמה

  הקובץ אינו:
  - שולח אימיילים - רק משנה סיסמה
  - מאמת טוקן - נעשה בשרת
*/

import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { resetPassword as resetPasswordService } from "../../services/users.service";

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { token } = useParams();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("הסיסמאות אינן תואמות");
      return;
    }

    if (newPassword.length < 8) {
      setError("הסיסמה חייבת להכיל לפחות 8 תווים");
      return;
    }

    setLoading(true);

    try {
      const response = await resetPasswordService({
        token,
        newPassword
      });

      if (response.success) {
        setSuccess(response.message);
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    } catch (err) {
      const serverMsg = err.message;
      let msg = "שגיאה באיפוס הסיסמה. נסה שוב.";

      if (serverMsg === "token and new password are required") {
        msg = "טוקן וסיסמה חדשה נדרשים";
      } else if (serverMsg === "password must be at least 8 characters") {
        msg = "הסיסמה חייבת להכיל לפחות 8 תווים";
      } else if (serverMsg === "Invalid or expired token") {
        msg = "הקישור לא תקף או שפג תוקפו. בקש קישור חדש.";
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
              src="/helper-logo.jpeg"
              alt="HELPER ON THE WAY - סולידריות בכבישים"
              className="h-24 w-24 object-contain rounded-full"
            />
          </div>

          <div className="text-3xl font-bold text-center text-gray-800 mb-2">איפוס סיסמה</div>
          <p className="text-center text-gray-600 text-sm mb-6">
            הזן סיסמה חדשה לחשבון שלך
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-center text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-center text-sm">
              {success}
              <br />
              <span className="text-xs">מעביר אותך לדף ההתחברות...</span>
            </div>
          )}

          {/* סיסמה חדשה */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">סיסמה חדשה</label>
            <input
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="לפחות 8 תווים"
              required
              minLength={8}
            />
          </div>

          {/* אימות סיסמה */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">אימות סיסמה</label>
            <input
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="הזן שוב את הסיסמה"
              required
              minLength={8}
            />
          </div>

          <button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            type="submit"
            disabled={loading || success}
          >
            {loading ? "מאפס סיסמה..." : "אפס סיסמה"}
          </button>
        </form>
      </div>
    </div>
  );
}
