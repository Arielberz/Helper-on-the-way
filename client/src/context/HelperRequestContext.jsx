import { createContext, useContext, useState, useEffect } from 'react'
import { io } from 'socket.io-client'
import { getToken } from '../utils/authUtils'

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

  // Initialize Socket.IO connection
  useEffect(() => {
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001'
    const token = getToken()
    
    if (!token) {
      return
    }

    const newSocket = io(API_BASE, {
      auth: { token },
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

    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
  }, [])

  const clearPendingRequest = () => {
    setPendingRequest(null)
  }

  const clearHelperConfirmed = () => {
    setHelperConfirmed(null)
  }

  return (
    <HelperRequestContext.Provider 
      value={{ 
        pendingRequest, 
        clearPendingRequest,
        helperConfirmed,
        clearHelperConfirmed,
        socket
      }}
    >
      {children}
    </HelperRequestContext.Provider>
  )
}
