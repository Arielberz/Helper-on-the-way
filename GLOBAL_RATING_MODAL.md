# Global Rating Modal System - Documentation

## Overview
The rating modal now appears as a **global popup** that can be triggered from any page in the application, including the map page. This ensures users never miss the opportunity to rate their helpers.

## Architecture

### 1. Global Context (`RatingContext.jsx`)
**Location:** `client/src/context/RatingContext.jsx`

**Purpose:** Manages the rating modal state globally across the entire application.

**Key Functions:**
- `openRatingModal(request)` - Opens the rating modal with a specific request
- `closeRatingModal()` - Closes the rating modal
- `showRatingModal` - Boolean state indicating if modal is open
- `requestToRate` - The request object to be rated

### 2. Global Rating Modal Component
**Location:** `client/src/components/GlobalRatingModal/GlobalRatingModal.jsx`

**Purpose:** Renders the rating modal at the app level, above all pages.

**Features:**
- Automatically appears when `openRatingModal()` is called from anywhere
- Shows the RatingModal component with the selected request
- Handles success callback and page refresh

### 3. Pending Rating Notification
**Location:** `client/src/components/PendingRatingNotification/PendingRatingNotification.jsx`

**Purpose:** Floating button that shows pending ratings count and allows quick rating.

**Features:**
- Fixed position button (bottom-right corner)
- Shows count of pending ratings
- Polls every 30 seconds for new pending ratings
- Clicking opens the rating modal for the first pending request
- Only visible when there are pending ratings
- Animated pulse effect to draw attention

### 4. Backend Check Endpoint
**Location:** `Server/Api/Controllers/ratingController.js`

**New Endpoint:** `GET /api/ratings/:requestId/check`

**Purpose:** Checks if a specific request has already been rated by the current user.

**Response:**
```json
{
  "success": true,
  "message": "Rating check completed",
  "data": {
    "alreadyRated": false,
    "rating": null
  }
}
```

## User Flow

### Flow 1: Confirmation from Profile Page
1. User confirms completion on profile page
2. `handleRequesterConfirmCompletion()` calls `openRatingModal(request)`
3. Global rating modal appears immediately
4. User submits rating
5. Page refreshes to show updated rating

### Flow 2: Automatic on Map Page
1. User is on the map page (Home)
2. `useEffect` in Home component checks for pending ratings on mount
3. If found, automatically calls `openRatingModal(request)`
4. Rating modal appears over the map
5. User can rate without leaving the map page

### Flow 3: Floating Notification Button
1. User navigates to any page
2. Pending rating notification appears as floating button
3. Shows count of pending ratings with pulse animation
4. User clicks button
5. Rating modal opens for the first pending request
6. After rating, notification disappears or updates count

## Integration Points

### App.jsx
```jsx
import { RatingProvider } from "./context/RatingContext";
import GlobalRatingModal from "./components/GlobalRatingModal/GlobalRatingModal";

function App() {
  return (
    <RatingProvider>
      <GlobalRatingModal />
      <Routes>
        {/* All routes */}
      </Routes>
    </RatingProvider>
  );
}
```

### Any Component Can Trigger Rating
```jsx
import { useRating } from "../../context/RatingContext";

const MyComponent = () => {
  const { openRatingModal } = useRating();
  
  const handleSomeAction = () => {
    // Trigger rating modal from anywhere!
    openRatingModal(requestObject);
  };
};
```

## Features

### ✅ Global Accessibility
- Rating modal can be triggered from **any page**
- No need to navigate to profile to rate
- Works seamlessly across route changes

### ✅ Automatic Detection
- Home page automatically checks for pending ratings on load
- Shows modal if user has unrated completed requests

### ✅ Visual Notifications
- Floating button with count badge
- Pulse animation draws attention
- Fixed position for easy access

### ✅ Persistent State
- Modal state managed globally
- Survives route changes
- Clean close and reset functionality

### ✅ Smart Polling
- Checks for new pending ratings every 30 seconds
- Only when user is authenticated
- Minimal performance impact

## API Endpoints Used

1. **GET /api/requests/my-requests**
   - Fetches user's requests
   - Filters for completed + confirmed requests

2. **GET /api/ratings/:requestId/check** (NEW)
   - Checks if request already rated
   - Returns boolean `alreadyRated`

3. **POST /api/ratings**
   - Submits the rating
   - Updates helper's average rating

4. **PATCH /api/requests/:id/status**
   - Updates request status
   - Handles `requesterConfirmed: true`

## Styling

### Notification Button
- **Position:** Fixed bottom-right (bottom: 24px, right: 24px)
- **Colors:** Yellow background (`bg-yellow-500`)
- **Animation:** Pulse effect (`animate-pulse`)
- **Z-index:** 50 (appears above most content)
- **Hover:** Scale up slightly (`hover:scale-110`)

### Modal Overlay
- Renders at app root level
- Full-screen semi-transparent backdrop
- Z-index ensures it's on top of all content

## Testing Checklist

- [ ] Rating modal opens from profile page
- [ ] Rating modal auto-opens on map page when pending rating exists
- [ ] Floating notification button appears when ratings pending
- [ ] Button shows correct count
- [ ] Clicking notification opens rating modal
- [ ] Rating submission works from any page
- [ ] Modal closes properly after rating
- [ ] Page refreshes and shows updated rating
- [ ] Anonymous rating display works
- [ ] Polling updates notification count every 30 seconds
- [ ] No errors in console

## Benefits

1. **Improved User Experience:** Users can rate immediately without navigating away
2. **Higher Rating Completion Rate:** Notifications and auto-popups encourage ratings
3. **Context Preservation:** Users can rate while staying on the map
4. **Clear Feedback:** Floating button shows pending ratings count
5. **Non-Intrusive:** Only appears when needed

## Future Enhancements

- Push notifications for pending ratings
- Email reminders after X hours
- Swipe through multiple pending ratings
- Rating analytics dashboard
- Helper response to ratings
