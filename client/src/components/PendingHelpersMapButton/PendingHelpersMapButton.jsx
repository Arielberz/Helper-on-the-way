import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useHelperRequest } from '../../context/HelperRequestContext'
import { getToken } from '../../utils/authUtils'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export default function PendingHelpersMapButton() {
  const [pendingCount, setPendingCount] = useState(0)
  const [myActiveRequest, setMyActiveRequest] = useState(null)
  const navigate = useNavigate()
  const { pendingRequest } = useHelperRequest()

  useEffect(() => {
    fetchPendingCount()
    // Poll every 10 seconds for updates
    const interval = setInterval(fetchPendingCount, 10000)
    return () => clearInterval(interval)
  }, [])

  // Refresh when new pending request comes in via socket
  useEffect(() => {
    if (pendingRequest) {
      fetchPendingCount()
    }
  }, [pendingRequest])

  const fetchPendingCount = async () => {
    try {
      const token = getToken()
      if (!token) return

      // Get user's active requests
      const response = await fetch(`${API_BASE}/api/requests/my-requests`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (!response.ok) return

      const data = await response.json()
      
      // Find active request (pending status with pending helpers)
      const activeRequest = data.data?.find(
        req => req.status === 'pending' && req.pendingHelpers?.length > 0
      )

      if (activeRequest) {
        setMyActiveRequest(activeRequest)
        setPendingCount(activeRequest.pendingHelpers?.length || 0)
      } else {
        setMyActiveRequest(null)
        setPendingCount(0)
      }
    } catch (err) {
      console.error('Error fetching pending helpers:', err)
    }
  }

  const handleClick = () => {
    if (myActiveRequest) {
      navigate(`/pending-helpers?requestId=${myActiveRequest._id}`)
    }
  }

  // Only show if there are pending helpers
  if (!myActiveRequest || pendingCount === 0) {
    return null
  }

  return (
    <button
      onClick={handleClick}
      className="absolute bottom-24 right-6 z-[1000] bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300 animate-bounce"
      title={`${pendingCount} ${pendingCount === 1 ? 'helper' : 'helpers'} waiting`}
    >
      {/* Icon */}
      <div className="relative">
        <svg 
          className="w-8 h-8" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2.5} 
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" 
          />
        </svg>
        
        {/* Badge */}
        <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center animate-pulse border-2 border-white">
          {pendingCount}
        </span>

        {/* Pulsing ring effect */}
        <span className="absolute inset-0 rounded-full bg-blue-400 opacity-75 animate-ping"></span>
      </div>

      {/* Tooltip */}
      <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block">
        <div className="bg-gray-900 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap shadow-lg">
          {pendingCount} {pendingCount === 1 ? 'helper' : 'helpers'} waiting
          <div className="absolute top-full right-6 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      </div>
    </button>
  )
}
