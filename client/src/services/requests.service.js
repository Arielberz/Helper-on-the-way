/*
  קובץ זה אחראי על:
  - שכבת שירות (Service Layer) לקריאות API של בקשות עזרה
  - יצירה, עדכון, ביטול ושיוך של בקשות
  - שליפת בקשות פעילות, בקשות שלי, ובקשות לפי מיקום
  - עדכון מיקום, סטטוס ותשלום של בקשות
  - שימוש ב-apiFetch לקריאות מאומתות

  הקובץ משמש את:
  - MapLive, HelpButton, IncomingHelpNotification
  - דף Home וכל קומפוננטה הקשורה לבקשות עזרה

  הקובץ אינו:
  - מכיל לוגיקת UI
  - מנהל Socket.IO (זה ב-hooks ו-context)
*/

import { API_BASE } from '../utils/apiConfig';
import { apiFetch } from '../utils/apiFetch';

export async function createRequest(requestData, navigate) {
  try {
    const response = await apiFetch(`${API_BASE}/api/requests`, {
      method: 'POST',
      body: JSON.stringify(requestData)
    }, navigate);

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to create request');
    }
    return data;
  } catch (error) {
    // Re-throw errors that come from apiFetch (like phone verification)
    if (error.code === 'PHONE_VERIFICATION_REQUIRED') {
      throw error;
    }
    // Re-throw any other error as-is
    throw error;
  }
}


export async function getAllRequests(navigate) {
  const res = await apiFetch(`${API_BASE}/api/requests`, {}, navigate);
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || 'Failed to fetch requests');
  }
  return res.json();
}


export async function getMyRequests(navigate) {
  const response = await apiFetch(`${API_BASE}/api/requests/my-requests`, {}, navigate);

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch requests');
  }
  return data;
}


export async function getRequestsByHelper(helperId, navigate) {
  const response = await apiFetch(`${API_BASE}/api/requests?helperId=${helperId}`, {}, navigate);

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch helper requests');
  }
  return data;
}

export async function getRequestStatus(requestId) {
  const response = await apiFetch(`${API_BASE}/api/requests/${requestId}/status`, {});

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch request status');
  }
  return data;
}

export async function requestHelp(requestId, options = {}) {
  const body = {};
  if (options.message) body.message = options.message;
  if (options.location) body.location = options.location;

  const response = await apiFetch(`${API_BASE}/api/requests/${requestId}/request-help`, {
    method: 'POST',
    body: Object.keys(body).length > 0 ? JSON.stringify(body) : undefined
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to request help');
  }
  return data;
}

export async function confirmHelper(requestId) {
  const response = await apiFetch(`${API_BASE}/api/requests/${requestId}/confirm-helper`, {
    method: 'POST'
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to confirm helper');
  }
  return data;
}

export async function cancelHelp(requestId) {
  const response = await apiFetch(`${API_BASE}/api/requests/${requestId}/cancel-help`, {
    method: 'POST'
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to cancel help');
  }
  return data;
}

export async function cancelRequest(requestId) {
  const response = await apiFetch(`${API_BASE}/api/requests/${requestId}/cancel`, {
    method: 'POST'
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to cancel request');
  }
  return data;
}

/**
 * Reject helper offer (requester rejects specific helper)
 * @param {string} requestId - Request ID
 * @param {string} helperId - Helper ID to reject
 * @returns {Promise<Object>} Response data
 */
export async function rejectHelper(requestId, helperId) {
  const response = await apiFetch(
    `${API_BASE}/api/requests/${requestId}/reject-helper`,
    {
      method: 'POST',
      body: JSON.stringify({ helperId })
    }
  );

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to reject helper');
  }
  return data;
}
export async function updateRequestStatus(requestId, statusData) {
  const response = await apiFetch(
    `${API_BASE}/api/requests/${requestId}/status`,
    {
      method: 'PATCH',
      body: JSON.stringify(statusData)
    }
  );

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to update request status');
  }
  return data;
}

export async function updateRequestPayment(requestId, paymentData) {
  const response = await apiFetch(
    `${API_BASE}/api/requests/${requestId}/payment`,
    {
      method: 'PATCH',
      body: JSON.stringify(paymentData)
    }
  );

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to update payment');
  }
  return data;
}