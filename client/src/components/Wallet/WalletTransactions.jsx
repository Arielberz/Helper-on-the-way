/*
  קובץ זה אחראי על:
  - הצגת רשימת העסקאות בארנק
  - תצוגת פרטי עסקה בודדת עם אייקון וצבע
  - עיצוב וארגון של היסטוריית העסקאות
*/

import React from 'react';

function WalletTransactionRow({ transaction, getTransactionIcon, getTransactionColor }) {
  return (
    <div className="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{getTransactionIcon(transaction.type)}</span>
        <div>
          <p className="font-medium text-gray-800 text-sm">
            {transaction.description}
          </p>
          <p className="text-xs text-gray-500">
            {new Date(transaction.createdAt).toLocaleDateString('he-IL', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
          {transaction.status === 'pending' && (
            <span className="inline-block mt-1 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
              ממתין לעיבוד
            </span>
          )}
        </div>
      </div>
      <div className={`text-lg font-bold ${getTransactionColor(transaction.type)}`}>
        {transaction.amount > 0 ? '+' : ''}₪{transaction.amount.toFixed(2)}
      </div>
    </div>
  );
}

export function WalletTransactions({ 
  transactions, 
  showTransactions, 
  onToggleTransactions,
  getTransactionIcon,
  getTransactionColor
}) {
  if (!transactions || transactions.length === 0) {
    return null;
  }

  return (
    <div>
      <button
        onClick={onToggleTransactions}
        className="text-blue-600 hover:text-blue-700 font-medium text-sm"
      >
        {showTransactions ? 'הסתר היסטוריה' : `הצג היסטוריה (${transactions.length})`}
      </button>

      {showTransactions && (
        <div className="mt-4 space-y-2">
          {transactions.map((transaction) => (
            <WalletTransactionRow
              key={transaction._id}
              transaction={transaction}
              getTransactionIcon={getTransactionIcon}
              getTransactionColor={getTransactionColor}
            />
          ))}
        </div>
      )}
    </div>
  );
}
