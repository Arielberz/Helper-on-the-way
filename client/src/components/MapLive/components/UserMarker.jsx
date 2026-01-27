/*
  קובץ זה אחראי על:
  - מרקר המיקום של המשתמש על המפה
  - הצגת דיוק המיקום בפופאפ
  - אייקון מותאם למשתמש
*/

import React from "react";
import { Marker, Popup } from "react-leaflet";
import { getUserPositionIcon } from "../../../utils/iconUtils";

export default function UserMarker({ position, locationAccuracy }) {
  if (!position) return null;

  const getMessage = () => {
    switch (locationAccuracy) {
      case "precise":
        return {
          icon: "📍",
          title: "You are here",
          subtitle: "GPS location"
        };
      case "approximate":
        return {
          icon: "📍",
          title: "You are here",
          subtitle: "Approximate location"
        };
      default:
        return {
          icon: "📍",
          title: "You are here",
          subtitle: "Default location"
        };
    }
  };

  const message = getMessage();

  return (
    <Marker position={position} icon={getUserPositionIcon()}>
      <Popup className="user-location-popup">
        <div className="user-location-popup-content">
          <span className="popup-icon">{message.icon}</span>
          <span className="popup-title">{message.title}</span>
          <span className="popup-subtitle">{message.subtitle}</span>
        </div>
      </Popup>
    </Marker>
  );
}
