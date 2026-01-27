/*
  קובץ זה אחראי על:
  - ניהול כל קריאות ה-API הקשורות לדירוגים
  - שליחת דירוגים חדשים
  - בדיקת קיום דירוגים קיימים
  - מקור האמת היחיד לקריאות דירוג בצד הלקוח

  הקובץ משמש את:
  - RatingContext - לוגיקה מרכזית של דירוגים
  - כל קומפוננטות שצריכות לעבוד עם דירוגים

  הקובץ אינו:
  - מטפל בדיווחים או הודעות צ'אט
  - מנהל מצב גלובלי (זה תפקיד RatingContext)
*/

import { API_BASE } from '../utils/apiConfig';
import { apiFetch } from '../utils/apiFetch';

/**
 * שליחת דירוג חדש למסייע
 * @param {Object} ratingData - נתוני הדירוג
 * @param {string} ratingData.requestId - מזהה הבקשה
 * @param {number} ratingData.score - ציון (1-5)
 * @param {string} [ratingData.review] - חוות דעת אופציונלית
 * @returns {Promise<Object>} תגובת השרת עם הדירוג החדש
 * @throws {Error} אם השליחה נכשלה
 */
export async function submitRating(ratingData) {
  const response = await apiFetch(`${API_BASE}/api/ratings`, {
    method: 'POST',
    body: JSON.stringify(ratingData)
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to submit rating');
  }
  return data;
}

/**
 * בדיקה אם דירוג כבר קיים עבור בקשה מסוימת
 * @param {string} requestId - מזהה הבקשה
 * @returns {Promise<Object>} תגובת השרת עם מצב הדירוג
 * @throws {Error} אם הבדיקה נכשלה
 */
export async function checkRatingExists(requestId) {
  const response = await apiFetch(`${API_BASE}/api/ratings/${requestId}/check`, {});

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to check rating');
  }
  return data;
}
