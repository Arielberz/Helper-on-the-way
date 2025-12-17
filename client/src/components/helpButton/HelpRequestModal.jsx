// Multi-step modal component that guides users through the help request creation process
// with steps for location, problem details, photos, and payment offering.
import React, { useState } from 'react';
import { ErrorMessage } from './ErrorMessage';
import LocationSection from './LocationSection';
import ProblemDetailsSection from './ProblemDetailsSection';
import ImageUpload from './ImageUpload';
import PaymentSection from './PaymentSection';

export default function HelpRequestModal({
  isOpen,
  onClose,
  onSubmit,
  formData,
  onInputChange,
  useCurrentLocation,
  setUseCurrentLocation,
  currentLocation,
  isLoadingLocation,
  errorMessage,
  locationError,
  setLocationError,
  selectedImage,
  imagePreview,
  imageError,
  onImageChange,
  onRemoveImage,
  isSubmitting
}) {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    { title: 'מיקום', description: 'איפה אתה צריך עזרה?' },
    { title: 'פרטים', description: 'מה הבעיה?' },
    { title: 'תמונות', description: 'הוסף תמונה (אופציונלי)' },
    { title: 'הצעה', description: 'הצע סכום (אופציונלי)' }
  ];

  const handleNext = () => {
    if (currentStep >= steps.length - 1) return;
    
    if (currentStep === 0) {
      if (useCurrentLocation && !currentLocation) {
        setLocationError('אנא המתן למיקום GPS או הזן כתובת ידנית');
        return;
      }
      if (!useCurrentLocation && !formData.manualAddress?.trim()) {
        setLocationError('אנא הזן כתובת תקינה');
        return;
      }
    }
    if (currentStep === 1 && !formData.problemType) return;
    
    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1);
  };

  const isStepValid = () => {
    if (currentStep === 0) return useCurrentLocation ? !!currentLocation : !!formData.manualAddress?.trim();
    if (currentStep === 1) return !!formData.problemType;
    return true;
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <LocationSection
            useCurrentLocation={useCurrentLocation}
            setUseCurrentLocation={setUseCurrentLocation}
            currentLocation={currentLocation}
            isLoadingLocation={isLoadingLocation}
            manualAddress={formData.manualAddress}
            onAddressChange={onInputChange}
            locationError={locationError}
            clearLocationError={() => setLocationError('')}
          />
        );
      case 1:
        return (
          <ProblemDetailsSection
            problemType={formData.problemType}
            description={formData.description}
            onChange={onInputChange}
          />
        );
      case 2:
        return (
          <ImageUpload
            imagePreview={imagePreview}
            selectedImage={selectedImage}
            imageError={imageError}
            onImageChange={onImageChange}
            onRemoveImage={onRemoveImage}
          />
        );
      case 3:
        return (
          <PaymentSection
            offeredAmount={formData.offeredAmount}
            currency={formData.currency}
            onChange={onInputChange}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-1001 flex items-center justify-center p-4 backdrop-blur-sm transition-all"
         style={{ backgroundColor: 'rgba(15, 23, 42, 0.6)' }}>
      <div className="max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
           style={{
             backgroundColor: 'white',
             borderRadius: 'var(--rounded-xl)',
             boxShadow: 'var(--shadow-lg)'
           }}>
        <div className="bg-white px-8 py-6 border-b"
             style={{ borderColor: 'rgba(0, 0, 0, 0.05)' }}>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold" style={{ color: 'var(--text-main)' }}>בקש סיוע</h2>
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>שלב {currentStep + 1} מתוך {steps.length}: {steps[currentStep].description}</p>
            </div>
            <button onClick={onClose} className="transition-colors"
                    style={{
                      color: 'var(--text-light)',
                      transitionDuration: 'var(--transition-mid)'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-light)'}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="w-full h-2 overflow-hidden"
               style={{
                 backgroundColor: 'var(--background-dark)',
                 borderRadius: 'var(--rounded-full)'
               }}>
            <div 
              className="h-full transition-all ease-out"
              style={{
                width: `${((currentStep + 1) / steps.length) * 100}%`,
                backgroundColor: 'var(--primary)',
                borderRadius: 'var(--rounded-full)',
                transitionDuration: 'var(--transition-slow)'
              }}
            />
          </div>
        </div>

        <div className="p-8 overflow-y-auto flex-1">
          <ErrorMessage message={errorMessage} />
          <div className="animate-fadeIn">
            {renderStepContent()}
          </div>
        </div>

        <div className="px-8 py-6 border-t flex justify-between items-center"
             style={{
               backgroundColor: 'var(--background)',
               borderColor: 'rgba(0, 0, 0, 0.05)'
             }}>
          <button
            onClick={currentStep === 0 ? onClose : handleBack}
            className="font-medium transition-colors"
            style={{
              padding: 'var(--space-md) var(--space-lg)',
              color: 'var(--text-secondary)',
              borderRadius: 'var(--rounded-md)',
              transitionDuration: 'var(--transition-mid)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--text-main)';
              e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-secondary)';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
            disabled={isSubmitting}
          >
            {currentStep === 0 ? 'ביטול' : 'חזרה'}
          </button>
          
          {currentStep === steps.length - 1 ? (
            <button
              onClick={onSubmit}
              disabled={isSubmitting}
              className="font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              style={{
                padding: 'var(--space-md) var(--space-xl)',
                backgroundColor: 'var(--primary)',
                color: 'var(--text-inverted)',
                borderRadius: 'var(--rounded-md)',
                boxShadow: 'var(--shadow-md)',
                transitionDuration: 'var(--transition-mid)'
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.backgroundColor = 'var(--primary-dark)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--primary)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              }}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  שולח...
                </>
              ) : (
                'שלח בקשה'
              )}
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={!isStepValid()}
              className="font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                padding: 'var(--space-md) var(--space-xl)',
                backgroundColor: 'var(--primary)',
                color: 'var(--text-inverted)',
                borderRadius: 'var(--rounded-md)',
                boxShadow: 'var(--shadow-md)',
                transitionDuration: 'var(--transition-mid)'
              }}
              onMouseEnter={(e) => {
                if (isStepValid()) {
                  e.currentTarget.style.backgroundColor = 'var(--primary-dark)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--primary)';
                e.currentTarget.style.boxShadow = 'var(--shadow-md)';
              }}
            >
              שלב הבא
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
