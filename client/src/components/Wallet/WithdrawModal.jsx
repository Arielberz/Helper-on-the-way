/*
  קובץ זה אחראי על:
  - מודאל משיכת כספים מהארנק
  - טופס הזנת סכום למשיכה ואימות
  - ניהול תהליך המשיכה ותצוגת הודעות שגיאה/הצלחה
*/

import React from 'react';

export function WithdrawModal({
  isOpen,
  balance,
  withdrawAmount,
  withdrawMethod,
  accountInfo,
  withdrawing,
  error,
  onAmountChange,
  onMethodChange,
  onAccountInfoChange,
  onSubmit,
  onCancel
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 max-w-md w-full shadow-2xl" dir="rtl">
        <h3 className="text-xl font-bold text-gray-800 mb-4">משיכת כסף</h3>

        <form onSubmit={onSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              סכום למשיכה (₪)
            </label>
            <input
              type="number"
              value={withdrawAmount}
              onChange={onAmountChange}
              min="10"
              max={balance}
              step="0.01"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="סכום מינימלי: 10 ₪"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              יתרה זמינה: ₪{balance?.toFixed(2)}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              שיטת משיכה
            </label>
            <select
              value={withdrawMethod}
              onChange={onMethodChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="bank_transfer">העברה בנקאית</option>
              <option value="paypal">PayPal</option>
              <option value="cash">מזומן</option>
              <option value="other">אחר</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              פרטי חשבון
            </label>
            <textarea
              value={accountInfo}
              onChange={onAccountInfoChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={
                withdrawMethod === 'bank_transfer'
                  ? 'מספר חשבון וסניף'
                  : withdrawMethod === 'paypal'
                  ? 'כתובת אימייל של PayPal'
                  : 'פרטים נוספים'
              }
              rows="3"
              required
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={withdrawing}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {withdrawing ? 'שולח...' : 'אשר משיכה'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              ביטול
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
