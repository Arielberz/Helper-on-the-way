# Location Error Fixes - macOS

## Error: `kCLErrorLocationUnknown` (Code 2)

This error means your device **cannot determine your location** at this time. It's different from permission being denied.

## Quick Fixes

### 1. Enable Location Services (macOS)

**System-wide Location Services:**
1. Open **System Settings** (or System Preferences)
2. Go to **Privacy & Security** → **Location Services**
3. Make sure **Location Services** is turned **ON**
4. Scroll down and ensure **Safari** (or your browser) is checked

**Safari-specific:**
1. In Safari, go to **Safari** → **Settings** → **Websites** → **Location**
2. Find `localhost` or your app's domain
3. Change to **Ask** or **Allow**

### 2. Check Browser Permissions

**Safari:**
- Safari → Settings → Websites → Location
- Set to "Ask" or "Allow" for your site

**Chrome:**
1. Click the lock icon in address bar
2. Under "Location", select "Allow"
3. Refresh the page

### 3. Restart Location Services

If still not working, restart the Location Services daemon:

```bash
# In Terminal:
sudo killall -HUP locationd
```

Or simply restart your Mac.

### 4. Check for VPN/Proxy Issues

- Disable VPN temporarily
- Check if firewall is blocking location services
- Some corporate networks block location APIs

### 5. Try a Different Browser

If Safari isn't working, try:
- Google Chrome
- Firefox
- Edge

## Understanding Error Codes

The Geolocation API returns different error codes:

| Code | Name | Meaning | Solution |
|------|------|---------|----------|
| **1** | PERMISSION_DENIED | User denied permission | Click "Allow" when prompted |
| **2** | POSITION_UNAVAILABLE | System can't determine location | Check Location Services settings |
| **3** | TIMEOUT | Request took too long | Try again, check internet connection |

## What the App Does Now

✅ **Improved behavior:**
- Uses IP-based location first (no permission needed)
- Only requests GPS when you click "Enable Precise Location"
- Shows helpful error messages
- Doesn't spam permission requests
- Works even if GPS fails (uses approximate location)

## Still Not Working?

**Fallback Location:**
The app will use Tel Aviv, Israel as a default location if all else fails. You can still:
- Manually enter your address in help requests
- Use the map to select your location
- The app functions normally with approximate location

## Testing Location Permissions

To test if location is working in your browser:

```javascript
// Open browser console and run:
navigator.geolocation.getCurrentPosition(
  (pos) => console.log('✅ Location:', pos.coords),
  (err) => console.error('❌ Error:', err.code, err.message)
)
```

## For Developers

**Changes made:**
1. Removed automatic GPS request on page load
2. Added user-friendly error messages for each error code
3. Increased GPS timeout from 10s to 15s
4. Banner now shows error state with "Try Again" button
5. Better error logging with geolocation error codes
