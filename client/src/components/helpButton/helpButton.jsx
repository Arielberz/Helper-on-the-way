// Main help request button component that manages the modal state and handles
// the complete flow of creating a help request including location, problem details, photos, and payment.
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
    requestCurrentLocation();
    onModalStateChange?.(true);
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
    setUseCurrentLocation(true);
    setErrorMessage('');
    resetImage();
    resetLocation();
    onModalStateChange?.(false);
  };

  const handleLocationMethodChange = (useGPS) => {
    setUseCurrentLocation(useGPS);
    setLocationError('');
    resetLocation();
    if (useGPS) requestCurrentLocation();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'manualAddress') setLocationError('');
    if (name === 'problemType') setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLocationError('');
    
    const token = getToken();
    if (!token) {
      setErrorMessage('עליך להיות מחובר כדי ליצור בקשת עזרה');
      return;
    }

    let location;
    try {
      if (useCurrentLocation) {
        if (!currentLocation && !fallbackLocation) {
          setLocationError('מיקום GPS לא זמין. אנא המתן או הזן כתובת ידנית.');
          return;
        }
        const locationToUse = currentLocation || fallbackLocation;
        location = {
          lat: locationToUse.lat,
          lng: locationToUse.lng,
          address: '',
          accuracy: currentLocation ? currentLocation.accuracy : 'approximate',
          precision: currentLocation?.precision
        };
      } else {
        if (!formData.manualAddress?.trim()) {
          setLocationError('אנא הזן כתובת תקינה');
          return;
        }
        setIsSubmitting(true);
        const geocoded = await geocodeAddress(formData.manualAddress);
        location = { ...geocoded, accuracy: 'manual' };
      }
    } catch (error) {
      setLocationError(error.message);
      setIsSubmitting(false);
      return;
    }

    if (!formData.problemType) {
      setErrorMessage('אנא בחר סוג בעיה');
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(true);

    try {
      const requestData = {
        location,
        problemType: formData.problemType,
        description: formData.description || 'ללא תיאור'
      };

      if (formData.offeredAmount && parseFloat(formData.offeredAmount) > 0) {
        requestData.offeredAmount = parseFloat(formData.offeredAmount);
        requestData.currency = formData.currency;
      }

      if (selectedImage) {
        const photoData = await convertImageToBase64(selectedImage);
        requestData.photos = [photoData];
      }

      const result = await createHelpRequest(requestData, token);
      onRequestCreated?.(result);
      handleCloseModal();
    } catch (error) {
      console.error('Error creating request:', error);
      setErrorMessage(error.message || 'שגיאה ביצירת בקשת עזרה. אנא נסה שוב.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={handleOpenModal}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-1000 flex items-center gap-3 font-semibold text-xl px-14 py-5 transition-all"
        style={{
          backgroundColor: 'var(--glass-bg-strong)',
          backdropFilter: 'blur(var(--glass-blur))',
          WebkitBackdropFilter: 'blur(var(--glass-blur))',
          border: '1px solid var(--glass-border)',
          borderRadius: 'var(--rounded-xl)',
          boxShadow: 'var(--glass-shadow)',
          color: 'var(--danger)',
          transitionDuration: 'var(--transition-slow)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.45)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--glass-bg-strong)';
        }}
      >
       בקש עזרה
      </button>

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
