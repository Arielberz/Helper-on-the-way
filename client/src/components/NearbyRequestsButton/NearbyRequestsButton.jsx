import { useState, useMemo, useCallback } from 'react'

const PROBLEM_TYPES = [
  { value: 'flat_tire', label: 'פנצר' },
  { value: 'dead_battery', label: 'מצבר מת' },
  { value: 'out_of_fuel', label: 'נגמר דלק' },
  { value: 'engine_problem', label: 'בעיית מנוע' },
  { value: 'locked_out', label: 'נעול בחוץ' },
  { value: 'accident', label: 'תאונה' },
  { value: 'towing_needed', label: 'נדרש גרירה' },
  { value: 'other', label: 'אחר' }
]

const PROBLEM_LABELS = Object.fromEntries(PROBLEM_TYPES.map(t => [t.value, t.label]))

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

const CloseIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

const SettingsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const NearbyRequestsButton = ({ requests, userPosition, onSelectRequest, onModalStateChange }) => {
  const [showList, setShowList] = useState(false)
  const [showHelperSettings, setShowHelperSettings] = useState(false)
  const [filterSettings, setFilterSettings] = useState({
    maxDistance: 100,
    destination: '',
    onlyOnRoute: false,
    problemTypes: [],
    minPayment: 0
  })

  const closeList = useCallback(() => {
    setShowList(false)
    onModalStateChange?.(false)
  }, [onModalStateChange])

  const toggleList = useCallback(() => {
    setShowList(s => !s)
    onModalStateChange?.(!showList)
  }, [showList, onModalStateChange])

  const updateSetting = useCallback((key, value) => {
    setFilterSettings(prev => ({ ...prev, [key]: value }))
  }, [])

  const handleProblemTypeChange = useCallback((value) => {
    setFilterSettings(prev => ({
      ...prev,
      problemTypes: prev.problemTypes.includes(value)
        ? prev.problemTypes.filter(t => t !== value)
        : [...prev.problemTypes, value]
    }))
  }, [])

  const hasActiveFilters = filterSettings.maxDistance < 100 || filterSettings.problemTypes.length > 0 || filterSettings.minPayment > 0

  const sortedRequests = useMemo(() => {
    return requests
      .filter(req => req.location?.lat && req.location?.lng && req.status === 'pending')
      .map(req => ({
        ...req,
        distance: calculateDistance(userPosition[0], userPosition[1], req.location.lat, req.location.lng)
      }))
      .filter(req => {
        if (req.distance > filterSettings.maxDistance) return false
        if (filterSettings.problemTypes.length > 0 && !filterSettings.problemTypes.includes(req.problemType)) return false
        if (filterSettings.minPayment > 0 && (req.payment?.offeredAmount || 0) < filterSettings.minPayment) return false
        return true
      })
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 10)
  }, [requests, userPosition, filterSettings])

  const filterSummary = hasActiveFilters
    ? `Filtered: max ${filterSettings.maxDistance}km${filterSettings.problemTypes.length ? `, ${filterSettings.problemTypes.length} types` : ''}${filterSettings.minPayment ? `, min ₪${filterSettings.minPayment}` : ''}`
    : 'Nearby Help Requests'

  return (
    <>
      <button
        className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold transition-all duration-300 backdrop-blur-md bg-blue-500/10 hover:bg-blue-500/20 text-blue-700 border border-blue-200/40 shadow-lg hover:shadow-xl"
        onClick={toggleList}
        aria-label="Show nearby requests"
      >
        <span className="text-2xl">📍</span>
        <span className="text-sm font-medium">{sortedRequests.length} Nearby</span>
      </button>

      {showList && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-1001 p-4" onClick={closeList}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()} dir="rtl">
            <div className="bg-white px-8 py-6 border-b border-slate-100">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">בקשות עזרה קרובות</h2>
                  <p className="text-sm text-slate-500 mt-1">{filterSummary}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowHelperSettings(true)}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      hasActiveFilters ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                    aria-label="Filter settings"
                    title="Filter Settings"
                  >
                    <SettingsIcon />
                  </button>
                  <button className="text-slate-400 hover:text-slate-600 transition-colors" onClick={closeList}>
                    <CloseIcon />
                  </button>
                </div>
              </div>
            </div>

            <div className="p-8 overflow-y-auto flex-1 space-y-4">
              {sortedRequests.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-xl text-gray-600 mb-2">אין בקשות עזרה קרובות</p>
                  <p className="text-sm text-gray-400">{hasActiveFilters ? 'No requests match your filters' : 'No nearby requests'}</p>
                </div>
              ) : (
                sortedRequests.map(req => (
                  <div
                    key={req._id || req.id}
                    className="bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-blue-500 hover:shadow-md transition-all"
                    onClick={() => { onSelectRequest(req); closeList() }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                        {PROBLEM_LABELS[req.problemType] || req.problemType}
                      </span>
                      <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-semibold">
                        {req.distance.toFixed(1)} ק"מ
                      </span>
                    </div>
                    <div className="text-gray-700 mb-2">👤 {req.user?.username || 'משתמש לא ידוע'}</div>
                    {req.description && <div className="text-gray-600 text-sm mb-2">{req.description}</div>}
                    {req.location?.address && <div className="text-gray-500 text-sm mb-2">📍 {req.location.address}</div>}
                    {req.payment?.offeredAmount > 0 && (
                      <div className="text-green-600 font-semibold mb-2">💰 {req.payment.offeredAmount} {req.payment.currency || 'ILS'}</div>
                    )}
                    <div className="text-gray-400 text-xs">⏰ {new Date(req.createdAt).toLocaleString('he-IL')}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {showHelperSettings && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-1002 p-4" onClick={() => setShowHelperSettings(false)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()} dir="rtl">
            <div className="bg-white px-8 py-6 border-b border-slate-100">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">הגדרות סינון</h2>
                  <p className="text-slate-500 text-sm mt-1">Filter Settings</p>
                </div>
                <button onClick={() => setShowHelperSettings(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <CloseIcon />
                </button>
              </div>
            </div>

            <div className="p-8 overflow-y-auto flex-1 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">📏 מרחק מקסימלי</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={filterSettings.maxDistance}
                    onChange={e => updateSetting('maxDistance', Number(e.target.value))}
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-gray-700 font-medium">ק"מ</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">🎯 לאן אתה נוסע?</label>
                <input
                  type="text"
                  placeholder="כתובת יעד"
                  value={filterSettings.destination}
                  onChange={e => updateSetting('destination', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <label className="flex items-center gap-3 cursor-pointer bg-blue-50/50 border border-blue-100 rounded-xl p-4">
                <input
                  type="checkbox"
                  checked={filterSettings.onlyOnRoute}
                  onChange={e => updateSetting('onlyOnRoute', e.target.checked)}
                  className="w-5 h-5 text-blue-600"
                />
                <span className="text-gray-900 font-medium">רק אנשים שבדרך שלי</span>
              </label>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">💰 תשלום מינימלי</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="1000"
                    value={filterSettings.minPayment}
                    onChange={e => updateSetting('minPayment', Number(e.target.value))}
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-gray-700 font-medium">₪</span>
                </div>
                <p className="text-sm text-gray-500 mt-2">💡 0 = כל תשלום או עזרה חינם</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">🔧 סוגי בעיות</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {PROBLEM_TYPES.map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => handleProblemTypeChange(value)}
                      className={`flex items-center justify-center p-3 rounded-xl border-2 transition-all h-16 text-xs font-medium text-center ${
                        filterSettings.problemTypes.includes(value)
                          ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                          : 'border-gray-100 bg-white text-gray-600 hover:border-blue-200 hover:bg-gray-50'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
              <button onClick={() => setShowHelperSettings(false)} className="px-6 py-2.5 text-slate-600 font-medium hover:bg-slate-200/50 rounded-lg transition-colors">
                ביטול
              </button>
              <button onClick={() => setShowHelperSettings(false)} className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all">
                שמור
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default NearbyRequestsButton
