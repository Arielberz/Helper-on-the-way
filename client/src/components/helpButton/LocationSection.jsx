// Location selection component that provides options for GPS-based location or manual address entry
// with real-time location detection and validation feedback.
import React from 'react';
import { InlineError } from './ErrorMessage';

export default function LocationSection({
  useCurrentLocation,
  setUseCurrentLocation,
  currentLocation,
  isLoadingLocation,
  manualAddress,
  onAddressChange,
  locationError,
  clearLocationError
}) {
  const handleLocationMethodChange = (useGPS) => {
    setUseCurrentLocation(useGPS);
    clearLocationError();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col" style={{ gap: 'var(--space-md)' }}>
        <label className="flex items-center cursor-pointer transition-colors"
               style={{
                 gap: 'var(--space-md)',
                 padding: 'var(--space-lg)',
                 border: '2px solid',
                 borderColor: useCurrentLocation ? 'var(--primary)' : 'var(--glass-border)',
                 borderRadius: 'var(--rounded-lg)',
                 transitionDuration: 'var(--transition-mid)'
               }}
               onMouseEnter={(e) => !useCurrentLocation && (e.currentTarget.style.backgroundColor = 'var(--background)')}
               onMouseLeave={(e) => !useCurrentLocation && (e.currentTarget.style.backgroundColor = 'transparent')}>
          <input
            type="radio"
            checked={useCurrentLocation}
            onChange={() => handleLocationMethodChange(true)}
            className="w-5 h-5"
            style={{ accentColor: 'var(--primary)' }}
          />
          <span className="font-medium" style={{ color: 'var(--text-main)' }}>Use My GPS Location</span>
        </label>
        
        <label className="flex items-center cursor-pointer transition-colors"
               style={{
                 gap: 'var(--space-md)',
                 padding: 'var(--space-lg)',
                 border: '2px solid',
                 borderColor: !useCurrentLocation ? 'var(--primary)' : 'var(--glass-border)',
                 borderRadius: 'var(--rounded-lg)',
                 transitionDuration: 'var(--transition-mid)'
               }}
               onMouseEnter={(e) => useCurrentLocation && (e.currentTarget.style.backgroundColor = 'var(--background)')}
               onMouseLeave={(e) => useCurrentLocation && (e.currentTarget.style.backgroundColor = 'transparent')}>
          <input
            type="radio"
            checked={!useCurrentLocation}
            onChange={() => handleLocationMethodChange(false)}
            className="w-5 h-5"
            style={{ accentColor: 'var(--primary)' }}
          />
          <span className="font-medium" style={{ color: 'var(--text-main)' }}>Enter Address Manually</span>
        </label>
      </div>

      {useCurrentLocation && (
        <div className="flex items-center justify-center"
             style={{
               backgroundColor: 'rgba(59, 130, 246, 0.05)',
               border: '1px solid rgba(59, 130, 246, 0.2)',
               borderRadius: 'var(--rounded-lg)',
               padding: 'var(--space-lg)'
             }}>
          {isLoadingLocation ? (
            <div className="flex items-center" style={{ gap: 'var(--space-sm)', color: 'var(--primary)' }}>
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="font-medium">Locating...</span>
            </div>
          ) : currentLocation ? (
            <div className="font-medium flex items-center" style={{ color: 'var(--success)', gap: 'var(--space-sm)' }}>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Location Found
            </div>
          ) : (
            <span style={{ color: 'var(--text-light)' }}>Waiting for location...</span>
          )}
        </div>
      )}

      <InlineError message={locationError} />

      {!useCurrentLocation && (
        <div>
          <input
            type="text"
            name="manualAddress"
            value={manualAddress}
            onChange={onAddressChange}
            placeholder="Enter address..."
            className="w-full focus:outline-none transition-all"
            style={{
              padding: 'var(--space-md) var(--space-lg)',
              border: '1px solid var(--glass-border)',
              borderRadius: 'var(--rounded-lg)',
              transitionDuration: 'var(--transition-mid)'
            }}
            onFocus={(e) => {
              e.currentTarget.style.outline = '2px solid var(--primary)';
              e.currentTarget.style.outlineOffset = '0px';
            }}
            onBlur={(e) => {
              e.currentTarget.style.outline = 'none';
            }}
            required={!useCurrentLocation}
          />
        </div>
      )}
    </div>
  );
}
