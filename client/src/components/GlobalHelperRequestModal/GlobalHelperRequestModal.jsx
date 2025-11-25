import { useHelperRequest } from '../../context/HelperRequestContext'
import HelperRequestModal from '../HelperRequestModal/HelperRequestModal'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const GlobalHelperRequestModal = () => {
  const { pendingRequest, clearPendingRequest } = useHelperRequest()

  const handleConfirm = async (helperRequest) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(
        `${API_BASE}/api/requests/${helperRequest.requestId}/confirm-helper`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            helperId: helperRequest.helper._id
          })
        }
      )

      if (!response.ok) {
        throw new Error('Failed to confirm helper')
      }

      // Modal will auto-navigate to chat, so just clear the request
      clearPendingRequest()
    } catch (error) {
      console.error('Error confirming helper:', error)
      throw error
    }
  }

  const handleReject = async (helperRequest) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(
        `${API_BASE}/api/requests/${helperRequest.requestId}/reject-helper`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            helperId: helperRequest.helper._id
          })
        }
      )

      if (!response.ok) {
        throw new Error('Failed to reject helper')
      }

      clearPendingRequest()
    } catch (error) {
      console.error('Error rejecting helper:', error)
      throw error
    }
  }

  if (!pendingRequest) return null

  return (
    <HelperRequestModal
      helperRequest={pendingRequest}
      onClose={clearPendingRequest}
      onConfirm={handleConfirm}
      onReject={handleReject}
    />
  )
}

export default GlobalHelperRequestModal
