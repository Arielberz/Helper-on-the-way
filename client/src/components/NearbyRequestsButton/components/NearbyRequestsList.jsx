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
  asSidebar = false
}) {
  if (!showList) return null;

  // Sidebar mode - fixed on the right side
  if (asSidebar) {
    return (
      <div 
        className="bg-white rounded-theme-xl shadow-theme-lg w-80 max-h-[calc(100vh-160px)] overflow-hidden flex flex-col"
        style={{
          background: 'var(--glass-bg-strong)',
          backdropFilter: 'var(--glass-blur)',
          border: '1px solid var(--glass-border)',
          boxShadow: 'var(--glass-shadow)',
        }}
        dir="rtl"
      >
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

        <div className="p-4 overflow-y-auto flex-1 space-y-3">
          {sortedRequests.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-base text-text-secondary mb-1">אין בקשות עזרה קרובות</p>
              <p className="text-xs text-text-light">{hasActiveFilters ? 'אין בקשות מתאימות' : 'אין בקשות באזור'}</p>
            </div>
          ) : (
            sortedRequests.map(req => (
              <div
                key={req._id || req.id}
                className="bg-white border border-gray-200 rounded-theme-md p-3 cursor-pointer hover:border-primary hover:shadow-theme-md transition-all duration-theme-mid"
                onClick={() => { onSelectRequest(req); closeList() }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="bg-blue-100 text-primary px-2 py-0.5 rounded-full text-xs font-semibold">
                    {PROBLEM_LABELS[req.problemType] || req.problemType}
                  </span>
                  <span className="bg-orange-100 text-warning px-2 py-0.5 rounded-full text-xs font-semibold">
                    {req.distance.toFixed(1)} ק"מ
                  </span>
                </div>
                <div className="text-text-main text-sm mb-1">👤 {req.user?.username || 'משתמש לא ידוע'}</div>
                {req.description && <div className="text-text-secondary text-xs mb-1 line-clamp-2">{req.description}</div>}
                {req.location?.address && <div className="text-text-light text-xs mb-1 line-clamp-1">📍 {req.location.address}</div>}
                {req.payment?.offeredAmount > 0 && (() => {
                  // Calculate helper amount (90% rounded to 1 decimal)
                  const helperAmount = req.payment?.helperAmount || Math.round(req.payment.offeredAmount * 0.9 * 10) / 10;
                  return (
                    <div className="text-success font-semibold text-sm mb-1">💰 {helperAmount} {req.payment.currency || 'ILS'}</div>
                  );
                })()}
                <div className="text-text-light text-xs">⏰ {new Date(req.createdAt).toLocaleString('he-IL')}</div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  // Modal mode - centered on screen
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-1001 p-4" onClick={closeList}>
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
                  // Calculate helper amount (90% rounded to 1 decimal)
                  const helperAmount = req.payment?.helperAmount || Math.round(req.payment.offeredAmount * 0.9 * 10) / 10;
                  return (
                    <div className="text-success font-semibold mb-2">💰 {helperAmount} {req.payment.currency || 'ILS'}</div>
                  );
                })()}}}}}}
                <div className="text-text-light text-xs">⏰ {new Date(req.createdAt).toLocaleString('he-IL')}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
