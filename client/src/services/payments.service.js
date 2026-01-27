/*
  קובץ זה אחראי על:
  - ניהול כל קריאות ה-API הקשורות לתשלומים (PayPal, Stripe)

  הקובץ משמש את:
  - דף הצ'אט לשליחת בקשות תשלום
  - דפי הצלחה/ביטול של PayPal
  - רכיב התשלום במודל העזרה

  הקובץ אינו:
  - מטפל בלוגיקה עסקית - רק מנהל API
*/

import { API_BASE } from '../utils/apiConfig';
import { apiFetch } from '../utils/apiFetch';

export async function createPayPalOrder(orderData) {
  const response = await apiFetch(`${API_BASE}/api/payments/create-order`, {
    method: 'POST',
    body: JSON.stringify(orderData)
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to create order');
  }
  return data;
}

export async function capturePayPalOrder(orderId, requestId) {
  const response = await apiFetch(`${API_BASE}/api/payments/capture-order`, {
    method: 'POST',
    body: JSON.stringify({ orderId, requestId })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to capture order');
  }
  return data;
}

export async function payWithBalance(paymentData) {
  const response = await apiFetch(`${API_BASE}/api/payments/pay-with-balance`, {
    method: 'POST',
    body: JSON.stringify(paymentData)
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to process payment');
  }
  return data;
}
