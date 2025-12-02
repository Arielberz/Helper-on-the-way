// Problem type selection and description component with icon-based buttons for common roadside issues
// and a text area for detailed problem descriptions.
import React from 'react';

const problemOptions = [
  { 
    value: 'flat_tire', 
    label: 'Flat Tire',
    icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  },
  { 
    value: 'dead_battery', 
    label: 'Dead Battery',
    icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
  },
  { 
    value: 'out_of_fuel', 
    label: 'Out of Fuel',
    icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
  },
  { 
    value: 'engine_problem', 
    label: 'Engine Problem',
    icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
  },
  { 
    value: 'locked_out', 
    label: 'Locked Out',
    icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
  },
  { 
    value: 'accident', 
    label: 'Accident',
    icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
  },
  { 
    value: 'towing_needed', 
    label: 'Towing',
    icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
  },
  { 
    value: 'other', 
    label: 'Other',
    icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" /></svg>
  }
];



export default function ProblemDetailsSection({
  problemType,
  description,
  onChange
}) {
  const handleTypeSelect = (value) => {
    onChange({ target: { name: 'problemType', value } });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
      <div>
        <label className="block text-sm font-medium mb-3" style={{ color: 'var(--text-main)' }}>
          Problem Type
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4" style={{ gap: 'var(--space-md)' }}>
          {problemOptions.map((option) => {
            const iconColorMap = {
              'flat_tire': 'var(--icon-flat-tire)',
              'dead_battery': 'var(--icon-dead-battery)',
              'out_of_fuel': 'var(--icon-out-of-fuel)',
              'engine_problem': 'var(--icon-engine-problem)',
              'locked_out': 'var(--icon-locked-out)',
              'accident': 'var(--icon-accident)',
              'towing_needed': 'var(--icon-towing)',
              'other': 'var(--icon-other)'
            };
            const isSelected = problemType === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleTypeSelect(option.value)}
                className="flex flex-col items-center justify-center h-28 transition-all"
                style={{
                  padding: 'var(--space-lg)',
                  borderRadius: 'var(--rounded-lg)',
                  border: '2px solid',
                  borderColor: isSelected ? 'var(--primary)' : 'var(--glass-border)',
                  backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.05)' : 'white',
                  gap: 'var(--space-sm)',
                  boxShadow: isSelected ? 'var(--shadow-sm)' : 'none',
                  transitionDuration: 'var(--transition-mid)'
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = 'var(--primary-light)';
                    e.currentTarget.style.backgroundColor = 'var(--background)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = 'var(--glass-border)';
                    e.currentTarget.style.backgroundColor = 'white';
                  }
                }}
              >
                <div style={{ color: isSelected ? iconColorMap[option.value] : 'var(--text-light)' }}>
                  {option.icon}
                </div>
                <span className="text-sm font-medium text-center leading-tight"
                      style={{ color: isSelected ? 'var(--primary)' : 'var(--text-secondary)' }}>
                  {option.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-main)' }}>
          Description
        </label>
        <textarea
          name="description"
          value={description}
          onChange={onChange}
          placeholder="Describe the problem..."
          rows="4"
          maxLength="1000"
          className="w-full resize-none focus:outline-none"
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

    </div>
  );
}
