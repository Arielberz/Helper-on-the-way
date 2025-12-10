// Location utility functions with IP-based geolocation

import { API_BASE } from './apiConfig';
const LOCATION_CACHE_KEY = 'userLocation';
const LOCATION_CACHE_DURATION = 30 * 60 * 1000; // 30 minutes in milliseconds

/**
 * Get cached location if it exists and is still fresh
 */
const getCachedLocation = () => {
  try {
    const cached = localStorage.getItem(LOCATION_CACHE_KEY);
    if (!cached) return null;

    const { location, timestamp } = JSON.parse(cached);
    const now = Date.now();
    
    // Check if cache is still fresh
    if (now - timestamp < LOCATION_CACHE_DURATION) {
      return location;
    }
    
    // Cache is stale, remove it
    localStorage.removeItem(LOCATION_CACHE_KEY);
    return null;
  } catch (error) {
    localStorage.removeItem(LOCATION_CACHE_KEY);
    return null;
  }
};

/**
 * Cache location data with timestamp
 */
const saveLocationCache = (location) => {
  try {
    const cacheData = {
      location,
      timestamp: Date.now()
    };
    localStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify(cacheData));
  } catch (error) {
    // Silent fail - caching is optional
  }
};

/**
 * Get approximate location based on IP address (no permission required)
 * This provides city-level accuracy and works immediately
 */
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
    
    // Backend returns { success, message, data: { latitude, longitude, city, country, ip } }
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
    
    // Cache IP-based location
    saveLocationCache(location);
    return location;
  } catch (error) {
    // Fallback to Tel Aviv (don't cache this)
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

/**
 * Get precise GPS location (requires user permission)
 * Only call this when user explicitly wants to use current location
 */
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
          precision: position.coords.accuracy, // accuracy in meters
        };
        
        // Cache GPS location
        saveLocationCache(location);
        resolve(location);
      },
      (error) => {
        // GeolocationPositionError codes:
        // 1 = PERMISSION_DENIED
        // 2 = POSITION_UNAVAILABLE (kCLErrorLocationUnknown on macOS)
        // 3 = TIMEOUT
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000, // Increased timeout to 15 seconds
        maximumAge: 0, // Don't use browser cache, we have our own
      }
    );
  });
};

/**
 * Get user location with smart caching and fallback chain
 * 1. Check cache first (30 min validity)
 * 2. Try GPS if available
 * 3. Fall back to IP geolocation
 * 4. Ultimate fallback to default location
 */
export const getUserLocation = async () => {
  // 1. Check cache first
  const cached = getCachedLocation();
  if (cached) {
    return cached;
  }

  // 2. Try GPS if previously granted permission
  if ('geolocation' in navigator) {
    try {
      const gpsLocation = await getPreciseLocation();
      return gpsLocation;
    } catch (geoError) {
      // GPS failed, continue to IP fallback
    }
  }

  // 3. Fallback to IP geolocation
  return await getApproximateLocation();
};

/**
 * Get initial location for app load - ALWAYS uses IP first
 * This provides instant location without asking for GPS permission
 * GPS can be requested later via getPreciseLocation()
 */
export const getInitialLocation = async () => {
  // 1. Check cache first
  const cached = getCachedLocation();
  if (cached) {
    return cached;
  }

  // 2. Always start with IP geolocation (no permission needed)
  return await getApproximateLocation();
};

/**
 * Cache location for future use (legacy - for backward compatibility)
 * @deprecated Use getUserLocation() which handles caching automatically
 */
export const cacheLocation = saveLocationCache;

/**
 * Clear cached location (force fresh location on next request)
 */
export const clearCachedLocation = () => {
  localStorage.removeItem(LOCATION_CACHE_KEY);
  localStorage.removeItem('lastKnownLocation'); // Clean up old cache key
};

/**
 * Force refresh location (clears cache and gets fresh location)
 */
export const refreshLocation = async () => {
  clearCachedLocation();
  return await getUserLocation();
};
