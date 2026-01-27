/*
  קובץ זה אחראי על:
  - קבלת מיקום משתמש (GPS או IP)
  - שמירת מיקום במטמון לחיסכון בבקשות
  - חישוב מסלולים בין נקודות (שילוב עם OpenRouteService)

  הקובץ משמש את:
  - useMapLocation hook - אתחול מיקום במפה
  - HelpButton - קבלת מיקום לבקשת עזרה
  - MapLive - הצגת נתיבי ניווט

  הקובץ אינו:
  - עוקב אחרי מיקום בזמן אמת - רק קבלה חד פעמית
  - שומר היסטוריית מיקומים
*/

import { API_BASE } from './apiConfig';
const LOCATION_CACHE_KEY = 'userLocation';
const LOCATION_CACHE_DURATION = 30 * 60 * 1000;

const getCachedLocation = () => {
  try {
    const cached = localStorage.getItem(LOCATION_CACHE_KEY);
    if (!cached) return null;

    const { location, timestamp } = JSON.parse(cached);
    const now = Date.now();
    
    if (now - timestamp < LOCATION_CACHE_DURATION) {
      return location;
    }
    
    localStorage.removeItem(LOCATION_CACHE_KEY);
    return null;
  } catch (error) {
    localStorage.removeItem(LOCATION_CACHE_KEY);
    return null;
  }
};

const saveLocationCache = (location) => {
  try {
    const cacheData = {
      location,
      timestamp: Date.now()
    };
    localStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify(cacheData));
  } catch (error) {
  }
};

export const getApproximateLocation = async () => {
  try {
    const response = await fetch(`${API_BASE}/api/users/location/ip`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('IP geolocation failed');
    }

    const result = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error(result.message || 'IP geolocation failed');
    }
    
    const data = result.data;
    
    const location = {
      lat: data.latitude,
      lng: data.longitude,
      city: data.city,
      country: data.country,
      accuracy: 'approximate',
      source: 'ip',
    };
    
    saveLocationCache(location);
    return location;
  } catch (error) {
    return {
      lat: 32.0853,
      lng: 34.7818,
      city: 'Tel Aviv',
      country: 'Israel',
      accuracy: 'default',
      source: 'fallback',
    };
  }
};

export const getPreciseLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      const error = new Error('Geolocation not supported by this browser');
      error.code = 0;
      reject(error);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: 'precise',
          source: 'gps',
          precision: position.coords.accuracy,
        };
        
        saveLocationCache(location);
        resolve(location);
      },
      (error) => {
        const enhancedError = new Error(error.message);
        enhancedError.code = error.code;
        enhancedError.originalError = error;
        reject(enhancedError);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  });
};

export const getUserLocation = async () => {
  const cached = getCachedLocation();
  if (cached) {
    return cached;
  }

  if ('geolocation' in navigator) {
    try {
      const gpsLocation = await getPreciseLocation();
      return gpsLocation;
    } catch (geoError) {
    }
  }

  return await getApproximateLocation();
};

export const getInitialLocation = async () => {
  const cached = getCachedLocation();
  if (cached) {
    return cached;
  }

  return await getApproximateLocation();
};

export const cacheLocation = saveLocationCache;

export const clearCachedLocation = () => {
  localStorage.removeItem(LOCATION_CACHE_KEY);
  localStorage.removeItem('lastKnownLocation');
};

export const refreshLocation = async () => {
  clearCachedLocation();
  return await getUserLocation();
};

export const reverseGeocode = async (lat, lng) => {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=he`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Reverse geocoding failed');
    }
    const data = await response.json();
    return data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }
};

export const fetchRouteGeometry = async (fromLat, fromLng, toLat, toLng) => {
  const url = `https://router.project-osrm.org/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=full&geometries=geojson`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch route from OSRM');
  }
  const data = await response.json();
  if (data.routes && data.routes[0]?.geometry?.coordinates) {
    return data.routes[0].geometry.coordinates;
  }
  throw new Error('No route found');
};
