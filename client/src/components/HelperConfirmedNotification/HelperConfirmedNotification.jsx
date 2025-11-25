import { useEffect } from 'react'
import { useHelperRequest } from '../../context/HelperRequestContext'
import { useNavigate } from 'react-router-dom'

export default function HelperConfirmedNotification() {
  const { helperConfirmed, clearHelperConfirmed } = useHelperRequest()
  const navigate = useNavigate()

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

  if (!helperConfirmed) {
    console.log('🎯 Not showing notification - helperConfirmed is null')
    return null
  }

  console.log('🎯 RENDERING NOTIFICATION MODAL!')

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4 animate-in fade-in duration-300">
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

          <div className="flex gap-3">
            <button
              onClick={() => {
                navigate('/map')
                clearHelperConfirmed()
              }}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
            >
              View on Map
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
  )
}
