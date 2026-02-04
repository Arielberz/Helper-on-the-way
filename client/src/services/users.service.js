/*
  קובץ זה אחראי על:
  - שכבת שירות (Service Layer) לקריאות API של משתמשים
  - ריכוז כל פעולות ההתחברות, הרשמה, פרופיל, אימות אימייל ואיפוס סיסמה
  - העלאת תמונות פרופיל ועדכוני משתמשים
  - שימוש ב-apiFetch לקריאות מאומתות

  הקובץ משמש את:
  - קומפוננטות Login, Register, Profile, ForgotPassword
  - כל מקום שצריך לגשת לנתוני משתמשים

  הקובץ אינו:
  - מכיל לוגיקת UI או מצב
  - מנהל את הטוקן ב-localStorage (זה תפקיד authUtils)
*/

import { API_BASE } from '../utils/apiConfig';
import { apiFetch } from '../utils/apiFetch';

export async function register(userData) {
  const response = await apiFetch(`${API_BASE}/api/users/register`, {
    method: 'POST',
    body: JSON.stringify(userData),
    public: true
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Registration failed');
  }
  return data;
}


export async function verifyEmail(email, code) {
  const response = await apiFetch(`${API_BASE}/api/users/verify-email`, {
    method: 'POST',
    body: JSON.stringify({ email, code }),
    public: true
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Email verification failed');
  }
  return data;
}


export async function login(credentials) {
  const response = await apiFetch(`${API_BASE}/api/users/login`, {
    method: 'POST',
    body: JSON.stringify(credentials),
    public: true
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Login failed');
  }
  return data;
}


export async function forgotPassword(email) {
  const response = await apiFetch(`${API_BASE}/api/users/forgot-password`, {
    method: 'POST',
    body: JSON.stringify({ email }),
    public: true
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Password reset request failed');
  }
  return data;
}


export async function resetPassword(resetData) {
  const response = await apiFetch(`${API_BASE}/api/users/reset-password`, {
    method: 'POST',
    body: JSON.stringify(resetData),
    public: true
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Password reset failed');
  }
  return data;
}


export async function getCurrentUser(navigate) {
  const response = await apiFetch(`${API_BASE}/api/users/me`, {}, navigate);

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch user profile');
  }
  return data;
}


export async function getUserRatings(userId) {
  const response = await apiFetch(`${API_BASE}/api/users/${userId}/ratings`, {});

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch ratings');
  }
  return data;
}


export async function getWallet(navigate) {
  const res = await apiFetch(`${API_BASE}/api/users/wallet`, {}, navigate);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to fetch wallet');
  }
  return data;
}


export async function withdrawFunds(amount, paypalEmail, navigate) {
  const res = await apiFetch(
    `${API_BASE}/api/users/wallet/withdraw`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ amount, paypalEmail })
    },
    navigate
  );

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Withdrawal failed');
  }
  return data;
}

export async function uploadAvatar(avatarData) {
  const isBase64 = typeof avatarData === 'string';
  
  const response = await apiFetch(`${API_BASE}/api/users/avatar`, {
    method: 'POST',
    body: isBase64 ? JSON.stringify({ avatar: avatarData }) : avatarData,
    skipContentType: !isBase64  // Skip Content-Type for FormData only
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Avatar upload failed');
  }
  return data;
}


export async function deleteAvatar() {
  const response = await apiFetch(`${API_BASE}/api/users/avatar`, {
    method: 'DELETE'
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Avatar deletion failed');
  }
  return data;
}


export async function getLocationFromIP() {
  const response = await apiFetch(`${API_BASE}/api/users/location/ip`, {});

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to get location');
  }
  return data;
}

export async function startPhoneVerification(phone, navigate) {
  const response = await apiFetch(
    `${API_BASE}/api/users/phone/start`,
    {
      method: 'POST',
      body: JSON.stringify({ phone })
    },
    navigate
  );

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to start phone verification');
  }
  return data;
}

export async function checkPhoneVerification(phone, code, navigate) {
  const response = await apiFetch(
    `${API_BASE}/api/users/phone/check`,
    {
      method: 'POST',
      body: JSON.stringify({ phone, code })
    },
    navigate
  );

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to verify phone');
  }
  return data;
}
