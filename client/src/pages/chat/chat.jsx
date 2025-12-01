import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import io from "socket.io-client";

const API_BASE = import.meta.env.VITE_API_URL;

export default function Chat() {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [socket, setSocket] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Scroll to bottom of messages
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

    // Use getUserId utility
    const userId = getUserId();
    if (userId) {
      setCurrentUserId(userId);
    } else {
      // Fallback: decode token to get user ID
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
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
          
          // Check if there's a specific conversation to load from navigation state
          const targetConversationId = location.state?.conversationId;
          
          if (targetConversationId) {
            // Load the specific conversation
            loadConversation(targetConversationId);
          } else if (conversationsArray.length > 0) {
            // Select first conversation by default
            loadConversation(conversationsArray[0]._id);
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

  // Load a specific conversation
  const loadConversation = async (conversationId) => {
    const token = getToken();
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE}/api/chat/conversation/${conversationId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const conversation = data.data?.conversation || data.data;
        setSelectedConversation(conversation);
        setMessages(conversation?.messages || []);
        setLoading(false);

        // Mark messages as read
        await fetch(`${API_BASE}/api/chat/conversation/${conversationId}/read`, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error("Error loading conversation:", error);
      setLoading(false);
    }
  };

  // Setup Socket.IO
  useEffect(() => {
    const token = getToken();
    if (!token) return;

    const newSocket = io(API_BASE, {
      auth: { token },
    });

    setSocket(newSocket);

    // Join current conversation
    if (selectedConversation) {
      newSocket.emit('join_conversation', selectedConversation._id);
    }

    // Listen for new messages
    newSocket.on('new_message', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => {
      newSocket.close();
    };
  }, [selectedConversation]);

  const handleSend = async () => {
    if (!input.trim() || !selectedConversation) return;

    const token = getToken();
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE}/api/chat/conversation/${selectedConversation._id}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: input.trim(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Emit via socket for real-time delivery
        if (socket) {
          socket.emit('send_message', {
            conversationId: selectedConversation._id,
            message: data.data,
          });
        }

        setInput("");
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleDeleteConversation = async (conversationId, e) => {
    e?.stopPropagation();
    
    if (!confirm("האם אתה בטוח שברצונך למחוק את השיחה הזו?")) {
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE}/api/chat/conversation/${conversationId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        // Remove from conversations list
        setConversations(conversations.filter(conv => conv._id !== conversationId));
        
        // Clear selected conversation if it was deleted
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

    const reportedUserId = currentUserId === selectedConversation.user?._id 
      ? selectedConversation.helper?._id 
      : selectedConversation.user?._id;

    try {
      const response = await fetch(`${API_BASE}/api/reports/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          reportedUserId,
          conversationId: selectedConversation._id,
          reason: reportReason,
          description: reportDescription
        }),
      });

      if (response.ok) {
        alert("הדיווח נשלח בהצלחה. אנו נבדוק את הנושא בהקדם.");
        setShowReportModal(false);
        setReportReason('');
        setReportDescription('');
      } else {
        const data = await response.json();
        alert(data.message || "שגיאה בשליחת הדיווח");
      }
    } catch (error) {
      console.error("Error submitting report:", error);
      alert("שגיאה בשליחת הדיווח");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-600">טוען שיחות...</p>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">אין שיחות</h3>
          <p className="mt-1 text-sm text-gray-500">התחל לעזור או לבקש עזרה כדי לפתוח שיחות</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Desktop Navigation Buttons - Hidden on mobile, positioned at bottom right */}
      <div className="hidden md:flex fixed bottom-6 right-4 z-50 flex-row gap-3">
        <button
          onClick={() => navigate("/home")}
          className="h-12 w-12 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
          title="Home"
        >
          <img src="/helper-logo.jpeg" alt="Home" className="h-10 w-10 rounded-full object-cover" />
        </button>
        
        <button
          onClick={() => navigate("/profile")}
          className="h-12 w-12 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-blue-50 transition-colors duration-200 cursor-pointer"
          title="Profile"
        >
          <svg className="h-6 w-6 text-gray-600" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
          </svg>
        </button>

        <button
          onClick={handleLogout}
          className="h-12 w-12 bg-white shadow-lg rounded-full flex items-center justify-center hover:bg-red-50 transition-colors duration-200 cursor-pointer"
          title="Logout"
        >
          <svg className="h-6 w-6 text-red-600" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
          </svg>
        </button>
      </div>

      {/* Mobile Navigation - Bottom bar with menu */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg z-50 border-t border-gray-200">
        <div className="flex items-center justify-around py-2">
          <button
            onClick={() => navigate("/home")}
            className="flex flex-col items-center p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <img src="/helper-logo.jpeg" alt="Home" className="h-8 w-8 rounded-full object-cover" />
            <span className="text-xs text-gray-600 mt-1">בית</span>
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex flex-col items-center p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="h-8 w-8 text-gray-600" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
            </svg>
            <span className="text-xs text-gray-600 mt-1">שיחות</span>
          </button>

          <button
            onClick={() => navigate("/profile")}
            className="flex flex-col items-center p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="h-8 w-8 text-gray-600" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
            <span className="text-xs text-gray-600 mt-1">פרופיל</span>
          </button>

          <button
            onClick={handleLogout}
            className="flex flex-col items-center p-2 hover:bg-red-50 rounded-lg transition-colors"
          >
            <svg className="h-8 w-8 text-red-600" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
            </svg>
            <span className="text-xs text-red-600 mt-1">יציאה</span>
          </button>
        </div>
      </div>

      {/* Mobile Conversations Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setMobileMenuOpen(false)}>
          <div className="fixed bottom-16 left-0 right-0 bg-white rounded-t-2xl shadow-2xl max-h-96 overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-800">השיחות שלי</h3>
              <button onClick={() => setMobileMenuOpen(false)} className="text-gray-500 hover:text-gray-700">
                <svg className="h-6 w-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            
            <div className="overflow-y-auto flex-1">
              {conversations.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <p>אין שיחות עדיין</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {conversations.map((conv) => (
                    <div
                      key={conv._id}
                      className={`p-4 hover:bg-gray-50 transition-colors ${
                        selectedConversation?._id === conv._id ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <button
                          onClick={() => {
                            loadConversation(conv._id);
                            setMobileMenuOpen(false);
                          }}
                          className="flex-1 text-right"
                        >
                          <p className="font-semibold text-gray-900">
                            {conv.user?.username === conv.helper?.username 
                              ? 'שיחה'
                              : currentUserId === conv.user?._id 
                                ? conv.helper?.username 
                                : conv.user?.username}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {conv.request?.problemType || 'בקשת עזרה'}
                          </p>
                        </button>
                        <div className="flex items-center gap-2">
                          {conv.messages?.some(m => !m.read && m.sender.toString() !== currentUserId) && (
                            <span className="h-3 w-3 bg-red-500 rounded-full"></span>
                          )}
                          <button
                            onClick={(e) => handleDeleteConversation(conv._id, e)}
                            className="p-1.5 hover:bg-red-100 rounded-full transition-colors"
                            title="מחק שיחה"
                          >
                            <svg className="h-5 w-5 text-red-600" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                              <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex h-screen bg-gray-50 pb-16 md:pb-0" dir="rtl">
        {/* Conversations list */}
        <div className="w-80 bg-white border-l border-gray-200 overflow-y-auto">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">שיחות</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {conversations.map((conv) => (
              <div
                key={conv._id}
                onClick={() => loadConversation(conv._id)}
                className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedConversation?._id === conv._id ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">
                      {conv.user?.username === conv.helper?.username 
                        ? 'שיחה'
                        : currentUserId === conv.user?._id 
                          ? conv.helper?.username 
                          : conv.user?.username}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {conv.request?.problemType || 'בקשת עזרה'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {conv.messages?.some(m => !m.read && m.sender.toString() !== currentUserId) && (
                      <span className="h-3 w-3 bg-red-500 rounded-full"></span>
                    )}
                    <button
                      onClick={(e) => handleDeleteConversation(conv._id, e)}
                      className="p-1.5 hover:bg-red-100 rounded-full transition-colors"
                      title="מחק שיחה"
                    >
                      <svg className="h-5 w-5 text-red-600" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                        <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat header */}
              <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {currentUserId === selectedConversation.user?._id 
                        ? selectedConversation.helper?.username 
                        : selectedConversation.user?.username}
                    </p>
                    <p className="text-sm text-gray-500">
                      {selectedConversation.request?.problemType || 'בקשת עזרה'}
                    </p>
                  </div>
                </div>
                
                {/* Report Button */}
                <button
                  onClick={() => setShowReportModal(true)}
                  className="p-2 hover:bg-red-50 rounded-full transition-colors"
                  title="דווח על משתמש"
                >
                  <svg className="h-6 w-6 text-red-600" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                  </svg>
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-500 mt-10">
                    <p>עדיין אין הודעות בשיחה הזו</p>
                    <p className="text-sm mt-2">שלח הודעה כדי להתחיל את השיחה</p>
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const isMe = msg.sender?.toString() === currentUserId || msg.sender?._id?.toString() === currentUserId;
                    return (
                      <div
                        key={idx}
                        className={`flex ${isMe ? 'justify-start' : 'justify-end'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            isMe
                              ? 'bg-blue-500 text-white'
                              : 'bg-white text-gray-900 border border-gray-200'
                          }`}
                        >
                          <p>{msg.content}</p>
                          <p className={`text-xs mt-1 ${isMe ? 'text-blue-100' : 'text-gray-500'}`}>
                            {new Date(msg.timestamp).toLocaleTimeString('he-IL', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input area */}
              <div className="bg-white border-t border-gray-200 p-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="הקלד הודעה..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleSend}
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold"
                  >
                    שלח
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              בחר שיחה כדי להתחיל
            </div>
          )}
        </div>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setShowReportModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">דיווח על משתמש</h3>
              <button onClick={() => setShowReportModal(false)} className="text-gray-500 hover:text-gray-700">
                <svg className="h-6 w-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              דיווח על: <strong>{currentUserId === selectedConversation?.user?._id 
                ? selectedConversation?.helper?.username 
                : selectedConversation?.user?.username}</strong>
            </p>

            <div className="space-y-4">
              {/* Reason Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">סיבת הדיווח</label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
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

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">תיאור הבעיה</label>
                <textarea
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  placeholder="אנא תאר בפירוט את הבעיה..."
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                  maxLength="1000"
                />
                <p className="text-xs text-gray-500 mt-1">{reportDescription.length}/1000</p>
              </div>

              {/* Warning */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-xs text-yellow-800">
                  ⚠️ דיווחים כוזבים עלולים להוביל לחסימת החשבון שלך. אנא דווח רק על בעיות אמיתיות.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowReportModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  ביטול
                </button>
                <button
                  onClick={handleSubmitReport}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  שלח דיווח
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
