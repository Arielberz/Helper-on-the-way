import React, { useState, useEffect } from 'react';
import { useRating } from '../../context/RatingContext';
import { getToken } from '../../utils/authUtils';

const PendingRatingNotification = () => {
  const [pendingCount, setPendingCount] = useState(0);
  const { openRatingModal } = useRating();
  const [pendingRequests, setPendingRequests] = useState([]);

  useEffect(() => {
    checkPendingRatings();
    
    // Check every 30 seconds for new pending ratings
    const interval = setInterval(checkPendingRatings, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkPendingRatings = async () => {
    try {
      const token = getToken();
      if (!token) return;

      const response = await fetch("http://localhost:3001/api/requests/my-requests", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const requests = data.data || [];
        
        // Find completed requests that need rating
        const needsRating = [];
        
        for (const req of requests) {
          if (req.status === 'completed' && req.requesterConfirmedAt) {
            // Check if already rated
            const ratingCheckResponse = await fetch(
              `http://localhost:3001/api/ratings/${req._id}/check`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            if (ratingCheckResponse.ok) {
              const ratingCheckData = await ratingCheckResponse.json();
              if (!ratingCheckData.data?.alreadyRated) {
                needsRating.push(req);
              }
            }
          }
        }

        setPendingCount(needsRating.length);
        setPendingRequests(needsRating);
      }
    } catch (error) {
      console.error("Error checking pending ratings:", error);
    }
  };

  const handleClick = () => {
    if (pendingRequests.length > 0) {
      // Open rating modal for the first pending request
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
