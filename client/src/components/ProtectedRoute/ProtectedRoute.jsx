/*
  קובץ זה אחראי על:
  - הגנה על מסלולים שדורשים אימות משתמש
  - בדיקת קיום טוקן JWT ב-localStorage
  - הפניה לדף ההתחברות אם אין טוקן
  - מעטפת עמודים כמו Home, Chat, Profile, MapLive

  הקובץ משמש את:
  - App.jsx לעטיפת מסלולים מוגנים
  - React Router לצורך ניווט

  הקובץ אינו:
  - מאמת את הטוקן בשרת (זה תפקיד authMiddleware בצד השרת)
  - מטפל בניהול משתמשים או התחברות
*/

import { Navigate } from "react-router-dom";
import { getToken } from "../../utils/authUtils";

const ProtectedRoute = ({ children }) => {
  const token = getToken();
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

export default ProtectedRoute;
