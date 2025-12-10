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
  const [etaByRequestId, setEtaByRequestId] = useState({})

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
      console.log('🎉 [Socket.IO] Received helperConfirmed event:', data)
      setHelperConfirmed(data)
      try {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBDGH0fPTgjMGHm7A7+OZSR0NVK7n77BfG')
        audio.play().catch(() => {})
      } catch (e) {}
    })

    newSocket.on('connect', () => {
      console.log('✅ [Socket.IO] Connected to server')
    })

    newSocket.on('disconnect', () => {
      console.log('❌ [Socket.IO] Disconnected from server')
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
    setEtaByRequestId(prev => ({
      ...prev,
      [requestId]: etaData,
    }))
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
        setEtaForRequest
      }}
    >
      {children}
    </HelperRequestContext.Provider>
  )
}
