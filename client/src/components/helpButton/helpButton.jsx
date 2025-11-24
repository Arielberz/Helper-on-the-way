import React, { useState } from 'react';
import HelpRequestModal from './HelpRequestModal';
import { useImageUpload } from './useImageUpload';
import { useLocation } from './useLocation';
import { geocodeAddress, createHelpRequest, convertImageToBase64 } from './requestService';

export default function HelpButton({ onRequestCreated }) {
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
    
    const token = localStorage.getItem('token');
    if (!token) {
      setErrorMessage('You must be logged in to create a help request');
      return;
    }

    // Validate and get location
    let location;
    try {
      if (useCurrentLocation) {
        // Use GPS location
        if (!currentLocation) {
          setLocationError('GPS location is not available. Please wait or enter address manually.');
          return;
        }
        location = {
          lat: currentLocation.lat,
          lng: currentLocation.lng,
          address: '',
          accuracy: currentLocation.accuracy,
          precision: currentLocation.precision
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
      setErrorMessage(`Failed to create help request: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Help Button - positioned at bottom center */}
      <button
        onClick={handleOpenModal}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-1000 bg-white/90 backdrop-blur-md border border-blue-100 text-blue-600 font-semibold px-8 py-4 rounded-full shadow-lg hover:shadow-xl hover:bg-white hover:scale-105 transition-all duration-300 flex items-center gap-2"
      >
        Need Help?
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
