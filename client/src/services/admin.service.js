/*
  קובץ זה אחראי על:
  - ניהול כל קריאות ה-API של ממשק המנהל (סטטיסטיקות, משתמשים, עסקאות, דוחות)

  הקובץ משמש את:
  - דפי הניהול - לוח מחוונים, טבלאות משתמשים, בקשות, עסקאות
  - רכיבי תצוגה גרפית (גרפים ותרשימים)

  הקובץ אינו:
  - נגיש למשתמשים רגילים - רק למנהלים
*/

import { API_BASE } from '../utils/apiConfig';
import { apiFetch } from '../utils/apiFetch';

export async function getAdminOverview(navigate) {
  const res = await apiFetch(`${API_BASE}/api/admin/overview`, {}, navigate);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to fetch overview');
  }
  return data;
}

export async function getCommissionStats(navigate) {
  const res = await apiFetch(`${API_BASE}/api/admin/commission-stats`, {}, navigate);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to fetch commission stats');
  }
  return data;
}

export async function getUsers(page, navigate) {
  const res = await apiFetch(`${API_BASE}/api/admin/users?page=${page}&limit=20`, {}, navigate);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to fetch users');
  }
  return data;
}

export async function blockUser(userId, reason, navigate) {
  const res = await apiFetch(
    `${API_BASE}/api/admin/users/${userId}/block`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason })
    },
    navigate
  );
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to block user');
  }
  return data;
}

export async function unblockUser(userId, navigate) {
  const res = await apiFetch(
    `${API_BASE}/api/admin/users/${userId}/unblock`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    },
    navigate
  );
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to unblock user');
  }
  return data;
}

export async function getRequests(page, navigate) {
  const res = await apiFetch(`${API_BASE}/api/admin/requests?page=${page}&limit=20`, {}, navigate);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to fetch requests');
  }
  return data;
}

export async function getTransactions(page, navigate) {
  const res = await apiFetch(`${API_BASE}/api/admin/transactions?page=${page}&limit=20`, {}, navigate);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to fetch transactions');
  }
  return data;
}

export async function getContactMessages(navigate) {
  const res = await apiFetch(`${API_BASE}/api/admin/contact-messages`, {}, navigate);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to fetch messages');
  }
  return data;
}

export async function markContactMessageAsRead(messageId, navigate) {
  const res = await apiFetch(
    `${API_BASE}/api/admin/contact-messages/${messageId}/read`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' }
    },
    navigate
  );
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to mark as read');
  }
  return data;
}

export async function deleteContactMessage(messageId, navigate) {
  const res = await apiFetch(
    `${API_BASE}/api/admin/contact-messages/${messageId}`,
    {
      method: 'DELETE'
    },
    navigate
  );
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to delete message');
  }
  return data;
}

export async function getReports(page, navigate) {
  const res = await apiFetch(`${API_BASE}/api/admin/reports?page=${page}&limit=20`, {}, navigate);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to fetch reports');
  }
  return data;
}

export async function viewReport(reportId, navigate) {
  const res = await apiFetch(`${API_BASE}/api/admin/reports/${reportId}`, {}, navigate);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to fetch report');
  }
  return data;
}
