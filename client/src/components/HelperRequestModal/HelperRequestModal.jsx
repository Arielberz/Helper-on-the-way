import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const HelperRequestModal = ({ helperRequest, onClose, onConfirm, onReject }) => {
  const navigate = useNavigate()
  const [isConfirming, setIsConfirming] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)

  // Calculate distance using Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371 // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  const handleConfirm = async () => {
    setIsConfirming(true)
    try {
      await onConfirm(helperRequest)
      // Auto-navigate to chat after confirmation
      navigate(`/chat?requestId=${helperRequest.requestId}&helperId=${helperRequest.helper._id}`)
    } catch (error) {
      console.error('Error confirming helper:', error)
      alert('שגיאה באישור העוזר')
      setIsConfirming(false)
    }
  }

  const handleReject = async () => {
    setIsRejecting(true)
    try {
      await onReject(helperRequest)
      onClose()
    } catch (error) {
      console.error('Error rejecting helper:', error)
      alert('שגיאה בדחיית העוזר')
      setIsRejecting(false)
    }
  }

  if (!helperRequest) return null

  const distance = helperRequest.helperLocation && helperRequest.requestLocation
    ? calculateDistance(
        helperRequest.requestLocation.lat,
        helperRequest.requestLocation.lng,
        helperRequest.helperLocation.lat,
        helperRequest.helperLocation.lng
      )
    : null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-slideUp">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800">🤝 מישהו רוצה לעזור!</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isConfirming || isRejecting}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Helper Info Card */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 mb-4 border border-blue-200">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl font-semibold text-gray-800">
                  {helperRequest.helper?.username || 'משתמש'}
                </span>
                {helperRequest.helper?.averageRating && (
                  <div className="flex items-center gap-1 bg-yellow-100 px-2 py-1 rounded-full">
                    <span className="text-yellow-600 font-bold">
                      {helperRequest.helper.averageRating.toFixed(1)}
                    </span>
                    <span className="text-yellow-500">⭐</span>
                  </div>
                )}
              </div>
              
              {distance !== null && (
                <div className="flex items-center gap-1 text-blue-700 font-medium">
                  <span>📍</span>
                  <span>{distance.toFixed(1)} ק״מ ממך</span>
                </div>
              )}
            </div>
          </div>

          {/* Helper Message */}
          {helperRequest.message && (
            <div className="bg-white rounded-lg p-3 border border-blue-200">
              <p className="text-sm text-gray-600 mb-1 font-semibold">הודעה:</p>
              <p className="text-gray-800">{helperRequest.message}</p>
            </div>
          )}

          {/* Helper Contact Info */}
          <div className="mt-3 space-y-1 text-sm">
            {helperRequest.helper?.phone && (
              <div className="flex items-center gap-2 text-gray-700">
                <span>📱</span>
                <span dir="ltr">{helperRequest.helper.phone}</span>
              </div>
            )}
            {helperRequest.helper?.email && (
              <div className="flex items-center gap-2 text-gray-700">
                <span>📧</span>
                <span>{helperRequest.helper.email}</span>
              </div>
            )}
          </div>
        </div>

        {/* Request Details */}
        <div className="bg-gray-50 rounded-lg p-3 mb-4 border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">
            <strong>בקשת עזרה שלך:</strong> {helperRequest.problemType || 'עזרה כללית'}
          </p>
          {helperRequest.requestLocation?.address && (
            <p className="text-sm text-gray-600">
              <strong>מיקום:</strong> {helperRequest.requestLocation.address}
            </p>
          )}
          <p className="text-xs text-gray-500 mt-2">
            התקבל: {new Date(helperRequest.requestedAt).toLocaleString('he-IL')}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleConfirm}
            disabled={isConfirming || isRejecting}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
              isConfirming
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-500 hover:bg-green-600 active:scale-95'
            } text-white shadow-md`}
          >
            {isConfirming ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                מאשר...
              </span>
            ) : (
              '✅ אשר ופתח צ\'אט'
            )}
          </button>
          
          <button
            onClick={handleReject}
            disabled={isConfirming || isRejecting}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
              isRejecting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-red-500 hover:bg-red-600 active:scale-95'
            } text-white shadow-md`}
          >
            {isRejecting ? 'מבטל...' : '❌ דחה'}
          </button>
        </div>

        {/* Info Note */}
        <p className="text-xs text-gray-500 text-center mt-4">
          💡 לאחר האישור, תועבר אוטומטית לצ'אט עם העוזר
        </p>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}

export default HelperRequestModal
