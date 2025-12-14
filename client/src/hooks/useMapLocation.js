import { useState, useEffect } from 'react';
import {
  getInitialLocation,
  getPreciseLocation,
  cacheLocation,
} from '../utils/locationUtils';

export function useMapLocation(mapRef) {
  // Default location: Center of Israel (Tel Aviv area)
  const DEFAULT_LOCATION = [32.0853, 34.7818];

  const [position, setPosition] = useState(DEFAULT_LOCATION);
  const [locationAccuracy, setLocationAccuracy] = useState("loading"); // 'loading', 'approximate', 'precise', 'default'
  const [showAccuracyBanner, setShowAccuracyBanner] = useState(false);
  const [locationError, setLocationError] = useState(null);

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


    } catch (error) {
      console.error("GPS location denied or unavailable:", error);
      setLocationAccuracy("approximate");
      // Keep showing banner
    }
  };

  const refreshLocation = () => {
    requestPreciseLocation();
  };

  const dismissAccuracyBanner = () => {
    setShowAccuracyBanner(false);
  };

  return {
    position,
    locationAccuracy,
    locationError,
    showAccuracyBanner,
    refreshLocation,
    dismissAccuracyBanner,
  };
}
