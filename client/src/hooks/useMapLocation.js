/*
  קובץ זה אחראי על:
  - ניהול מיקום המשתמש במפה (GPS או IP-based)
  - קבלת מיקום ראשוני מהיר ושדרוג למדויק
  - סינכרון מפה עם מיקום המשתמש
  - הצגת באנר דיוק מיקום

  הקובץ משמש את:
  - MapLive - הרכיב הראשי של המפה

  הקובץ אינו:
  - מנהל סוקטים - רק מיקום מקומי
  - שומר היסטוריית מיקומים - רק מיקום נוכחי
*/

import { useState, useEffect } from 'react';
import {
  getInitialLocation,
  getPreciseLocation,
  cacheLocation,
} from '../utils/locationUtils';

export function useMapLocation(mapRef) {
  const DEFAULT_LOCATION = [32.0853, 34.7818];

  const [position, setPosition] = useState(DEFAULT_LOCATION);
  const [locationAccuracy, setLocationAccuracy] = useState("loading"); // 'loading', 'approximate', 'precise', 'default'
  const [showAccuracyBanner, setShowAccuracyBanner] = useState(false);
  const [locationError, setLocationError] = useState(null);

  useEffect(() => {
    const initializeLocation = async () => {
      try {
        const location = await getInitialLocation();
        setPosition([location.lat, location.lng]);
        setLocationAccuracy(location.accuracy);

        if (mapRef) {
          mapRef.setView(
            [location.lat, location.lng],
            location.accuracy === "precise" ? 15 : 12
          );
        }

        if (location.accuracy !== "precise") {
          setShowAccuracyBanner(true);

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

  const requestPreciseLocation = async () => {
    try {
      setLocationAccuracy("loading");
      setLocationError(null);
      const preciseLocation = await getPreciseLocation();
      setPosition([preciseLocation.lat, preciseLocation.lng]);
      setLocationAccuracy("precise");
      setShowAccuracyBanner(false);

      if (mapRef) {
        mapRef.flyTo([preciseLocation.lat, preciseLocation.lng], 15, {
          duration: 1.5,
        });
      }

      cacheLocation(preciseLocation);

    } catch (error) {
      console.error("GPS location error:", error);
      
      // Handle POSITION_UNAVAILABLE (code 2) gracefully
      if (error.code === 2) {
        // Try to use cached location as fallback
        try {
          const cached = localStorage.getItem('userLocation');
          if (cached) {
            const { location } = JSON.parse(cached);
            setPosition([location.lat, location.lng]);
            setLocationAccuracy("approximate");
            setLocationError("המיקום המדויק אינו זמין כרגע. משתמש במיקום אחרון שנשמר.");
            setShowAccuracyBanner(true);
            return;
          }
        } catch (cacheError) {
          // Cache fallback failed, use default
        }
        
        // Fall back to default location (Israel center)
        setPosition(DEFAULT_LOCATION);
        setLocationAccuracy("default");
        setLocationError("המיקום המדויק אינו זמין. משתמש במיקום ברירת מחדל.");
        setShowAccuracyBanner(true);
      } else if (error.code === 1) {
        // Permission denied
        setLocationAccuracy("approximate");
        setLocationError("הרשאת מיקום נדחתה. ניתן לנסות שוב.");
        setShowAccuracyBanner(true);
      } else {
        // Other errors (timeout, etc.)
        setLocationAccuracy("approximate");
        setLocationError("לא ניתן לקבל מיקום מדויק.");
      }
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
