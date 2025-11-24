import { useState } from 'react';
import { getPreciseLocation } from '../../utils/locationUtils';

export function useLocation() {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState('');

  // Request GPS location only when user explicitly chooses "Use Current Location"
  const requestCurrentLocation = async () => {
    setIsLoadingLocation(true);
    setLocationError('');
    setCurrentLocation(null);

    try {
      const location = await getPreciseLocation();
      setCurrentLocation({
        lat: location.lat,
        lng: location.lng,
        accuracy: location.accuracy,
        precision: location.precision
      });
      setLocationError('');
    } catch (error) {
      console.error('Error getting GPS location:', error);
      
      let errorMessage = 'Unable to retrieve your location.';
      if (error.code === error.PERMISSION_DENIED) {
        errorMessage = 'Location permission denied. Please enter address manually.';
      } else if (error.code === error.POSITION_UNAVAILABLE) {
        errorMessage = 'Location unavailable. Please enter address manually.';
      } else if (error.code === error.TIMEOUT) {
        errorMessage = 'Location request timed out. Please try again or enter address manually.';
      }
      
      setLocationError(errorMessage);
      setCurrentLocation(null);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const resetLocation = () => {
    setCurrentLocation(null);
    setLocationError('');
    setIsLoadingLocation(false);
  };

  return {
    currentLocation,
    isLoadingLocation,
    locationError,
    setLocationError,
    resetLocation,
    requestCurrentLocation
  };
}
