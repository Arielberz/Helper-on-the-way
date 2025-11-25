import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import Header from '../../components/header/Header'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export default function PendingHelpers() {
  const [searchParams] = useSearchParams()
  const requestId = searchParams.get('requestId')
  const navigate = useNavigate()
  
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
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE}/api/requests/${requestId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch request')
      }

      const data = await response.json()
      setRequest(data.data)
      setLoading(false)
    } catch (err) {
      console.error('Error fetching request:', err)
      setError(err.message)
      setLoading(false)
    }
  }

  const handleConfirmHelper = async (helperId) => {
    setProcessingHelperId(helperId)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(
        `${API_BASE}/api/requests/${requestId}/confirm-helper`,
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
        throw new Error(data.message || 'Failed to confirm helper')
      }

      // Refresh request data
      await fetchRequest()
      
      // Navigate to chat with the confirmed helper
      navigate(`/chat?requestId=${requestId}&helperId=${helperId}`)
    } catch (err) {
      console.error('Error confirming helper:', err)
      alert(err.message || 'Failed to confirm helper')
      setProcessingHelperId(null)
    }
  }

  const handleRejectHelper = async (helperId) => {
    setProcessingHelperId(helperId)
    try {
      const token = localStorage.getItem('token')
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
      alert(err.message || 'Failed to reject helper')
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
        <Header />
        <div className="flex items-center justify-center h-[80vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !request) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-[80vh]">
          <div className="text-center">
            <p className="text-red-600 mb-4">❌ {error || 'Request not found'}</p>
            <button
              onClick={() => navigate('/home')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  const isAssigned = request.status === 'assigned' || request.status === 'in_progress' || request.status === 'completed'
  const hasPendingHelpers = request.pendingHelpers && request.pendingHelpers.length > 0

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Request Info Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Your Help Request
          </h1>
          
          <div className="space-y-2">
            <p className="text-gray-700">
              <span className="font-semibold">Problem:</span>{' '}
              {request.problemType?.replace(/_/g, ' ') || 'N/A'}
            </p>
            <p className="text-gray-700">
              <span className="font-semibold">Description:</span>{' '}
              {request.description || 'N/A'}
            </p>
            {request.location?.address && (
              <p className="text-gray-700">
                <span className="font-semibold">Location:</span>{' '}
                {request.location.address}
              </p>
            )}
            <p className="text-gray-700">
              <span className="font-semibold">Status:</span>{' '}
              <span className={`
                inline-block px-3 py-1 rounded-full text-sm font-semibold
                ${request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                ${request.status === 'assigned' ? 'bg-blue-100 text-blue-800' : ''}
                ${request.status === 'in_progress' ? 'bg-green-100 text-green-800' : ''}
                ${request.status === 'completed' ? 'bg-gray-100 text-gray-800' : ''}
              `}>
                {request.status}
              </span>
            </p>
          </div>
        </div>

        {/* Confirmed Helper Section */}
        {isAssigned && request.helper && (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg shadow-md p-6 mb-6 border-2 border-green-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-2xl">✅</span>
              Confirmed Helper
            </h2>
            
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="mb-4">
                <p className="text-xl font-bold text-gray-900 mb-2">
                  {request.helper.username}
                </p>
                {request.helper.averageRating && (
                  <div className="inline-flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-200">
                    <span className="text-yellow-600 font-bold text-lg">
                      {request.helper.averageRating.toFixed(1)}
                    </span>
                    <span className="text-yellow-500 text-lg">⭐</span>
                    <span className="text-sm text-gray-500 ml-1">
                      ({request.helper.ratingCount || 0})
                    </span>
                  </div>
                )}
              </div>

              <button
                onClick={() => navigate(`/chat?requestId=${request._id}&helperId=${request.helper._id}`)}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
              >
                💬 Open Chat
              </button>
            </div>
          </div>
        )}

        {/* Pending Helpers Section */}
        {!isAssigned && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-2xl">🤝</span>
              People Who Want to Help
              {hasPendingHelpers && (
                <span className="bg-blue-600 text-white text-sm px-3 py-1 rounded-full">
                  {request.pendingHelpers.length}
                </span>
              )}
            </h2>

            {!hasPendingHelpers ? (
              <div className="text-center py-12">
                <p className="text-6xl mb-4">⏳</p>
                <p className="text-gray-600 text-lg mb-2">
                  No helpers yet
                </p>
                <p className="text-gray-500 text-sm">
                  Waiting for someone to respond to your request...
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {request.pendingHelpers.map((pendingHelper) => {
                  // Safety check for user data
                  if (!pendingHelper.user || !pendingHelper.user.username) {
                    return null
                  }

                  // Calculate distance if helper location is available
                  const distance = pendingHelper.location && request.location
                    ? calculateDistance(
                        request.location.lat,
                        request.location.lng,
                        pendingHelper.location.lat,
                        pendingHelper.location.lng
                      )
                    : null

                  return (
                    <div
                      key={pendingHelper.user._id}
                      className="border-2 border-gray-200 rounded-xl p-5 hover:shadow-lg hover:border-blue-300 transition-all bg-white"
                    >
                      <div className="flex items-start gap-4 mb-4">
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                          <div className="h-16 w-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-md">
                            {pendingHelper.user.username.charAt(0).toUpperCase()}
                          </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {pendingHelper.user.username}
                          </h3>
                          
                          {/* Rating */}
                          {pendingHelper.user.averageRating ? (
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-200">
                                <span className="text-yellow-600 font-bold text-lg">
                                  {pendingHelper.user.averageRating.toFixed(1)}
                                </span>
                                <span className="text-yellow-500 text-lg">⭐</span>
                              </div>
                              <span className="text-sm text-gray-500">
                                ({pendingHelper.user.ratingCount || 0} reviews)
                              </span>
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500 mb-2">
                              No ratings yet
                            </div>
                          )}

                          {/* Distance */}
                          {distance !== null && (
                            <div className="flex items-center gap-1 text-blue-600 font-medium text-sm mb-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <span>{distance.toFixed(1)} km away</span>
                            </div>
                          )}

                          {/* Request Time */}
                          <p className="text-gray-400 text-xs">
                            🕐 Requested {new Date(pendingHelper.requestedAt).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>

                      {/* Buttons */}
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleConfirmHelper(pendingHelper.user._id)}
                          disabled={processingHelperId === pendingHelper.user._id}
                          className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                          {processingHelperId === pendingHelper.user._id ? (
                            <span className="flex items-center justify-center gap-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              Confirming...
                            </span>
                          ) : (
                            '✅ Confirm & Chat'
                          )}
                        </button>
                        <button
                          onClick={() => handleRejectHelper(pendingHelper.user._id)}
                          disabled={processingHelperId === pendingHelper.user._id}
                          className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                          {processingHelperId === pendingHelper.user._id ? (
                            <span className="flex items-center justify-center gap-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              Rejecting...
                            </span>
                          ) : (
                            '❌ Reject'
                          )}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Back Button */}
        <div className="mt-6">
          <button
            onClick={() => navigate('/home')}
            className="text-blue-600 hover:text-blue-700 font-semibold"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  )
}
