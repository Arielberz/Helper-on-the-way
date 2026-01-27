/*
  קובץ זה אחראי על:
  - פורם ההרשמה (הפרדה מ-register.jsx לקישוטיות)
  - שדות שם משתמש, אימייל, טלפון, סיסמאות
  - וולידציות והודעות שגיאה

  הקובץ משמש את:
  - register.jsx - הרכיב האב

  הקובץ אינו:
  - מנהל מצב - מקבל מהאב
  - מבצע בקשות API - רק מציג
*/

import React from 'react';
import { Link } from 'react-router-dom';

export function RegisterForm({
  formData,
  onChange,
  onSubmit,
  error,
  loading
}) {
  return (
    <div>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-center text-sm mb-4">
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        {/* שם מלא */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">שם מלא</label>
          <input
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
            type="text"
            name="username"
            value={formData.username}
            onChange={onChange}
            disabled={loading}
          />
        </div>

        {/* מספר טלפון */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">מספר טלפון</label>
          <input
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={onChange}
            disabled={loading}
          />
        </div>

        {/* אימייל */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">אימייל</label>
          <input
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
            type="email"
            name="email"
            value={formData.email}
            onChange={onChange}
            disabled={loading}
          />
        </div>

        {/* סיסמה */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">סיסמה</label>
          <input
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
            type="password"
            name="password"
            value={formData.password}
            onChange={onChange}
            disabled={loading}
          />
        </div>

        {/* אימות סיסמה */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">אימות סיסמה</label>
          <input
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={onChange}
            disabled={loading}
          />
        </div>

        <button
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed mt-6"
          type="submit"
          disabled={loading}
        >
          {loading ? "מבצע הרשמה..." : "צור חשבון"}
        </button>
      </form>

      <div className="mt-6 text-center text-gray-600">
        כבר יש לך חשבון?{" "}
        <Link to="/login" className="text-blue-600 hover:text-blue-800 font-semibold hover:underline transition-colors duration-200">
          להתחברות
        </Link>
      </div>
    </div>
  );
}
