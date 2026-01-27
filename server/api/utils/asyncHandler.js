/*
  קובץ זה אחראי על:
  - עטיפת פונקציות async לטיפול בשגיאות
  - מניעת בלוקי try/catch חוזרים
  - העברת שגיאות ל-Express error handler

  הקובץ משמש את:
  - קונטרולרים ומידלווירים שמשתמשים בו

  הקובץ אינו:
  - מכיל לוגיקה עסקית - רק פונקציית עזר
*/

function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = asyncHandler;
