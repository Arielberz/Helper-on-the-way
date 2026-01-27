/*
  קובץ זה אחראי על:
  - הפניית משתמשים מחוברים מעמודים ציבוריים
  - בדיקה אם קיים טוקן מחובר ב-localStorage
  - מניעת גישה לדפי התחברות/הרשמה למשתמשים מחוברים
  - מעטפת עמודים כמו Landing, Login, Register, ForgotPassword

  הקובץ משמש את:
  - App.jsx לעטיפת מסלולים ציבוריים
  - React Router לצורך ניווט

  הקובץ אינו:
  - מטפל בלוגיקת התחברות
  - מאמת את הטוקן
*/

import { Navigate } from "react-router-dom";
import { getToken } from "../../utils/authUtils";

const PublicRoute = ({ children }) => {
  const token = getToken();
  
  if (token) {
    return <Navigate to="/home" replace />;
  }
  
  return children;
};

export default PublicRoute;
