import { useState } from 'react';
import { getToken } from '../utils/authUtils';
import { API_BASE } from '../utils/apiConfig';

import { useAlert } from '../context/AlertContext';

export function useChatPayment(socket, selectedConversation, currentUserId) {
  const { showAlert } = useAlert();
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);
  const [paymentRequestId, setPaymentRequestId] = useState(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isAcceptingPayment, setIsAcceptingPayment] = useState(false);
  const [isEndingTreatment, setIsEndingTreatment] = useState(false);

  // Handle end treatment
  const handleEndTreatment = async () => {
    if (!selectedConversation?.request?._id || isEndingTreatment) return;

    setIsEndingTreatment(true);
    const token = getToken();

    try {
      const response = await fetch(
        `${API_BASE}/api/requests/${selectedConversation.request._id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ helperCompleted: true }),
        }
      );

      if (response.ok) {
        const data = await response.json();

        // Send a system message via socket with end treatment notification
        if (socket) {
          socket.emit("send_message", {
            conversationId: selectedConversation._id,
            content: "🏁 העוזר סיים את הטיפול וממתין לאישור שלך",
            isSystemMessage: true,
            systemMessageType: "end_treatment",
            requestId: selectedConversation.request._id,
          });
        }

        showAlert(`✅ ${data.message || "ממתין לאישור המבקש"}`);
      } else {
        const responseData = await response.json();
        showAlert(`❌ שגיאה: ${responseData.message || "לא ניתן לעדכן סטטוס"}`);
      }
    } catch (error) {
      console.error("Error ending treatment:", error);
      showAlert("❌ שגיאה בעדכון סטטוס");
    } finally {
      setIsEndingTreatment(false);
    }
  };

  // Handle requester confirmation
  const handleConfirmCompletion = async (requestId) => {
    const token = getToken();

    try {
      const response = await fetch(
        `${API_BASE}/api/requests/${requestId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ requesterConfirmed: true }),
        }
      );

      if (response.ok) {
        // Show payment popup instead of alerting
        setPaymentRequestId(requestId);
        setShowPaymentPopup(true);
      } else {
        const data = await response.json();
        showAlert(`❌ שגיאה: ${data.message || "לא ניתן לאשר השלמה"}`);
      }
    } catch (error) {
      console.error("Error confirming completion:", error);
      showAlert("❌ שגיאה באישור השלמה");
    }
  };

  // Handle payment confirmation
  const handlePaymentConfirm = async () => {
    if (!paymentRequestId || !selectedConversation) return;

    setIsProcessingPayment(true);

    try {
      if (socket) {
        // Send message for the requester (payment sent)
        socket.emit("send_message", {
          conversationId: selectedConversation._id,
          content: "💰 התשלום שלך נשלח בהצלחה!",
          isSystemMessage: true,
          systemMessageType: "payment_sent",
          requestId: paymentRequestId,
          recipientRole: "requester",
        });

        // Send message for the helper (payment pending - with accept button)
        socket.emit("send_message", {
          conversationId: selectedConversation._id,
          content: "💰 המשתמש שלח לך תשלום. אנא אשר את קבלת התשלום",
          isSystemMessage: true,
          systemMessageType: "payment_pending",
          requestId: paymentRequestId,
          recipientRole: "helper",
        });
      }

      setShowPaymentPopup(false);
      setPaymentRequestId(null);
    } catch (error) {
      console.error("Error processing payment:", error);
      showAlert("❌ שגיאה בעיבוד תשלום");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Handle accept payment
  const handleAcceptPayment = async (requestId) => {
    setIsAcceptingPayment(true);
    const token = getToken();

    try {
      const response = await fetch(
        `${API_BASE}/api/requests/${requestId}/accept-payment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        if (socket && selectedConversation) {
          socket.emit("send_message", {
            conversationId: selectedConversation._id,
            content: "✅ התשלום אושר! העוזר קיבל את כספו",
            isSystemMessage: true,
            systemMessageType: "payment_accepted",
            requestId: requestId,
          });
        }
      } else {
        const data = await response.json();
        showAlert(`❌ שגיאה: ${data.message || "לא ניתן לאשר תשלום"}`);
      }
    } catch (error) {
      console.error("Error accepting payment:", error);
      showAlert("❌ שגיאה באישור תשלום");
    } finally {
      setIsAcceptingPayment(false);
    }
  };

  return {
    showPaymentPopup,
    setShowPaymentPopup,
    paymentRequestId,
    setPaymentRequestId,
    isProcessingPayment,
    isAcceptingPayment,
    isEndingTreatment,
    handleEndTreatment,
    handleConfirmCompletion,
    handlePaymentConfirm,
    handleAcceptPayment,
  };
}
