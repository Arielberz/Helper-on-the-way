/*
  קובץ זה אחראי על:
  - מודאל הגדרות פילטר לבקשות סמוכות
  - סינון לפי סוג בעיה וטווח מרחק
  - שמירה וטעינה של העדפות פילטר
  - ממשק הגדרות למשתמש
*/

import React from 'react';
import { CloseIcon } from './Icons';
import { PROBLEM_TYPES } from '../utils/nearbyUtils';

export default function FilterSettingsModal({
  showHelperSettings,
  setShowHelperSettings,
  filterSettings,
  updateSetting,
  handleProblemTypeChange
}) {
  if (!showHelperSettings) return null;

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-[2200] p-4 backdrop-blur-sm transition-all"
      style={{ backgroundColor: 'rgba(15, 23, 42, 0.8)' }}
      onClick={() => setShowHelperSettings(false)}
    >
      <div className="bg-white rounded-theme-xl shadow-theme-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()} dir="rtl">
        <div className="bg-white px-8 py-6 border-b border-slate-100">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-text-main">הגדרות סינון</h2>
              <p className="text-sm mt-1 text-text-secondary">Filter Settings</p>
            </div>
            <button onClick={() => setShowHelperSettings(false)} className="text-text-light hover:text-text-secondary transition-colors duration-theme-mid">
              <CloseIcon />
            </button>
          </div>
        </div>

        <div className="p-8 overflow-y-auto flex-1 space-y-6">
          <div>
            <label className="block text-sm font-medium text-text-main mb-2">📏 מרחק מקסימלי</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="100"
                value={filterSettings.maxDistance}
                onChange={e => updateSetting('maxDistance', Number(e.target.value))}
                className="flex-1 px-4 py-3 border border-gray-200 rounded-theme-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <span className="text-text-main font-medium">ק"מ</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-main mb-2">🎯 לאן אתה נוסע?</label>
            <input
              type="text"
              placeholder="כתובת יעד"
              value={filterSettings.destination}
              onChange={e => updateSetting('destination', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-theme-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer bg-blue-50/50 border border-blue-100 rounded-theme-lg p-4 hover:bg-blue-100/50 transition-colors duration-theme-mid">
            <input
              type="checkbox"
              checked={filterSettings.onlyOnRoute}
              onChange={e => updateSetting('onlyOnRoute', e.target.checked)}
              className="w-5 h-5 accent-primary"
            />
            <span className="text-text-main font-medium">רק אנשים שבדרך שלי</span>
          </label>

          <div>
            <label className="block text-sm font-medium text-text-main mb-2">💰 תשלום מינימלי</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="1000"
                value={filterSettings.minPayment}
                onChange={e => updateSetting('minPayment', Number(e.target.value))}
                className="flex-1 px-4 py-3 border border-gray-200 rounded-theme-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <span className="text-text-main font-medium">₪</span>
            </div>
            <p className="text-sm text-text-light mt-2">💡 0 = כל תשלום או עזרה חינם</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-main mb-3">🔧 סוגי בעיות</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {PROBLEM_TYPES.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleProblemTypeChange(value)}
                  className={`flex items-center justify-center p-3 rounded-theme-lg border-2 transition-all duration-theme-mid h-16 text-xs font-medium text-center ${
                    filterSettings.problemTypes.includes(value)
                      ? 'border-primary bg-blue-50 text-primary shadow-theme-sm'
                      : 'border-gray-100 bg-white text-text-secondary hover:border-primary-light hover:bg-background'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="px-8 py-6 bg-background border-t border-slate-100 flex justify-between items-center">
          <button
            onClick={() => setShowHelperSettings(false)}
            className="px-6 py-2.5 text-text-secondary font-medium hover:text-text-main hover:bg-black/5 rounded-theme-md transition-colors duration-theme-mid"
          >
            ביטול
          </button>
          <button
            onClick={() => setShowHelperSettings(false)}
            className="px-8 py-2.5 bg-primary hover:bg-primary-dark text-text-inverted font-semibold rounded-theme-md shadow-theme-md hover:shadow-theme-lg transition-all duration-theme-mid"
          >
            שמור
          </button>
        </div>
      </div>
    </div>
  );
}
