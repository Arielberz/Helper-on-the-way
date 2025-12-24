import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useHelperRequest } from '../../context/HelperRequestContext'
import { getToken } from '../../utils/authUtils'
import { API_BASE } from '../../utils/apiConfig'
import { useAlert } from '../../context/AlertContext'
import { apiFetch } from '../../utils/apiFetch'

// Helper function to calculate distance and ETA
const calculateEta = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  
  // Distance (Haversine formula)
  const R = 6371; // Earth curve radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distanceKm = R * c;

  // Estimate time (assuming average speed of 40 km/h in city)
  const speedKmh = 40;
  const timeHours = distanceKm / speedKmh;
  const timeMinutes = Math.round(timeHours * 60);

  // Return formatted strings
  return {
    distance: distanceKm < 1 ? `${(distanceKm * 1000).toFixed(0)} m` : `${distanceKm.toFixed(1)} km`,
    time: timeMinutes < 1 ? '< 1 min' : `${timeMinutes} mins`,
    rawTime: timeMinutes
  };
};

export default function IncomingHelpNotification() {
  const [activeRequest, setActiveRequest] = useState(null)
  const [firstHelper, setFirstHelper] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  
  const navigate = useNavigate()
  const { pendingRequest } = useHelperRequest() // Socket updates trigger this
  const { showAlert } = useAlert()

  // Poll for pending helpers
  useEffect(() => {
    fetchPendingHelpers()
    const interval = setInterval(fetchPendingHelpers, 5000)
    return () => clearInterval(interval)
  }, [])

  // Listen to socket triggers
  useEffect(() => {
    if (pendingRequest) {
      fetchPendingHelpers()
    }
  }, [pendingRequest])

  const fetchPendingHelpers = async () => {
    try {
      const token = getToken()
      if (!token) return

      const response = await fetch(`${API_BASE}/api/requests/my-requests`, {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (!response.ok) return

      const data = await response.json()
      // Find active request with pending helpers
      const request = data.data?.find(
        req => req.status === 'pending' && req.pendingHelpers?.length > 0
      )

      if (request) {
        setActiveRequest(request)
        // Just take the first helper for the notification
        setFirstHelper(request.pendingHelpers[0])
      } else {
        setActiveRequest(null)
        setFirstHelper(null)
      }
    } catch (err) {
      console.error('Error fetching pending helpers:', err)
    }
  }

  const handleAccept = async () => {
    if (!activeRequest || !firstHelper) return
    setIsProcessing(true)
    const token = getToken()
    const requestId = activeRequest._id
    const helperId = firstHelper.user._id

    try {
      // 1. Confirm Helper
      const response = await apiFetch(
        `${API_BASE}/api/requests/${requestId}/confirm-helper`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ helperId })
        },
        navigate
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to confirm helper')
      }

      // 2. Open Chat
      const chatResponse = await fetch(
        `${API_BASE}/api/chat/conversation/request/${requestId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      if (chatResponse.ok) {
        const chatData = await chatResponse.json()
        const conversationId = chatData.data?.conversation?._id || chatData.data?._id
        if (conversationId) {
          navigate('/chat', { state: { conversationId } })
        } else {
          showAlert('Helper confirmed! Could not open chat automatically.')
          setActiveRequest(null)
        }
      } else {
        showAlert('Helper confirmed! Please open chat manually.')
        setActiveRequest(null)
      }
    } catch (error) {
      console.error('Error accepting helper:', error)
      showAlert(error.message)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDecline = async () => {
    if (!activeRequest || !firstHelper) return
    setIsProcessing(true)
    const requestId = activeRequest._id
    const helperId = firstHelper.user._id
    const token = getToken()

    try {
      const response = await fetch(
        `${API_BASE}/api/requests/${requestId}/reject-helper`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ helperId })
        }
      )

      if (!response.ok) {
        throw new Error('Failed to reject helper')
      }

      // Refresh to see if there are other helpers
      await fetchPendingHelpers()

    } catch (error) {
      console.error('Error rejecting helper:', error)
      showAlert('Failed to reject helper')
    } finally {
      setIsProcessing(false)
    }
  }

  // Calculate ETA - Must be before any early return!
  const eta = useMemo(() => {
    if (!activeRequest?.location || !firstHelper?.location) return null;
    return calculateEta(
      activeRequest.location.lat,
      activeRequest.location.lng,
      firstHelper.location.lat,
      firstHelper.location.lng
    );
  }, [activeRequest, firstHelper]);

  if (!activeRequest || !firstHelper) return null

  // Format Helper Name
  const user = firstHelper.user || {}
  const helperName = user.username || 'Unknown Helper'
  const helperRating = user.rating || user.averageRating ? (user.rating || user.averageRating).toFixed(1) : 'New'
  const helperAvatar = user.avatar

  return (
    <div className="fixed top-24 md:top-8 left-1/2 -translate-x-1/2 z-[9999] animate-in slide-in-from-top-4 fade-in duration-500 w-[90%] max-w-md">
      <div className="bg-white/90 backdrop-blur-xl border border-blue-200 shadow-2xl rounded-2xl p-5 relative overflow-hidden">
        
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500"></div>
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-blue-100/50 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col gap-4">
          
          <div className="flex items-center gap-4">
            {/* Avatar / Icon */}
            <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shadow-inner shrink-0">
               {helperAvatar ? (
                 <img src={helperAvatar} alt={helperName} className="w-full h-full rounded-full object-cover" />
               ) : (
                 <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                 </svg>
               )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 text-lg truncate">
                {helperName}
              </h3>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-600 mt-1">
                <span className="flex items-center gap-1 bg-yellow-50 px-2 py-0.5 rounded-full border border-yellow-100 text-yellow-700 text-xs font-medium">
                  ⭐ {helperRating}
                </span>
                
                {eta && (
                  <span className="flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100 text-blue-700 text-xs font-medium">
                    📍 {eta.distance} • 🕒 {eta.time}
                  </span>
                )}
              </div>
              {!eta && <div className="text-xs text-green-600 font-medium mt-1">רוצה לעזור לך!</div>}
            </div>
          </div>

          <div className="flex gap-3 mt-1">
            <button
              onClick={handleAccept}
              disabled={isProcessing}
              className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-xl transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <span className="animate-spin">⌛</span>
              ) : (
                <>
                  <span>קבל עזרה</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </>
              )}
            </button>
            <button
              onClick={handleDecline}
              disabled={isProcessing}
              className="px-5 py-3 rounded-xl bg-gray-100 text-gray-600 font-medium hover:bg-gray-200 hover:text-gray-800 transition-colors disabled:opacity-50"
            >
              לא תודה
            </button>
          </div>

          {activeRequest.pendingHelpers.length > 1 && (
            <p className="text-xs text-center text-gray-400 mt-1">
              +{activeRequest.pendingHelpers.length - 1} עוזרים נוספים ממתינים
            </p>
          )}

        </div>
      </div>
    </div>
  )
}
