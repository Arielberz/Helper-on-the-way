/*
  קובץ זה אחראי על:
  - מעטפת גלובלית ל-RatingModal המקושרת ל-RatingContext
  - הצגת מודל דירוג בכל מקום באפליקציה
  - ניהול מצב הדירוג הממתין (איזו request צריך לדרג)
  - מניעת טעינה מחדש של העמוד לאחר דירוג

  הקובץ משמש את:
  - App.jsx כמרכיב גלובלי
  - RatingContext לקביעת מתי להציג את המודל

  הקובץ אינו:
  - מכיל את לוגיקת הדירוג עצמה (זה ב-RatingModal)
  - שולח קריאות API ישירות
*/

import React from 'react';
import { useRating } from '../../context/RatingContext';
import RatingModal from '../RatingModal/RatingModal';

const GlobalRatingModal = () => {
  const { showRatingModal, requestToRate, closeRatingModal, markRequestAsRated } = useRating();

  const handleSuccess = (data) => {
    if (requestToRate?._id) {
      markRequestAsRated(requestToRate._id);
    }
    // Also mark by requestId from response data if available
    if (data?.requestId && data.requestId !== requestToRate?._id) {
      markRequestAsRated(data.requestId);
    }
    closeRatingModal();
  };

  if (!showRatingModal || !requestToRate) {
    return null;
  }

  return (
    <RatingModal
      requestId={requestToRate._id}
      helperName={requestToRate.helper?.username || requestToRate.helper?.name || 'Helper'}
      onClose={closeRatingModal}
      onSubmitSuccess={handleSuccess}
    />
  );
};

export default GlobalRatingModal;
