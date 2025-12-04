# Live ETA Feature Documentation

## Overview
The Live ETA (Estimated Time of Arrival) feature provides real-time arrival estimates for requesters waiting for helpers. The ETA updates automatically as the helper moves toward the requester's location.

## How It Works

### 1. Helper Location Tracking
- When a helper is assigned to a request (status: 'assigned'), their location is tracked automatically
- Location updates are sent every 30 seconds via Socket.IO
- Uses browser's native `navigator.geolocation` API

### 2. ETA Calculation (Server-Side)
- Server receives helper's location updates via socket event `helperLocationUpdate`
- Calculates route distance and time using OSRM (Open Source Routing Machine) API
- Falls back to Haversine distance calculation if OSRM is unavailable
- Assumes 30 km/h average city speed for fallback calculations

### 3. Real-Time Updates (Frontend)
- Requester receives ETA updates via socket event `etaUpdated`
- ETA Timer component displays countdown in minutes
- Timer decrements every 60 seconds locally between server updates
- Banner shows above the map with smooth animations

## Implementation Details

### Server Changes (Minimal)
**File: `server/api/sockets/chatSockets.js`**
- Added `helperLocationUpdate` socket event handler
- Added `calculateETA()` function using OSRM API
- Emits `etaUpdated` event to requester's personal room (`user:${userId}`)

### Frontend Changes
**New Files:**
1. `client/src/components/MapLive/components/EtaTimer.jsx` - ETA display component
2. `client/src/components/MapLive/components/EtaTimer.css` - Styling

**Modified File:**
- `client/src/components/MapLive/MapLive.jsx`
  - Added ETA state management
  - Added socket listener for `etaUpdated` events
  - Helper location tracking and broadcasting
  - Conditional rendering of ETA Timer

## Socket Events

### `helperLocationUpdate` (Helper → Server)
```javascript
socket.emit('helperLocationUpdate', {
  requestId: '507f1f77bcf86cd799439011',
  latitude: 32.0853,
  longitude: 34.7818
});
```

### `etaUpdated` (Server → Requester)
```javascript
socket.on('etaUpdated', (data) => {
  // data: {
  //   requestId: '507f1f77bcf86cd799439011',
  //   etaSeconds: 420,
  //   helperLocation: { latitude: 32.0853, longitude: 34.7818 },
  //   timestamp: 1702345678900
  // }
});
```

## UI/UX Features

### ETA Banner
- **Position:** Fixed at bottom center of screen (mobile: 90px from bottom, above help button)
- **Animation:** Smooth slide-up entrance animation
- **Content:** 
  - Car emoji with bounce animation
  - "Helper is on the way" status text
  - "Estimated arrival in X minutes" with countdown
- **Visibility:** Only shown to requester when helper is assigned and ETA data available

### Responsive Design
- Desktop: 400px max width
- Mobile: 90% width with adjusted positioning
- Smaller fonts and spacing on mobile devices

## Technical Requirements

### Dependencies
- `socket.io-client` (already installed)
- `node-fetch` (server-side, already installed)
- Browser Geolocation API support

### API Services
- **OSRM Public API:** `https://router.project-osrm.org/route/v1/driving/`
  - Free, no API key required
  - Rate limit: reasonable for this use case
  - Fallback included for reliability

## Testing Checklist

- [ ] Helper's location updates are sent every 30 seconds when assigned
- [ ] ETA calculation works with OSRM API
- [ ] Fallback calculation works when OSRM fails
- [ ] Requester receives ETA updates in real-time
- [ ] ETA Timer displays and counts down correctly
- [ ] Banner only shows for requester (not helper)
- [ ] Banner hides when request is completed/cancelled
- [ ] Mobile responsive design works correctly
- [ ] No ETA shown for unassigned or pending requests

## Future Enhancements

1. **Traffic-Aware ETA:** Integrate real-time traffic data
2. **Route Visualization:** Show helper's route on map
3. **Helper Movement:** Animate helper marker moving on map
4. **ETA Accuracy:** Machine learning for better predictions
5. **Notifications:** Alert requester when helper is close (e.g., 2 minutes away)
6. **Historical Data:** Track actual vs. estimated times for improvement

## Troubleshooting

### ETA Not Showing
- Check browser console for geolocation errors
- Verify request status is 'assigned'
- Confirm socket connection is established
- Check server logs for OSRM API errors

### Inaccurate ETA
- OSRM uses actual road networks for accuracy
- Fallback calculation is less accurate (straight line)
- Consider traffic conditions may affect actual arrival time

### Location Not Updating
- Verify geolocation permissions granted
- Check browser compatibility
- Ensure helper app is in foreground (some browsers restrict background geolocation)
