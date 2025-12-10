import React from 'react';

export function EmailVerificationModal({
  isOpen,
  email,
  verificationCode,
  onChangeCode,
  onSubmit,
  onCancel,
  error,
  loading
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <div className="text-3xl mb-2">📧</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">אימות אימייל</h2>
          <p className="text-gray-600">
            שלחנו קוד אימות בן 6 ספרות לכתובת:
          </p>
          <p className="text-blue-600 font-semibold mt-1">{email}</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-center text-sm mb-4">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">קוד אימות</label>
            <input
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none text-center text-2xl tracking-widest disabled:bg-gray-100 disabled:cursor-not-allowed"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength="6"
              value={verificationCode}
              onChange={onChangeCode}
              disabled={loading}
              placeholder="000000"
              autoFocus
            />
          </div>

          <button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            type="submit"
            disabled={loading}
          >
            {loading ? "מאמת..." : "אמת ומשך"}
          </button>
        </form>

        <div className="mt-4 text-center text-sm text-gray-600">
          לא קיבלת את הקוד? בדוק בתיקיית הספאם או נסה להירשם שוב
        </div>
      </div>
    </div>
  );
}
