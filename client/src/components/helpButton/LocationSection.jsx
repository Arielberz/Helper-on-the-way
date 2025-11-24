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
      
      {/* Location Toggle */}
      <div className="flex flex-col gap-3">
        <label className="flex items-center gap-3 cursor-pointer p-4 border rounded-xl hover:bg-gray-50 transition-colors"
               style={{ borderColor: useCurrentLocation ? '#2563eb' : '#e5e7eb' }}>
          <input
            type="radio"
            checked={useCurrentLocation}
            onChange={() => handleLocationMethodChange(true)}
            className="w-5 h-5 text-blue-600"
          />
          <span className="font-medium text-gray-900">Use My GPS Location</span>
        </label>
        
        <label className="flex items-center gap-3 cursor-pointer p-4 border rounded-xl hover:bg-gray-50 transition-colors"
               style={{ borderColor: !useCurrentLocation ? '#2563eb' : '#e5e7eb' }}>
          <input
            type="radio"
            checked={!useCurrentLocation}
            onChange={() => handleLocationMethodChange(false)}
            className="w-5 h-5 text-blue-600"
          />
          <span className="font-medium text-gray-900">Enter Address Manually</span>
        </label>
      </div>

      {/* GPS Location Display */}
      {useCurrentLocation && (
        <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex items-center justify-center">
          {isLoadingLocation ? (
            <div className="flex items-center gap-2 text-blue-600">
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="font-medium">Locating...</span>
            </div>
          ) : currentLocation ? (
            <div className="text-green-600 font-medium flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Location Found
            </div>
          ) : (
            <span className="text-gray-500">Waiting for location...</span>
          )}
        </div>
      )}

      {/* Location Error Message */}
      <InlineError message={locationError} />

      {/* Manual Location Input */}
      {!useCurrentLocation && (
        <div>
          <input
            type="text"
            name="manualAddress"
            value={manualAddress}
            onChange={onAddressChange}
            placeholder="Enter address..."
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            required={!useCurrentLocation}
          />
        </div>
      )}
    </div>
  );
}
