/*
  קובץ זה אחראי על:
  - רכיב הארנק הראשי המציג את מצב הארנק של המשתמש
  - ניהול יתרה, עסקאות ומשיכת כספים
  - תצוגת היסטוריית עסקאות ופעולות כספיות
  - אינטגרציה עם מערכת התשלומים והארנק
*/

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getToken } from '../../utils/authUtils';
import { getWallet, withdrawFunds } from '../../services/users.service';
import { WalletSummary } from './WalletSummary';
import { WalletTransactions } from './WalletTransactions';
import { WithdrawModal } from './WithdrawModal';

import { useAlert } from '../../context/AlertContext';

export default function Wallet() {
  const { showAlert } = useAlert();
  const navigate = useNavigate();
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
      const data = await getWallet(navigate);
      setWalletData(data.data);
    } catch (err) {
      if (err.message === 'NO_TOKEN' || err.message === 'UNAUTHORIZED') {
        return;
      }
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
      const data = await withdrawFunds(amount, accountInfo, navigate);

      showAlert('✅ בקשת משיכה נשלחה בהצלחה! הכסף יועבר בתוך 3-5 ימי עסקים');
      setShowWithdrawModal(false);
      setWithdrawAmount('');
      setAccountInfo('');
      fetchWallet(); // Refresh wallet data
    } catch (err) {
      if (err.message === 'NO_TOKEN' || err.message === 'UNAUTHORIZED') {
        return;
      }
      console.error('Error withdrawing:', err);
      setError(err.message || 'שגיאה בשליחת בקשת משיכה');
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

      <WalletSummary 
        balance={walletData?.balance}
        totalEarnings={walletData?.totalEarnings}
      />


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


      <WalletTransactions
        transactions={walletData?.transactions}
        showTransactions={showTransactions}
        onToggleTransactions={() => setShowTransactions(!showTransactions)}
        getTransactionIcon={getTransactionIcon}
        getTransactionColor={getTransactionColor}
      />


      <WithdrawModal
        isOpen={showWithdrawModal}
        balance={walletData?.balance}
        withdrawAmount={withdrawAmount}
        withdrawMethod={withdrawMethod}
        accountInfo={accountInfo}
        withdrawing={withdrawing}
        error={error}
        onAmountChange={(e) => setWithdrawAmount(e.target.value)}
        onMethodChange={(e) => setWithdrawMethod(e.target.value)}
        onAccountInfoChange={(e) => setAccountInfo(e.target.value)}
        onSubmit={handleWithdraw}
        onCancel={() => {
          setShowWithdrawModal(false);
          setError('');
          setWithdrawAmount('');
          setAccountInfo('');
        }}
      />
    </div>
  );
}
