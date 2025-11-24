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
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={handleCancelSettings}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
            dir="rtl"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-2">הגדרות עזרה</h2>
            <p className="text-sm text-gray-500 mb-6">Helper Mode Settings</p>

            <div className="mb-6">
              <label className="block mb-2">
                <span className="text-gray-700 font-semibold block mb-2">
                  מרחק מקסימלי (Maximum Distance)
                </span>
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
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-gray-600 font-medium">ק"מ (km)</span>
                </div>
              </label>
            </div>

            <div className="mb-6">
              <label className="block">
                <span className="text-gray-700 font-semibold block mb-2">
                  לאן אתה נוסע? (Where are you going?)
                </span>
                <input
                  type="text"
                  placeholder="כתובת יעד (Destination address)"
                  value={helperSettings.destination}
                  onChange={(e) => setHelperSettings(prev => ({
                    ...prev,
                    destination: e.target.value
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </label>
            </div>

            <div className="mb-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={helperSettings.onlyOnRoute}
                  onChange={(e) => setHelperSettings(prev => ({
                    ...prev,
                    onlyOnRoute: e.target.checked
                  }))}
                  className="w-5 h-5 text-blue-500 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-700">רק אנשים שבדרך שלי (Only people on my route)</span>
              </label>
            </div>

            <div className="mb-6">
              <label className="block">
                <span className="text-gray-700 font-semibold block mb-2">
                  תשלום מינימלי (Minimum Payment)
                </span>
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
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-gray-600 font-medium">₪ (ILS)</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">0 = Any payment or free help</p>
              </label>
            </div>

            <div className="mb-6">
              <label className="block mb-2">
                <span className="text-gray-700 font-semibold">סוגי בעיות שאני יכול לעזור בהם:</span>
              </label>
              <p className="text-sm text-gray-500 mb-3">Problem types I can help with:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {problemTypeOptions.map(option => (
                  <label key={option.value} className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-50 rounded-lg">
                    <input
                      type="checkbox"
                      checked={helperSettings.problemTypes.includes(option.value)}
                      onChange={() => handleProblemTypeChange(option.value)}
                      className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
              <button 
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                onClick={handleCancelSettings}
              >
                ביטול (Cancel)
              </button>
              <button 
                className="px-6 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors shadow-md"
                onClick={handleConfirmSettings}
              >
                התחל לעזור (Start Helping)
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default HelperButton
