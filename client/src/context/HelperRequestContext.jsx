import { createContext, useContext, useState, useEffect } from 'react'
import { io } from 'socket.io-client'

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
  const [socket, setSocket] = useState(null)

  // Initialize Socket.IO connection
  useEffect(() => {
    const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001'
    const token = localStorage.getItem('token')
    
    // Don't connect if no token (user not logged in)
    if (!token) {
      return
    }

    // Connect to socket with auth token
    const newSocket = io(API_BASE, {
      auth: { token },
      transports: ['websocket', 'polling'], // Try websocket first, fallback to polling
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    })

    newSocket.on('connect', () => {
      console.log('✅ Socket connected for helper requests:', newSocket.id)
    })

    newSocket.on('connect_error', (error) => {
      // Socket connection error
    })

    // Listen for helper request notifications
    newSocket.on('helperRequestReceived', (data) => {
      console.log('🔔 HELPER REQUEST RECEIVED:', data)
      alert(`🔔 New helper request from ${data.helper?.username || 'Someone'}!`)
      setPendingRequest(data)
    })

    newSocket.on('disconnect', (reason) => {
      // Socket disconnected
    })

    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
  }, [])

  const clearPendingRequest = () => {
    setPendingRequest(null)
  }

  return (
    <HelperRequestContext.Provider 
      value={{ 
        pendingRequest, 
        clearPendingRequest,
        socket 
      }}
    >
      {children}
    </HelperRequestContext.Provider>
  )
}
