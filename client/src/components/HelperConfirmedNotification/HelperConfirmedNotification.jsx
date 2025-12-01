import { useEffect, useState } from 'react'
import { useHelperRequest } from '../../context/HelperRequestContext'
import { useNavigate } from 'react-router-dom'

const API_BASE = import.meta.env.VITE_API_URL

export default function HelperConfirmedNotification() {
  const { helperConfirmed, clearHelperConfirmed } = useHelperRequest()
  const navigate = useNavigate()
  const [isLoadingChat, setIsLoadingChat] = useState(false)

  useEffect(() => {
    console.log('🎯 HelperConfirmedNotification component mounted')
  }, [])

  useEffect(() => {
    console.log('🎯 helperConfirmed changed:', helperConfirmed)
    if (helperConfirmed) {
      console.log('🎉 SHOWING HELPER CONFIRMED NOTIFICATION!')
      console.log('Helper confirmed data:', helperConfirmed)
    }
  }, [helperConfirmed])

  console.log('🎯 HelperConfirmedNotification render, helperConfirmed:', helperConfirmed)

  const handleOpenChat = async () => {
    if (!helperConfirmed?.request?._id) return

    setIsLoadingChat(true)
    const token = localStorage.getItem('token')
    const requestId = helperConfirmed.request._id

    try {
      // Get or create conversation for this request
      const response = await fetch(
        `${API_BASE}/api/chat/conversation/request/${requestId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (response.ok) {
        const chatData = await response.json()
        const conversationId = chatData.data?.conversation?._id || chatData.data?._id

        if (conversationId) {
          console.log('💬 Opening chat with conversation:', conversationId)
          // Navigate to chat with conversation ID
          navigate('/chat', { state: { conversationId } })
          clearHelperConfirmed()
        } else {
          console.error('No conversation ID received')
          alert('Unable to open chat. Please try again.')
        }
      } else {
        console.error('Failed to get conversation:', response.status)
        alert('Unable to open chat. Please try again.')
      }
    } catch (error) {
      console.error('Error opening chat:', error)
      alert('Unable to open chat. Please try again.')
    } finally {
      setIsLoadingChat(false)
    }
  }

  if (!helperConfirmed) {
    console.log('🎯 Not showing notification - helperConfirmed is null')
    return null
  }

  console.log('🎯 RENDERING NOTIFICATION MODAL!')

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-9999 p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-in zoom-in duration-300">
        <div className="text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            You're Confirmed!
          </h2>
          <p className="text-gray-600 mb-6">
            {helperConfirmed.message || "You've been confirmed to help with this request!"}
          </p>
          
          {helperConfirmed.request && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-semibold text-gray-900 mb-2">Request Details:</h3>
              <p className="text-sm text-gray-700 mb-1">
                <span className="font-medium">Requester:</span> {helperConfirmed.request.user?.username || 'N/A'}
              </p>
              <p className="text-sm text-gray-700 mb-1">
                <span className="font-medium">Phone:</span> {helperConfirmed.request.user?.phone || 'N/A'}
              </p>
              <p className="text-sm text-gray-700 mb-1">
                <span className="font-medium">Problem:</span> {helperConfirmed.request.problemType?.replace(/_/g, ' ') || 'N/A'}
              </p>
              {helperConfirmed.request.location?.address && (
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Location:</span> {helperConfirmed.request.location.address}
                </p>
              )}
            </div>
          )}

          <div className="flex flex-col gap-3">
            <button
              onClick={handleOpenChat}
              disabled={isLoadingChat}
              className="w-full bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoadingChat ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Opening Chat...
                </>
              ) : (
                <>
                  💬 Contact Requester
                </>
              )}
            </button>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  const requestLocation = helperConfirmed.request?.location
                  navigate('/home', {
                    state: {
                      requestId: helperConfirmed.request?._id,
                      focusLocation: requestLocation ? {
                        lat: requestLocation.lat,
                        lng: requestLocation.lng,
                        address: requestLocation.address
                      } : null
                    }
                  })
                  clearHelperConfirmed()
                }}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
              >
                📍 View on Map
              </button>
              <button
                onClick={clearHelperConfirmed}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition font-medium"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
