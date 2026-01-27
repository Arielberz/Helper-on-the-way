/*
  קובץ זה אחראי על:
  - מודאל אישור תנאי שימוש ומדיניות פרטיות
  - הצגת דרישה לאישור התנאים לפני שימוש במערכת
  - ניווט לדפי תנאי השימוש והפרטיות
  - ניהול מצב האישור ושמירתו
*/

import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function TermsConsentModal({ 
  isOpen, 
  onAccept, 
  onCancel, 
  isChecked, 
  onCheckChange,
  error 
}) {
  const navigate = useNavigate()

  if (!isOpen) return null

  const handleTermsClick = (e) => {
    e.preventDefault()
    navigate('/terms')
  }

  const handlePrivacyClick = (e) => {
    e.preventDefault()
    navigate('/privacy')
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onCancel}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >

        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
          <h2 className="text-2xl font-bold text-gray-800 text-right">
            תנאי שימוש ופרטיות
          </h2>
        </div>


        <div className="p-6 text-right">
          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p className="font-semibold text-lg">לפני ההרשמה, אנא קרא/י את הנקודות הבאות:</p>
            
            <ul className="space-y-3 mr-6 list-disc">
              <li>
                האפליקציה היא פלטפורמה לחיבור בין משתמשים; ההתקשרות בין משתמשים נעשית ישירות ביניהם.
              </li>
              <li>
                תשלומים באפליקציה מתבצעים דרך מערכת התשלומים שלנו, ונזקפים ליתרה פנימית של העוזר.
              </li>
              <li>
                קיימים כלי דיווח, דירוג ובקרה: במקרה של בעיה ניתן לדווח, והחברה תפעל ככל האפשר לבדוק ולנקוט צעדים מתאימים, בהתאם לשיקול דעתה.
              </li>
              <li>
                השימוש באפליקציה הוא באחריות המשתמש; החברה לא תישא באחריות לנזק ישיר או עקיף, כספי או אחר, שנגרם עקב השימוש באפליקציה או כתוצאה מפעולות של משתמשים אחרים; עם זאת החברה תפעל ככל האפשר לסייע בבדיקת מקרים חריגים שידווחו לה ולנקוט צעדים מתאימים מול משתמשים שפעלו בניגוד לתנאים.
              </li>
            </ul>


            <div className="flex flex-col gap-2 mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={handleTermsClick}
                className="text-blue-600 hover:text-blue-800 underline text-right font-medium"
              >
                צפה בתנאי השימוש המלאים ←
              </button>
              <button
                onClick={handlePrivacyClick}
                className="text-blue-600 hover:text-blue-800 underline text-right font-medium"
              >
                צפה במדיניות הפרטיות ←
              </button>
            </div>


            <div className="mt-6 pt-4 border-t border-gray-200">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={onCheckChange}
                  className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-800 font-medium flex-1">
                  קראתי ואני מסכים/ה לתנאי השימוש ולמדיניות הפרטיות.
                </span>
              </label>
              
              {error && (
                <p className="text-red-600 text-sm mt-2 mr-8">
                  {error}
                </p>
              )}
            </div>
          </div>
        </div>


        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 rounded-b-2xl flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition-colors"
          >
            ביטול
          </button>
          <button
            onClick={onAccept}
            disabled={!isChecked}
            className={`px-6 py-3 font-semibold rounded-lg transition-colors ${
              isChecked 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            המשך הרשמה
          </button>
        </div>
      </div>
    </div>
  )
}
