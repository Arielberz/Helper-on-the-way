/*
  קובץ זה אחראי על:
  - דף הבית עם מפה אינטראקטיבית
  - הצגת התראה לדירוגים שטרם נוצלו (דרך PendingRatingNotification)

  הקובץ לא משמש:
  - דף landing - יש landing.jsx נפרד

  הקובץ אינו:
  - מציג את המפה עצמה - משתמש ב-MapLive component
  - בודק דירוגים ממתינים ישירות (זה ב-PendingRatingNotification)
*/

import React from "react";
import MapLive from "../../components/MapLive/MapLive.jsx";
import PendingRatingNotification from "../../components/PendingRatingNotification/PendingRatingNotification";

export default function Home() {
  return (
    <>
      <MapLive />
      <PendingRatingNotification />
    </>
  );
}
