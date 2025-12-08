import React, { useState, useEffect } from 'react';
import { getToken } from '../../utils/authUtils';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function Wallet() {
  const [walletData, setWalletData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState('bank_transfer');
  const [accountInfo, setAccountInfo] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);
  const [error, setError] = useState('');
  const [showTransactions, setShowTransactions] = useState(false);

  useEffect(() => {
    fetchWallet();
  }, []);

  const fetchWallet = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE}/api/users/wallet`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setWalletData(data.data);
      } else {
        console.error('Failed to fetch wallet');
      }
    } catch (err) {
      console.error('Error fetching wallet:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    setError('');

    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      setError('נא להזין סכום תקין');
      return;
    }

    if (amount < 10) {
      setError('סכום משיכה מינימלי הוא 10 ₪');
      return;
    }

    if (amount > walletData.balance) {
      setError('אין מספיק יתרה');
      return;
    }

    if (!accountInfo.trim()) {
      setError('נא להזין פרטי חשבון');
      return;
    }

    setWithdrawing(true);

    try {
      const token = getToken();
      const response = await fetch(`${API_BASE}/api/users/wallet/withdraw`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount,
          method: withdrawMethod,
          accountInfo,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('✅ בקשת משיכה נשלחה בהצלחה! הכסף יועבר בתוך 3-5 ימי עסקים');
        setShowWithdrawModal(false);
        setWithdrawAmount('');
        setAccountInfo('');
        fetchWallet(); // Refresh wallet data
      } else {
        setError(data.message || 'שגיאה בשליחת בקשת משיכה');
      }
    } catch (err) {
      console.error('Error withdrawing:', err);
      setError('שגיאה בשליחת בקשת משיכה');
    } finally {
      setWithdrawing(false);
    }
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'earning':
        return '💰';
      case 'withdrawal':
        return '🏦';
      case 'refund':
        return '↩️';
      default:
        return '📝';
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case 'earning':
        return 'text-green-600';
      case 'withdrawal':
        return 'text-red-600';
      case 'refund':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Balance Card */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">היתרה שלי</h3>
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
          </svg>
        </div>
        <div className="text-4xl font-bold mb-2">
          ₪{walletData?.balance?.toFixed(2) || '0.00'}
        </div>
        <div className="text-blue-100 text-sm">
          סה"כ הכנסות: ₪{walletData?.totalEarnings?.toFixed(2) || '0.00'}
        </div>
      </div>

      {/* Withdraw Button */}
      {walletData?.balance > 0 && (
        <button
          onClick={() => setShowWithdrawModal(true)}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          משיכת כסף
        </button>
      )}

      {/* Transaction History Toggle */}
      {walletData?.transactions?.length > 0 && (
        <div>
          <button
            onClick={() => setShowTransactions(!showTransactions)}
            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            {showTransactions ? 'הסתר היסטוריה' : `הצג היסטוריה (${walletData.transactions.length})`}
          </button>

          {showTransactions && (
            <div className="mt-4 space-y-2">
              {walletData.transactions.map((transaction) => (
                <div
                  key={transaction._id}
                  className="bg-gray-50 rounded-lg p-3 flex items-center justify-between"
                >
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
              ))}
            </div>
          )}
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 max-w-md w-full shadow-2xl" dir="rtl">
            <h3 className="text-xl font-bold text-gray-800 mb-4">משיכת כסף</h3>

            <form onSubmit={handleWithdraw} className="space-y-4">
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
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  min="10"
                  max={walletData?.balance}
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="סכום מינימלי: 10 ₪"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  יתרה זמינה: ₪{walletData?.balance?.toFixed(2)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  שיטת משיכה
                </label>
                <select
                  value={withdrawMethod}
                  onChange={(e) => setWithdrawMethod(e.target.value)}
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
                  onChange={(e) => setAccountInfo(e.target.value)}
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
                  onClick={() => {
                    setShowWithdrawModal(false);
                    setError('');
                    setWithdrawAmount('');
                    setAccountInfo('');
                  }}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  ביטול
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
