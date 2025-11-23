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
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Location</h3>
      
      {/* Location Toggle */}
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            checked={useCurrentLocation}
            onChange={() => {
              setUseCurrentLocation(true);
              clearLocationError();
            }}
            className="w-4 h-4 text-red-600"
          />
          <span className="text-gray-700">Use Current Location</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            checked={!useCurrentLocation}
            onChange={() => {
              setUseCurrentLocation(false);
              clearLocationError();
            }}
            className="w-4 h-4 text-red-600"
          />
          <span className="text-gray-700">Enter Manually</span>
        </label>
      </div>

      {/* Current Location Display */}
      {useCurrentLocation && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          {isLoadingLocation ? (
            <p className="text-green-700 text-sm">📍 Getting your location...</p>
          ) : currentLocation ? (
            <p className="text-green-700 text-sm">
              ✓ Location acquired: {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
            </p>
          ) : (
            <p className="text-yellow-700 text-sm">⚠ Location not available</p>
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
            placeholder="e.g., 123 Main Street, Tel Aviv, Israel"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            required={!useCurrentLocation}
          />
          <p className="text-xs text-gray-500 mt-1">
            Enter a complete address including street, city, and country for best results
          </p>
        </div>
      )}
    </div>
  );
}
