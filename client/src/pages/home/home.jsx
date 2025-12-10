import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import MapLive from "../../components/MapLive/MapLive.jsx";
import { NavLink } from "react-router-dom";
import { useRating } from "../../context/RatingContext";
import PendingRatingNotification from "../../components/PendingRatingNotification/PendingRatingNotification";
import { getToken } from "../../utils/authUtils";
import { API_BASE } from '../../utils/apiConfig';

export default function Home() {
  const { openRatingModal } = useRating();

  useEffect(() => {
    // Check if there's a pending rating request
    const checkPendingRating = async () => {
      try {
        const token = getToken();
        if (!token) return;

        // Fetch user's requests to check if any need rating
        const response = await fetch(`${API_BASE}/api/requests/my-requests`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          const requests = data.data || [];
          
          // Find requests that are completed and requester confirmed but not yet rated
          const pendingRatingRequests = requests.filter(req => 
            req.status === 'completed' && 
            req.requesterConfirmedAt && 
            !req.rated // We'll need to check if already rated
          );

          // For now, check the first pending one
          if (pendingRatingRequests.length > 0) {
            const requestToRate = pendingRatingRequests[0];
            
            // Check if already rated
            const ratingCheckResponse = await fetch(
              `${API_BASE}/api/ratings/${requestToRate._id}/check`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            if (ratingCheckResponse.ok) {
              const ratingCheckData = await ratingCheckResponse.json();
              if (!ratingCheckData.data?.alreadyRated) {
                // Show rating modal automatically
                openRatingModal(requestToRate);
              }
            }
          }
        }
      } catch (error) {
        console.error("Error checking pending ratings:", error);
      }
    };

    checkPendingRating();
  }, [openRatingModal]);

  return (
    <>
      <MapLive />
      <PendingRatingNotification />
    </>
  );
}
