/*
  קובץ זה אחראי על:
  - נקודת הכניסה הראשית לאפליקציית React
  - עטיפת האפליקציה ב-BrowserRouter לניתוב
  - הזרקת ספקי הקשר גלובליים (AlertProvider)
  - בדיקת תוקף טוקן אימות בעת טעינת האפליקציה
  - רינדור הרכיב הראשי App לתוך ה-DOM

  הקובץ משמש את:
  - מערכת הבנייה (Vite) כנקודת כניסה ראשית
  - דפדפן המשתמש בעת טעינת האפליקציה

  הקובץ אינו:
  - מטפל בניתוב ספציפי (זה תפקיד App.jsx)
  - מכיל לוגיקה עסקית של האפליקציה
*/

import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./app.jsx";
import { BrowserRouter } from "react-router-dom";
import { AlertProvider } from "./context/AlertContext";
import { isTokenExpired, clearAuthData } from "./utils/authUtils";


const token = localStorage.getItem('token');
if (token && isTokenExpired(token)) {
  console.log('Clearing expired token on startup');
  clearAuthData();
}

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AlertProvider>
      <App />
    </AlertProvider>
  </BrowserRouter>
);
