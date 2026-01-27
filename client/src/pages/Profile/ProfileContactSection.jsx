/*
  קובץ זה אחראי על:
  - רכיב פרטי קשר בפרופיל (אימייל, טלפון)
  - הסתרת/חשיפת פרטים רגישים
  - שימוש בפונקציות מסיכה מ-profileUtils

  הקובץ משמש את:
  - profile.jsx - חלק אמצעי של דף הפרופיל

  הקובץ אינו:
  - מנהל מצב - מקבל מהאב
  - שומר פרטים בשרת - רק מציג
*/

import React from 'react';
import { maskEmail, maskPhone, formatPhoneForDisplay } from '../../utils/profileUtils';

export function ProfileContactSection({ 
  user, 
  showEmail, 
  showPhone, 
  onToggleEmail, 
  onTogglePhone 
}) {
  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-8 mb-4 sm:mb-6">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center gap-2">
        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        פרטים אישיים
      </h2>
      
      <div className="space-y-3 sm:space-y-4">

        <div className="flex items-center p-3 sm:p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 ml-2 sm:ml-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm text-gray-500 font-medium">שם משתמש</p>
            <p className="text-base sm:text-lg text-gray-800 font-semibold truncate">{user?.username || "לא זמין"}</p>
          </div>
        </div>


        <div className="flex items-center p-3 sm:p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 ml-2 sm:ml-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm text-gray-500 font-medium">אימייל</p>
            <p className="text-base sm:text-lg text-gray-800 font-semibold truncate">
              {showEmail ? (user?.email || "לא זמין") : maskEmail(user?.email)}
            </p>
          </div>
          <button
            onClick={onToggleEmail}
            className="mr-2 p-2 rounded-lg hover:bg-green-200 transition-colors flex-shrink-0"
            aria-label={showEmail ? "Hide email" : "Show email"}
          >
            {showEmail ? (
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>


        <div className="flex items-center p-3 sm:p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 ml-2 sm:ml-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm text-gray-500 font-medium">טלפון</p>
            <p className="text-base sm:text-lg text-gray-800 font-semibold truncate">
              {showPhone ? formatPhoneForDisplay(user?.phone) : maskPhone(user?.phone)}
            </p>
          </div>
          <button
            onClick={onTogglePhone}
            className="mr-2 p-2 rounded-lg hover:bg-purple-200 transition-colors flex-shrink-0"
            aria-label={showPhone ? "Hide phone" : "Show phone"}
          >
            {showPhone ? (
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
