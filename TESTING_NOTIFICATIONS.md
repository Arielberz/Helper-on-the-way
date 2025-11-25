# Quick Test Instructions

## How to Test Notifications

### Option 1: Real Test (Recommended)
1. Open TWO browser windows (or use incognito for second)
2. Login as USER A in Window 1
3. Login as USER B in Window 2
4. In Window 1: Create a help request
5. In Window 2: Go to map, find the request, click "I can help"
6. Window 1 should show popup IMMEDIATELY
7. In Window 1: Click confirm
8. Window 2 should show popup IMMEDIATELY

### Option 2: Quick Debug
Add this to any component to manually test:

```jsx
// Add to any component temporarily
const { socket } = useHelperRequest()

const testNotification = () => {
  // Simulate receiving a helper request (requester side)
  socket.emit('helperRequestReceived', {
    requestId: '123',
    helper: { username: 'Test Helper', phone: '0501234567' },
    message: 'Test message'
  })
}

// Or emit to yourself for testing
const testHelperConfirmed = () => {
  socket.emit('helperConfirmed', {
    requestId: '123',
    request: {
      user: { username: 'Test User', phone: '0501234567' },
      problemType: 'flat_tire',
      location: { address: 'Test Address' }
    },
    message: 'You were confirmed!'
  })
}

// Button in JSX
<button onClick={testNotification}>Test</button>
```

### What to Look For

1. **Browser Console**:
   - Look for: `🔔 HELPER REQUEST RECEIVED EVENT FIRED!`
   - Look for: `✅ HELPER CONFIRMED EVENT FIRED!`
   - Look for: `🎯 SHOWING HELPER CONFIRMED NOTIFICATION!`
   - Look for: `🎯 RENDERING NOTIFICATION MODAL!`

2. **Bottom-Left Corner**:
   - Should show green "Connected" indicator

3. **Modal Popup**:
   - Should appear immediately over the current page
   - Should have dark overlay behind it
   - Should show helper/requester details

### If Nothing Happens

1. Check browser console for errors
2. Make sure you're logged in (token exists)
3. Check connection indicator is green
4. Refresh the page and try again
5. Check server is running and logs show socket connections

### Server Logs to Look For

```bash
User [userId] connected with socket [socketId]
🔔 Notified requester [userId] of new helper request
✅ Notified helper [userId] of confirmation
```

### Network Tab Check

1. Open browser DevTools → Network tab
2. Filter by "WS" (WebSocket)
3. Should see `socket.io` connection
4. Status should be "101 Switching Protocols"
5. Click on it to see messages tab
6. Should see events flowing when actions happen
