/**
 * Custom hook for managing unread chat messages count
 * 
 * This hook provides real-time unread message count tracking by:
 * - Fetching initial count on mount
 * - Polling for updates every 30 seconds
 * - Listening to Socket.IO events for instant updates
 * - Ignoring messages sent by the current user
 * 
 * @returns {number} unreadCount - The current number of unread messages
 */

import { useState, useEffect } from "react";
import { useHelperRequest } from "../context/HelperRequestContext";
import { getToken, getUserId } from "../utils/authUtils";
import { API_BASE } from "../utils/apiConfig";

export function useUnreadCount() {
  const [unreadCount, setUnreadCount] = useState(0);
  const { socket } = useHelperRequest();

  // Function to fetch unread count from API
  const fetchUnreadCount = async () => {
    const token = getToken();
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE}/api/chat/unread-count`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.data?.unreadCount || 0);
      }
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  // Fetch initial count and set up polling
  useEffect(() => {
    fetchUnreadCount();

    // Refetch every 30 seconds as fallback
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // Setup Socket.IO event listeners for real-time updates
  useEffect(() => {
    if (!socket) return;

    // Listen for new messages
    const handleNewMessage = (data) => {
      const me = getUserId();
      const msg = data && (data.message || data);
      const sender = msg?.sender && (msg.sender._id || msg.sender);
      
      // Don't count own messages
      if (me && sender && String(sender) === String(me)) {
        return;
      }
      
      // Re-fetch unread count for accuracy across conversations
      fetchUnreadCount();
    };

    // Listen for messages marked as read
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
