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

export default function MapLive() {
  const [position, setPosition] = useState(null);        // המיקום שלך
  const [sharedMarkers, setSharedMarkers] = useState([]); // נקודות מהשרת
  const [socket, setSocket] = useState(null);

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
        const json = await res.json();
        console.log('Initial locations loaded:', json.data?.length || 0);
        setSharedMarkers(json.data || []);
      } catch (err) {
        console.error("Failed to fetch locations", err);
      }
    };

    fetchRequests();
  }, [token]);

  // 4. מה קורה כשאתה לוחץ על המפה
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

  if (!position) {
    return (
      <div style={{ textAlign: "center", padding: "20px 0" }}>
        טוען מיקום...
      </div>
    );
  }

  return (
    <MapContainer
      center={position}
      zoom={15}
      style={{ height: "100vh", width: "100%", borderRadius: "14px" }}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* המיקום הנוכחי שלך */}
      <Marker position={position}>
        <Popup>אתה כאן עכשיו 🚗</Popup>
      </Marker>

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
  );
}
