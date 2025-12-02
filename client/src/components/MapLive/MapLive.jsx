// src/components/MapLive/MapLive.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useHelperRequest } from "../../context/HelperRequestContext";

import HelpButton from "../helpButton/helpButton";
import NearbyRequestsButton from "../NearbyRequestsButton/NearbyRequestsButton";
import PendingHelpersMapButton from "../PendingHelpersMapButton/PendingHelpersMapButton";
import {
  getInitialLocation,
  getPreciseLocation,
  cacheLocation,
} from "../../utils/locationUtils";
import { getToken, getUserId, clearAuthData } from "../../utils/authUtils";

// Subcomponents
import MapRefSetter from "./components/MapRefSetter";
import LocationAccuracyBanner from "./components/LocationAccuracyBanner";
import MapLogo from "./components/MapLogo";
import ProfileMenu from "./components/ProfileMenu";
import ConfirmationToast from "./components/ConfirmationToast";
import UserMarker from "./components/UserMarker";
import RequestMarkers from "./components/RequestMarkers";
import RoutePolylines from "./components/RoutePolylines";

const API_BASE = import.meta.env.VITE_API_URL;

export default function MapLive() {
  // Default location: Center of Israel (Tel Aviv area)
  const DEFAULT_LOCATION = [32.0853, 34.7818];

  const [position, setPosition] = useState(DEFAULT_LOCATION); // המיקום שלך
  const [locationAccuracy, setLocationAccuracy] = useState("loading"); // 'loading', 'approximate', 'precise', 'default'
  const [showAccuracyBanner, setShowAccuracyBanner] = useState(false);
  const [locationError, setLocationError] = useState(null); // Error message for location issues
  const [sharedMarkers, setSharedMarkers] = useState([]); // נקודות מהשרת
  const { socket } = useHelperRequest(); // Use shared socket from context

  const [confirmationMessage, setConfirmationMessage] = useState(null);
  const [mapRef, setMapRef] = useState(null); // התייחסות למפה
  const [showProfileMenu, setShowProfileMenu] = useState(false); // Profile dropdown menu
  const [unreadCount, setUnreadCount] = useState(0); // Unread messages count
  const [routes, setRoutes] = useState({}); // Store routes for each request { requestId: routeCoordinates }
  const [isNearbyModalOpen, setIsNearbyModalOpen] = useState(false); // מצב מודל בקשות קרובות

  const navigate = useNavigate();
  const location = useLocation();
  const token = getToken(); // Secure token retrieval

  // Fetch unread messages count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (!token) return;
      try {
        const response = await fetch(`${API_BASE}/api/chat/unread-count`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setUnreadCount(data.data?.unreadCount || 0);
        }
      } catch (error) {
        console.error("Error fetching unread count:", error);
      }
    };
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [token]);

  // Handle focus location from navigation (when helper clicks "View on Map")
  useEffect(() => {
    const { focusLocation } = location.state || {};
    if (focusLocation && mapRef) {
      console.log('🗺️ Centering map on request location:', focusLocation);
      // Center and zoom to the request location with animation
      mapRef.flyTo([focusLocation.lat, focusLocation.lng], 16, {
        duration: 1.5,
      });
    }
  }, [location.state, mapRef]);

  // 1. Get initial location using IP-based geolocation (no permission needed)
  useEffect(() => {
    const initializeLocation = async () => {
      try {
        // Step 1: Get IP-based location first (instant, no permission)
        const location = await getInitialLocation();
        setPosition([location.lat, location.lng]);
        setLocationAccuracy(location.accuracy);

        // Center map on user's location
        if (mapRef) {
          mapRef.setView(
            [location.lat, location.lng],
            location.accuracy === "precise" ? 15 : 12
          );
        }

        console.log(
          `Location initialized: ${location.city || "Unknown"}, ${
            location.country || "Unknown"
          } (${location.accuracy})`
        );

        // Step 2: After IP location is set, automatically request GPS permission
        if (location.accuracy !== "precise") {
          setShowAccuracyBanner(true);

          // Auto-request precise location after a short delay
          setTimeout(() => {
            requestPreciseLocation();
          }, 1000);
        }
      } catch (error) {
        console.error("Failed to get initial location:", error);
        setPosition(DEFAULT_LOCATION);
        setLocationAccuracy("default");
        setShowAccuracyBanner(true);
      }
    };

    initializeLocation();
  }, [mapRef]);

  // Request precise GPS location (only when user clicks button)
  const requestPreciseLocation = async () => {
    try {
      setLocationAccuracy("loading");
      const preciseLocation = await getPreciseLocation();
      setPosition([preciseLocation.lat, preciseLocation.lng]);
      setLocationAccuracy("precise");
      setShowAccuracyBanner(false);

      // Center map on precise location
      if (mapRef) {
        mapRef.flyTo([preciseLocation.lat, preciseLocation.lng], 15, {
          duration: 1.5,
        });
      }

      // Cache the GPS location for future use
      cacheLocation(preciseLocation);

      console.log("Precise GPS location acquired");
    } catch (error) {
      console.error("GPS location denied or unavailable:", error);
      setLocationAccuracy("approximate");
      // Keep showing banner
    }
  };

  // 2. Listen to Socket.IO events for real-time updates
  useEffect(() => {
    if (!socket) return;

    // האזנה לבקשות חדשות מהשרת
    const handleRequestAdded = (request) => {
      console.log("New request received:", request);
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

    // Listen for new chat messages to update unread count
    const handleNewMessage = (data) => {
      setUnreadCount((prev) => prev + 1);
    };

    // Listen for messages being read to reset count
    const handleMessagesRead = () => {
      setUnreadCount(0);
    };

    socket.on("requestAdded", handleRequestAdded);
    socket.on("requestUpdated", handleRequestUpdated);
    socket.on("requestDeleted", handleRequestDeleted);
    socket.on("new_message", handleNewMessage);
    socket.on("messages_read", handleMessagesRead);

    return () => {
      socket.off("requestAdded", handleRequestAdded);
      socket.off("requestUpdated", handleRequestUpdated);
      socket.off("requestDeleted", handleRequestDeleted);
      socket.off("new_message", handleNewMessage);
      socket.off("messages_read", handleMessagesRead);
    };
  }, [socket]);

  // 3. טעינת כל המיקומים מהשרת פעם אחת בהתחלה
  useEffect(() => {
    if (!token) return;

    const fetchRequests = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/requests`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Check if token expired
        if (res.status === 401) {
          clearAuthData();
          window.location.href = "/login";
          return;
        }

        const json = await res.json();
        console.log("Initial locations loaded:", json.data?.length || 0);
        console.log("Sample request data:", json.data?.[0]);
        console.log("Sample user object:", json.data?.[0]?.user);
        
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
        // Failed to fetch locations
      }
    };

    fetchRequests();
  }, [token]);

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
        
        console.log('Auto-fetching route for assigned request:', request._id);
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
    console.log("New request created from HelpButton:", newRequest);

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
    console.log("Opening chat for request:", request);

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
      console.log("Fetching conversation from:", url);

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Response status:", response.status);
      const data = await response.json();
      console.log("Response data:", data);

      if (response.ok) {
        // Navigate to chat page - the chat page will load this conversation
        const conversationId = data.data?.conversation?._id || data.data?._id;
        console.log("Navigating to chat with conversation ID:", conversationId);
        navigate("/chat", { state: { conversationId } });
      } else if (response.status === 401) {
        console.log("Unauthorized - token expired");
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
        requestPreciseLocation={requestPreciseLocation}
        setShowAccuracyBanner={setShowAccuracyBanner}
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

      {!isNearbyModalOpen && <MapLogo mapRef={mapRef} position={position} />}

      {/* Nearby Button - Mobile Only (Top Center) */}
      {position && (
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
        {position && (
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
