/*
  קובץ זה אחראי על:
  - מעקב אחר מספר הודעות שלא נקראו בזמן אמת
  - פולינג כל 30 שניות כגיבוי
  - האזנה לאירועי Socket.IO להתראות מיידיות

  הקובץ משמש את:
  - MapLive - הצגת תג הודעות שלא נקראו
  - Header - עדכון נקודה אדומה על אייקון הצ'אט

  הקובץ אינו:
  - מסמן הודעות כנקראו - רק ספירה
  - מנהל שיחות - רק מונה
*/

import { useState, useEffect } from "react";
import { useHelperRequest } from "../context/HelperRequestContext";
import { getUserId } from "../utils/authUtils";
import { getUnreadCount as fetchUnreadCountAPI } from "../services/chat.service";

export function useUnreadCount() {
  const [unreadCount, setUnreadCount] = useState(0);
  const { socket } = useHelperRequest();

  const fetchUnreadCount = async () => {
    try {
      const data = await fetchUnreadCountAPI();
      setUnreadCount(data?.data?.unreadCount || 0);
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  useEffect(() => {
    fetchUnreadCount();

    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (data) => {
      const me = getUserId();
      const msg = data && (data.message || data);
      const sender = msg?.sender && (msg.sender._id || msg.sender);
      
      if (me && sender && String(sender) === String(me)) {
        return;
      }
      
      fetchUnreadCount();
    };

    const handleMessagesRead = () => {
      fetchUnreadCount();
    };

    socket.on("new_message", handleNewMessage);
    socket.on("messages_read", handleMessagesRead);

    return () => {
      socket.off("new_message", handleNewMessage);
      socket.off("messages_read", handleMessagesRead);
    };
  }, [socket]);

  return unreadCount;
}
