import { useEffect, useState } from 'react'
import { useHelperRequest } from '../../context/HelperRequestContext'
import { useNavigate } from 'react-router-dom'
import { API_BASE } from '../../utils/apiConfig'
import { useAlert } from '../../context/AlertContext'

export default function HelperConfirmedNotification() {
  const { showAlert } = useAlert()
  const { helperConfirmed, clearHelperConfirmed } = useHelperRequest()
  const navigate = useNavigate()
  const [isLoadingChat, setIsLoadingChat] = useState(false)

  useEffect(() => {

  }, [])

  useEffect(() => {

    if (helperConfirmed) {

    }
  }, [helperConfirmed])



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

          // Navigate to chat with conversation ID
          navigate('/chat', { state: { conversationId } })
          clearHelperConfirmed()
        } else {
          console.error('No conversation ID received')
          showAlert('Unable to open chat. Please try again.')
        }
      } else {
        console.error('Failed to get conversation:', response.status)
        showAlert('Unable to open chat. Please try again.')
      }
    } catch (error) {
      console.error('Error opening chat:', error)
      showAlert('Unable to open chat. Please try again.')
    } finally {
      setIsLoadingChat(false)
    }
  }

  if (!helperConfirmed) {

    return null
  }



  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-9999 p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-in zoom-in duration-300">
        <div className="text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            אושרת!
          </h2>
          <p className="text-gray-600 mb-6">
            {helperConfirmed.message || "אושרת לעזור בבקשה זו!"}
          </p>
          
          {helperConfirmed.request && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <h3 className="font-semibold text-gray-900 mb-2">פרטי הבקשה:</h3>
              <p className="text-sm text-gray-700 mb-1">
                <span className="font-medium">מבקש:</span> {helperConfirmed.request.user?.username || 'N/A'}
              </p>
              <p className="text-sm text-gray-700 mb-1">
                <span className="font-medium">טלפון:</span> {helperConfirmed.request.user?.phone || 'N/A'}
              </p>
              <p className="text-sm text-gray-700 mb-1">
                <span className="font-medium">בעיה:</span> {helperConfirmed.request.problemType?.replace(/_/g, ' ') || 'N/A'}
              </p>
              {helperConfirmed.request.location?.address && (
                <p className="text-sm text-gray-700">
                  <span className="font-medium">מיקום:</span> {helperConfirmed.request.location.address}
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
                  <span className="animate-spin">⌛</span>
                  פותח צ'אט...
                </>
              ) : (
                <>
                  💬 צור קשר עם המבקש
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
                📍 צפה במפה
              </button>
              <button
                onClick={clearHelperConfirmed}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition font-medium"
              >
                סגור
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
