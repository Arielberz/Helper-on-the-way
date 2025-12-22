import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useHelperRequest } from "../../context/HelperRequestContext";
import { useRating } from "../../context/RatingContext";
import { getToken, getUserId, clearAuthData } from "../../utils/authUtils";
import { API_BASE } from "../../utils/apiConfig";
import { apiFetch } from "../../utils/apiFetch";

// Components
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

  // Get current user ID from token
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

  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await apiFetch(`${API_BASE}/api/chat/conversations`, {}, navigate);

        if (response.ok) {
          const data = await response.json();
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

  // Load conversation
  const loadConversation = async (conversationId) => {
    const token = getToken();
    if (!token) {
      navigate("/login");
      return;
    }

    // Find the conversation in the current list for instant UI update
    const conversation = conversations.find(
      (conv) => conv._id === conversationId
    );
    if (conversation) {
      setSelectedConversation(conversation);
      setMessages(conversation?.messages || []);
      setIsMobileMenuOpen(false);
    }

    try {
      const response = await fetch(
        `${API_BASE}/api/chat/conversation/${conversationId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const fullConversation = data.data?.conversation || data.data;
        setSelectedConversation(fullConversation);
        setMessages(fullConversation?.messages || []);
        setLoading(false);

        // Mark as read
        await fetch(
          `${API_BASE}/api/chat/conversation/${conversationId}/read`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else {
        const errorData = await response.json();
        console.error("Failed to load conversation:", errorData);

        if (response.status === 401 || response.status === 403) {
          clearAuthData();
          navigate("/login");
        }
        setLoading(false);
      }
    } catch (error) {
      console.error("Error loading conversation:", error);
      setLoading(false);
    }
  };

  // Socket listeners
  useEffect(() => {
    if (!socket || !selectedConversation) return;

    socket.emit("join_conversation", selectedConversation._id);

    const handleNewMessage = (data) => {
      if (data.conversationId === selectedConversation._id) {
        setMessages((prev) => [...prev, data.message]);

        // If payment was accepted, show rating modal to requester
        if (data.message?.systemMessageType === "payment_accepted") {
          const isRequester = currentUserId === selectedConversation.user?._id;
          if (isRequester && selectedConversation.request) {
            // Open rating modal for the requester
            setTimeout(() => {
              openRatingModal(selectedConversation.request);
            }, 500);
          }
        }
      }
    };

    // Handle ETA updates from the conversation room
    const handleEtaUpdated = (data) => {
      const requestId = selectedConversation?.request?._id;
      if (data.requestId === requestId && setEtaForRequest) {
        setEtaForRequest(requestId, {
          etaMinutes: data.etaMinutes,
          etaSeconds: data.etaSeconds,
          distanceKm: data.distanceKm,
          updatedAt: data.timestamp
        });
      }
    };

    socket.on("new_message", handleNewMessage);
    socket.on("etaUpdated", handleEtaUpdated);

    return () => {
      socket.off("new_message", handleNewMessage);
      socket.off("etaUpdated", handleEtaUpdated);
      socket.emit("leave_conversation", selectedConversation._id);
    };
  }, [socket, selectedConversation]);

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

    // Find the conversation to check request status
    const conversation = conversations.find(conv => conv._id === conversationId);
    if (conversation?.request) {
      const requestStatus = conversation.request.status;
      // Prevent deletion if request is still open (not completed or cancelled)
      if (requestStatus !== 'completed' && requestStatus !== 'cancelled') {
        showAlert("לא ניתן למחוק שיחה כאשר בקשת העזרה עדיין פעילה. אנא המתן עד להשלמת הבקשה.");
        return;
      }
    }

    showConfirm(
      "האם אתה בטוח שברצונך למחוק את השיחה הזו?",
      async () => {
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
          const response = await fetch(
            `${API_BASE}/api/chat/conversation/${conversationId}`,
            {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (response.ok) {
            setConversations((prev) =>
              prev.filter((conv) => conv._id !== conversationId)
            );

            if (selectedConversation?._id === conversationId) {
              setSelectedConversation(null);
              setMessages([]);
            }
          } else {
            showAlert("שגיאה במחיקת השיחה");
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

    const token = localStorage.getItem("token");
    if (!token) return;

    const reportedUserId =
      currentUserId === selectedConversation.user?._id
        ? selectedConversation.helper?._id
        : selectedConversation.user?._id;

    try {
      const response = await fetch(`${API_BASE}/api/reports/report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          reportedUserId,
          conversationId: selectedConversation._id,
          reason: reportReason,
          description: reportDescription,
        }),
      });

      if (response.ok) {
        showAlert("הדיווח נשלח בהצלחה. אנו נבדוק את הנושא בהקדם.");
        setShowReportModal(false);
        setReportReason("");
        setReportDescription("");
      } else {
        const data = await response.json();
        showAlert(data.message || "שגיאה בשליחת הדיווח");
      }
    } catch (error) {
      console.error("Error submitting report:", error);
      showAlert("שגיאה בשליחת הדיווח");
    }
  };

  // Check if current user is the helper
  const isHelper = currentUserId === selectedConversation?.helper?._id;

  // Handle end treatment (helper only)
  const handleEndTreatment = async () => {
    if (!selectedConversation?.request?._id) return;

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

  // Handle requester confirmation (from chat message)
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
      const isRequester = currentUserId === selectedConversation.user?._id;

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

      // Close popup
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

  // Handle helper accepting payment
  const handleAcceptPayment = async (requestId) => {
    setIsAcceptingPayment(true);
    const token = getToken();

    try {
      // Update payment status in database
      const response = await fetch(
        `${API_BASE}/api/requests/${requestId}/payment`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ isPaid: true }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update payment status");
      }

      const data = await response.json();

      // Update local state immediately to hide the button
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

      // Send payment accepted message
      if (socket) {
        socket.emit("send_message", {
          conversationId: selectedConversation._id,
          content: "✅ התשלום אושר! תודה על ההעברה.",
          isSystemMessage: true,
          systemMessageType: "payment_accepted",
          requestId: requestId,
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
      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        conversations={conversations}
        selectedConversation={selectedConversation}
        currentUserId={currentUserId}
        loadConversation={loadConversation}
        handleDeleteConversation={handleDeleteConversation}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      {/* Main Chat Area */}
      <div className="flex flex-1 flex-col">
        {selectedConversation ? (
          <>
            {/* Header */}
            <ChatHeader
              selectedConversation={selectedConversation}
              currentUserId={currentUserId}
              isHelper={isHelper}
              isEndingTreatment={isEndingTreatment}
              handleEndTreatment={handleEndTreatment}
              setShowReportModal={setShowReportModal}
              setIsMobileMenuOpen={setIsMobileMenuOpen}
            />

            {/* Messages */}
            <MessageList
              messages={messages}
              currentUserId={currentUserId}
              selectedConversation={selectedConversation}
              handleConfirmCompletion={handleConfirmCompletion}
              handleAcceptPayment={handleAcceptPayment}
              isAcceptingPayment={isAcceptingPayment}
              etaData={(() => {
                const requestId = selectedConversation?.request?._id;
                
                // First check real-time ETA from context (socket updates)
                const realtimeEta = requestId ? etaByRequestId[requestId] : null;
                if (realtimeEta && typeof realtimeEta.etaMinutes === 'number' && !isNaN(realtimeEta.etaMinutes) && realtimeEta.etaMinutes >= 0) {
                  return realtimeEta;
                }
                
                // Fallback: check server-stored ETA from the request
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

            {/* Input */}
            <MessageInput
              input={input}
              setInput={setInput}
              handleSend={handleSend}
              handleKeyDown={handleKeyDown}
            />
          </>
        ) : (
          // Empty state
          <EmptyState setIsMobileMenuOpen={setIsMobileMenuOpen} />
        )}
      </div>

      {/* Report Modal */}
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

      {/* Payment Popup */}
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
