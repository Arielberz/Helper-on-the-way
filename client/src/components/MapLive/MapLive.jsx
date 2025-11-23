// src/components/MapLive/MapLive.jsx
import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import io from "socket.io-client";

import HelpButton from "../helpButton/helpButton";
import HelperButton from "../helperButton/helperButton";
import NearbyRequestsButton from "../NearbyRequestsButton/NearbyRequestsButton";


// Fix for default marker icons in Leaflet with React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const API_BASE = import.meta.env.VITE_API_URL; 

// קומפוננטה פנימית שמטפלת בלחיצה על המפה
function ClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onMapClick({ lat, lng });
    },
  });
  return null;
}

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
  const [position, setPosition] = useState(null);        // המיקום שלך
  const [sharedMarkers, setSharedMarkers] = useState([]); // נקודות מהשרת
  const [socket, setSocket] = useState(null);

  const [confirmationMessage, setConfirmationMessage] = useState(null);
  const [isHelperMode, setIsHelperMode] = useState(false); // מצב עוזר
  const [helperSettings, setHelperSettings] = useState(null); // הגדרות עוזר
  const [mapRef, setMapRef] = useState(null); // התייחסות למפה


  const token = localStorage.getItem("token"); // מהשמור אחרי login/register

  // 1. מציאת מיקום המשתמש (GPS)
  useEffect(() => {
    if (!navigator.geolocation) {
      alert("הדפדפן לא תומך במיקום (Geolocation)");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setPosition([pos.coords.latitude, pos.coords.longitude]);
      },
      (err) => {
        console.error(err);
        alert("לא ניתן לקרוא את המיקום, בדוק הרשאות GPS.");
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 10000,
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

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

  // 6. מה קורה כשאתה לוחץ על המפה
  const handleMapClick = async ({ lat, lng }) => {
    if (!token) {
      alert("אין חיבור משתמש (token), צריך להתחבר מחדש");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          location: { lat, lng },
          problemType: 'other',
          description: 'בקשת עזרה ממפה',
          priority: 'medium'
        }),
      });

      // Check if token expired
      if (res.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
        return;
      }

      const json = await res.json();

      if (!json.success) {
        console.error("Error from server:", json);
        return;
      }

      console.log('New request created:', json.data);

      // מוסיפים את המיקום לרשימת הפינים המקומית
      setSharedMarkers((prev) => [...prev, json.data]);

      // שולחים עדכון לכל המשתמשים האחרים דרך Socket.IO
      if (socket) {
        socket.emit('newRequest', json.data);
      }
    } catch (err) {
      console.error("Failed to send request", err);
      alert("לא הצלחנו לשמור את הבקשה בשרת");
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

  if (!position) {
    return (
      <div style={{ textAlign: "center", padding: "20px 0" }}>
        טוען מיקום...
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', height: '100vh', width: '100%' }}>
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
        zoom={15}
        style={{ height: "100vh", width: "100%", borderRadius: "14px" }}

        ref={setMapRef}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* המיקום הנוכחי שלך */}
        <Marker position={position}>
          <Popup>אתה כאן עכשיו 🚗</Popup>
        </Marker>

        {/* Get map reference */}
        <MapRefSetter setMapRef={setMapRef} />

        {/* מאזין ללחיצה על המפה */}
        <ClickHandler onMapClick={handleMapClick} />

        {/* כל הנקודות שהגיעו מהשרת */}
        {sharedMarkers.filter(m => m.location?.lat && m.location?.lng).map((m) => (
          <Marker key={m._id || m.id} position={[m.location.lat, m.location.lng]}>
            <Popup>
              <strong>{m.user?.username || 'משתמש לא ידוע'}</strong><br />
              {m.problemType && `בעיה: ${m.problemType}`}<br />
              {m.description && `תיאור: ${m.description}`}<br />
              סטטוס: {m.status || 'pending'}
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Confirmation Message */}
      {confirmationMessage && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[1000] bg-green-500 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 animate-fade-in">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-semibold">{confirmationMessage}</span>
        </div>
      )}

      {/* Help Button Component */}
      <HelpButton 
        currentPosition={position}
        onRequestCreated={handleRequestCreated} 
      />
    </div>
  );
}
