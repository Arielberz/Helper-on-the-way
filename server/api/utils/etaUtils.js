// Calculate ETA and distance using OSRM routing service
async function calculateETAWithDistance(fromLat, fromLng, toLat, toLng) {
  try {
    const fetch = (await import('node-fetch')).default;
    const url = `https://router.project-osrm.org/route/v1/driving/${fromLng},${fromLat};${toLng},${toLat}?overview=false`;
    
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
    
    // Fallback: Haversine distance with average city speed
    const R = 6371; // Earth's radius in km
    const dLat = (toLat - fromLat) * Math.PI / 180;
    const dLon = (toLng - fromLng) * Math.PI / 180;
    const a = Math.sin(dLat/2) ** 2 + 
              Math.cos(fromLat * Math.PI / 180) * Math.cos(toLat * Math.PI / 180) * 
              Math.sin(dLon/2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distanceKm = R * c;
    
    // Assume 30 km/h average city speed
    return {
      etaSeconds: Math.round((distanceKm / 30) * 3600),
      distanceMeters: Math.round(distanceKm * 1000)
    };
  }
}

module.exports = { calculateETAWithDistance };
