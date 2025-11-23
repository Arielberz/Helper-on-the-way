import { useState } from 'react'
import './helperButton.css'

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
        className={`helper-button ${isHelper ? 'active' : ''}`}
        onClick={handleToggle}
        aria-label={isHelper ? 'Stop helping' : 'Start helping'}
      >
        <div className="helper-icon">
          {isHelper ? '🚗✓' : '🚗'}
        </div>
        <span className="helper-text">
          {isHelper ? 'Helping Mode ON' : 'Help Others'}
        </span>
      </button>

      {showModal && (
        <div className="helper-modal-overlay" onClick={handleCancelSettings}>
          <div className="helper-modal" onClick={(e) => e.stopPropagation()}>
            <h2>הגדרות עזרה</h2>
            <p className="modal-subtitle">Helper Mode Settings</p>

            <div className="modal-section">
              <label>
                מרחק מקסימלי (Maximum Distance)
                <div className="input-with-unit">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={helperSettings.maxDistance}
                    onChange={(e) => setHelperSettings(prev => ({
                      ...prev,
                      maxDistance: Number(e.target.value)
                    }))}
                  />
                  <span className="unit">ק"מ (km)</span>
                </div>
              </label>
            </div>

            <div className="modal-section">
              <label>
                לאן אתה נוסע? (Where are you going?)
                <input
                  type="text"
                  placeholder="כתובת יעד (Destination address)"
                  value={helperSettings.destination}
                  onChange={(e) => setHelperSettings(prev => ({
                    ...prev,
                    destination: e.target.value
                  }))}
                />
              </label>
            </div>

            <div className="modal-section">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={helperSettings.onlyOnRoute}
                  onChange={(e) => setHelperSettings(prev => ({
                    ...prev,
                    onlyOnRoute: e.target.checked
                  }))}
                />
                <span>רק אנשים שבדרך שלי (Only people on my route)</span>
              </label>
            </div>

            <div className="modal-section">
              <label>
                תשלום מינימלי (Minimum Payment)
                <div className="input-with-unit">
                  <input
                    type="number"
                    min="0"
                    max="1000"
                    value={helperSettings.minPayment}
                    onChange={(e) => setHelperSettings(prev => ({
                      ...prev,
                      minPayment: Number(e.target.value)
                    }))}
                  />
                  <span className="unit">₪ (ILS)</span>
                </div>
              </label>
              <p className="label-subtitle">0 = Any payment or free help</p>
            </div>

            <div className="modal-section">
              <label>סוגי בעיות שאני יכול לעזור בהם:</label>
              <p className="label-subtitle">Problem types I can help with:</p>
              <div className="problem-types-grid">
                {problemTypeOptions.map(option => (
                  <label key={option.value} className="checkbox-label small">
                    <input
                      type="checkbox"
                      checked={helperSettings.problemTypes.includes(option.value)}
                      onChange={() => handleProblemTypeChange(option.value)}
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn-cancel" onClick={handleCancelSettings}>
                ביטול (Cancel)
              </button>
              <button className="btn-confirm" onClick={handleConfirmSettings}>
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
