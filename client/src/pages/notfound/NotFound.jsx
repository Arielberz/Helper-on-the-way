/*
  קובץ זה אחראי על:
  - דף 404 - הדף לא נמצא
  - הצגה כשמנסים לגשת לנתיב שאינו קיים
  - עיצוב פשוט וברור

  הקובץ משמש את:
  - React Router - כשאין התאמה לנתיב
  - משתמשים שטעו בכתובת

  הקובץ אינו:
  - מטפל בשגיאות שרת - רק נתיבים
  - מציג הודעות שגיאה - רק הודעה בסיסית
*/

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6" dir="rtl">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-2">הדף לא נמצא</h1>
        <p className="text-slate-600">הדף שאתה מחפש לא קיים.</p>
      </div>
    </div>
  );
}
