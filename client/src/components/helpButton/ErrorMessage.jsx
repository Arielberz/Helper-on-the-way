// Error message display components with theme-based styling for showing validation
// and error messages throughout the help request flow.
import React from 'react';

export function ErrorMessage({ message }) {
  if (!message) return null;

  return (
    <div className="flex items-start p-4"
         style={{
           backgroundColor: 'rgba(239, 68, 68, 0.1)',
           border: '1px solid var(--danger)',
           borderRadius: 'var(--rounded-md)',
           gap: 'var(--space-md)'
         }}>
      <svg className="w-5 h-5 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"
           style={{ color: 'var(--danger)' }}>
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
      <div>
        <h4 className="font-semibold text-sm" style={{ color: 'var(--danger)' }}>שגיאה</h4>
        <p className="text-sm mt-1" style={{ color: 'var(--danger)' }}>{message}</p>
      </div>
    </div>
  );
}

export function InlineError({ message }) {
  if (!message) return null;

  return (
    <div className="flex items-start p-3"
         style={{
           backgroundColor: 'rgba(239, 68, 68, 0.1)',
           border: '1px solid var(--danger)',
           borderRadius: 'var(--rounded-md)',
           gap: 'var(--space-sm)'
         }}>
      <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20"
           style={{ color: 'var(--danger)' }}>
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
      <p className="text-sm" style={{ color: 'var(--danger)' }}>{message}</p>
    </div>
  );
}
