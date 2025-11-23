import { useState } from 'react'
import './NearbyRequestsButton.css'

const NearbyRequestsButton = ({ requests, userPosition, onSelectRequest, helperSettings, isHelperMode }) => {
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
    setShowList(!showList)
  }

  return (
    <>
      <button
        className={`nearby-requests-button ${isHelperMode ? 'helper-active' : ''}`}
        onClick={handleToggle}
        aria-label="Show nearby requests"
      >
        <div className="nearby-icon">📍</div>
        <span className="nearby-text">
          {sortedRequests.length} Nearby
        </span>
      </button>

      {showList && (
        <div className="nearby-modal-overlay" onClick={() => setShowList(false)}>
          <div className="nearby-modal" onClick={(e) => e.stopPropagation()}>
            <div className="nearby-header">
              <h2>בקשות עזרה קרובות</h2>
              <p className="nearby-subtitle">
                {isHelperMode && helperSettings 
                  ? `Filtered by your helper settings (max ${helperSettings.maxDistance}km${helperSettings.problemTypes.length > 0 ? `, ${helperSettings.problemTypes.length} problem types` : ''})`
                  : 'Nearby Help Requests'
                }
              </p>
              <button className="close-button" onClick={() => setShowList(false)}>
                ✕
              </button>
            </div>

            <div className="nearby-list">
              {sortedRequests.length === 0 ? (
                <div className="no-requests">
                  <p>אין בקשות עזרה קרובות</p>
                  <p className="no-requests-subtitle">
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
                    className="request-card"
                    onClick={() => {
                      onSelectRequest(req)
                      setShowList(false)
                    }}
                  >
                    <div className="request-header">
                      <div className="request-type">
                        {getProblemTypeLabel(req.problemType)}
                      </div>
                      <div className="request-distance">
                        {req.distance.toFixed(1)} ק"מ
                      </div>
                    </div>
                    
                    <div className="request-user">
                      👤 {req.user?.username || 'משתמש לא ידוע'}
                    </div>
                    
                    {req.description && (
                      <div className="request-description">
                        {req.description}
                      </div>
                    )}
                    
                    {req.location?.address && (
                      <div className="request-location">
                        📍 {req.location.address}
                      </div>
                    )}

                    {req.payment?.offeredAmount && (
                      <div className="request-payment">
                        💰 {req.payment.offeredAmount} {req.payment.currency || 'ILS'}
                      </div>
                    )}

                    <div className="request-time">
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
