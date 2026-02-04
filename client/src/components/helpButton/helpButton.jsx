/*
  קובץ זה אחראי על:
  - כפתור קריאת עזרה הראשי (SOS button) באפליקציה
  - ניהול מודל יצירת בקשת עזרה עם כל השלבים
  - איסוף מיקום (ידני/GPS), תיאור בעיה, תמונות, וסכום תשלום מוצע
  - שילוב hooks לניהול מיקום והעלאת תמונות
  - שליחת בקשת עזרה לשרת ועדכון מפה

  הקובץ משמש את:
  - MapLive כמרכיב מרכזי בדף ה-Home
  - HelpRequestModal, LocationSection, ProblemDetailsSection, PaymentSection

  הקובץ אינו:
  - מציג את המפה (זה תפקיד MapLive)
  - מטפל באימות או ניתוב
*/

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HelpRequestModal from './HelpRequestModal';
import { useImageUpload } from './useImageUpload';
import { useLocation } from './useLocation';
import { geocodeAddress, createHelpRequest, convertImageToBase64 } from './requestService';
import { getToken } from '../../utils/authUtils';
import { startPhoneVerification, checkPhoneVerification } from '../../services/users.service';

export default function HelpButton({ onRequestCreated, onModalStateChange, fallbackLocation }) {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [useCurrentLocation, setUseCurrentLocation] = useState(true); // Default to GPS location
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showPhoneVerification, setShowPhoneVerification] = useState(false);
  const [phoneVerificationError, setPhoneVerificationError] = useState('');
  const [phoneVerificationLoading, setPhoneVerificationLoading] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationStep, setVerificationStep] = useState('send');
  
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
    setShowPhoneVerification(false);
    setPhoneVerificationError('');
    setPhoneVerificationLoading(false);
    setVerificationCode('');
    setVerificationStep('send');
    resetImage();
    resetLocation();
    onModalStateChange?.(false);
  };

  const handleOpenPhoneVerification = () => {
    handleCloseModal();
    navigate('/phone-verification');
  };

  const handleSendVerificationCode = async () => {
    try {
      setPhoneVerificationError('');
      setPhoneVerificationLoading(true);

      const profile = await startPhoneVerification(null, navigate).catch((error) => {
        throw error;
      });

      setVerificationStep('check');
      return profile;
    } catch (error) {
      setPhoneVerificationError(error.message || 'שגיאה בשליחת קוד אימות');
    } finally {
      setPhoneVerificationLoading(false);
    }
  };

  const handleCheckVerificationCode = async () => {
    try {
      setPhoneVerificationError('');
      if (!verificationCode || verificationCode.trim().length !== 6) {
        setPhoneVerificationError('נא להזין קוד בן 6 ספרות');
        return;
      }

      setPhoneVerificationLoading(true);

      const me = await startPhoneVerification(null, navigate);
      const phone = me?.data?.user?.phone || me?.user?.phone;
      if (!phone) {
        setPhoneVerificationError('מספר טלפון לא נמצא בפרופיל');
        return;
      }

      await checkPhoneVerification(phone, verificationCode.trim(), navigate);

      setShowPhoneVerification(false);
      setVerificationCode('');
      setVerificationStep('send');
      setPhoneVerificationError('');
    } catch (error) {
      setPhoneVerificationError(error.message || 'שגיאה באימות הטלפון');
    } finally {
      setPhoneVerificationLoading(false);
    }
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

      const result = await createHelpRequest(requestData, token, navigate);
      onRequestCreated?.(result);
      handleCloseModal();
    } catch (error) {
      console.error('Error creating request:', error);
      // Check for phone verification requirement
      if (error.code === 'PHONE_VERIFICATION_REQUIRED' || 
          error.message?.includes('Phone verification required')) {
        setErrorMessage('נדרש אימות טלפון לפני יצירת בקשת עזרה.');
        handleOpenPhoneVerification();
      } else {
        setErrorMessage(error.message || 'שגיאה ביצירת בקשת עזרה. אנא נסה שוב.');
      }
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

      {showPhoneVerification && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-md" dir="rtl">
            <div className="text-center mb-6">
              <div className="text-3xl mb-2">📱</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">אימות טלפון</h2>
              <p className="text-gray-600">
                כדי לשלוח בקשת עזרה, יש לאמת את מספר הטלפון שלך.
              </p>
            </div>

            {phoneVerificationError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-center text-sm mb-4">
                {phoneVerificationError}
              </div>
            )}

            {verificationStep === 'send' ? (
              <button
                onClick={handleSendVerificationCode}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={phoneVerificationLoading}
              >
                {phoneVerificationLoading ? 'שולח קוד...' : 'שלח קוד אימות'}
              </button>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">קוד אימות</label>
                  <input
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 outline-none text-center text-2xl tracking-widest disabled:bg-gray-100 disabled:cursor-not-allowed"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength="6"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    disabled={phoneVerificationLoading}
                    placeholder="000000"
                    autoFocus
                  />
                </div>

                <button
                  onClick={handleCheckVerificationCode}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={phoneVerificationLoading}
                >
                  {phoneVerificationLoading ? 'מאמת...' : 'אמת'}
                </button>
              </div>
            )}

            <button
              onClick={() => setShowPhoneVerification(false)}
              className="mt-4 w-full text-sm text-gray-600 hover:text-gray-800"
              disabled={phoneVerificationLoading}
            >
              ביטול
            </button>
          </div>
        </div>
      )}
    </>
  );
}
