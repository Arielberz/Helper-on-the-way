/*
  קובץ זה אחראי על:
  - מרכיב המפה המרכזי של האפליקציה (Leaflet/React Leaflet)
  - תצוגת בקשות עזרה בזמן אמת על המפה
  - מעקב מיקום משתמש בזמן אמת ושיתוף מיקום ב-Socket.IO
  - ניהול מסלולים וניווט לצורך מעבר לצ'אט ופרופיל
  - הצגת markers לבקשות פעילות, משתמשים ומעזרים

  הקובץ משמש את:
  - דף Home כמרכיב ראשי
  - HelpButton, IncomingHelpNotification וקומפוננטות משנה נוספות
  - useMapLiveSocketHandlers, useMapLocation hooks

  הקובץ אינו:
  - מטפל באימות (זה תפקיד authMiddleware/ProtectedRoute)
  - מכיל לוגיקת תשלומים או דירוגים
*/

import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./leaflet-overrides.css";
import { useHelperRequest } from "../../context/HelperRequestContext";

import HelpButton from "../helpButton/helpButton";
import IncomingHelpNotification from "../IncomingHelpNotification/IncomingHelpNotification";
import { getToken, getUserId } from "../../utils/authUtils";
import { useUnreadCount } from "../../hooks/useUnreadCount";
import { useMapLocation } from "../../hooks/useMapLocation";
import { useMapLiveSocketHandlers, useActiveRequestTracking } from "../../hooks/useMapLiveSocketHandlers";
import { useAlert } from "../../context/AlertContext";
import { fetchRouteGeometry } from "../../utils/locationUtils";
import { getAllRequests, requestHelp } from "../../services/requests.service";
import { getConversationByRequest } from "../../services/chat.service";

import MapRefSetter from "./components/MapRefSetter";
import LocationAccuracyBanner from "./components/LocationAccuracyBanner";
import MapSidebar from "./components/MapSidebar";
import MobileMapHeader from "./components/MobileMapHeader";
import ProfileMenu from "./components/ProfileMenu";
import ConfirmationToast from "./components/ConfirmationToast";
import UserMarker from "./components/UserMarker";
import RequestMarkers from "./components/RequestMarkers";
import RoutePolylines from "./components/RoutePolylines";

export default function MapLive() {
  const { showAlert } = useAlert();
  const [sharedMarkers, setSharedMarkers] = useState([]);
  const { socket, setEtaForRequest } = useHelperRequest();

  const [confirmationMessage, setConfirmationMessage] = useState(null);
  const [mapRef, setMapRef] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const unreadCount = useUnreadCount();
  
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const {
    position,
    locationAccuracy,
    locationError,
    showAccuracyBanner,
    refreshLocation,
    dismissAccuracyBanner,
  } = useMapLocation(mapRef);
  const [routes, setRoutes] = useState({});
  const [myActiveRequest, setMyActiveRequest] = useState(null); // User's active request (as requester or helper)
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const token = getToken();

  useMapLiveSocketHandlers(socket, setSharedMarkers, setMyActiveRequest);
  useActiveRequestTracking(socket, sharedMarkers, setMyActiveRequest);

  useEffect(() => {
    const { focusLocation } = location.state || {};
    if (focusLocation && mapRef) {

      mapRef.flyTo([focusLocation.lat, focusLocation.lng], 16, {
        duration: 1.5,
      });
    }
  }, [location.state, mapRef]);

  useEffect(() => {
    if (!token) return;

    const fetchRequests = async () => {
      try {
        const json = await getAllRequests(navigate);
        
        const uniqueRequests = (json.data || []).reduce((acc, req) => {
          const id = req._id || req.id;
          if (id && !acc.some(r => (r._id || r.id) === id)) {
            acc.push(req);
          }
          return acc;
        }, []);
        
        setSharedMarkers(uniqueRequests);
        
        // Get current user's phone verification status
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        setIsPhoneVerified(user.phoneVerified || false);
      } catch (err) {
        if (err.message === 'NO_TOKEN' || err.message === 'UNAUTHORIZED') {
          return;
        }
      }
    };

    fetchRequests();
  }, [token, navigate]);

  const fetchRoute = async (requestId, fromLat, fromLng, toLat, toLng) => {
    try {
      const coordinates = await fetchRouteGeometry(fromLat, fromLng, toLat, toLng);
      
      const latLngCoordinates = coordinates.map(coord => [coord[1], coord[0]]);
      
      setRoutes(prev => ({
        ...prev,
        [requestId]: {
          coordinates: latLngCoordinates
        }
      }));
    } catch (error) {
      console.error('Error fetching route:', error);
    }
  };

  useEffect(() => {
    if (!position || !position[0] || !position[1] || !sharedMarkers.length) return;

    const currentUserId = getUserId();
    
    sharedMarkers.forEach(request => {
      const isAssignedHelper = 
        request.status === 'assigned' && 
        (request.helper === currentUserId || request.helper?._id === currentUserId);
      
      if (isAssignedHelper && 
          request.location?.lat && 
          request.location?.lng && 
          !routes[request._id || request.id]) {
        

        fetchRoute(
          request._id || request.id,
          position[0],
          position[1],
          request.location.lat,
          request.location.lng
        );
      }
    });
  }, [sharedMarkers, position]);

  const handleSelectRequest = (request) => {
    if (mapRef && request.location?.lat && request.location?.lng) {
      mapRef.flyTo([request.location.lat, request.location.lng], 16, {
        duration: 1.5,
      });

      if (position && position[0] && position[1]) {
        fetchRoute(
          request._id || request.id,
          position[0],
          position[1],
          request.location.lat,
          request.location.lng
        );
      }
    }
  };

  const handleRequestCreated = (newRequest) => {


    setSharedMarkers((prev) => {
      if (!newRequest?._id && !newRequest?.id) return [...prev, newRequest];
      const id = newRequest._id || newRequest.id;
      const exists = prev.some((m) => (m._id || m.id) === id);
      return exists ? prev : [...prev, newRequest];
    });

    if (mapRef && newRequest.location) {
      mapRef.flyTo([newRequest.location.lat, newRequest.location.lng], 16, {
        duration: 1.5,
      });
    }

    setConfirmationMessage("Help request created successfully!");

    setTimeout(() => {
      setConfirmationMessage(null);
    }, 5000);
  };

  const openChat = async (request) => {


    if (!token) {
      showAlert("אנא התחבר כדי לשלוח הודעות");
      navigate("/login");
      return;
    }

    if (position && position[0] && position[1] && request.location?.lat && request.location?.lng) {
      fetchRoute(
        request._id || request.id,
        position[0],
        position[1],
        request.location.lat,
        request.location.lng
      );
    }

    try {
      const currentUserId = getUserId();
      
      if (!request.helper && request.status === 'pending') {
        try {
          await requestHelp(request._id, {
            message: 'אני יכול לעזור לך!',
            location: {
              lat: position[0],
              lng: position[1]
            }
          });
          showAlert(`✅ בקשת העזרה נשלחה! ממתין לאישור המבקש.`, { onClose: () => window.location.reload() });
          return;
        } catch (error) {
          // Handle phone verification error
          if (error.code === 'PHONE_VERIFICATION_REQUIRED' || 
              error.message?.includes('Phone verification required')) {
            showAlert(
              `📱 צריך לאמת מספר טלפון כדי לעזור בבקשות. אנא אמת את המספר שלך.`,
              {
                onClose: () => navigate('/phone-verification')
              }
            );
            return;
          }
          showAlert(`❌ ${error.message || 'נכשל בשליחת בקשת העזרה'}`);
          return;
        }
      } 
      
      else if (request.helper && (request.helper === currentUserId || request.helper._id === currentUserId)) {
      } 
      
      else if (request.helper) {
        showAlert('⚠️ בקשה זו כבר שובצה לעוזר אחר');
        return;
      } 
      
      else {
        showAlert('⚠️ בקשה זו אינה זמינה יותר');
        return;
      }

      const data = await getConversationByRequest(request._id);
      
      const conversationId = data.data?.conversation?._id || data.data?._id;
      navigate("/chat", { state: { conversationId } });
    } catch (error) {
      showAlert(`שגיאה בפתיחת השיחה: ${error.message}`);
    }
  };

  return (
    <div style={{ position: "relative", height: "100vh", width: "100%" }}>
      <LocationAccuracyBanner
        showAccuracyBanner={showAccuracyBanner}
        locationAccuracy={locationAccuracy}
        locationError={locationError}
        requestPreciseLocation={refreshLocation}
        setShowAccuracyBanner={dismissAccuracyBanner}
      />

      {!isMobile && !isHelpModalOpen && (
        <MapSidebar
          mapRef={mapRef}
          userPosition={position}
          requests={sharedMarkers}
          onSelectRequest={handleSelectRequest}
        />
      )}

      {isMobile && !isHelpModalOpen && (
        <MobileMapHeader
          mapRef={mapRef}
          userPosition={position}
          requests={sharedMarkers}
          onSelectRequest={handleSelectRequest}
          unreadCount={unreadCount}
          navigate={navigate}
        />
      )}

      <MapContainer
        center={position}
        zoom={locationAccuracy === "precise" ? 15 : 12}
        style={{ height: "100vh", width: "100%" }}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer
          attribution=""
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <UserMarker position={position} locationAccuracy={locationAccuracy} />

        <MapRefSetter setMapRef={setMapRef} />

        <RequestMarkers
          sharedMarkers={sharedMarkers}
          routes={routes}
          position={position}
          fetchRoute={fetchRoute}
          openChat={openChat}
          isPhoneVerified={isPhoneVerified}
          onVerifyPhoneClick={() => navigate('/phone-verification')}
        />

        <RoutePolylines routes={routes} />
      </MapContainer>

      {!isMobile && !isHelpModalOpen && (
        <ProfileMenu
          showProfileMenu={showProfileMenu}
          setShowProfileMenu={setShowProfileMenu}
          unreadCount={unreadCount}
          navigate={navigate}
        />
      )}

      <ConfirmationToast message={confirmationMessage} />

      {!isHelpModalOpen && <IncomingHelpNotification />}

      <div className="fixed bottom-6 right-6 flex flex-col-reverse gap-2 z-1000">
        <HelpButton
          onRequestCreated={handleRequestCreated}
          onModalStateChange={setIsHelpModalOpen}
          fallbackLocation={position ? { lat: position[0], lng: position[1] } : null}
        />
      </div>
    </div>
  );
}
