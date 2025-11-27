import React, { useState } from 'react';
import HelpRequestModal from './HelpRequestModal';
import { useImageUpload } from './useImageUpload';
import { useLocation } from './useLocation';
import { geocodeAddress, createHelpRequest, convertImageToBase64 } from './requestService';
import { getToken } from '../../utils/authUtils';

export default function HelpButton({ onRequestCreated, onModalStateChange, fallbackLocation }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [useCurrentLocation, setUseCurrentLocation] = useState(true); // Default to GPS location
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const [formData, setFormData] = useState({
    problemType: 'other',
    description: '',
    offeredAmount: '',
    currency: 'ILS',
    manualAddress: ''
  });

  const {
    selectedImage,
    imagePreview,
    imageError,
    handleImageChange,
    handleRemoveImage,
    resetImage
  } = useImageUpload();

  const {
    currentLocation,
    isLoadingLocation,
    locationError,
    setLocationError,
    resetLocation,
    requestCurrentLocation
  } = useLocation();

  const handleOpenModal = () => {
    setIsModalOpen(true);
    // Automatically request GPS location when modal opens
    requestCurrentLocation();
    // Notify parent component that modal is open
    if (onModalStateChange) {
      onModalStateChange(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({
      problemType: 'other',
      description: '',
      offeredAmount: '',
      currency: 'ILS',
      manualAddress: ''
    });
    setUseCurrentLocation(true); // Reset to GPS default
    setErrorMessage('');
    resetImage();
    resetLocation();
    // Notify parent component that modal is closed
    if (onModalStateChange) {
      onModalStateChange(false);
    }
  };

  const handleLocationMethodChange = (useGPS) => {
    setUseCurrentLocation(useGPS);
    setLocationError('');
    resetLocation();
    
    // If user chooses GPS, request it immediately
    if (useGPS) {
      requestCurrentLocation();
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear relevant error messages
    if (name === 'manualAddress') {
      setLocationError('');
    }
    if (name === 'problemType') {
      setErrorMessage('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLocationError('');
    
    const token = getToken();
    if (!token) {
      setErrorMessage('You must be logged in to create a help request');
      return;
    }

    // Validate and get location
    let location;
    try {
      if (useCurrentLocation) {
        // Use GPS location, or fallback to map's current position (IP-based or cached)
        if (!currentLocation && !fallbackLocation) {
          setLocationError('GPS location is not available. Please wait or enter address manually.');
          return;
        }
        
        const locationToUse = currentLocation || fallbackLocation;
        location = {
          lat: locationToUse.lat,
          lng: locationToUse.lng,
          address: '',
          accuracy: currentLocation ? currentLocation.accuracy : 'approximate',
          precision: currentLocation ? currentLocation.precision : undefined
        };
      } else {
        // Use manual address
        if (!formData.manualAddress || !formData.manualAddress.trim()) {
          setLocationError('Please enter a valid address');
          return;
        }
        
        setIsSubmitting(true);
        const geocoded = await geocodeAddress(formData.manualAddress);
        location = {
          ...geocoded,
          accuracy: 'manual'
        };
      }
    } catch (error) {
      setLocationError(error.message);
      setIsSubmitting(false);
      return;
    }

    // Validate required fields
    if (!formData.problemType) {
      setErrorMessage('Please select a problem type');
      setIsSubmitting(false);
      return;
    }

    if (!isSubmitting) {
      setIsSubmitting(true);
    }

    try {
      const requestData = {
        location,
        problemType: formData.problemType,
        description: formData.description || 'No description provided'
      };

      // Add optional payment if provided
      if (formData.offeredAmount && parseFloat(formData.offeredAmount) > 0) {
        requestData.offeredAmount = parseFloat(formData.offeredAmount);
        requestData.currency = formData.currency;
      }

      // Handle image upload if provided
      if (selectedImage) {
        const photoData = await convertImageToBase64(selectedImage);
        requestData.photos = [photoData];
      }

      const result = await createHelpRequest(requestData, token);

      // Notify parent component
      if (onRequestCreated) {
        onRequestCreated(result);
      }

      handleCloseModal();
    } catch (error) {
      console.error('Error creating request:', error);
      
      // Display user-friendly error message
      const errorMsg = error.message || 'Failed to create help request. Please try again.';
      setErrorMessage(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Help Button - positioned at bottom center */}
      <button
        onClick={handleOpenModal}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-1000 backdrop-blur-md bg-red-500/10 hover:bg-red-500/20 text-red-600 border border-red-200/40 font-semibold text-xl px-14 py-5 rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center gap-3"
      >
       Request Help
      </button>

      {/* Modal */}
      <HelpRequestModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        formData={formData}
        onInputChange={handleInputChange}
        useCurrentLocation={useCurrentLocation}
        setUseCurrentLocation={handleLocationMethodChange}
        currentLocation={currentLocation}
        isLoadingLocation={isLoadingLocation}
        errorMessage={errorMessage}
        locationError={locationError}
        setLocationError={setLocationError}
        selectedImage={selectedImage}
        imagePreview={imagePreview}
        imageError={imageError}
        onImageChange={handleImageChange}
        onRemoveImage={handleRemoveImage}
        isSubmitting={isSubmitting}
      />
    </>
  );
}
