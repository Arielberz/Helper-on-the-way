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
      <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Location</h3>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
        <p className="text-blue-800 text-sm flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Choose how to specify your location for this help request
        </p>
      </div>
      
      {/* Location Toggle */}
      <div className="flex flex-col gap-3">
        <label className="flex items-start gap-3 cursor-pointer p-3 border-2 rounded-lg hover:bg-gray-50 transition-colors"
               style={{ borderColor: useCurrentLocation ? '#ef4444' : '#d1d5db' }}>
          <input
            type="radio"
            checked={useCurrentLocation}
            onChange={() => handleLocationMethodChange(true)}
            className="w-4 h-4 text-red-600 mt-1"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900">Use My GPS Location</span>
              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">Recommended</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">Most accurate - Uses your device's GPS</p>
          </div>
        </label>
        
        <label className="flex items-start gap-3 cursor-pointer p-3 border-2 rounded-lg hover:bg-gray-50 transition-colors"
               style={{ borderColor: !useCurrentLocation ? '#ef4444' : '#d1d5db' }}>
          <input
            type="radio"
            checked={!useCurrentLocation}
            onChange={() => handleLocationMethodChange(false)}
            className="w-4 h-4 text-red-600 mt-1"
          />
          <div className="flex-1">
            <span className="font-medium text-gray-900">Enter Address Manually</span>
            <p className="text-sm text-gray-600 mt-1">Type your exact address</p>
          </div>
        </label>
      </div>

      {/* GPS Location Display */}
      {useCurrentLocation && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          {isLoadingLocation ? (
            <div className="flex items-center gap-2 text-green-700">
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-sm">📍 Getting your GPS location...</span>
            </div>
          ) : currentLocation ? (
            <div className="space-y-1">
              <p className="text-green-700 text-sm font-medium flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                ✓ GPS Location Acquired
              </p>
              <p className="text-green-600 text-xs">
                Coordinates: {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
              </p>
              {currentLocation.precision && (
                <p className="text-green-600 text-xs">
                  Accuracy: ±{Math.round(currentLocation.precision)}m
                </p>
              )}
            </div>
          ) : (
            <p className="text-yellow-700 text-sm">⚠ Waiting for GPS location...</p>
          )}
        </div>
      )}

      {/* Location Error Message */}
      <InlineError message={locationError} />

      {/* Manual Location Input */}
      {!useCurrentLocation && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="manualAddress"
            value={manualAddress}
            onChange={onAddressChange}
            placeholder="e.g., 123 Dizengoff Street, Tel Aviv, Israel"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            required={!useCurrentLocation}
          />
          <p className="text-xs text-gray-500 mt-1">
            Enter a complete address including street, city, and country for accurate location
          </p>
        </div>
      )}
    </div>
  );
}
