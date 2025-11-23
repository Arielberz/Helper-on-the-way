import React, { useState } from 'react';
import HelpRequestModal from './HelpRequestModal';
import { useImageUpload } from './useImageUpload';
import { geocodeAddress, createHelpRequest, convertImageToBase64 } from './requestService';

export default function HelpButton({ currentPosition, onRequestCreated }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [useCurrentLocation, setUseCurrentLocation] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [locationError, setLocationError] = useState('');
  
  const [formData, setFormData] = useState({
    problemType: 'other',
    description: '',
    priority: 'medium',
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

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({
      problemType: 'other',
      description: '',
      priority: 'medium',
      offeredAmount: '',
      currency: 'ILS',
      manualAddress: ''
    });
    setUseCurrentLocation(true);
    setErrorMessage('');
    setLocationError('');
    resetImage();
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
        if (!currentPosition) {
          setLocationError('Current location is not available. Please wait or enter manually.');
          return;
        }
        location = {
          lat: currentPosition[0],
          lng: currentPosition[1],
          address: ''
        };
      } else {
        if (!formData.manualAddress || !formData.manualAddress.trim()) {
          setLocationError('Please enter a valid address');
          return;
        }
        
        setIsSubmitting(true);
        location = await geocodeAddress(formData.manualAddress);
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
        description: formData.description || 'No description provided',
        priority: formData.priority
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
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-1000 bg-linear-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 transform hover:scale-105"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
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
        setUseCurrentLocation={setUseCurrentLocation}
        currentLocation={currentPosition ? { lat: currentPosition[0], lng: currentPosition[1] } : null}
        isLoadingLocation={!currentPosition}
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
