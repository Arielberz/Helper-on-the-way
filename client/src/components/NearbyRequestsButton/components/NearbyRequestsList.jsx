/*
  קובץ זה אחראי על:
  - רשימת בקשות עזרה סמוכות
  - הצגת בקשות עם מרחק, סוג בעיה ופרטים
  - אינטראקציה עם בקשות (צפייה ופתיחה)
  - סינון והצגה של בקשות רלוונטיות
*/

import React from 'react';
import { CloseIcon, SettingsIcon } from './Icons';
import { PROBLEM_LABELS } from '../utils/nearbyUtils';

export default function NearbyRequestsList({
  showList,
  closeList,
  filterSummary,
  setShowHelperSettings,
  hasActiveFilters,
  sortedRequests,
  onSelectRequest,
  asSidebar = false,
  embedded = false,
  ...props
}) {
  if (!showList) return null;

  if (asSidebar) {
    return (
      <div 
        className={`flex flex-col h-full ${
            embedded 
            ? 'w-full bg-transparent rounded-none shadow-none' 
            : 'bg-white rounded-theme-xl shadow-theme-lg w-80 max-h-[calc(100vh-160px)]'
        } overflow-hidden`}
        style={embedded ? {} : {
          background: 'var(--glass-bg-strong)',
          backdropFilter: 'var(--glass-blur)',
          border: '1px solid var(--glass-border)',
          boxShadow: 'var(--glass-shadow)',
        }}
        dir="rtl"
      >
        {!embedded && (
        <div className="px-4 py-3 border-b border-slate-100">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-bold text-text-main">בקשות עזרה קרובות</h2>
              <p className="text-xs mt-1 text-text-secondary">{filterSummary}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowHelperSettings(true)}
                className={`p-1.5 rounded-theme-md transition-all duration-theme-mid ${
                  hasActiveFilters ? 'bg-blue-100 text-primary hover:bg-blue-200' : 'bg-background text-text-light hover:bg-background-dark'
                }`}
                aria-label="Filter settings"
                title="Filter Settings"
              >
                <SettingsIcon />
              </button>
              <button className="text-text-light hover:text-text-secondary transition-colors duration-theme-mid" onClick={closeList}>
                <CloseIcon />
              </button>
            </div>
          </div>
        </div>
        )}

        <div className="p-4 overflow-y-auto flex-1">
          {sortedRequests.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-base text-text-secondary mb-1">אין בקשות עזרה קרובות</p>
              <p className="text-xs text-text-light">{hasActiveFilters ? 'אין בקשות מתאימות' : 'אין בקשות באזור'}</p>
            </div>
          ) : (
            sortedRequests.map(req => (
              <div
                key={req._id || req.id}
                className={`${
                  embedded 
                    ? 'bg-white/60 backdrop-blur-sm border-white/50 hover:bg-white/80 shadow-sm' 
                    : 'bg-white border-gray-100 hover:border-blue-300 hover:shadow-md'
                } border rounded-2xl p-4 cursor-pointer transition-all duration-300 group relative mb-3 last:mb-0`}
                onClick={() => { onSelectRequest(req); closeList() }}
              >

                <div className="flex items-center justify-between mb-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide ${
                    embedded ? 'bg-blue-500/10 text-blue-700' : 'bg-blue-50 text-blue-600'
                  }`}>
                    {PROBLEM_LABELS[req.problemType] || req.problemType}
                  </span>
                  <span className="flex items-center gap-1 text-xs font-medium text-gray-500 bg-gray-100/80 px-2 py-1 rounded-lg">
                    <span>📍</span>
                    {req.distance.toFixed(1)} ק"מ
                  </span>
                </div>


                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                      embedded ? 'bg-white/80 shadow-sm text-blue-600' : 'bg-blue-100 text-blue-600'
                    }`}>
                      👤
                    </div>
                    <span className="font-bold text-gray-800 text-sm">
                      {req.user?.username || 'משתמש לא ידוע'}
                    </span>
                  </div>

                  {req.description && (
                    <div className="text-gray-600 text-sm leading-relaxed line-clamp-2 pr-1">
                      {req.description}
                    </div>
                  )}

                  {req.location?.address && (
                    <div className="flex items-start gap-1.5 text-xs text-gray-500 mt-1">
                         <span className="shrink-0 mt-0.5 opacity-70">📌</span>
                         <span className="line-clamp-1">{req.location.address}</span>
                    </div>
                  )}
                  

                  <div className="pt-3 mt-1 border-t border-gray-100/50 flex items-center justify-between">
                     <span className="text-[10px] text-gray-400 font-medium">
                        {new Date(req.createdAt).toLocaleString('he-IL', {
                           hour: '2-digit', minute:'2-digit', day: 'numeric', month: 'numeric'
                        })}
                     </span>
                     
                     {req.payment?.offeredAmount > 0 && (() => {
                        const helperAmount = req.payment?.helperAmount || Math.round(req.payment.offeredAmount * 0.9 * 10) / 10;
                        return (
                           <div className="flex items-center gap-1 text-green-600 font-bold text-sm bg-green-50/80 px-2 py-0.5 rounded-lg">
                              <span>₪</span>
                              {helperAmount}
                           </div>
                        );
                     })()}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[2100] p-4" onClick={closeList}>
      <div className="bg-white rounded-theme-xl shadow-theme-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()} dir="rtl">
        <div className="bg-white px-8 py-6 border-b border-slate-100">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-text-main">בקשות עזרה קרובות</h2>
              <p className="text-sm mt-1 text-text-secondary">{filterSummary}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowHelperSettings(true)}
                className={`p-2 rounded-theme-md transition-all duration-theme-mid ${
                  hasActiveFilters ? 'bg-blue-100 text-primary hover:bg-blue-200' : 'bg-background text-text-light hover:bg-background-dark'
                }`}
                aria-label="Filter settings"
                title="Filter Settings"
              >
                <SettingsIcon />
              </button>
              <button className="text-text-light hover:text-text-secondary transition-colors duration-theme-mid" onClick={closeList}>
                <CloseIcon />
              </button>
            </div>
          </div>
        </div>

        <div className="p-8 overflow-y-auto flex-1 space-y-4">
          {sortedRequests.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xl text-text-secondary mb-2">אין בקשות עזרה קרובות</p>
              <p className="text-sm text-text-light">{hasActiveFilters ? 'No requests match your filters' : 'No nearby requests'}</p>
            </div>
          ) : (
            sortedRequests.map(req => (
              <div
                key={req._id || req.id}
                className="bg-white border border-gray-200 rounded-theme-md p-4 cursor-pointer hover:border-primary hover:shadow-theme-md transition-all duration-theme-mid"
                onClick={() => { onSelectRequest(req); closeList() }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="bg-blue-100 text-primary px-3 py-1 rounded-full text-sm font-semibold">
                    {PROBLEM_LABELS[req.problemType] || req.problemType}
                  </span>
                  <span className="bg-orange-100 text-warning px-3 py-1 rounded-full text-sm font-semibold">
                    {req.distance.toFixed(1)} ק"מ
                  </span>
                </div>
                <div className="text-text-main mb-2">👤 {req.user?.username || 'משתמש לא ידוע'}</div>
                {req.description && <div className="text-text-secondary text-sm mb-2">{req.description}</div>}
                {req.location?.address && <div className="text-text-light text-sm mb-2">📍 {req.location.address}</div>}
                {req.payment?.offeredAmount > 0 && (() => {
                  const helperAmount = req.payment?.helperAmount || Math.round(req.payment.offeredAmount * 0.9 * 10) / 10;
                  return (
                    <div className="text-success font-semibold mb-2">💰 {helperAmount} {req.payment.currency || 'ILS'}</div>
                  );
                })()}
                <div className="text-text-light text-xs">⏰ {new Date(req.createdAt).toLocaleString('he-IL')}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
