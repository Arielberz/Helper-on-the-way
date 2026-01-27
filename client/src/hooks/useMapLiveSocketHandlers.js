/*
  קובץ זה אחראי על:
  - ניהול אירועי Socket.IO של המפה (הוספה, עדכון, מחיקה של בקשות)
  - עקיבה אחרי בקשת העזרה האקטיבית של המשתמש
  - סנכרון סמנים על המפה בזמן אמת

  הקובץ משמש את:
  - MapLive - עדכוני מפה בזמן אמת

  הקובץ אינו:
  - מבצע קריאות API - רק מאזין לסוקטים
  - מנהל מצב מפה - רק מעדכן markers
*/

import { useEffect } from 'react';
import { getUserId } from '../utils/authUtils';

export function useMapLiveSocketHandlers(socket, setSharedMarkers, setMyActiveRequest) {
  
  useEffect(() => {
    if (!socket) return;

    const handleRequestAdded = (request) => {
      setSharedMarkers((prev) => {
        if (!request?._id) return prev;
        const exists = prev.some((m) => (m._id || m.id) === request._id);
        return exists ? prev : [...prev, request];
      });
    };

    const handleRequestUpdated = (request) => {
      if (!request?._id) return;
      setSharedMarkers((prev) => prev.map((m) => ((m._id || m.id) === request._id ? { ...m, ...request } : m)));
    };

    const handleRequestDeleted = ({ _id }) => {
      if (!_id) return;
      setSharedMarkers((prev) => prev.filter((m) => (m._id || m.id) !== _id));
    };

    socket.on("requestAdded", handleRequestAdded);
    socket.on("requestUpdated", handleRequestUpdated);
    socket.on("requestDeleted", handleRequestDeleted);

    return () => {
      socket.off("requestAdded", handleRequestAdded);
      socket.off("requestUpdated", handleRequestUpdated);
      socket.off("requestDeleted", handleRequestDeleted);
    };
  }, [socket, setSharedMarkers]);
  
  useEffect(() => {
    const userId = getUserId();
    if (!userId) return;

    return () => {};
  }, []);
}

export function useActiveRequestTracking(socket, sharedMarkers, setMyActiveRequest) {
  useEffect(() => {
    const userId = getUserId();
    if (!userId || sharedMarkers.length === 0) return;

    const activeReq = sharedMarkers.find(
      req => req.status === 'assigned' && 
            (req.user?._id === userId || req.user === userId || 
             req.helper?._id === userId || req.helper === userId)
    );

    setMyActiveRequest(activeReq || null);

    if (activeReq && (activeReq.helper?._id === userId || activeReq.helper === userId) && socket) {
      const sendLocationUpdate = () => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const locationData = {
                requestId: activeReq._id,
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude
              };
              socket.emit('helperLocationUpdate', locationData);
            },
            (error) => console.warn('❌ Geolocation error:', error.message)
          );
        }
      };

      sendLocationUpdate();
      const interval = setInterval(sendLocationUpdate, 30000);
      return () => {
        clearInterval(interval);
      };
    }
  }, [sharedMarkers, socket, setMyActiveRequest]);
}
