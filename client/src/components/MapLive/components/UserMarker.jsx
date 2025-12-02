import React from "react";
import { Marker, Popup } from "react-leaflet";
import { getUserPositionIcon } from "../../../utils/iconUtils";

export default function UserMarker({ position, locationAccuracy }) {
  if (!position) return null;

  return (
    <Marker position={position} icon={getUserPositionIcon()}>
      <Popup>
        {locationAccuracy === "precise"
          ? "📍 Your precise location"
          : locationAccuracy === "approximate"
          ? "📍 Approximate location (IP-based)"
          : "📍 Default location"}
      </Popup>
    </Marker>
  );
}
