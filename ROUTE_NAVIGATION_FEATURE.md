# Route Navigation Feature

## Overview
Added real-time route visualization using OSRM (Open Source Routing Machine) API to show the best driving route from helper's location to the request location.

## Features Implemented

### 1. Backend API Endpoint
**File:** `Server/Api/Controllers/requestsController.js`

- Added `getRoute` controller function
- **Endpoint:** `GET /api/requests/route`
- **Query Parameters:**
  - `lon1`, `lat1` - Starting point (helper's location)
  - `lon2`, `lat2` - Destination (request location)
- **Returns:** Route geometry, distance, duration, and waypoints

### 2. Frontend Route Visualization
**File:** `client/src/components/MapLive/MapLive.jsx`

#### Added Components:
- Imported `Polyline` from react-leaflet for drawing routes
- Added `routes` state to store multiple routes simultaneously

#### Added Functions:
- `fetchRoute()` - Fetches route from OSRM API directly (client-side)
  - Converts coordinates from [lng, lat] to [lat, lng] for Leaflet compatibility
  - Stores route data with distance and duration

#### Auto-Features:
- **Auto-fetch for assigned helpers** - Automatically loads routes when:
  - Current user is assigned as helper to a request
  - User's position is available
  - Route hasn't been loaded yet

#### UI Enhancements:

**Route Display:**
- Blue polyline showing the driving path
- 70% opacity for better map visibility
- Smooth rendering on map

**Popup Additions:**
1. **"הצג מסלול" (Show Route) Button** - For all non-requester users
2. **"הצג ניווט" (Show Navigation) Button** - Specifically for assigned helpers
3. **Route Information Card** - Shows:
   - 🚗 Distance in kilometers
   - ⏱️ Estimated time in minutes

**Button Logic:**
- Pending requests: "אני רוצה לעזור" (I want to help) + Show Route button
- Already requested: "ממתין לאישור" (Waiting for approval) status
- Assigned helper: "פתח צ'אט" (Open Chat) + "הצג ניווט" (Show Navigation)
- Other users: "כבר שובץ עוזר" (Helper already assigned)

## How It Works

### User Flow:
1. **Helper views map** with available requests
2. **Clicks on a request marker** to see details
3. **Clicks "הצג מסלול"** to display the driving route
4. **Route appears** as a blue line on the map
5. **Route info shows** distance and estimated time in the popup

### Assigned Helper Flow:
1. Helper gets assigned to a request
2. **Route automatically loads** when they view the map
3. Blue line shows the best driving path
4. Can click "הצג ניווט" to refresh/re-center on route
5. Route info helps them plan their journey

## Technical Details

### OSRM API Integration:
- **URL:** `https://router.project-osrm.org/route/v1/driving/{lon1},{lat1};{lon2},{lat2}?overview=full&geometries=geojson`
- **Free service** - No API key required
- **Response:** GeoJSON geometry with full route details

### Route Storage:
```javascript
routes = {
  [requestId]: {
    coordinates: [[lat, lng], [lat, lng], ...],
    distance: 5420, // meters
    duration: 324   // seconds
  }
}
```

### Performance:
- Routes cached in state to avoid repeated API calls
- Only fetches when route not already loaded
- Automatic cleanup when requests are removed

## Benefits

✅ **Better UX** - Helpers can see exact driving route before accepting
✅ **Time Estimation** - Accurate travel time helps helpers decide
✅ **Distance Info** - Shows how far the request is
✅ **Visual Navigation** - Clear blue line shows the path
✅ **Auto-load** - Assigned helpers see route immediately
✅ **Multiple Routes** - Can display routes to multiple requests simultaneously
✅ **Free Service** - Uses OSRM's free routing API

## Future Enhancements

### Potential Improvements:
- [ ] Add turn-by-turn navigation instructions
- [ ] Show traffic conditions (requires paid service)
- [ ] Alternative route options
- [ ] Save route history
- [ ] Export route to GPS apps (Google Maps, Waze)
- [ ] Real-time ETA updates as helper moves
- [ ] Voice navigation integration

## Testing

To test the feature:
1. Start the client: `cd client && npm run dev`
2. Login as a helper
3. View the map with active requests
4. Click on any request marker
5. Click "הצג מסלול" button
6. Observe the blue route line appearing
7. Check route info (distance & time) in popup

For assigned helpers:
1. Get assigned to a request
2. View the map
3. Route should auto-load immediately
4. Blue line shows path to request
