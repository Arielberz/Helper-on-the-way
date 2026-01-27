/*
  קובץ זה אחראי על:
  - ניהול מצב שיחות הצ'אט והודעות
  - טעינת שיחות וקביעת שיחה נבחרת
  - סנכרון בין שיחות להודעות

  הקובץ משמש את:
  - דף הצ'אט - ניהול מצב ממשק המשתמש

  הקובץ אינו:
  - מבצע קריאות API ישירות - מחזיר פונקציות ניהול
  - מטפל באירועי סוקט - רק מצב מקומי
*/

import { useState, useEffect } from 'react';
import { API_BASE } from '../utils/apiConfig';
import { getToken, getUserId, clearAuthData } from '../utils/authUtils';

export function useChatConversations(navigate) {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const addMessage = (message) => {
    setMessages((prev) => [...prev, message]);
  };

  const selectConversation = (conversation) => {
    setSelectedConversation(conversation);
    setMessages(conversation?.messages || []);
  };

  return {
    conversations,
    setConversations,
    selectedConversation,
    setSelectedConversation: selectConversation,
    messages,
    setMessages,
    addMessage,
    currentUserId,
    loading,
    setLoading,
  };
}
