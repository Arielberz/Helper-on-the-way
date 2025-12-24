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
    <div className="fixed bottom-4 right-8 z-[9999] animate-in slide-in-from-bottom-10 fade-in duration-500">
      <div className="bg-white/80 backdrop-blur-xl border border-blue-200/50 shadow-2xl rounded-3xl p-5 w-80 flex flex-col gap-4 relative overflow-hidden">
        {/* Decorative glass gradient blob */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-400/20 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-xl shadow-sm">
                🎉
              </div>
              <div>
                <h2 className="font-bold text-gray-900 text-lg leading-tight">
                  אושרת!
                </h2>
                <p className="text-xs text-blue-600 font-medium">
                  {helperConfirmed.message || "אושרת לעזור לבקשה זו"}
                </p>
              </div>
            </div>
            <button 
              onClick={clearHelperConfirmed}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-black/5 transition"
            >
              ✕
            </button>
          </div>

          {helperConfirmed.request && (
            <div className="bg-white/60 rounded-xl p-3 mb-3 text-right">
              <p className="text-sm text-gray-800 font-medium truncate">
                <span className="text-gray-500 text-xs ml-1">מבקש:</span>
                {helperConfirmed.request.user?.username || 'N/A'}
              </p>
              <p className="text-xs text-gray-600 truncate mt-1">
                <span className="text-gray-500 ml-1">בעיה:</span> 
                {helperConfirmed.request.problemType?.replace(/_/g, ' ') || 'N/A'}
              </p>
              {helperConfirmed.request.location?.address && (
                 <p className="text-xs text-gray-500 truncate mt-1" title={helperConfirmed.request.location.address}>
                   📍 {helperConfirmed.request.location.address}
                 </p>
              )}
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleOpenChat}
              disabled={isLoadingChat}
              className="flex-1 bg-green-600 text-white px-3 py-2 rounded-xl hover:bg-green-700 transition text-sm font-medium flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoadingChat ? (
                <>
                  <span className="animate-spin text-xs">⌛</span>
                  <span>טוען...</span>
                </>
              ) : (
                <>
                  💬 <span>צ'אט</span>
                </>
              )}
            </button>
            
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
              className="px-3 py-2 rounded-xl bg-blue-100 text-blue-700 hover:bg-blue-200 transition text-sm font-medium flex items-center gap-1"
            >
              📍 מפה
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
