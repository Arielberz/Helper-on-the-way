/*
  קובץ זה אחראי על:
  - פונקציות עזר לחישוב ETA (זמן הגעה משוער)
  - עטיפה של routingService לתאימות לאחור
  - חישוב מרחקים וזמן נסיעה

  הקובץ משמש את:
  - requestsController.js
  - chatSockets.js

  הקובץ אינו:
  - מתחבר ישירות ל-API - משתמש ב-routingService
*/

const { getETA } = require('../services/routingService');

async function calculateETAWithDistance(fromLat, fromLng, toLat, toLng) {
  return getETA(fromLat, fromLng, toLat, toLng);
}

module.exports = { calculateETAWithDistance };
