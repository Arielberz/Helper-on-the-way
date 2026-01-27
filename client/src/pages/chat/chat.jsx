/*
  קובץ זה אחראי על:
  - דף הצ'אט הראשי עם רשימת שיחות והודעות
  - ניהול תשלומים בין עוזרים למבקשים
  - סיום טיפול ואישור השלמת בקשה
  - דיווח על משתמשים, מחיקת שיחות

  הקובץ משמש את:
  - משתמשים בשיחות עם עוזרים/מבקשים
  - קישור מהתראות ואייקון הצ'אט במפה

  הקובץ אינו:
  - מנהל WebSocket server - רק מתחבר לסוקטים
  - מעבד תשלום פיזי - רק מעדכן סטטוס
*/

import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useHelperRequest } from "../../context/HelperRequestContext";
import { useRating } from "../../context/RatingContext";
import { getUserId, clearAuthData, getToken } from "../../utils/authUtils";
import { getConversations, getConversationById, markConversationAsRead, deleteConversation } from "../../services/chat.service";
import { updateRequestStatus, updateRequestPayment } from "../../services/requests.service";
import { submitReport } from "../../services/other.service";
import { useChatSocketHandlers, sendSystemMessage } from "../../hooks/useChatSocketHandlers";

import Sidebar from "./components/Sidebar";
import ChatHeader from "./components/ChatHeader";
import MessageList from "./components/MessageList";
import MessageInput from "./components/MessageInput";
import EmptyState from "./components/EmptyState";
import ReportModal from "./components/ReportModal";
import PaymentModal from "./components/PaymentModal";

import { useAlert } from "../../context/AlertContext";

export default function Chat() {
  const { showAlert, showConfirm } = useAlert();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const { socket, etaByRequestId, setEtaForRequest } = useHelperRequest();
  const { openRatingModal } = useRating();
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [isEndingTreatment, setIsEndingTreatment] = useState(false);
  const [showPaymentPopup, setShowPaymentPopup] = useState(false);
  const [paymentRequestId, setPaymentRequestId] = useState(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isAcceptingPayment, setIsAcceptingPayment] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = getToken();
    if (!token) {
      navigate("/login");
      return;
    }

    const userId = getUserId();
    if (userId) {
      setCurrentUserId(userId);
    } else {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setCurrentUserId(payload.id || payload.userId);
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, [navigate]);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const data = await getConversations(navigate);

        const conversationsArray = data.data?.conversations || [];
        setConversations(conversationsArray);

        const targetConversationId = location.state?.conversationId;

        if (targetConversationId) {
          loadConversation(targetConversationId);
        } else if (conversationsArray.length > 0) {
          if (window.innerWidth >= 768) {
            loadConversation(conversationsArray[0]._id);
          } else {
            setLoading(false);
          }
        } else {
          setLoading(false);
        }
      } catch (error) {
        if (error.message === 'NO_TOKEN' || error.message === 'UNAUTHORIZED') {
          return;
        }
        console.error("Error fetching conversations:", error);
        setLoading(false);
      }
    };

    fetchConversations();
  }, [navigate, location.state]);

  const loadConversation = async (conversationId) => {
    const token = getToken();
    if (!token) {
      navigate("/login");
      return;
    }

    const conversation = conversations.find(
      (conv) => conv._id === conversationId
    );
    if (conversation) {
      setSelectedConversation(conversation);
      setMessages(conversation?.messages || []);
      setIsMobileMenuOpen(false);
    }

    try {
      const data = await getConversationById(conversationId);

      if (data) {
        const fullConversation = data.data?.conversation || data.data;
        setSelectedConversation(fullConversation);
        setMessages(fullConversation?.messages || []);
        setLoading(false);

        await markConversationAsRead(conversationId);
      } else {
        console.error("Failed to load conversation");
        setLoading(false);
      }
    } catch (error) {
      console.error("Error loading conversation:", error);
      setLoading(false);
    }
  };

  useChatSocketHandlers(socket, selectedConversation, currentUserId, setMessages, setEtaForRequest, openRatingModal);

  const handleSend = () => {
    if (!input.trim() || !selectedConversation || !socket) return;

    const messageContent = input.trim();
    socket.emit("send_message", {
      conversationId: selectedConversation._id,
      content: messageContent,
    });

    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  const handleDeleteConversation = async (conversationId, e) => {
    e?.stopPropagation();

    const conversation = conversations.find(conv => conv._id === conversationId);
    if (conversation?.request) {
      const requestStatus = conversation.request.status;
      if (requestStatus !== 'completed' && requestStatus !== 'cancelled') {
        showAlert("לא ניתן למחוק שיחה כאשר בקשת העזרה עדיין פעילה. אנא המתן עד להשלמת הבקשה.");
        return;
      }
    }

    showConfirm(
      "האם אתה בטוח שברצונך למחוק את השיחה הזו?",
      async () => {
        try {
          await deleteConversation(conversationId);

          setConversations((prev) =>
            prev.filter((conv) => conv._id !== conversationId)
          );

          if (selectedConversation?._id === conversationId) {
            setSelectedConversation(null);
            setMessages([]);
          }
        } catch (error) {
          console.error("Error deleting conversation:", error);
          showAlert("שגיאה במחיקת השיחה");
        }
      }
    );
  };

  const handleSubmitReport = async () => {
    if (!reportReason || !reportDescription.trim()) {
      showAlert("אנא בחר סיבה והוסף תיאור");
      return;
    }

    const token = getToken();
    if (!token) return;

    const reportedUserId =
      currentUserId === selectedConversation.user?._id
        ? selectedConversation.helper?._id
        : selectedConversation.user?._id;

    try {
      await submitReport({
        reportedUserId,
        conversationId: selectedConversation._id,
        reason: reportReason,
        description: reportDescription,
      });

      showAlert("הדיווח נשלח בהצלחה. אנו נבדוק את הנושא בהקדם.");
      setShowReportModal(false);
      setReportReason("");
      setReportDescription("");
    } catch (error) {
      console.error("Error submitting report:", error);
      showAlert("שגיאה בשליחת הדיווח");
    }
  };

  const isHelper = currentUserId === selectedConversation?.helper?._id;

  const handleEndTreatment = async () => {
    if (!selectedConversation?.request?._id) return;

    setIsEndingTreatment(true);

    try {
      await updateRequestStatus(selectedConversation.request._id, { helperCompleted: true });

      if (socket) {
        sendSystemMessage(socket, selectedConversation._id, {
          content: "🏁 העוזר סיים את הטיפול וממתין לאישור שלך",
          type: "end_treatment",
          requestId: selectedConversation.request._id
        });
      }

      showAlert("✅ ממתין לאישור המבקש");
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
      const isRequester = currentUserId === selectedConversation.user?._id;

      if (socket) {
        sendSystemMessage(socket, selectedConversation._id, {
          content: "💰 התשלום שלך נשלח בהצלחה!",
          type: "payment_sent",
          requestId: paymentRequestId,
          recipientRole: "requester"
        });

        sendSystemMessage(socket, selectedConversation._id, {
          content: "💰 המשתמש שלח לך תשלום. אנא אשר את קבלת התשלום",
          type: "payment_pending",
          requestId: paymentRequestId,
          recipientRole: "helper"
        });
      }

      setShowPaymentPopup(false);
      setPaymentRequestId(null);
      showAlert("✅ תשלום בוצע בהצלחה!", { onClose: () => window.location.reload() });

    } catch (error) {
      console.error("Error processing payment:", error);
      showAlert("❌ שגיאה בעיבוד התשלום");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleAcceptPayment = async (requestId) => {
    setIsAcceptingPayment(true);

    try {
      const data = await updateRequestPayment(requestId, { isPaid: true });

      setSelectedConversation((prev) => ({
        ...prev,
        request: {
          ...prev.request,
          payment: {
            ...prev.request?.payment,
            isPaid: true,
            paidAt: new Date(),
          },
        },
      }));

      if (socket) {
        sendSystemMessage(socket, selectedConversation._id, {
          content: "✅ התשלום אושר! תודה על ההעברה.",
          type: "payment_accepted",
          requestId: requestId
        });
      }

      showAlert("✅ התשלום אושר בהצלחה!", { onClose: () => window.location.reload() });

    } catch (error) {
      console.error("Error accepting payment:", error);
      showAlert("❌ שגיאה באישור התשלום");
    } finally {
      setIsAcceptingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[var(--background)]">
        <div className="h-10 w-10 rounded-full border-2 border-[var(--primary)] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div
      className="flex h-screen bg-[var(--background)] font-sans text-[var(--text-main)]"
      dir="rtl"
    >

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}


      <Sidebar
        conversations={conversations}
        selectedConversation={selectedConversation}
        currentUserId={currentUserId}
        loadConversation={loadConversation}
        handleDeleteConversation={handleDeleteConversation}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />


      <div className="flex flex-1 flex-col">
        {selectedConversation ? (
          <>

            <ChatHeader
              selectedConversation={selectedConversation}
              currentUserId={currentUserId}
              isHelper={isHelper}
              isEndingTreatment={isEndingTreatment}
              handleEndTreatment={handleEndTreatment}
              setShowReportModal={setShowReportModal}
              setIsMobileMenuOpen={setIsMobileMenuOpen}
            />


            <MessageList
              messages={messages}
              currentUserId={currentUserId}
              selectedConversation={selectedConversation}
              handleConfirmCompletion={handleConfirmCompletion}
              handleAcceptPayment={handleAcceptPayment}
              isAcceptingPayment={isAcceptingPayment}
              etaData={(() => {
                const requestId = selectedConversation?.request?._id;
                
                const realtimeEta = requestId ? etaByRequestId[requestId] : null;
                if (realtimeEta && typeof realtimeEta.etaMinutes === 'number' && !isNaN(realtimeEta.etaMinutes) && realtimeEta.etaMinutes >= 0) {
                  return realtimeEta;
                }
                
                const serverEta = selectedConversation?.request?.etaData;
                if (serverEta && serverEta.etaSeconds != null) {
                  return {
                    etaMinutes: serverEta.etaSeconds / 60,
                    etaSeconds: serverEta.etaSeconds,
                    distanceKm: serverEta.distanceMeters ? serverEta.distanceMeters / 1000 : undefined,
                    updatedAt: serverEta.updatedAt
                  };
                }
                
                return null;
              })()}
              requestStatus={selectedConversation?.request?.status}
            />


            <MessageInput
              input={input}
              setInput={setInput}
              handleSend={handleSend}
              handleKeyDown={handleKeyDown}
            />
          </>
        ) : (
          <EmptyState setIsMobileMenuOpen={setIsMobileMenuOpen} />
        )}
      </div>


      {showReportModal && (
        <ReportModal
          reportReason={reportReason}
          setReportReason={setReportReason}
          reportDescription={reportDescription}
          setReportDescription={setReportDescription}
          handleSubmitReport={handleSubmitReport}
          setShowReportModal={setShowReportModal}
          selectedConversation={selectedConversation}
          currentUserId={currentUserId}
        />
      )}


      {showPaymentPopup && (
        <PaymentModal
          selectedConversation={selectedConversation}
          handlePaymentConfirm={handlePaymentConfirm}
          isProcessingPayment={isProcessingPayment}
          setShowPaymentPopup={setShowPaymentPopup}
        />
      )}
    </div>
  );
}
