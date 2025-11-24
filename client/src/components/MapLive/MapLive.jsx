// src/components/MapLive/MapLive.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import IconChat from "../IconChat/IconChat.jsx";
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
import HelperButton from "../helperButton/helperButton";
import NearbyRequestsButton from "../NearbyRequestsButton/NearbyRequestsButton";
import { getInitialLocation, getPreciseLocation, cacheLocation } from "../../utils/locationUtils";


// Fix for default marker icons in Leaflet with React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
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
  
  const [position, setPosition] = useState(DEFAULT_LOCATION);        // המיקום שלך
  const [locationAccuracy, setLocationAccuracy] = useState('loading'); // 'loading', 'approximate', 'precise', 'default'
  const [showAccuracyBanner, setShowAccuracyBanner] = useState(false);
  const [sharedMarkers, setSharedMarkers] = useState([]); // נקודות מהשרת
  const [socket, setSocket] = useState(null);

  const [confirmationMessage, setConfirmationMessage] = useState(null);
  const [isHelperMode, setIsHelperMode] = useState(false); // מצב עוזר
  const [helperSettings, setHelperSettings] = useState(null); // הגדרות עוזר
  const [mapRef, setMapRef] = useState(null); // התייחסות למפה

  const navigate = useNavigate();
  const token = localStorage.getItem("token"); // מהשמור אחרי login/register

  // 1. Get initial location using IP-based geolocation (no permission needed)
  useEffect(() => {
    const initializeLocation = async () => {
      try {
        const location = await getInitialLocation();
        setPosition([location.lat, location.lng]);
        setLocationAccuracy(location.accuracy);
        
        // Show banner if not precise GPS
        if (location.accuracy !== 'precise') {
          setShowAccuracyBanner(true);
        }
        
        console.log(`Location initialized: ${location.city || 'Unknown'}, ${location.country || 'Unknown'} (${location.accuracy})`);
      } catch (error) {
        console.error('Failed to get initial location:', error);
        setPosition(DEFAULT_LOCATION);
        setLocationAccuracy('default');
        setShowAccuracyBanner(true);
      }
    };

    initializeLocation();
  }, []);

  // Request precise GPS location (only when user clicks button)
  const requestPreciseLocation = async () => {
    try {
      setLocationAccuracy('loading');
      const preciseLocation = await getPreciseLocation();
      setPosition([preciseLocation.lat, preciseLocation.lng]);
      setLocationAccuracy('precise');
      setShowAccuracyBanner(false);
      
      // Cache the GPS location for future use
      cacheLocation(preciseLocation);
      
      console.log('Precise GPS location acquired');
    } catch (error) {
      console.error('GPS location denied or unavailable:', error);
      setLocationAccuracy('approximate');
      // Keep showing banner
    }
  };

  // 2. התחברות ל-Socket.IO לעדכונים בזמן אמת
  useEffect(() => {
    const newSocket = io(API_BASE);
    setSocket(newSocket);

    // האזנה לבקשות חדשות מהשרת
    newSocket.on('requestAdded', (request) => {
      console.log('New request received:', request);
      setSharedMarkers((prev) => [...prev, request]);
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
        console.log('Initial locations loaded:', json.data?.length || 0);
        console.log('Sample request data:', json.data?.[0]);
        console.log('Sample user object:', json.data?.[0]?.user);
        setSharedMarkers(json.data || []);
      } catch (err) {
        console.error("Failed to fetch locations", err);
      }
    };

    fetchRequests();
  }, [token]);

  // 4. טיפול במצב עוזר
  const handleToggleHelper = (isActive, settings) => {
    setIsHelperMode(isActive);
    setHelperSettings(isActive ? settings : null);
    
    if (isActive && settings) {
      console.log('Helper mode ON with settings:', settings);
      console.log('Max distance:', settings.maxDistance, 'km');
      console.log('Destination:', settings.destination || 'None');
      console.log('Only on route:', settings.onlyOnRoute);
      console.log('Problem types:', settings.problemTypes.length > 0 ? settings.problemTypes : 'All types');
    } else {
      console.log('Helper mode OFF');
    }
    
    // שליחה לשרת שהמשתמש זמין לעזור עם ההגדרות
    if (socket && position) {
      socket.emit('toggleHelper', {
        isHelper: isActive,
        location: { lat: position[0], lng: position[1] },
        settings: settings || null
      });
    }
    
    // TODO: עדכון בדאטאבייס שהמשתמש זמין לעזור
    // יכול להוסיף שדה isAvailableHelper במודל User עם הגדרות העזרה
  };

  // 5. טיפול בבחירת בקשה מהרשימה
  const handleSelectRequest = (request) => {
    console.log('Selected request:', request);
    // מרכז את המפה על הבקשה שנבחרה
    if (mapRef && request.location?.lat && request.location?.lng) {
      mapRef.flyTo([request.location.lat, request.location.lng], 16, {
        duration: 1.5
      });
    }
  };

  // Handle new request created from HelpButton
  const handleRequestCreated = (newRequest) => {
    console.log('New request created from HelpButton:', newRequest);
    
    // Add to local markers
    setSharedMarkers((prev) => [...prev, newRequest]);

    // Emit to socket for real-time updates
    if (socket) {
      socket.emit('newRequest', newRequest);
    }

    // Zoom to the new request location
    if (mapRef && newRequest.location) {
      mapRef.flyTo([newRequest.location.lat, newRequest.location.lng], 16, {
        duration: 1.5
      });
    }

    // Show confirmation message
    setConfirmationMessage('Help request created successfully!');
    
    // Hide confirmation after 5 seconds
    setTimeout(() => {
      setConfirmationMessage(null);
    }, 5000);
  };

  // Open chat with a specific user for a request
  const openChat = async (request) => {
    console.log('Opening chat for request:', request);
    
    if (!token) {
      alert("אנא התחבר כדי לשלוח הודעות");
      navigate("/login");
      return;
    }

    try {
      // First, try to assign yourself as helper if request is pending and has no helper
      if (!request.helper && request.status === 'pending') {
        console.log('No helper assigned and status is pending, assigning current user as helper...');
        const assignResponse = await fetch(`${API_BASE}/api/requests/${request._id}/assign`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (!assignResponse.ok) {
          const assignData = await assignResponse.json();
          console.error('Failed to assign helper:', assignData);
          // Don't return - still try to open chat even if assignment fails
        } else {
          console.log('Successfully assigned as helper');
        }
      } else {
        console.log('Request already has helper or is not pending, skipping assignment');
      }

      // Now get or create conversation
      const url = `${API_BASE}/api/chat/conversation/request/${request._id}`;
      console.log('Fetching conversation from:', url);
      
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok) {
        // Navigate to chat page - the chat page will load this conversation
        const conversationId = data.data?.conversation?._id || data.data?._id;
        console.log('Navigating to chat with conversation ID:', conversationId);
        navigate("/chat", { state: { conversationId } });
      } else if (response.status === 401) {
        console.log('Unauthorized - token expired');
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        console.error('Failed to open chat:', data);
        alert(`לא ניתן לפתוח שיחה: ${data.message || 'שגיאה לא ידועה'}`);
      }
    } catch (error) {
      console.error("Error opening chat:", error);
      alert(`שגיאה בפתיחת השיחה: ${error.message}`);
    }
  };

  return (
    <div style={{ position: 'relative', height: '100vh', width: '100%' }}>
      {/* Show location accuracy banner */}
      {showAccuracyBanner && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-1000 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-3">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-sm">
            {locationAccuracy === 'loading' ? 'Getting location...' : 
             locationAccuracy === 'approximate' ? '📍 Showing approximate location' :
             '📍 Using default location'}
          </span>
          {locationAccuracy !== 'loading' && (
            <button
              onClick={requestPreciseLocation}
              className="ml-2 px-3 py-1 bg-white text-blue-600 text-sm font-medium rounded hover:bg-blue-50 transition-colors"
            >
              Enable Precise Location
            </button>
          )}
        </div>
      )}
      
      <HelperButton onToggleHelper={handleToggleHelper} />
      {position && (
        <NearbyRequestsButton 
          requests={sharedMarkers}
          userPosition={position}
          onSelectRequest={handleSelectRequest}
          helperSettings={helperSettings}
          isHelperMode={isHelperMode}
        />
      )}
      
      <MapContainer
        center={position}
        zoom={locationAccuracy === 'precise' ? 15 : 12}
        style={{ height: "100vh", width: "100%", borderRadius: "14px" }}

        ref={setMapRef}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* המיקום הנוכחי שלך */}
        <Marker position={position}>
          <Popup>
            {locationAccuracy === 'precise' ? '📍 Your precise location' : 
             locationAccuracy === 'approximate' ? '📍 Approximate location (IP-based)' :
             '📍 Default location'}
          </Popup>
        </Marker>

        {/* Get map reference */}
        <MapRefSetter setMapRef={setMapRef} />



        {/* כל הנקודות שהגיעו מהשרת */}
        {sharedMarkers.filter(m => m.location?.lat && m.location?.lng).map((m) => {
          console.log('Rendering marker:', m._id, 'User object:', m.user, 'Username:', m.user?.username);
          return (
            <Marker key={m._id || m.id} position={[m.location.lat, m.location.lng]}>
              <Popup>
                <strong>{m.user?.username || 'משתמש לא ידוע'}</strong><br />
                {m.problemType && `בעיה: ${m.problemType}`}<br />
                {m.description && `תיאור: ${m.description}`}<br />
                סטטוס: {m.status || 'pending'}<br />
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

      {/* Confirmation Message */}
      {confirmationMessage && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-1000 bg-green-500 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 animate-fade-in">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-semibold">{confirmationMessage}</span>
        </div>
      )}

      {/* Help Button Component */}
      <HelpButton 
        onRequestCreated={handleRequestCreated} 
      />
       <IconChat />
         {/* Demo Message Button - For Testing */}
            <button
              onClick={() => {
                // Simulate a new message notification
                const event = new CustomEvent('demoMessage');
                window.dispatchEvent(event);
              }}
              className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors"
              title="Test notification"
            >
              📨 Demo
            </button>
    </div>
  );
}