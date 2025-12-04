import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useHelperRequest } from "../../context/HelperRequestContext";
import { useRating } from "../../context/RatingContext";
import { getToken, getUserId, clearAuthData } from "../../utils/authUtils";

const API_BASE = import.meta.env.VITE_API_URL;

export default function Chat() {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const { socket } = useHelperRequest();
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
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
      const token = getToken();
      if (!token) return;

      try {
        const response = await fetch(`${API_BASE}/api/chat/conversations`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

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
        } else if (response.status === 401) {
          clearAuthData();
          navigate("/login");
        } else {
          setLoading(false);
        }
      } catch (error) {
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

    socket.on("new_message", handleNewMessage);

    return () => {
      socket.off("new_message", handleNewMessage);
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

    if (!confirm("האם אתה בטוח שברצונך למחוק את השיחה הזו?")) return;

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
        alert("שגיאה במחיקת השיחה");
      }
    } catch (error) {
      console.error("Error deleting conversation:", error);
      alert("שגיאה במחיקת השיחה");
    }
  };

  const handleSubmitReport = async () => {
    if (!reportReason || !reportDescription.trim()) {
      alert("אנא בחר סיבה והוסף תיאור");
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
        alert("הדיווח נשלח בהצלחה. אנו נבדוק את הנושא בהקדם.");
        setShowReportModal(false);
        setReportReason("");
        setReportDescription("");
      } else {
        const data = await response.json();
        alert(data.message || "שגיאה בשליחת הדיווח");
      }
    } catch (error) {
      console.error("Error submitting report:", error);
      alert("שגיאה בשליחת הדיווח");
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

        alert(`✅ ${data.message || "ממתין לאישור המבקש"}`);
      } else {
        const responseData = await response.json();
        alert(`❌ שגיאה: ${responseData.message || "לא ניתן לעדכן סטטוס"}`);
      }
    } catch (error) {
      console.error("Error ending treatment:", error);
      alert("❌ שגיאה בעדכון סטטוס");
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
        alert(`❌ שגיאה: ${data.message || "לא ניתן לאשר השלמה"}`);
      }
    } catch (error) {
      console.error("Error confirming completion:", error);
      alert("❌ שגיאה באישור השלמה");
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
      alert("✅ תשלום בוצע בהצלחה!");

      // Refresh to show updated state
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error("Error processing payment:", error);
      alert("❌ שגיאה בעיבוד התשלום");
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

      alert("✅ התשלום אושר בהצלחה!");

      // Refresh to show updated state
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error("Error accepting payment:", error);
      alert("❌ שגיאה באישור התשלום");
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

  const renderSidebar = () => (
    <div className="flex h-full flex-col border-l border-[var(--background-dark)] bg-[var(--background-dark)] w-72">
      {/* Profile */}
      <div
        onClick={() => navigate("/profile")}
        className="glass m-4 flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-white/10 transition-colors"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--primary-light)] text-[var(--text-inverted)]">
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-[var(--text-main)]">
            הפרופיל שלי
          </p>
        </div>
      </div>

      {/* Chats list */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 pt-1">
        <p className="mb-2 text-xs font-semibold text-[var(--text-secondary)]">
          שיחות אחרונות
        </p>

        {conversations.length === 0 ? (
          <div className="mt-8 text-center text-sm text-[var(--text-light)]">
            אין שיחות פעילות
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map((conv) => {
              const isSelected = selectedConversation?._id === conv._id;
              const hasUnread = conv.messages?.some(
                (m) => !m.read && m.sender.toString() !== currentUserId
              );

              const partnerName =
                conv.user?.username === conv.helper?.username
                  ? "שיחה"
                  : currentUserId === conv.user?._id
                  ? conv.helper?.username
                  : conv.user?.username;

              return (
                <div
                  key={conv._id}
                  onClick={() => loadConversation(conv._id)}
                  className={`flex w-full items-start justify-between rounded-lg px-3 py-2 text-right text-sm transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-white text-[var(--text-main)]"
                      : "bg-transparent hover:bg-white/60"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate font-medium">{partnerName}</p>
                      {hasUnread && (
                        <span className="h-2 w-2 rounded-full bg-[var(--danger)]" />
                      )}
                    </div>
                    <p className="truncate text-xs text-[var(--text-secondary)]">
                      {conv.request?.problemType || "בקשת עזרה"}
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleDeleteConversation(conv._id, e)}
                    className="ml-2 text-xs text-[var(--text-light)] hover:text-[var(--danger)]"
                    title="מחק שיחה"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Return Home */}
      <div className="border-t border-[var(--background)] p-4">
        <button
          onClick={() => navigate("/home")}
          className="glass flex w-full items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-[var(--primary-dark)]"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          חזרה לבית
        </button>
      </div>
    </div>
  );

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
      <div
        className={`
          fixed inset-y-0 right-0 z-50 w-72 transform bg-[var(--background-dark)] transition-transform md:relative md:translate-x-0 flex flex-col
          ${
            isMobileMenuOpen
              ? "translate-x-0"
              : "translate-x-full md:translate-x-0"
          }
        `}
      >
        <div className="h-full flex flex-col">
          {/* Close (mobile) */}
          <div className="flex items-center justify-between px-4 pt-4 md:hidden">
            <span className="text-sm font-medium text-[var(--text-secondary)]">
              השיחות שלי
            </span>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-[var(--text-light)]"
            >
              ✕
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {renderSidebar()}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex flex-1 flex-col">
        {selectedConversation ? (
          <>
            {/* Header */}
            <div className="flex h-16 items-center border-b border-[var(--background-dark)] bg-[var(--background)] px-4 md:px-6">
              <div className="flex items-center gap-3 flex-1">
                {/* Hamburger (mobile) */}
                <button
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="md:hidden"
                >
                  <svg
                    className="h-6 w-6 text-[var(--text-main)]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </button>

                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--primary-light)]/50 text-[var(--primary)]">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold md:text-base">
                    {currentUserId === selectedConversation.user?._id
                      ? selectedConversation.helper?.username
                      : selectedConversation.user?.username}
                  </p>
                  <p className="truncate text-xs text-[var(--text-secondary)]">
                    {selectedConversation.request?.problemType || "בקשת עזרה"}
                  </p>
                </div>
              </div>

              {/* End Treatment Button (Helper only) - Centered */}
              {isHelper &&
                selectedConversation.request?.status !== "completed" && (
                  <button
                    onClick={handleEndTreatment}
                    disabled={isEndingTreatment}
                    className="glass px-3 py-1.5 text-xs md:text-sm font-medium transition-all hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                    style={{
                      backgroundColor: "var(--glass-bg-strong)",
                      backdropFilter: "blur(var(--glass-blur))",
                      WebkitBackdropFilter: "blur(var(--glass-blur))",
                      border: "1px solid var(--glass-border)",
                      borderRadius: "var(--rounded-lg)",
                      boxShadow: "var(--glass-shadow)",
                      color: "var(--primary-dark)",
                    }}
                  >
                    <span>🏁</span>
                    <span>סיום טיפול</span>
                  </button>
                )}

              <div className="flex items-center gap-2 flex-1 justify-end">
                <button
                  onClick={() => setShowReportModal(true)}
                  className="text-sm text-[var(--text-light)] hover:text-[var(--danger)]"
                >
                  דווח
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 md:px-6 md:py-6">
              {messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-[var(--text-secondary)]">
                  <p className="mb-1 text-lg">השיחה ריקה</p>
                  <p className="text-sm">שלח הודעה כדי להתחיל</p>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    {messages.map((msg, idx) => {
                      const senderId =
                        msg.sender?._id?.toString() ||
                        msg.sender?.toString() ||
                        "";
                      const isMe = senderId === currentUserId;

                      // Check if this is a system message (end treatment notification or payment)
                      const isSystemMessage =
                        msg.isSystemMessage ||
                        msg.systemMessageType === "end_treatment" ||
                        msg.systemMessageType === "payment_sent" ||
                        msg.systemMessageType === "payment_pending" ||
                        msg.systemMessageType === "payment_accepted";
                      const isRequester =
                        currentUserId === selectedConversation.user?._id;
                      const isHelper =
                        currentUserId === selectedConversation.helper?._id;

                      // System message for end treatment or payment
                      if (isSystemMessage) {
                        return (
                          <div key={idx} className="flex justify-center my-4">
                            <div
                              className="max-w-[85%] px-4 py-3 rounded-xl text-center"
                              style={{
                                backgroundColor: "var(--glass-bg-strong)",
                                backdropFilter: "blur(var(--glass-blur))",
                                WebkitBackdropFilter: "blur(var(--glass-blur))",
                                border: "1px solid var(--glass-border)",
                                boxShadow: "var(--glass-shadow)",
                              }}
                            >
                              <p
                                className="text-sm font-medium mb-3"
                                style={{ color: "var(--primary-dark)" }}
                              >
                                {msg.content}
                              </p>

                              {/* End treatment confirmation button - for requester */}
                              {msg.systemMessageType === "end_treatment" &&
                                isRequester &&
                                selectedConversation.request?.status !==
                                  "completed" && (
                                  <button
                                    onClick={() =>
                                      handleConfirmCompletion(
                                        msg.requestId ||
                                          selectedConversation.request._id
                                      )
                                    }
                                    className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-90 w-full"
                                    style={{
                                      backgroundColor: "var(--primary)",
                                      color: "white",
                                    }}
                                  >
                                    ✅ אשר סיום
                                  </button>
                                )}

                              {/* Accept payment button - for helper */}
                              {msg.systemMessageType === "payment_pending" &&
                                isHelper &&
                                !selectedConversation.request?.payment
                                  ?.isPaid && (
                                  <button
                                    onClick={() =>
                                      handleAcceptPayment(
                                        msg.requestId ||
                                          selectedConversation.request._id
                                      )
                                    }
                                    disabled={isAcceptingPayment}
                                    className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-90 w-full disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={{
                                      backgroundColor: "var(--primary)",
                                      color: "white",
                                    }}
                                  >
                                    {isAcceptingPayment
                                      ? "⏳ מעבד..."
                                      : "✅ אשר תשלום"}
                                  </button>
                                )}

                              {msg.systemMessageType === "end_treatment" &&
                                selectedConversation.request?.status ===
                                  "completed" && (
                                  <p
                                    className="text-xs"
                                    style={{ color: "var(--text-secondary)" }}
                                  >
                                    ✓ אושר
                                  </p>
                                )}

                              <p
                                className="mt-2 text-[10px] opacity-70"
                                style={{ color: "var(--text-secondary)" }}
                              >
                                {new Date(msg.timestamp).toLocaleTimeString(
                                  "he-IL",
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </p>
                            </div>
                          </div>
                        );
                      }

                      // Regular message
                      return (
                        <div
                          key={idx}
                          className={`flex ${
                            isMe ? "justify-start" : "justify-end"
                          }`}
                        >
                          <div
                            className={`
                              max-w-[72%] rounded-2xl px-3 py-2 text-sm
                              ${
                                isMe
                                  ? "rounded-br-none bg-[var(--primary)] text-white"
                                  : "rounded-bl-none bg-[var(--primary-light)] text-[var(--text-main)]"
                              }
                            `}
                          >
                            <p className="whitespace-pre-wrap">{msg.content}</p>
                            <p className="mt-1 text-[10px] text-left opacity-80">
                              {new Date(msg.timestamp).toLocaleTimeString(
                                "he-IL",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input */}
            <div className="border-t border-[var(--background-dark)] bg-[var(--background)] px-4 py-3 md:px-6 md:py-4">
              <div className="mx-auto flex max-w-3xl items-center gap-2">
                <input
                  type="text"
                  placeholder="הקלד הודעה..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 rounded-lg border border-[var(--background-dark)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--primary)]"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className={`flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition-opacity ${
                    !input.trim()
                      ? "bg-[var(--primary)] text-white opacity-50 cursor-not-allowed"
                      : "bg-[var(--primary)] text-white hover:opacity-90"
                  }`}
                >
                  שליחה
                </button>
              </div>
            </div>
          </>
        ) : (
          // Empty state
          <div className="flex flex-1 flex-col items-center justify-center text-[var(--text-secondary)]">
            {/* Mobile header with hamburger when no conversation */}
            <div className="absolute top-0 left-0 right-0 flex h-12 items-center border-b border-[var(--background-dark)] bg-[var(--background)] px-4 md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="mr-2"
              >
                <svg
                  className="h-6 w-6 text-[var(--text-main)]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
              <span className="text-sm font-semibold text-[var(--text-main)]">
                השיחות שלי
              </span>
            </div>

            <div className="mt-10 text-center md:mt-0">
              <p className="mb-1 text-lg font-semibold">בחר שיחה</p>
              <p className="mb-4 text-sm text-[var(--text-light)]">
                בחר שיחה מהתפריט כדי להתחיל לשוחח
              </p>
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="glass mt-2 px-4 py-2 text-sm font-medium text-[var(--primary-dark)] md:hidden"
              >
                פתח תפריט שיחות
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
          onClick={() => setShowReportModal(false)}
        >
          <div
            className="w-full max-w-md rounded-lg bg-white shadow-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
              <p className="text-sm font-semibold text-gray-800">
                דיווח על משתמש
              </p>
              <button
                onClick={() => setShowReportModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 px-4 py-4">
              <p className="text-xs text-gray-600">
                דיווח על:{" "}
                <strong className="text-gray-900">
                  {currentUserId === selectedConversation?.user?._id
                    ? selectedConversation?.helper?.username
                    : selectedConversation?.user?.username}
                </strong>
              </p>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">
                  סיבת הדיווח
                </label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full rounded-md border border-gray-300 bg-white px-2 py-2 text-sm outline-none focus:border-[var(--primary)]"
                >
                  <option value="">בחר סיבה</option>
                  <option value="illegal_activity">פעילות בלתי חוקית</option>
                  <option value="harassment">הטרדה</option>
                  <option value="inappropriate_content">תוכן לא הולם</option>
                  <option value="scam">הונאה/רמאות</option>
                  <option value="violence_threat">איום באלימות</option>
                  <option value="other">אחר</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">
                  תיאור הבעיה
                </label>
                <textarea
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  rows="4"
                  maxLength="1000"
                  className="w-full resize-none rounded-md border border-gray-300 bg-white px-2 py-2 text-sm outline-none focus:border-[var(--primary)]"
                  placeholder="אנא תאר בקצרה את הבעיה..."
                />
                <p className="mt-1 text-right text-[10px] text-gray-400">
                  {reportDescription.length}/1000
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setShowReportModal(false)}
                  className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700"
                >
                  ביטול
                </button>
                <button
                  onClick={handleSubmitReport}
                  className="flex-1 rounded-md bg-[var(--danger)] px-3 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
                >
                  שלח דיווח
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Popup */}
      {showPaymentPopup && (
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
              <h2 className="text-lg font-bold text-white">💳 תשלום</h2>
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
                <p
                  className="text-sm mb-2"
                  style={{ color: "var(--text-secondary)" }}
                >
                  סכום לתשלום
                </p>
                <p
                  className="text-4xl font-bold"
                  style={{ color: "var(--primary)" }}
                >
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
                  <span>העוזר יקבל את התגמול שלו לאחר אישור התשלום</span>
                </p>
              </div>
            </div>

            {/* Footer */}
            <div
              className="px-6 py-4 border-t flex gap-3"
              style={{ borderColor: "var(--glass-border)" }}
            >
              <button
                onClick={() => setShowPaymentPopup(false)}
                className="flex-1 px-4 py-2 rounded-lg font-medium transition-all text-sm"
                style={{
                  backgroundColor: "transparent",
                  color: "var(--text-main)",
                  border: "1px solid var(--glass-border)",
                }}
              >
                ביטול
              </button>
              <button
                onClick={handlePaymentConfirm}
                disabled={isProcessingPayment}
                className="flex-1 px-4 py-2 rounded-lg font-medium transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: "var(--primary)",
                  color: "white",
                }}
              >
                {isProcessingPayment ? "עיבוד..." : "שלח תשלום"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
