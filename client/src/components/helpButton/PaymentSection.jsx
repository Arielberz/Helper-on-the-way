// Optional payment offering section where users can specify an amount and currency
// they are willing to pay for assistance.
import React from 'react';

export default function PaymentSection({
  offeredAmount,
  currency,
  onChange
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3" style={{ gap: 'var(--space-lg)' }}>
        <div className="col-span-2">
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-main)' }}>
            סכום
          </label>
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
