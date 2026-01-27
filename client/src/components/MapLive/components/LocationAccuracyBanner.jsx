/*
  קובץ זה אחראי על:
  - הצגת באנר התראה על דיוק המיקום
  - התראה כשדיוק המיקום נמוך
  - הצגת מידע על רמת הדיוק הנוכחית
*/

import React from "react";

export default function LocationAccuracyBanner({
  showAccuracyBanner,
  locationAccuracy,
  locationError,
  requestPreciseLocation,
  setShowAccuracyBanner,
}) {
  if (!showAccuracyBanner) return null;

  return (
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
          className="ml-2 px-3 py-1 bg-white text-blue-600 text-sm font-medium rounded hover:bg-blue-50 transition-colors shrink-0"
        >
          {locationError ? "Try Again" : "Enable Precise Location"}
        </button>
      )}
      <button
        onClick={() => setShowAccuracyBanner(false)}
        className="ml-1 p-1 hover:bg-white/20 rounded transition-colors shrink-0"
        aria-label="Close"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
}
