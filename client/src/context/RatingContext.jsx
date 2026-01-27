/*
  קובץ זה אחראי על:
  - ניהול מצב גלובלי של מודל הדירוג
  - שמירת מידע על הבקשה שצריכה לקבל דירוג
  - פתיחה/סגירה של מודל הדירוג מכל מקום באפליקציה
  - שליחת דירוגים (מקור האמת היחיד)
  - בדיקת דירוגים ממתינים (לוגיקה מרכזית)
  - Hook useRating לגישה לפונקציות דירוג

  הקובץ משמש את:
  - App.jsx שמעטף את ה-Routes ב-RatingProvider
  - GlobalRatingModal, דף צ'אט, נוטיפיקציות

  הקובץ אינו:
  - מציג UI של הדירוג (זה ב-RatingModal)
*/

import React, { createContext, useContext, useState, useCallback } from 'react';
import { submitRating, checkRatingExists } from '../services/ratings.service';
import { getMyRequests } from '../services/requests.service';

const RatingContext = createContext();

export const useRating = () => {
  const context = useContext(RatingContext);
  if (!context) {
    throw new Error('useRating must be used within a RatingProvider');
  }
  return context;
};

export const RatingProvider = ({ children }) => {
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [requestToRate, setRequestToRate] = useState(null);
  const [ratedRequestIds, setRatedRequestIds] = useState(() => {
    try {
      const stored = localStorage.getItem('ratedRequestIds');
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });

  const openRatingModal = (request) => {
    setRequestToRate(request);
    setShowRatingModal(true);
  };

  const closeRatingModal = () => {
    setShowRatingModal(false);
    setRequestToRate(null);
  };

  const markRequestAsRated = (requestId) => {
    setRatedRequestIds(prev => {
      const updated = new Set(prev);
      updated.add(requestId);
      try {
        localStorage.setItem('ratedRequestIds', JSON.stringify([...updated]));
      } catch (error) {
        console.error('Failed to save rated request IDs:', error);
      }
      return updated;
    });
  };

  const isRequestRated = (requestId) => {
    return ratedRequestIds.has(requestId);
  };

  /**
   * שליחת דירוג מהקונטקסט - מקור האמת היחיד לשליחת דירוגים
   * מטפל ב-409 (כבר דורג) באופן גרייספול
   * @param {string} requestId - מזהה הבקשה
   * @param {number} score - ציון (1-5)
   * @param {string} review - חוות דעת (אופציונלי)
   * @returns {Promise<Object>} תגובת השרת או אובייקט עם alreadyRated: true
   */
  const submitRatingFromContext = useCallback(async (requestId, score, review) => {
    try {
      const response = await submitRating({ requestId, score, review });
      
      // Mark as rated on success
      markRequestAsRated(requestId);
      closeRatingModal();
      
      return { success: true, data: response.data };
    } catch (error) {
      // Handle 409 Conflict (already rated) gracefully
      if (error.message?.includes('409') || error.message?.includes('already been rated')) {
        markRequestAsRated(requestId);
        closeRatingModal();
        return { success: true, alreadyRated: true };
      }
      
      // Re-throw other errors for component to handle
      throw error;
    }
  }, []);

  /**
   * בדיקת דירוגים ממתינים - לוגיקה מרכזית אחת
   * מחזיר רשימת בקשות שממתינות לדירוג
   * @returns {Promise<Array>} רשימת בקשות שצריכות דירוג
   */
  const checkPendingRatings = useCallback(async () => {
    try {
      const data = await getMyRequests();
      const requests = Array.isArray(data)
        ? data
        : Array.isArray(data?.requests)
          ? data.requests
          : Array.isArray(data?.data)
            ? data.data
            : [];
      
      const needsRating = [];
      
      for (const req of requests) {
        if (req.status === 'completed' && req.requesterConfirmedAt && !req.rated && !isRequestRated(req._id)) {
          try {
            const ratingCheckData = await checkRatingExists(req._id);
            if (!ratingCheckData?.alreadyRated && !ratingCheckData?.data?.alreadyRated) {
              needsRating.push(req);
            } else {
              // Mark as rated if server says it's already rated
              markRequestAsRated(req._id);
            }
          } catch (error) {
            console.error(`Error checking rating for request ${req._id}:`, error);
          }
        }
      }

      return needsRating;
    } catch (error) {
      console.error("Error checking pending ratings:", error);
      return [];
    }
  }, [ratedRequestIds]);

  const value = {
    showRatingModal,
    requestToRate,
    openRatingModal,
    closeRatingModal,
    markRequestAsRated,
    isRequestRated,
    ratedRequestIds,
    submitRatingFromContext,
    checkPendingRatings
  };

  return (
    <RatingContext.Provider value={value}>
      {children}
    </RatingContext.Provider>
  );
};
