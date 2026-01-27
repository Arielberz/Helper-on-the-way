/*
  קובץ זה אחראי על:
  - ניהול תהליך התשלום בצ'אט (סיום טיפול, הצעת תשלום, אישור)
  - פתיחת מודל תשלום וטיפול בזרימת העבודה
  - שליחת הודעות מערכת דרך Socket.IO

  הקובץ משמש את:
  - דף הצ'אט - תהליך תשלום בין עוזר למבקש

  הקובץ אינו:
  - מבצע עיבוד תשלום בפועל - רק ממשק משתמש
  - מנהל PayPal/Stripe - רק עדכון סטטוס בבקשה
*/

import { useState } from 'react';
import { updateRequestStatus, updateRequestPayment } from '../services/requests.service';
import { useAlert } from '../context/AlertContext';

export function useChatPayment(socket, selectedConversation, currentUserId) {
  const { showAlert } = useAlert();
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);
  const [paymentRequestId, setPaymentRequestId] = useState(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isAcceptingPayment, setIsAcceptingPayment] = useState(false);
  const [isEndingTreatment, setIsEndingTreatment] = useState(false);

  const handleEndTreatment = async () => {
    if (!selectedConversation?.request?._id || isEndingTreatment) return;

    setIsEndingTreatment(true);

    try {
      const data = await updateRequestStatus(
        selectedConversation.request._id,
        { helperCompleted: true }
      );

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
    } catch (error) {
      console.error("Error ending treatment:", error);
      showAlert("❌ שגיאה בעדכון סטטוס");
    } finally {
      setIsEndingTreatment(false);
    }
  };

  const handleConfirmCompletion = async (requestId) => {
    try {
      await updateRequestStatus(requestId, { requesterConfirmed: true });

      setPaymentRequestId(requestId);
      setShowPaymentPopup(true);
    } catch (error) {
      console.error("Error confirming completion:", error);
      showAlert("❌ שגיאה באישור השלמה");
    }
  };

  const handlePaymentConfirm = async () => {
    if (!paymentRequestId || !selectedConversation) return;

    setIsProcessingPayment(true);

    try {
      if (socket) {
        socket.emit("send_message", {
          conversationId: selectedConversation._id,
          content: "💰 התשלום שלך נשלח בהצלחה!",
          isSystemMessage: true,
          systemMessageType: "payment_sent",
          requestId: paymentRequestId,
          recipientRole: "requester",
        });

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

  const handleAcceptPayment = async (requestId) => {
    setIsAcceptingPayment(true);

    try {
      await updateRequestPayment(requestId, { isPaid: true });

      if (socket && selectedConversation) {
        socket.emit("send_message", {
          conversationId: selectedConversation._id,
          content: "✅ התשלום אושר! העוזר קיבל את כספו",
          isSystemMessage: true,
          systemMessageType: "payment_accepted",
          requestId: requestId,
        });
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
