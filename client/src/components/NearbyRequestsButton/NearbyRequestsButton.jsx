import { useState } from 'react'

const NearbyRequestsButton = ({ requests, userPosition, onSelectRequest, helperSettings, isHelperMode, onModalStateChange }) => {
  const [showList, setShowList] = useState(false)

  // חישוב מרחק בין שתי נקודות (Haversine formula)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371 // רדיוס כדור הארץ בק"מ
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  // מיון וסינון הבקשות לפי מרחק והגדרות העוזר
  const sortedRequests = requests
    .filter(req => req.location?.lat && req.location?.lng && req.status === 'pending')
    .map(req => ({
      ...req,
      distance: calculateDistance(
        userPosition[0],
        userPosition[1],
        req.location.lat,
        req.location.lng
      )
    }))
    .filter(req => {
      // אם מצב עוזר פעיל, מסנן לפי הגדרות
      if (isHelperMode && helperSettings) {
        // סינון לפי מרחק מקסימלי
        if (req.distance > helperSettings.maxDistance) {
          return false
        }
        
        // סינון לפי סוגי בעיות
        if (helperSettings.problemTypes.length > 0) {
          if (!helperSettings.problemTypes.includes(req.problemType)) {
            return false
          }
        }
        
        // סינון לפי תשלום מינימלי
        if (helperSettings.minPayment > 0) {
          const offeredAmount = req.payment?.offeredAmount || 0
          if (offeredAmount < helperSettings.minPayment) {
            return false
          }
        }
        
        // TODO: סינון לפי "בדרך אליי" - דורש חישוב מסלול
        // if (helperSettings.onlyOnRoute && helperSettings.destination) {
        //   // כאן צריך לבדוק אם הבקשה נמצאת על המסלול
        // }
      }
      
      return true
    })
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 10) // 10 הבקשות הקרובות ביותר

  const getProblemTypeLabel = (type) => {
    const labels = {
      'flat_tire': 'פנצ\'ר',
      'dead_battery': 'מצבר מת',
      'out_of_fuel': 'גמר דלק',
      'engine_problem': 'בעיית מנוע',
      'locked_out': 'נעול בחוץ',
      'accident': 'תאונה',
      'towing_needed': 'נדרש גרירה',
      'other': 'אחר'
    }
    return labels[type] || type
  }

  const handleToggle = () => {
    const newState = !showList
    setShowList(newState)
    // Notify parent component of modal state change
    if (onModalStateChange) {
      onModalStateChange(newState)
    }
  }

  return (
    <>
      <button
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all duration-300 shadow-md hover:shadow-lg backdrop-blur-sm ${
          isHelperMode 
            ? 'bg-purple-500/20 hover:bg-purple-600/30 text-blue-600 drop-shadow-lg' 
            : 'bg-orange-500/20 hover:bg-orange-600/30 text-blue-600 drop-shadow-lg'
        }`}
        onClick={handleToggle}
        aria-label="Show nearby requests"
      >
        <div className="text-2xl">📍</div>
        <span className="text-sm font-medium">
          {sortedRequests.length} Nearby
        </span>
      </button>

      {showList && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-1001 p-4" onClick={() => {
          setShowList(false)
          if (onModalStateChange) {
            onModalStateChange(false)
          }
        }}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()} dir="rtl">
            <div className="bg-white px-8 py-6 border-b border-slate-100 flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">בקשות עזרה קרובות</h2>
                <p className="text-sm text-slate-500 mt-1">
                  {isHelperMode && helperSettings 
                    ? `Filtered: max ${helperSettings.maxDistance}km${helperSettings.problemTypes.length > 0 ? `, ${helperSettings.problemTypes.length} problem types` : ''}${helperSettings.minPayment > 0 ? `, min ₪${helperSettings.minPayment}` : ''}`
                    : 'Nearby Help Requests'
                  }
                </p>
              </div>
              <button className="text-slate-400 hover:text-slate-600 transition-colors" onClick={() => {
                setShowList(false)
                if (onModalStateChange) {
                  onModalStateChange(false)
                }
              }}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-8 overflow-y-auto flex-1 space-y-4">
              {sortedRequests.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-xl text-gray-600 mb-2">אין בקשות עזרה קרובות</p>
                  <p className="text-sm text-gray-400">
                    {isHelperMode && helperSettings 
                      ? 'No requests match your helper settings'
                      : 'No nearby help requests'
                    }
                  </p>
                </div>
              ) : (
                sortedRequests.map(req => (
                  <div
                    key={req._id || req.id}
                    className="bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-blue-500 hover:shadow-md transition-all"
                    onClick={() => {
                      onSelectRequest(req)
                      setShowList(false)
                      if (onModalStateChange) {
                        onModalStateChange(false)
                      }
                    }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                        {getProblemTypeLabel(req.problemType)}
                      </div>
                      <div className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-semibold">
                        {req.distance.toFixed(1)} ק"מ
                      </div>
                    </div>
                    
                    <div className="text-gray-700 mb-2">
                      👤 {req.user?.username || 'משתמש לא ידוע'}
                    </div>
                    
                    {req.description && (
                      <div className="text-gray-600 text-sm mb-2">
                        {req.description}
                      </div>
                    )}
                    
                    {req.location?.address && (
                      <div className="text-gray-500 text-sm mb-2">
                        📍 {req.location.address}
                      </div>
                    )}

                    {req.payment?.offeredAmount && (
                      <div className="text-green-600 font-semibold mb-2">
                        💰 {req.payment.offeredAmount} {req.payment.currency || 'ILS'}
                      </div>
                    )}

                    <div className="text-gray-400 text-xs">
                      ⏰ {new Date(req.createdAt).toLocaleString('he-IL')}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default NearbyRequestsButton
