import React, { useState, useEffect } from "react";
import { getToken } from "../../../utils/authUtils";
import { API_BASE } from '../../../utils/apiConfig';

export default function PaymentModal({
  selectedConversation,
  handlePaymentConfirm,
  isProcessingPayment,
  setShowPaymentPopup,
}) {
  const [isProcessingPayPal, setIsProcessingPayPal] = useState(false);
  const [isProcessingBalance, setIsProcessingBalance] = useState(false);
  const [userBalance, setUserBalance] = useState(0);

  useEffect(() => {
    fetchUserBalance();
  }, []);

  const fetchUserBalance = async () => {
    try {
      const token = getToken();
      const response = await fetch(`${API_BASE}/api/users/wallet`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setUserBalance(data.data.balance || 0);
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  const handlePayPalPayment = async () => {
    setIsProcessingPayPal(true);
    try {
      const token = getToken();
      const requestId = selectedConversation?.request?._id;
      const amount = selectedConversation?.request?.payment?.offeredAmount || 0;
      


      if (!requestId) {
        alert('לא נמצא מזהה בקשה');
        setIsProcessingPayPal(false);
        return;
      }

      if (!amount || amount <= 0) {
        alert('לא ניתן להשתמש ב-PayPal עבור עזרה חינמית. השתמש בכפתור "אשר סיום העזרה"');
        setIsProcessingPayPal(false);
        return;
      }

      const response = await fetch(`${API_BASE}/api/payments/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          requestId,
          amount,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success && data.data.approvalUrl) {
        // Redirect to PayPal
        window.location.href = data.data.approvalUrl;
      } else {
        alert(data.message || 'שגיאה ביצירת תשלום PayPal');
        setIsProcessingPayPal(false);
      }
    } catch (error) {
      console.error('Error creating PayPal order:', error);
      alert('שגיאה ביצירת תשלום');
      setIsProcessingPayPal(false);
    }
  };

  const handleBalancePayment = async () => {
    const amount = selectedConversation?.request?.payment?.offeredAmount || 0;
    
    if (amount > 0 && userBalance < amount) {
      alert(`אין לך מספיק יתרה. יתרה נוכחית: ${userBalance}₪`);
      return;
    }

    setIsProcessingBalance(true);
    try {
      const token = getToken();
      const requestId = selectedConversation?.request?._id;

      const response = await fetch(`${API_BASE}/api/payments/pay-with-balance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ requestId }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert('התשלום בוצע בהצלחה!');
        setShowPaymentPopup(false);
        window.location.reload();
      } else {
        alert(data.message || 'שגיאה בביצוע התשלום');
      }
    } catch (error) {
      console.error('Error paying with balance:', error);
      alert('שגיאה בביצוע התשלום');
    } finally {
      setIsProcessingBalance(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
      onClick={() => setShowPaymentPopup(false)}
    >
      <div
        className="w-full max-w-md rounded-xl shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: "var(--glass-bg-strong)",
          backdropFilter: "blur(var(--glass-blur))",
          WebkitBackdropFilter: "blur(var(--glass-blur))",
          border: "1px solid var(--glass-border)",
          boxShadow: "var(--glass-shadow)",
        }}
      >
        {/* Header */}
        <div
          className="px-6 py-4 border-b flex items-center justify-between"
          style={{
            borderColor: "var(--glass-border)",
            backgroundColor: "var(--primary)",
          }}
        >
          <h2 className="text-lg font-bold text-white">
            {(selectedConversation?.request?.payment?.offeredAmount || 0) > 0 ? "💳 תשלום" : "✅ אישור סיום"}
          </h2>
          <button
            onClick={() => setShowPaymentPopup(false)}
            className="text-white/70 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="text-center">
            <p className="text-sm mb-2" style={{ color: "var(--text-secondary)" }}>
              סכום לתשלום
            </p>
            <p className="text-4xl font-bold" style={{ color: "var(--primary)" }}>
              {selectedConversation?.request?.payment?.offeredAmount || 0}₪
            </p>
          </div>

          <div
            className="p-4 rounded-lg text-sm"
            style={{
              backgroundColor: "rgba(59, 130, 246, 0.1)",
              color: "var(--text-main)",
              border: "1px solid var(--primary)",
            }}
          >
            <p className="flex items-center gap-2">
              <span>ℹ️</span>
              <span>
                {(selectedConversation?.request?.payment?.offeredAmount || 0) > 0 
                  ? "העוזר יקבל את התגמול שלו לאחר אישור התשלום"
                  : "אשר שהעזרה הושלמה בהצלחה"}
              </span>
            </p>
          </div>

          <div
            className="p-3 rounded-lg text-sm"
            style={{
              backgroundColor: "rgba(34, 197, 94, 0.1)",
              color: "var(--text-main)",
              border: "1px solid #22c55e",
            }}
          >
            <p className="flex items-center justify-between">
              <span>💰 היתרה שלך:</span>
              <span className="font-bold text-lg">{userBalance}₪</span>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div
          className="px-6 py-4 border-t space-y-3"
          style={{ borderColor: "var(--glass-border)" }}
        >
          <button
            onClick={handleBalancePayment}
            disabled={isProcessingBalance || ((selectedConversation?.request?.payment?.offeredAmount || 0) > 0 && userBalance < (selectedConversation?.request?.payment?.offeredAmount || 0))}
            className="w-full px-4 py-3 rounded-lg font-medium transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{
              backgroundColor: "#22c55e",
              color: "white",
            }}
          >
            {isProcessingBalance ? "⏳ מעבד..." : (selectedConversation?.request?.payment?.offeredAmount || 0) > 0 ? "💰 שלם מהיתרה" : "✅ אשר סיום העזרה"}
          </button>

          <div className="text-center text-xs" style={{ color: "var(--text-secondary)" }}>
            או
          </div>

          <button
            onClick={handlePayPalPayment}
            disabled={isProcessingPayPal}
            className="w-full px-4 py-3 rounded-lg font-medium transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{
              backgroundColor: "#0070BA",
              color: "white",
            }}
          >
            {isProcessingPayPal ? "⏳ יוצר תשלום..." : "💳 שלם עם PayPal"}
          </button>
          
          <button
            onClick={() => setShowPaymentPopup(false)}
            className="w-full px-4 py-2 rounded-lg font-medium transition-all text-sm"
            style={{
              backgroundColor: "transparent",
              color: "var(--text-main)",
              border: "1px solid var(--glass-border)",
            }}
          >
            ביטול
          </button>
        </div>
      </div>
    </div>
  );
}
