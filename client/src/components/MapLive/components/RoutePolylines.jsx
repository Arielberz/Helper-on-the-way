/*
  קובץ זה אחראי על:
  - הצגת קווי מסלול על המפה
  - ציור נתיבי ניווט בין נקודות
  - הצגה גרפית של מסלולי נסיעה
*/

import React from "react";
import { Polyline } from "react-leaflet";

export default function RoutePolylines({ routes }) {
  if (!routes) return null;

  return (
    <>
      {Object.entries(routes).map(([requestId, routeData]) => (
        <Polyline
          key={requestId}
          positions={routeData.coordinates}
          color="#3B82F6"
          weight={4}
          opacity={0.7}
        />
      ))}
    </>
  );
}
