import { useState, useEffect } from 'react';

export function useLocation(isModalOpen, useCurrentLocation) {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState('');

  useEffect(() => {
    if (isModalOpen && useCurrentLocation && !currentLocation) {
      setIsLoadingLocation(true);
      setLocationError('');
      
      if (!navigator.geolocation) {
        setLocationError('Geolocation is not supported by your browser');
        setIsLoadingLocation(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLocationError('');
          setIsLoadingLocation(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setLocationError('Unable to retrieve your location. Please enter it manually.');
          setIsLoadingLocation(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    }
  }, [isModalOpen, useCurrentLocation, currentLocation]);

  const resetLocation = () => {
    setCurrentLocation(null);
    setLocationError('');
  };

  return {
    currentLocation,
    isLoadingLocation,
    locationError,
    setLocationError,
    resetLocation
  };
}
