/*
  קובץ זה אחראי על:
  - ניהול אימות משתמש בצד הלקוח (שמירה וטעינת טוקן JWT)
  - בדיקת תוקף טוקן וניתוח נתונים ממנו
  - ניקוי מידע אימות בהתנתקות

  הקובץ משמש את:
  - ProtectedRoute - בדיקת אימות לפני גישה לדפים
  - כל רכיב שצריך לשלוח בקשות מאומתות
  - דפי התחברות/הרשמה לשמירת טוקן לאחר הצלחה

  הקובץ אינו:
  - מאמת טוקן בצד שרת - אחריות של authMiddleware בשרת
  - מטפל בבקשות API - משתמש ב-apiFetch לכך
*/


export const setAuthData = (token, user) => {
  try {
    if (!token || !user) {
      throw new Error('Token and user data are required');
    }


    localStorage.setItem('token', token);
    localStorage.setItem('userId', user._id || user.id);
  } catch (error) {
    console.error('Error storing auth data:', error);
    clearAuthData();
  }
};

export const isTokenExpired = (token) => {
  if (!token) return true
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    
    if (payload.exp) {
      const currentTime = Math.floor(Date.now() / 1000);
      return currentTime > payload.exp;
    }
    
    return false;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true
  }
};

export const getToken = () => {
  try {
    const token = localStorage.getItem('token')
    
    if (!token) return null
    
    if (isTokenExpired(token)) {
      console.log('Token expired, clearing auth data');
      clearAuthData();
      return null;
    }
    
    return token;
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

export const getUserId = () => {
  try {
    return localStorage.getItem('userId');
  } catch (error) {
    console.error('Error getting userId:', error);
    return null;
  }
};

export const clearAuthData = () => {
  try {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('user');
    localStorage.removeItem('authTimestamp');
    localStorage.removeItem('etaData');
    localStorage.removeItem('etaByRequestId');
  } catch (error) {
    console.error('Error clearing auth data:', error);
  }
};

export const isAuthenticated = () => {
  const token = getToken();
  return !!token;
};
