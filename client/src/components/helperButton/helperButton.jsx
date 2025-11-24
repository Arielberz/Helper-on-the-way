import { useState } from 'react'

const HelperButton = ({ onToggleHelper }) => {
  const [isHelper, setIsHelper] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [helperSettings, setHelperSettings] = useState({
    maxDistance: 10, // km
    destination: '',
    onlyOnRoute: false,
    problemTypes: [],
    minPayment: 0 // minimum payment amount
  })

  const problemTypeOptions = [
    { value: 'flat_tire', label: 'פנצר (Flat Tire)' },
    { value: 'dead_battery', label: 'מצבר מת (Dead Battery)' },
    { value: 'out_of_fuel', label: 'נגמר דלק (Out of Fuel)' },
    { value: 'engine_problem', label: 'בעיית מנוע (Engine Problem)' },
    { value: 'locked_out', label: 'נעול בחוץ (Locked Out)' },
    { value: 'accident', label: 'תאונה (Accident)' },
    { value: 'towing_needed', label: 'נדרש גרירה (Towing Needed)' },
    { value: 'other', label: 'אחר (Other)' }
  ]

  const handleToggle = () => {
    if (!isHelper) {
      // Opening helper mode - show settings modal
      setShowModal(true)
    } else {
      // Turning off helper mode
      setIsHelper(false)
      onToggleHelper(false, null)
    }
  }

  const handleConfirmSettings = () => {
    setIsHelper(true)
    setShowModal(false)
    onToggleHelper(true, helperSettings)
  }

  const handleCancelSettings = () => {
    setShowModal(false)
  }

  const handleProblemTypeChange = (value) => {
    setHelperSettings(prev => ({
      ...prev,
      problemTypes: prev.problemTypes.includes(value)
        ? prev.problemTypes.filter(t => t !== value)
        : [...prev.problemTypes, value]
    }))
  }

  return (
    <>
      <button
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all duration-300 shadow-md hover:shadow-lg backdrop-blur-sm ${
          isHelper 
            ? 'bg-green-500/20 hover:bg-green-600/30 text-blue-600 drop-shadow-lg' 
            : 'bg-blue-500/20 hover:bg-blue-600/30 text-blue-600 drop-shadow-lg'
        }`}
        onClick={handleToggle}
        aria-label={isHelper ? 'Stop helping' : 'Start helping'}
      >
        <div className="text-2xl">
          {isHelper ? '🚗✓' : '🚗'}
        </div>
        <span className="text-sm font-medium">
          {isHelper ? 'Helping Mode ON' : 'Help Others'}
        </span>
      </button>

      {showModal && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
          onClick={handleCancelSettings}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-slideUp"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            {/* Header */}
            <div className="bg-white px-8 py-6 border-b border-slate-100">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">הגדרות עזרה</h2>
                  <p className="text-slate-500 text-sm mt-1">Helper Mode Settings</p>
                </div>
                <button onClick={handleCancelSettings} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-8 overflow-y-auto flex-1">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    📏 מרחק מקסימלי (Maximum Distance)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={helperSettings.maxDistance}
                      onChange={(e) => setHelperSettings(prev => ({
                        ...prev,
                        maxDistance: Number(e.target.value)
                      }))}
                      className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-gray-700 font-medium">ק"מ</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    🎯 לאן אתה נוסע? (Where are you going?)
                  </label>
                  <input
                    type="text"
                    placeholder="כתובת יעד (Destination address)"
                    value={helperSettings.destination}
                    onChange={(e) => setHelperSettings(prev => ({
                      ...prev,
                      destination: e.target.value
                    }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={helperSettings.onlyOnRoute}
                      onChange={(e) => setHelperSettings(prev => ({
                        ...prev,
                        onlyOnRoute: e.target.checked
                      }))}
                      className="w-5 h-5 text-blue-600"
                    />
                    <span className="text-gray-900 font-medium">רק אנשים שבדרך שלי (Only people on my route)</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    💰 תשלום מינימלי (Minimum Payment)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="1000"
                      value={helperSettings.minPayment}
                      onChange={(e) => setHelperSettings(prev => ({
                        ...prev,
                        minPayment: Number(e.target.value)
                      }))}
                      className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-gray-700 font-medium">₪</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">💡 0 = Any payment or free help</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    🔧 סוגי בעיות שאני יכול לעזור בהם (Problem types I can help with)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {problemTypeOptions.map(option => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handleProblemTypeChange(option.value)}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all duration-200 gap-1 h-20 ${
                          helperSettings.problemTypes.includes(option.value)
                            ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                            : 'border-gray-100 bg-white text-gray-600 hover:border-blue-200 hover:bg-gray-50'
                        }`}
                      >
                        <span className="text-xs font-medium text-center leading-tight">
                          {option.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer / Actions */}
            <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
              <button
                onClick={handleCancelSettings}
                className="px-6 py-2.5 text-slate-600 font-medium hover:text-slate-800 hover:bg-slate-200/50 rounded-lg transition-colors"
              >
                ביטול (Cancel)
              </button>
              <button
                onClick={handleConfirmSettings}
                className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
              >
                התחל לעזור! 🚗 (Start Helping)
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default HelperButton
