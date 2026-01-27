/*
  קובץ זה אחראי על:
  - שכבת שירות (Service Layer) לקריאות API של צ'אט
  - יצירה ושליפה של שיחות (קונברסציות)
  - שליחה וקבלת הודעות
  - סימון הודעות כנקראות וספירת הודעות שלא נקראו
  - שימוש ב-apiFetch לקריאות מאומתות

  הקובץ משמש את:
  - דף Chat וכל קומפוננטות הצ'אט
  - useChatConversations, useChatSocketHandlers hooks

  הקובץ אינו:
  - מנהל Socket.IO להודעות בזמן אמת (זה ב-hooks)
  - מציג UI של הצ'אט
*/

import { API_BASE } from '../utils/apiConfig';
import { apiFetch } from '../utils/apiFetch';

export async function getConversations(navigate) {
  const response = await apiFetch(`${API_BASE}/api/chat/conversations`, {}, navigate);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch conversations');
  }
  return data;
}

export async function getOrCreateConversation(requestId, navigate) {
  const response = await apiFetch(
    `${API_BASE}/api/chat/conversation/request/${requestId}`,
    {},
    navigate
  );

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to get conversation');
  }
  return data;
}

export async function getConversationByRequest(requestId) {
  const response = await apiFetch(
    `${API_BASE}/api/chat/conversation/request/${requestId}`,
    {}
  );

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch conversation');
  }
  return data;
}

export async function getConversationById(conversationId) {
  const response = await apiFetch(
    `${API_BASE}/api/chat/conversation/${conversationId}`,
    {}
  );

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch conversation');
  }
  return data;
}

export async function getMessages(conversationId) {
  const response = await apiFetch(
    `${API_BASE}/api/chat/${conversationId}/messages`,
    {}
  );

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch messages');
  }
  return data;
}

export async function markMessagesAsRead(conversationId) {
  await apiFetch(`${API_BASE}/api/chat/${conversationId}/read`, {
    method: 'POST'
  });
}

export async function markConversationAsRead(conversationId) {
  const response = await apiFetch(
    `${API_BASE}/api/chat/conversation/${conversationId}/read`,
    {
      method: 'PATCH'
    }
  );

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to mark conversation as read');
  }
  return data;
}

export async function deleteConversation(conversationId) {
  const response = await apiFetch(
    `${API_BASE}/api/chat/conversation/${conversationId}`,
    {
      method: 'DELETE'
    }
  );

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to delete conversation');
  }
  return data;
}

export async function getUnreadCount() {
  const response = await apiFetch(`${API_BASE}/api/chat/unread-count`, {});

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch unread count');
  }
  return data;
}

export async function getPaymentStatus(conversationId) {
  const response = await apiFetch(
    `${API_BASE}/api/chat/${conversationId}/payment-status`,
    {}
  );

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch payment status');
  }
  return data;
}

export async function getPaymentDetails(conversationId) {
  const response = await apiFetch(
    `${API_BASE}/api/chat/${conversationId}/payment`,
    {}
  );

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch payment details');
  }
  return data;
}

export async function updatePaymentAmount(conversationId, amount) {
  const response = await apiFetch(
    `${API_BASE}/api/chat/${conversationId}/payment/amount`,
    {
      method: 'PATCH',
      body: JSON.stringify({ amount })
    }
  );

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to update payment amount');
  }
  return data;
}
