import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useHelperRequest } from '../../context/HelperRequestContext'

const GlobalHelperRequestModal = () => {
  const { pendingRequest, clearPendingRequest } = useHelperRequest()
  const navigate = useNavigate()

  useEffect(() => {
    if (pendingRequest) {
      navigate(`/pending-helpers?requestId=${pendingRequest.requestId}`)
      clearPendingRequest()
    }
  }, [pendingRequest, navigate, clearPendingRequest])

  return null
}

export default GlobalHelperRequestModal
