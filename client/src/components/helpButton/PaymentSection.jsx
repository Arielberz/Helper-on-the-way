/*
  קובץ זה אחראי על:
  - סקציית תשלום אופציונלי בבקשת עזרה
  - הזנת סכום ומטבע לתשלום
  - הצעת תמורה כספית לעוזר
*/
import React, { useState } from 'react';

// Typical costs for different problem types (in ILS)
const typicalCosts = {
  'flat_tire': { amount: 150, label: 'החלפת גלגל' },
  'dead_battery': { amount: 100, label: 'הנעת רכב' },
  'out_of_fuel': { amount: 80, label: 'אספקת דלק' },
  'engine_problem': { amount: 250, label: 'בדיקת מנוע' },
  'locked_out': { amount: 200, label: 'פריצת רכב' },
  'accident': { amount: 0, label: 'סיוע בתאונה' }, // Usually involves insurance/police, payment might not be relevant
  'towing_needed': { amount: 300, label: 'גרירה' },
  'other': { amount: 100, label: 'שירות כללי' }
};

export default function PaymentSection({
  offeredAmount,
  currency,
  problemType,
  onChange
}) {
  const suggestedPrice = problemType && typicalCosts[problemType] ? typicalCosts[problemType] : null;

  const handleUseSuggestedPrice = () => {
    if (suggestedPrice) {
      onChange({ target: { name: 'offeredAmount', value: suggestedPrice.amount.toString() } });
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3" style={{ gap: 'var(--space-lg)' }}>
        <div className="col-span-2 relative">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium" style={{ color: 'var(--text-main)' }}>
              סכום
            </label>
            
            {/* Suggested Price Badge/Button */}
            {suggestedPrice && (
              <button
                type="button"
                onClick={handleUseSuggestedPrice}
                className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 transition-colors flex items-center gap-1 cursor-pointer"
                title={`לחץ לעדכון הסכום ל-${suggestedPrice.amount}`}
              >
                <span>עלות מומלצת: {suggestedPrice.amount} {currency}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>

          <input
            type="number"
            step="1"
            min="0"
            name="offeredAmount"
            value={offeredAmount}
            onChange={onChange}
            placeholder="0"
            className="w-full focus:outline-none"
            style={{
              padding: 'var(--space-md) var(--space-lg)',
              border: '1px solid var(--glass-border)',
              borderRadius: 'var(--rounded-lg)'
            }}
            onFocus={(e) => {
              e.currentTarget.style.outline = '2px solid var(--primary)';
              e.currentTarget.style.outlineOffset = '0px';
            }}
            onBlur={(e) => e.currentTarget.style.outline = 'none'}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-main)' }}>
            מטבע
          </label>
          <select
            name="currency"
            value={currency}
            onChange={onChange}
            className="w-full bg-white focus:outline-none"
            style={{
              padding: 'var(--space-md) var(--space-lg)',
              border: '1px solid var(--glass-border)',
              borderRadius: 'var(--rounded-lg)'
            }}
            onFocus={(e) => {
              e.currentTarget.style.outline = '2px solid var(--primary)';
              e.currentTarget.style.outlineOffset = '0px';
            }}
            onBlur={(e) => e.currentTarget.style.outline = 'none'}
          >
            <option value="ILS">ILS</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </select>
        </div>
      </div>
    </div>
  );
}
