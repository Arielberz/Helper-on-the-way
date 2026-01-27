/*
  קובץ זה אחראי על:
  - התראה על דירוגים ממתינים שהמשתמש צריך לתת
  - בדיקה והצגה של בקשות שממתינות לדירוג
  - ניהול תהליך פתיחת מודאל הדירוג
  - אינטגרציה עם קונטקסט הדירוגים

  הקובץ משמש את:
  - דף הבית ודפים אחרים

  הקובץ אינו:
  - מבצע לוגיקת בדיקת דירוגים (זה ב-RatingContext)
  - מטפל בתשלומים או צ'אט
*/

import React, { useState, useEffect } from 'react';
import { useRating } from '../../context/RatingContext';

const PendingRatingNotification = () => {
  const [pendingCount, setPendingCount] = useState(0);
  const { openRatingModal, checkPendingRatings } = useRating();
  const [pendingRequests, setPendingRequests] = useState([]);

  useEffect(() => {
    fetchPendingRatings();
    
    const interval = setInterval(fetchPendingRatings, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchPendingRatings = async () => {
    try {
      const needsRating = await checkPendingRatings();
      setPendingCount(needsRating.length);
      setPendingRequests(needsRating);
    } catch (error) {
      console.error("Error checking pending ratings:", error);
    }
  };

  const handleClick = () => {
    if (pendingRequests.length > 0) {
      openRatingModal(pendingRequests[0]);
    }
  };

  if (pendingCount === 0) {
    return null;
  }

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 right-6 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full p-4 shadow-2xl transform transition-all hover:scale-110 z-50 flex items-center gap-2 animate-pulse"
      title="יש בקשות שממתינות לדירוג"
    >
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
      <span className="font-bold text-lg">{pendingCount}</span>
      <span className="text-sm">דרג עכשיו!</span>
    </button>
  );
};

export default PendingRatingNotification;
