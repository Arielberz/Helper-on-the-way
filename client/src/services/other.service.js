/*
  קובץ זה אחראי על:
  - ניהול קריאות API לדיווחים ויצירת קשר
  - שליחת דיווחים על משתמשים
  - ייצוא מחדש של פונקציות דירוגים (לתאימות לאחור)

  הקובץ משמש את:
  - דף הצ'אט - דיווח על משתמשים
  - דף יצירת קשר
  - קומפוננטות ישנות עדיין משתמשות בייבוא ישן

  הקובץ אינו:
  - מטפל בשליחת הודעות או בקשות עזרה
  - מקור האמת לדירוגים (עבור לשימוש ב-ratings.service.js)
*/

import { API_BASE } from '../utils/apiConfig';
import { apiFetch } from '../utils/apiFetch';


export { submitRating, checkRatingExists } from './ratings.service';

export async function submitReport(reportData) {
  const response = await apiFetch(`${API_BASE}/api/reports/report`, {
    method: 'POST',
    body: JSON.stringify(reportData)
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to submit report');
  }
  return data;
}

export async function submitContactMessage(contactData) {
  const response = await fetch(`${API_BASE}/api/contact`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(contactData)
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to send message');
  }
  return data;
}
