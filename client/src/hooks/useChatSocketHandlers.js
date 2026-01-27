/*
  קובץ זה אחראי על:
  - ניהול כל מאזיני אירועי Socket.IO של הצ'אט
  - טיפול בהודעות נכנסות, עדכוני ETA, אישורי תשלום
  - פתיחת מודל דירוג אחרי אישור תשלום

  הקובץ משמש את:
  - דף הצ'אט - התחברות לאירועי שיחה בזמן אמת

  הקובץ אינו:
  - שולח הודעות - רק מאזין
  - מנהל מצב שיחות - רק מעדכן לפי אירועים
*/

import { useEffect } from 'react';

export function useChatSocketHandlers(
  socket,
  selectedConversation,
  currentUserId,
  setMessages,
  setEtaForRequest,
  openRatingModal
) {
  useEffect(() => {
    if (!socket || !selectedConversation) return;

    socket.emit("join_conversation", selectedConversation._id);

    const handleNewMessage = (data) => {
      if (data.conversationId === selectedConversation._id) {
        setMessages((prev) => [...prev, data.message]);

        if (data.message?.systemMessageType === "payment_accepted") {
          const isRequester = currentUserId === selectedConversation.user?._id;
          if (isRequester && selectedConversation.request) {
            setTimeout(() => {
              openRatingModal(selectedConversation.request);
            }, 500);
          }
        }
      }
    };

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
  }, [socket, selectedConversation, currentUserId, setMessages, setEtaForRequest, openRatingModal]);
}

export function sendSystemMessage(socket, conversationId, config) {
  if (!socket || !conversationId) return;
  
  socket.emit("send_message", {
    conversationId,
    content: config.content,
    isSystemMessage: true,
    systemMessageType: config.type,
    requestId: config.requestId,
    recipientRole: config.recipientRole,
    ...config.extraData
  });
}
