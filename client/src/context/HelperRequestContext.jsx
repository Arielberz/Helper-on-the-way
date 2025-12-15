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
  // Initialize ETA from localStorage for persistence across page refreshes
  const [etaByRequestId, setEtaByRequestId] = useState(() => {
    try {
      const saved = localStorage.getItem('etaByRequestId');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  })

  // Track auth token reactively (updates on storage changes)
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

  // Initialize Socket.IO connection
  useEffect(() => {
    if (!authToken) {
      // Close any existing socket when logging out / no token
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

    // Listen for ETA updates from server - this ensures ETA is available everywhere
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
          // Persist to localStorage
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

    // Application-level socket errors
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
      // Persist to localStorage
      try {
        localStorage.setItem('etaByRequestId', JSON.stringify(newData));
      } catch (e) {
        console.warn('Failed to save ETA to localStorage:', e);
      }
      return newData;
    })
  }

  // Clear ETA data for a specific request (e.g., when completed)
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
