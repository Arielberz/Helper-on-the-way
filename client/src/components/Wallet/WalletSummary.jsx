/*
  קובץ זה אחראי על:
  - תצוגת סיכום הארנק עם היתרה והרווחים הכוללים
  - הצגת מידע כספי בעיצוב גרדיאנט כחול
  - רכיב משני להצגת נתוני הארנק
*/

import React from 'react';

export function WalletSummary({ balance, totalEarnings }) {
  return (
    <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl p-6 text-white shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">היתרה שלי</h3>
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
        </svg>
      </div>
      <div className="text-4xl font-bold mb-2">
        ₪{balance?.toFixed(2) || '0.00'}
      </div>
      <div className="text-blue-100 text-sm">
        סה"כ הכנסות: ₪{totalEarnings?.toFixed(2) || '0.00'}
      </div>
    </div>
  );
}
