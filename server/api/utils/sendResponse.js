/*
  קובץ זה אחראי על:
  - פונקציית עזר לשליחת תגובות API אחידות
  - מבטיחה פורמט קבוע לכל התגובות
  - מפשטת טיפול בהצלחות ובשגיאות

  הקובץ משמש את:
  - כל הקונטרולרים במערכת

  הקובץ אינו:
  - מכיל לוגיקה עסקית - רק פונקציית עזר
*/

function sendResponse(res, status, success, message, data = null) {
  return res.status(status).json({ success, message, data });
}

module.exports = sendResponse;
