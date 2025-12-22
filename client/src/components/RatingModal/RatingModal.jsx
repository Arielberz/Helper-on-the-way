import { useState } from 'react'
import axios from 'axios'
import { getToken } from '../../utils/authUtils'
import { useAlert } from '../../context/AlertContext'

const RatingModal = ({ requestId, helperName, onClose, onSubmitSuccess }) => {
  const { showAlert } = useAlert()
  const [score, setScore] = useState(0)
  const [hoveredScore, setHoveredScore] = useState(0)
  const [review, setReview] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (score === 0) {
      showAlert('אנא בחר דירוג')
      return
    }

    setIsSubmitting(true)

    try {
      const token = getToken()
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/ratings`,
        {
          requestId,
          score,
          review
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      if (response.data.success) {
        const updatedHelper = response.data.data?.updatedHelper;
        if (updatedHelper) {
          showAlert(`✅ תודה על הדירוג!\n${helperName} כעת בעל דירוג: ${updatedHelper.averageRating.toFixed(1)} ⭐ (${updatedHelper.ratingCount} דירוגים)`);
        } else {
          showAlert('✅ תודה על הדירוג!');
        }
        if (onSubmitSuccess) {
          onSubmitSuccess(response.data.data)
        }
        onClose()
      }
    } catch (error) {
      console.error('Error submitting rating:', error)
      showAlert(error.response?.data?.message || 'שגיאה בשליחת הדירוג')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getScoreLabel = (score) => {
    const labels = {
      1: 'גרוע',
      2: 'לא טוב',
      3: 'בסדר',
      4: 'טוב',
      5: 'מצוין!'
    }
    return labels[score] || ''
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[1002] p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-white px-8 py-6 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-800">דרג את השירות</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          {helperName && (
            <p className="text-gray-600 mt-2">
              איך היה השירות מ{helperName}?
            </p>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Star Rating */}
            <div className="flex flex-col items-center">
              <label className="text-sm font-medium text-gray-700 mb-4">
                בחר דירוג
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setScore(star)}
                    onMouseEnter={() => setHoveredScore(star)}
                    onMouseLeave={() => setHoveredScore(0)}
                    className="text-5xl transition-all duration-200 hover:scale-110 focus:outline-none"
                  >
                    <span
                      className={
                        star <= (hoveredScore || score)
                          ? 'text-yellow-400'
                          : 'text-gray-300'
                      }
                    >
                      ★
                    </span>
                  </button>
                ))}
              </div>
              {score > 0 && (
                <p className="mt-3 text-lg font-medium text-gray-700">
                  {getScoreLabel(score)}
                </p>
              )}
            </div>

            {/* Review */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                חוות דעת (אופציונלי)
              </label>
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="ספר לנו על החוויה שלך..."
                rows={4}
                maxLength={500}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              />
              <p className="text-xs text-gray-500 mt-1 text-left">
                {review.length}/500
              </p>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-100 px-8 py-4 flex justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-all font-medium"
            disabled={isSubmitting}
          >
            ביטול
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={score === 0 || isSubmitting}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all font-medium shadow-sm hover:shadow-md"
          >
            {isSubmitting ? 'שולח...' : 'שלח דירוג'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default RatingModal
