// src/components/MapLive/MapLive.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L, { Icon } from "leaflet";
import io from "socket.io-client";

import HelpButton from "../helpButton/helpButton";
import NearbyRequestsButton from "../NearbyRequestsButton/NearbyRequestsButton";
import {
  getInitialLocation,
  getPreciseLocation,
  cacheLocation,
} from "../../utils/locationUtils";

// Fix for default marker icons in Leaflet with React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const API_BASE = import.meta.env.VITE_API_URL;

// קומפוננטה לקבלת reference למפה
function MapRefSetter({ setMapRef }) {
  const map = useMapEvents({});

  React.useEffect(() => {
    if (map) {
      setMapRef(map);
    }
  }, [map, setMapRef]);

  return null;
}

export default function MapLive() {
  // Default location: Center of Israel (Tel Aviv area)
  const DEFAULT_LOCATION = [32.0853, 34.7818];

  const [position, setPosition] = useState(DEFAULT_LOCATION); // המיקום שלך
  const [locationAccuracy, setLocationAccuracy] = useState("loading"); // 'loading', 'approximate', 'precise', 'default'
  const [showAccuracyBanner, setShowAccuracyBanner] = useState(false);
  const [sharedMarkers, setSharedMarkers] = useState([]); // נקודות מהשרת
  const [socket, setSocket] = useState(null);

  const [confirmationMessage, setConfirmationMessage] = useState(null);
  const [mapRef, setMapRef] = useState(null); // התייחסות למפה
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false); // מצב מודל בקשת עזרה
  const [isNearbyModalOpen, setIsNearbyModalOpen] = useState(false); // מצב מודל בקשות קרובות
  const [showProfileMenu, setShowProfileMenu] = useState(false); // Profile dropdown menu
  const [unreadCount, setUnreadCount] = useState(0); // Unread messages count

  const navigate = useNavigate();
  const token = localStorage.getItem("token"); // מהשמור אחרי login/register

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

  // 2. התחברות ל-Socket.IO לעדכונים בזמן אמת
  useEffect(() => {
    const newSocket = io(API_BASE);
    setSocket(newSocket);

    // האזנה לבקשות חדשות מהשרת
    newSocket.on("requestAdded", (request) => {
      console.log("New request received:", request);
      setSharedMarkers((prev) => [...prev, request]);
    });

    // Listen for new chat messages to update unread count
    newSocket.on("new_message", () => {
      setUnreadCount((prev) => prev + 1);
    });

    // Listen for messages being read to reset count
    newSocket.on("messages_read", () => {
      setUnreadCount(0);
    });

    return () => {
      newSocket.close();
    };
  }, []);

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
          localStorage.removeItem("token");
          window.location.href = "/login";
          return;
        }

        const json = await res.json();
        console.log("Initial locations loaded:", json.data?.length || 0);
        console.log("Sample request data:", json.data?.[0]);
        console.log("Sample user object:", json.data?.[0]?.user);
        setSharedMarkers(json.data || []);
      } catch (err) {
        console.error("Failed to fetch locations", err);
      }
    };

    fetchRequests();
  }, [token]);

  // 4. טיפול בבחירת בקשה מהרשימה
  const handleSelectRequest = (request) => {
    console.log("Selected request:", request);
    // מרכז את המפה על הבקשה שנבחרה
    if (mapRef && request.location?.lat && request.location?.lng) {
      mapRef.flyTo([request.location.lat, request.location.lng], 16, {
        duration: 1.5,
      });
    }
  };

  // Handle new request created from HelpButton
  const handleRequestCreated = (newRequest) => {
    console.log("New request created from HelpButton:", newRequest);

    // Add to local markers
    setSharedMarkers((prev) => [...prev, newRequest]);

    // Emit to socket for real-time updates
    if (socket) {
      socket.emit("newRequest", newRequest);
    }

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

    try {
      // First, try to assign yourself as helper if request is pending and has no helper
      if (!request.helper && request.status === "pending") {
        console.log(
          "No helper assigned and status is pending, assigning current user as helper..."
        );
        const assignResponse = await fetch(
          `${API_BASE}/api/requests/${request._id}/assign`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!assignResponse.ok) {
          const assignData = await assignResponse.json();
          console.error("Failed to assign helper:", assignData);
          // Don't return - still try to open chat even if assignment fails
        } else {
          console.log("Successfully assigned as helper");
        }
      } else {
        console.log(
          "Request already has helper or is not pending, skipping assignment"
        );
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
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        console.error("Failed to open chat:", data);
        alert(`לא ניתן לפתוח שיחה: ${data.message || "שגיאה לא ידועה"}`);
      }
    } catch (error) {
      console.error("Error opening chat:", error);
      alert(`שגיאה בפתיחת השיחה: ${error.message}`);
    }
  };

  return (
    <div style={{ position: "relative", height: "100vh", width: "100%" }}>
      {/* Show location accuracy banner */}
      {showAccuracyBanner && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-1000 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-3">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span className="text-sm">
            {locationAccuracy === "loading"
              ? "Getting location..."
              : locationAccuracy === "approximate"
              ? "📍 Showing approximate location"
              : "📍 Using default location"}
          </span>
          {locationAccuracy !== "loading" && (
            <button
              onClick={requestPreciseLocation}
              className="ml-2 px-3 py-1 bg-white text-blue-600 text-sm font-medium rounded hover:bg-blue-50 transition-colors"
            >
              Enable Precise Location
            </button>
          )}
        </div>
      )}

      <MapContainer
        center={position}
        zoom={locationAccuracy === "precise" ? 15 : 12}
        style={{ height: "100vh", width: "100%" }}
        zoomControl={false}
        attributionControl={false}
        ref={setMapRef}
      >
        <TileLayer
          attribution=""
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* המיקום הנוכחי שלך */}
        <Marker position={position}>
          <Popup>
            {locationAccuracy === "precise"
              ? "📍 Your precise location"
              : locationAccuracy === "approximate"
              ? "📍 Approximate location (IP-based)"
              : "📍 Default location"}
          </Popup>
        </Marker>

        {/* Get map reference */}
        <MapRefSetter setMapRef={setMapRef} />

        {/* כל הנקודות שהגיעו מהשרת */}
        {sharedMarkers
          .filter((m) => m.location?.lat && m.location?.lng)
          .map((m) => {
            console.log(
              "Rendering marker:",
              m._id,
              "User object:",
              m.user,
              "Username:",
              m.user?.username
            );
            return (
              <Marker
                key={m._id || m.id}
                position={[m.location.lat, m.location.lng]}
              >
                <Popup>
                  <strong>{m.user?.username || "משתמש לא ידוע"}</strong>
                  <br />
                  {m.problemType && `בעיה: ${m.problemType}`}
                  <br />
                  {m.description && `תיאור: ${m.description}`}
                  <br />
                  סטטוס: {m.status || "pending"}
                  <br />
                  <button
                    onClick={() => openChat(m)}
                    className="mt-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm font-medium"
                  >
                    💬 עזור לו
                  </button>
                </Popup>
              </Marker>
            );
          })}
      </MapContainer>

      {/* Logo - Top Left (Click to center on user location) */}
      <button
        onClick={() => {
          if (mapRef && position) {
            mapRef.flyTo(position, 18, { duration: 1 });
          }
        }}
        className="fixed top-6 left-6 z-1000 backdrop-blur-md bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center gap-3 h-12 w-12 sm:h-auto sm:w-auto sm:px-4 sm:py-2 transition-all duration-300 shadow-lg hover:shadow-xl border border-white/30 cursor-pointer"
        aria-label="Center map on my location"
      >
        <img src="/logo.png" alt="Helper on the Way" className="h-8 w-8 sm:h-10 sm:w-10 object-contain" />
        <div className="hidden sm:flex flex-col">
          <span className="text-slate-600 text-xs leading-tight">HELPER</span>
          <span className="text-slate-600 text-xs leading-tight">On the Way</span>
        </div>
      </button>

      {/* Nearby Button - Mobile Only (Top Center) */}
      {position && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-1000 sm:hidden">
          <NearbyRequestsButton
            requests={sharedMarkers}
            userPosition={position}
            onSelectRequest={handleSelectRequest}
            onModalStateChange={setIsNearbyModalOpen}
          />
        </div>
      )}

      {/* Profile Icon - Top Right */}
      <div className="fixed top-6 right-6 z-1000">
        <button
          onClick={() => setShowProfileMenu(!showProfileMenu)}
          className="relative h-12 w-12 backdrop-blur-md bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-xl border border-white/30"
          aria-label="Profile Menu"
        >
          {/* Notification dot */}
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full ring-2 ring-white" />
          )}
          <svg
            className="h-6 w-6 text-slate-700"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
          </svg>
        </button>

        {/* Profile Dropdown Menu */}
        {showProfileMenu && (
          <>
            {/* Backdrop to close menu */}
            <div 
              className="fixed inset-0 z-[-1]" 
              onClick={() => setShowProfileMenu(false)}
            />
            <div className="absolute top-14 right-0 backdrop-blur-md bg-white/10 rounded-xl shadow-xl border border-white/30 overflow-hidden min-w-40 animate-fade-in">
              <button
                onClick={() => { navigate('/profile'); setShowProfileMenu(false); }}
                className="w-full px-4 py-3 flex items-center gap-3 text-slate-700 hover:bg-white/20 transition-colors text-left"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="font-medium">Settings</span>
              </button>
              <button
                onClick={() => { navigate('/chat'); setShowProfileMenu(false); }}
                className="w-full px-4 py-3 flex items-center gap-3 text-slate-700 hover:bg-white/20 transition-colors text-left border-t border-white/20"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v6a2 2 0 01-2 2h-4l-4 4-4-4H9z" />
                </svg>
                <span className="font-medium">Chat</span>
                {unreadCount > 0 && (
                  <span className="ml-auto h-2.5 w-2.5 bg-red-500 rounded-full" />
                )}
              </button>
              <button
                onClick={() => { localStorage.removeItem('token'); navigate('/login'); setShowProfileMenu(false); }}
                className="w-full px-4 py-3 flex items-center gap-3 text-red-600 hover:bg-white/20 transition-colors text-left border-t border-white/20"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="font-medium">Sign Out</span>
              </button>
            </div>
          </>
        )}
      </div>

      {/* Confirmation Message */}
      {confirmationMessage && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-1000 bg-green-500 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 animate-fade-in">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="font-semibold">{confirmationMessage}</span>
        </div>
      )}

      {/* Button Group - Help at bottom, Nearby above (desktop only) */}
      <div className="fixed bottom-6 right-6 flex flex-col-reverse gap-2 z-1000">
        <HelpButton
          onRequestCreated={handleRequestCreated}
          onModalStateChange={setIsHelpModalOpen}
        />
        {position && (
          <div className="hidden sm:block">
            <NearbyRequestsButton
              requests={sharedMarkers}
              userPosition={position}
              onSelectRequest={handleSelectRequest}
              onModalStateChange={setIsNearbyModalOpen}
            />
          </div>
        )}
      </div>
    </div>
  );
}
