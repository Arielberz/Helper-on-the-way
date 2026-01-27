/*
  קובץ זה אחראי על:
  - אינטגרציה עם OpenRouteService API
  - חישוב מסלולים ומרחקים בין נקודות
  - חישוב זמן הגעה משוער (ETA)
  - תמיכה בפרופילים שונים (רכב, הליכה)

  הקובץ משמש את:
  - etaUtils.js (פונקציות עזר ל-ETA)
  - requestsController ו-requestsService
  - chatSockets.js (לתצוגת ETA בצ'אט)

  הקובץ אינו:
  - מחשב מרחקים ישירים - משתמש ב-API חיצוני
*/

const OSRM_BASE_URL = 'https://router.project-osrm.org';

async function getRouteGeoJSON(lat1, lon1, lat2, lon2) {
  try {
    const fetch = (await import('node-fetch')).default;
    
    const osrmUrl = `${OSRM_BASE_URL}/route/v1/driving/${lon1},${lat1};${lon2},${lat2}?overview=full&geometries=geojson`;

    const response = await fetch(osrmUrl);

    if (!response.ok) {
      throw new Error(`OSRM API responded with status: ${response.status}`);
    }

    const data = await response.json();

    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      return {
        success: false,
        message: 'No route found between the specified coordinates',
        data: null,
        osrmResponse: data
      };
    }

    return {
      success: true,
      route: data.routes[0],
      waypoints: data.waypoints,
      fullResponse: data
    };

  } catch (err) {
    console.error('Error fetching route from OSRM:', err);
    throw err;
  }
}

async function getETA(fromLat, fromLng, toLat, toLng) {
  try {
    const fetch = (await import('node-fetch')).default;
    
    const url = `${OSRM_BASE_URL}/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=false`;
    
    const response = await fetch(url, { timeout: 5000 });
    const data = await response.json();
    
    if (data.code === 'Ok' && data.routes?.[0]) {
      return {
        etaSeconds: Math.round(data.routes[0].duration),
        distanceMeters: Math.round(data.routes[0].distance)
      };
    }
    
    throw new Error('OSRM routing failed');
  } catch (error) {
    console.warn('OSRM error, using fallback calculation:', error.message);
    
    return calculateHaversineETA(fromLat, fromLng, toLat, toLng);
  }
}

function calculateHaversineETA(fromLat, fromLng, toLat, toLng) {
  const R = 6371;
  const dLat = (toLat - fromLat) * Math.PI / 180;
  const dLon = (toLng - fromLng) * Math.PI / 180;
  const a = Math.sin(dLat/2) ** 2 + 
            Math.cos(fromLat * Math.PI / 180) * Math.cos(toLat * Math.PI / 180) * 
            Math.sin(dLon/2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distanceKm = R * c;
  
  return {
    etaSeconds: Math.round((distanceKm / 30) * 3600),
    distanceMeters: Math.round(distanceKm * 1000)
  };
}

module.exports = {
  getRouteGeoJSON,
  getETA,
  calculateHaversineETA
};
