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
    { title: 'Location', description: 'Where do you need help?' },
    { title: 'Details', description: 'What is the problem?' },
    { title: 'Photos', description: 'Add a photo (optional)' },
    { title: 'Offer', description: 'Offer an amount (optional)' }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      // Validation logic per step
      if (currentStep === 0) {
        if (useCurrentLocation && !currentLocation) {
          setLocationError('Please wait for GPS location or enter address manually');
          return;
        }
        if (!useCurrentLocation && (!formData.manualAddress || !formData.manualAddress.trim())) {
          setLocationError('Please enter a valid address');
          return;
        }
      }
      if (currentStep === 1) {
        if (!formData.problemType) {
          // Assuming there's a way to set error message from parent or local state
          // For now, we rely on the parent's validation or just block
          return; 
        }
      }
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const isStepValid = () => {
    if (currentStep === 0) {
      return useCurrentLocation ? !!currentLocation : (formData.manualAddress && formData.manualAddress.trim().length > 0);
    }
    if (currentStep === 1) {
      return !!formData.problemType;
    }
    return true; // Other steps are optional
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
    <div className="fixed inset-0 z-1001 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-white px-8 py-6 border-b border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Request Assistance</h2>
              <p className="text-slate-500 text-sm mt-1">Step {currentStep + 1} of {steps.length}: {steps[currentStep].description}</p>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-blue-600 h-full transition-all duration-300 ease-out rounded-full"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto flex-1">
          <ErrorMessage message={errorMessage} />
          <div className="animate-fadeIn">
            {renderStepContent()}
          </div>
        </div>

        {/* Footer / Actions */}
        <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
          <button
            onClick={currentStep === 0 ? onClose : handleBack}
            className="px-6 py-2.5 text-slate-600 font-medium hover:text-slate-800 hover:bg-slate-200/50 rounded-lg transition-colors"
            disabled={isSubmitting}
          >
            {currentStep === 0 ? 'Cancel' : 'Back'}
          </button>
          
          {currentStep === steps.length - 1 ? (
            <button
              onClick={onSubmit}
              disabled={isSubmitting}
              className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </>
              ) : (
                'Submit Request'
              )}
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={!isStepValid()}
              className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next Step
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
