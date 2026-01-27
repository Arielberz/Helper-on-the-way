/*
  קובץ זה אחראי על:
  - הגדרת כל הסטטוסים האפשריים לבקשות סיוע
  - אספקת קבועים למחזור חיי הבקשה: ממתינה, משוייכת, בטיפול, הושלמה, בוטלה

  הקובץ משמש את:
  - מודל הבקשות (requestsModel.js)
  - קונטרולר הבקשות ושירות הבקשות
  - שירות הניקיון לזיהוי בקשות ישנות

  הקובץ אינו:
  - מכיל לוגיקה או פונקציות - רק קבועים
*/
module.exports = {
  PENDING: 'pending',
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};
