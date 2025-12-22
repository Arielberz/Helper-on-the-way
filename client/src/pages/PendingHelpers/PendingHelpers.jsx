import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getToken } from '../../utils/authUtils'
import { API_BASE } from '../../utils/apiConfig'
import { apiFetch } from '../../utils/apiFetch'
import { PendingHelpersHeader } from './PendingHelpersHeader'
import { ConfirmedHelper } from './ConfirmedHelper'
import { HelpersList } from './HelpersList'
import { useAlert } from '../../context/AlertContext'

export default function PendingHelpers() {
  const [searchParams] = useSearchParams()
  const requestId = searchParams.get('requestId')
  const navigate = useNavigate()
  const { showAlert } = useAlert()
  
  const [request, setRequest] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [processingHelperId, setProcessingHelperId] = useState(null)

  useEffect(() => {
    if (!requestId) {
      setError('No request ID provided')
      setLoading(false)
      return
    }
    fetchRequest()
  }, [requestId])

  const fetchRequest = async () => {
    try {
      const response = await apiFetch(`${API_BASE}/api/requests/${requestId}`, {}, navigate)

      if (!response.ok) {
        throw new Error('Failed to fetch request')
      }

      const data = await response.json()
      setRequest(data.data)
      setLoading(false)
    } catch (err) {
      if (err.message === 'NO_TOKEN' || err.message === 'UNAUTHORIZED') {
        return;
      }
      console.error('Error fetching request:', err)
      setError(err.message)
      setLoading(false)
    }
  }

  const handleConfirmHelper = async (helperId) => {
    setProcessingHelperId(helperId)
    const token = getToken()
    try {
      const response = await apiFetch(
        `${API_BASE}/api/requests/${requestId}/confirm-helper`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ helperId })
        },
        navigate
      )

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to confirm helper')
      }

      // Step 2: Get or create conversation for this request
      const chatResponse = await fetch(
        `${API_BASE}/api/chat/conversation/request/${requestId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      if (chatResponse.ok) {
        const chatData = await chatResponse.json()
        const conversationId = chatData.data?.conversation?._id || chatData.data?._id

        if (conversationId) {
          // Step 3: Navigate to chat with conversation ID
          navigate('/chat', { state: { conversationId } })
        } else {
          // Fallback: refresh page if no conversation ID
          await fetchRequest()
          showAlert('Helper confirmed! Chat will be available shortly.')
        }
      } else {
        // Fallback: refresh page if chat fetch fails
        await fetchRequest()
        showAlert('Helper confirmed! Please navigate to chat manually.')
      }
    } catch (err) {
      console.error('Error confirming helper:', err)
      showAlert(err.message || 'Failed to confirm helper')
      setProcessingHelperId(null)
    }
  }

  const handleRejectHelper = async (helperId) => {
    setProcessingHelperId(helperId)
    try {
      const token = getToken()
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

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to reject helper')
      }

      // Refresh request data
      await fetchRequest()
      setProcessingHelperId(null)
    } catch (err) {
      console.error('Error rejecting helper:', err)
      showAlert(err.message || 'Failed to reject helper')
      setProcessingHelperId(null)
    }
  }

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371 // Radius of Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c // Distance in kilometers
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center h-[80vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">טוען...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !request) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center h-[80vh]">
          <div className="text-center">
            <p className="text-red-600 mb-4">❌ {error || 'הבקשה לא נמצאה'}</p>
            <button
              onClick={() => navigate('/home')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              חזרה לדף הבית
            </button>
          </div>
        </div>
      </div>
    )
  }

  const isAssigned = request.status === 'assigned' || request.status === 'in_progress' || request.status === 'completed'

  return (
    <div className="min-h-screen bg-gray-50">
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Request Info Card */}
        <PendingHelpersHeader request={request} />

        {/* Confirmed Helper Section */}
        {isAssigned && <ConfirmedHelper request={request} />}

        {/* Pending Helpers Section */}
        {!isAssigned && (
          <HelpersList
            helpers={request.pendingHelpers}
            requestLocation={request.location}
            processingHelperId={processingHelperId}
            onConfirmHelper={handleConfirmHelper}
            onRejectHelper={handleRejectHelper}
            calculateDistance={calculateDistance}
          />
        )}

        {/* Back Button */}
        <div className="mt-6">
          <button
            onClick={() => navigate('/home')}
            className="text-blue-600 hover:text-blue-700 font-semibold"
          >
            ← חזרה לדף הבית
          </button>
        </div>
      </div>
    </div>
  )
}
