import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import io from "socket.io-client";
import Header from "../../components/header/Header";
import { getToken, getUserId, clearAuthData } from "../../utils/authUtils";

const API_BASE = import.meta.env.VITE_API_URL;

export default function Chat() {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [socket, setSocket] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loading, setLoading] = useState(true);
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

  if (loading) {
    return (
      <>
        <Header />
        <div className="flex items-center justify-center h-screen">
          <p className="text-gray-600">טוען שיחות...</p>
        </div>
      </>
    );
  }

  if (conversations.length === 0) {
    return (
      <>
        <Header />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">אין שיחות</h3>
            <p className="mt-1 text-sm text-gray-500">התחל לעזור או לבקש עזרה כדי לפתוח שיחות</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="flex h-screen bg-gray-50" dir="rtl">
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
                <div className="flex items-center justify-between">
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
                  {conv.messages?.some(m => !m.read && m.sender.toString() !== currentUserId) && (
                    <span className="h-3 w-3 bg-red-500 rounded-full"></span>
                  )}
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
              <div className="bg-white border-b border-gray-200 p-4 flex items-center gap-3">
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
    </>
  );
}
