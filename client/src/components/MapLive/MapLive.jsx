// src/components/MapLive/MapLive.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./leaflet-overrides.css";
import { useHelperRequest } from "../../context/HelperRequestContext";

import HelpButton from "../helpButton/helpButton";
import NearbyRequestsButton from "../NearbyRequestsButton/NearbyRequestsButton";
import PendingHelpersMapButton from "../PendingHelpersMapButton/PendingHelpersMapButton";
import { getToken, getUserId, clearAuthData } from "../../utils/authUtils";
import { useUnreadCount } from "../../hooks/useUnreadCount";
import { useMapLocation } from "../../hooks/useMapLocation";
import { API_BASE } from "../../utils/apiConfig";
import { apiFetch } from "../../utils/apiFetch";

// Subcomponents
import MapRefSetter from "./components/MapRefSetter";
import LocationAccuracyBanner from "./components/LocationAccuracyBanner";
import MapLogo from "./components/MapLogo";
import ProfileMenu from "./components/ProfileMenu";
import ConfirmationToast from "./components/ConfirmationToast";
import UserMarker from "./components/UserMarker";
import RequestMarkers from "./components/RequestMarkers";
import RoutePolylines from "./components/RoutePolylines";

export default function MapLive() {
  const [sharedMarkers, setSharedMarkers] = useState([]); // נקודות מהשרת
  const { socket, setEtaForRequest } = useHelperRequest(); // Use shared socket from context

  const [confirmationMessage, setConfirmationMessage] = useState(null);
  const [mapRef, setMapRef] = useState(null); // התייחסות למפה
  const [showProfileMenu, setShowProfileMenu] = useState(false); // Profile dropdown menu
  const unreadCount = useUnreadCount(); // Unread messages count from shared hook
  
  // Use location hook
  const {
    position,
    locationAccuracy,
    locationError,
    showAccuracyBanner,
    refreshLocation,
    dismissAccuracyBanner,
  } = useMapLocation(mapRef);
  const [routes, setRoutes] = useState({}); // Store routes for each request { requestId: routeCoordinates }
  const [isNearbyModalOpen, setIsNearbyModalOpen] = useState(false); // מצב מודל בקשות קרובות
  const [myActiveRequest, setMyActiveRequest] = useState(null); // User's active request (as requester or helper)
  const [autoOpenNearby, setAutoOpenNearby] = useState(false); // Auto-open nearby requests panel

  const navigate = useNavigate();
  const location = useLocation();
  const token = getToken(); // Secure token retrieval

  // Handle focus location from navigation (when helper clicks "View on Map")
  useEffect(() => {
    const { focusLocation } = location.state || {};
    if (focusLocation && mapRef) {

      // Center and zoom to the request location with animation
      mapRef.flyTo([focusLocation.lat, focusLocation.lng], 16, {
        duration: 1.5,
      });
    }
  }, [location.state, mapRef]);

  // Listen to Socket.IO events for real-time updates
  useEffect(() => {
    if (!socket) return;

    // האזנה לבקשות חדשות מהשרת
    const handleRequestAdded = (request) => {

      setSharedMarkers((prev) => {
        if (!request?._id) return prev;
        const exists = prev.some((m) => (m._id || m.id) === request._id);
        return exists ? prev : [...prev, request];
      });
    };

    // Update existing request
    const handleRequestUpdated = (request) => {
      if (!request?._id) return;
      setSharedMarkers((prev) => prev.map((m) => ((m._id || m.id) === request._id ? { ...m, ...request } : m)));
    };

    // Remove deleted request
    const handleRequestDeleted = ({ _id }) => {
      if (!_id) return;
      setSharedMarkers((prev) => prev.filter((m) => (m._id || m.id) !== _id));
    };

    socket.on("requestAdded", handleRequestAdded);
    socket.on("requestUpdated", handleRequestUpdated);
    socket.on("requestDeleted", handleRequestDeleted);

    return () => {
      socket.off("requestAdded", handleRequestAdded);
      socket.off("requestUpdated", handleRequestUpdated);
      socket.off("requestDeleted", handleRequestDeleted);
    };
  }, [socket]);

  // Identify user's active request (as requester or helper) and send location updates if helper
  useEffect(() => {
    const userId = getUserId();
    if (!userId || sharedMarkers.length === 0) return;

    // Find active request where user is requester OR helper with status 'assigned'
    const activeReq = sharedMarkers.find(
      req => req.status === 'assigned' && 
            (req.user?._id === userId || req.user === userId || 
             req.helper?._id === userId || req.helper === userId)
    );



    setMyActiveRequest(activeReq || null);

    // If user is the helper, send location updates every 30 seconds
    if (activeReq && (activeReq.helper?._id === userId || activeReq.helper === userId) && socket) {
      const sendLocationUpdate = () => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const locationData = {
                requestId: activeReq._id,
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude
              };
              socket.emit('helperLocationUpdate', locationData);

            },
            (error) => console.warn('❌ Geolocation error:', error.message)
          );
        }
      };

      // Send immediately on mount and then every 30 seconds

      sendLocationUpdate();
      const interval = setInterval(sendLocationUpdate, 30000);
      return () => {

        clearInterval(interval);
      };
    }
  }, [sharedMarkers, socket]);

  // 3. טעינת כל המיקומים מהשרת פעם אחת בהתחלה
  useEffect(() => {
    if (!token) return;

    const fetchRequests = async () => {
      try {
        const res = await apiFetch(`${API_BASE}/api/requests`, {}, navigate);

        const json = await res.json();

        
        // Deduplicate by _id before setting
        const uniqueRequests = (json.data || []).reduce((acc, req) => {
          const id = req._id || req.id;
          if (id && !acc.some(r => (r._id || r.id) === id)) {
            acc.push(req);
          }
          return acc;
        }, []);
        
        setSharedMarkers(uniqueRequests);
      } catch (err) {
        if (err.message === 'NO_TOKEN' || err.message === 'UNAUTHORIZED') {
          return;
        }
        // Failed to fetch locations
      }
    };

    fetchRequests();
  }, [token, navigate]);

  // 4. Fetch route from OSRM
  const fetchRoute = async (requestId, fromLat, fromLng, toLat, toLng) => {
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=full&geometries=geojson`;
      
      const response = await fetch(url);
      if (!response.ok) {
        console.error('Failed to fetch route from OSRM');
        return;
      }

      const data = await response.json();
      
      if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        const coordinates = route.geometry.coordinates.map(coord => [coord[1], coord[0]]); // Convert [lng, lat] to [lat, lng]
        
        setRoutes(prev => ({
          ...prev,
          [requestId]: {
            coordinates,
            distance: route.distance,
            duration: route.duration
          }
        }));
        
        // Push ETA/distance to context for chat
        const distanceKm = route.distance / 1000; // Convert meters to km
        const etaMinutes = route.duration / 60; // Convert seconds to minutes
        const etaSeconds = route.duration; // Keep seconds for consistency
        
        if (setEtaForRequest) {
          setEtaForRequest(requestId, { distanceKm, etaMinutes, etaSeconds });
        }
      }
    } catch (error) {
      console.error('Error fetching route:', error);
    }
  };

  // Auto-fetch routes for requests where current user is the assigned helper
  useEffect(() => {
    if (!position || !position[0] || !position[1] || !sharedMarkers.length) return;

    const currentUserId = getUserId();
    
    sharedMarkers.forEach(request => {
      // Check if current user is the assigned helper
      const isAssignedHelper = 
        request.status === 'assigned' && 
        (request.helper === currentUserId || request.helper?._id === currentUserId);
      
      // Fetch route if user is assigned helper and route not already loaded
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
  }, [sharedMarkers, position]); // Re-run when markers or position changes

  // 5. טיפול בבחירת בקשה מהרשימה
  const handleSelectRequest = (request) => {
    // מרכז את המפה על הבקשה שנבחרה
    if (mapRef && request.location?.lat && request.location?.lng) {
      mapRef.flyTo([request.location.lat, request.location.lng], 16, {
        duration: 1.5,
      });

      // Fetch route from user's position to the request
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

  // Handle new request created from HelpButton
  const handleRequestCreated = (newRequest) => {


    // Add to local markers (avoid duplicate since server will also emit requestAdded)
    setSharedMarkers((prev) => {
      if (!newRequest?._id && !newRequest?.id) return [...prev, newRequest];
      const id = newRequest._id || newRequest.id;
      const exists = prev.some((m) => (m._id || m.id) === id);
      return exists ? prev : [...prev, newRequest];
    });

    // Note: real-time broadcast of new requests should be triggered by the server
    // after authenticated creation, not directly by clients.

    // Zoom to the new request location
    if (mapRef && newRequest.location) {
      mapRef.flyTo([newRequest.location.lat, newRequest.location.lng], 16, {
        duration: 1.5,
      });
    }

    // Show confirmation message
    setConfirmationMessage("Help request created successfully!");

    // Hide confirmation after 5 seconds
    setTimeout(() => {
      setConfirmationMessage(null);
    }, 5000);
  };

  // Open chat with a specific user for a request
  const openChat = async (request) => {


    if (!token) {
      alert("אנא התחבר כדי לשלוח הודעות");
      navigate("/login");
      return;
    }

    // Fetch and display route to the request
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
      
      // Flow 1: Request is pending and no helper assigned yet → Send help request
      if (!request.helper && request.status === 'pending') {
        const helpResponse = await fetch(`${API_BASE}/api/requests/${request._id}/request-help`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            message: 'אני יכול לעזור לך!',
            location: {
              lat: position[0],
              lng: position[1]
            }
          })
        });
        
        if (!helpResponse.ok) {
          const helpData = await helpResponse.json();
          alert(`❌ ${helpData.message || 'נכשל בשליחת בקשת העזרה'}`);
          return;
        } else {
          await helpResponse.json();
          alert(`✅ בקשת העזרה נשלחה! ממתין לאישור המבקש.`);
          // Reload markers to show updated pendingHelpers
          window.location.reload();
          return;
        }
      } 
      
      // Flow 2: Helper is assigned and current user is the helper → Open chat
      else if (request.helper && (request.helper === currentUserId || request.helper._id === currentUserId)) {
        // Continue to chat opening code below
      } 
      
      // Flow 3: Helper already assigned to someone else
      else if (request.helper) {
        alert('⚠️ בקשה זו כבר שובצה לעוזר אחר');
        return;
      } 
      
      // Flow 4: Request is not pending anymore
      else {
        alert('⚠️ בקשה זו אינה זמינה יותר');
        return;
      }

      // Now get or create conversation
      const url = `${API_BASE}/api/chat/conversation/request/${request._id}`;


      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });



      if (response.ok) {
        // Navigate to chat page - the chat page will load this conversation
        const conversationId = data.data?.conversation?._id || data.data?._id;

        navigate("/chat", { state: { conversationId } });
      } else if (response.status === 401) {

        clearAuthData();
        navigate("/login");
      } else {
        console.error("Failed to open chat:", data);
        alert(`לא ניתן לפתוח שיחה: ${data.message || "שגיאה לא ידועה"}`);
      }
    } catch (error) {
      alert(`שגיאה בפתיחת השיחה: ${error.message}`);
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
        />

        <RoutePolylines routes={routes} />
      </MapContainer>

      {/* Logo - Top Left */}
      <MapLogo mapRef={mapRef} position={position} />

      {/* Auto-open toggle - below logo on left side */}
      {position && (
        <div className="fixed top-20 left-6 z-1000">
          <label
            className="flex items-center gap-2 px-3 py-2 cursor-pointer"
            style={{
              background: 'var(--glass-bg-strong)',
              backdropFilter: 'var(--glass-blur)',
              borderRadius: 'var(--rounded-xl)',
              border: '1px solid var(--glass-border)',
              boxShadow: 'var(--glass-shadow)',
            }}
            dir="rtl"
          >
            <span className="text-sm font-medium text-gray-700">הצג בקשות באזור</span>
            <div className="relative inline-block w-11 h-6">
              <input
                type="checkbox"
                checked={autoOpenNearby}
                onChange={(e) => setAutoOpenNearby(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </div>
          </label>
        </div>
      )}

      {/* Nearby Requests List - Always visible when toggle is ON */}
      {autoOpenNearby && position && (
        <div className="fixed top-36 right-6 z-1000">
          <NearbyRequestsButton
            requests={sharedMarkers}
            userPosition={position}
            onSelectRequest={handleSelectRequest}
            onModalStateChange={() => {}}
            forceOpen={true}
          />
        </div>
      )}

      {/* Nearby Button - Mobile Only (Top Center) - Hidden when toggle is ON */}
      {!autoOpenNearby && position && (
        <div className="fixed top-6 left-0 right-0 flex justify-center z-1000 sm:hidden pointer-events-none">
          <div className="pointer-events-auto">
            <NearbyRequestsButton
              requests={sharedMarkers}
              userPosition={position}
              onSelectRequest={handleSelectRequest}
              onModalStateChange={setIsNearbyModalOpen}
            />
          </div>
        </div>
      )}


      {!isNearbyModalOpen && (
        <ProfileMenu
          showProfileMenu={showProfileMenu}
          setShowProfileMenu={setShowProfileMenu}
          unreadCount={unreadCount}
          navigate={navigate}
        />
      )}

      <ConfirmationToast message={confirmationMessage} />

      {/* Pending Helpers Button - Floating (only when you have pending helpers) */}
      {!isNearbyModalOpen && <PendingHelpersMapButton />}

      {/* Button Group - Help at bottom, Nearby above (desktop only) */}
      <div className="fixed bottom-6 right-6 flex flex-col-reverse gap-2 z-1000">
        {!isNearbyModalOpen && (
          <HelpButton
            onRequestCreated={handleRequestCreated}
            onModalStateChange={() => {}}
            fallbackLocation={position ? { lat: position[0], lng: position[1] } : null}
          />
        )}
        {!autoOpenNearby && position && (
          <div className="hidden sm:block">
            <NearbyRequestsButton
              requests={sharedMarkers}
              userPosition={position}
              onSelectRequest={handleSelectRequest}
              onModalStateChange={() => {}}
            />
          </div>
        )}
      </div>
    </div>
  );
}
