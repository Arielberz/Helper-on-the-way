/*
  קובץ זה אחראי על:
  - ניהול מצב גלובלי של בקשות עזרה ומעזרים
  - חיבור Socket.IO לעדכונים בזמן אמת
  - מעקב בקשות ממתינות, מעזרים מאושרים, ו-ETA
  - שמירה ב-localStorage לשמירת מצב בין רענוני עמוד
  - Hook useHelperRequest לגישה למצב ופונקציות

  הקובץ משמש את:
  - App.jsx שמעטף את ה-Routes ב-HelperRequestProvider
  - MapLive, IncomingHelpNotification, HelperConfirmedNotification

  הקובץ אינו:
  - מציג UI של הנוטיפיקציות
  - מכיל לוגיקת מפה או ניתוב
*/

import { createContext, useContext, useState, useEffect } from 'react'
import { io } from 'socket.io-client'
import { getToken } from '../utils/authUtils'
import { API_BASE } from '../utils/apiConfig'

const HelperRequestContext = createContext()

export const useHelperRequest = () => {
  const context = useContext(HelperRequestContext)
  if (!context) {
    throw new Error('useHelperRequest must be used within HelperRequestProvider')
  }
  return context
}

export const HelperRequestProvider = ({ children }) => {
  const [pendingRequest, setPendingRequest] = useState(null)
  const [helperConfirmed, setHelperConfirmed] = useState(null)
  const [socket, setSocket] = useState(null)
  const [etaByRequestId, setEtaByRequestId] = useState(() => {
    try {
      const saved = localStorage.getItem('etaByRequestId');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  })

  const [authToken, setAuthToken] = useState(getToken())

  useEffect(() => {
    const handleStorage = (e) => {
      if (!e || e.key === 'token') {
        setAuthToken(getToken())
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  useEffect(() => {
    if (!authToken) {
      if (socket) {
        try { socket.close() } catch {}
        setSocket(null)
      }
      return
    }

    const newSocket = io(API_BASE, {
      auth: { token: authToken },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    })

    newSocket.on('helperRequestReceived', (data) => {
      setPendingRequest(data)
      try {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBDGH0fPTgjMGHm7A7+OZSR0NVK7n77BfG')
        audio.play().catch(() => {})
      } catch (e) {}
    })

    newSocket.on('helperConfirmed', (data) => {

      setHelperConfirmed(data)
      try {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBDGH0fPTgjMGHm7A7+OZSR0NVK7n77BfG')
        audio.play().catch(() => {})
      } catch (e) {}
    })

    newSocket.on('etaUpdated', (data) => {
      const { requestId, etaSeconds, timestamp } = data;
      if (requestId && typeof etaSeconds === 'number') {
        const etaMinutes = etaSeconds / 60;
        setEtaByRequestId(prev => {
          const newData = {
            ...prev,
            [requestId]: { 
              etaMinutes, 
              etaSeconds, 
              updatedAt: timestamp || Date.now() 
            }
          };
          try {
            localStorage.setItem('etaByRequestId', JSON.stringify(newData));
          } catch (e) {
            console.warn('Failed to save ETA to localStorage:', e);
          }
          return newData;
        });
      }
    })

    newSocket.on('connect', () => {

    })

    newSocket.on('disconnect', () => {

    })

    newSocket.on('connect_error', (error) => {
      console.error('❌ [Socket.IO] Connection error:', error)
    })

    newSocket.on('chat:error', (payload) => {
      console.error('❌ [Socket.IO] Chat error:', payload)
    })

    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
  }, [authToken])

  const clearPendingRequest = () => {
    setPendingRequest(null)
  }

  const clearHelperConfirmed = () => {
    setHelperConfirmed(null)
  }

  const setEtaForRequest = (requestId, etaData) => {
    setEtaByRequestId(prev => {
      const newData = {
        ...prev,
        [requestId]: etaData,
      };
      try {
        localStorage.setItem('etaByRequestId', JSON.stringify(newData));
      } catch (e) {
        console.warn('Failed to save ETA to localStorage:', e);
      }
      return newData;
    })
  }

  const clearEtaForRequest = (requestId) => {
    setEtaByRequestId(prev => {
      const newData = { ...prev };
      delete newData[requestId];
      try {
        localStorage.setItem('etaByRequestId', JSON.stringify(newData));
      } catch (e) {
        console.warn('Failed to save ETA to localStorage:', e);
      }
      return newData;
    })
  }

  return (
    <HelperRequestContext.Provider 
      value={{ 
        pendingRequest, 
        clearPendingRequest,
        helperConfirmed,
        clearHelperConfirmed,
        socket,
        etaByRequestId,
        setEtaForRequest,
        clearEtaForRequest
      }}
    >
      {children}
    </HelperRequestContext.Provider>
  )
}
