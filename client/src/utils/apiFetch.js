/*
  קובץ זה אחראי על:
  - מנגנון מרכזי לביצוע בקשות API מאומתות
  - הוספת טוכן JWT אוטומטית לכל בקשה
  - טיפול בשגיאות אימות (401/403) והפניה להתחברות

  הקובץ משמש את:
  - כל קבצי ה-services (users, requests, chat, payments וכו')
  - כל רכיב שצריך לשלוח בקשת API מאומתת

  הקובץ אינו:
  - מטפל בלוגיקה עסקית - רק wrapper ל-fetch
  - תומך בבקשות ללא אימות - לכך יש להשתמש ב-fetch רגיל
*/

import { getToken, clearAuthData } from "./authUtils";

export async function apiFetch(url, options = {}, navigate) {
  const isPublic = options.public || false;
  const token = getToken();
  
  if (!isPublic && !token) {
    if (navigate) navigate("/login");
    throw new Error("NO_TOKEN");
  }

  const headers = {
    ...(options.headers || {}),
  }

  if (!isPublic && token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (options.body && typeof options.body === 'string' && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }


  const { skipContentType, public: _public, ...fetchOptions } = options;

  const res = await fetch(url, {
    ...fetchOptions,
    headers,
  });

  if (res.status === 401 || res.status === 403) {
    const errorData = await res.json().catch(() => ({}))
    
    clearAuthData()
    
    if (navigate) {
      navigate("/login", { 
        state: { 
          message: errorData.message || "Session expired. Please login again.",
          expired: true 
        }
      });
    }
    
    throw new Error("UNAUTHORIZED");
  }

  return res;
}
