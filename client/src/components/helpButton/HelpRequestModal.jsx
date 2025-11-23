import React from 'react';
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
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="sticky top-0 bg-linear-to-r from-red-500 to-red-600 text-white px-6 py-4 rounded-t-2xl">
          <h2 className="text-2xl font-bold">Request Roadside Assistance</h2>
          <p className="text-red-100 text-sm mt-1">Fill out the form below and help will be on the way</p>
        </div>

        {/* Modal Content */}
        <form onSubmit={onSubmit} className="p-6 space-y-6">
          {/* Global Error Message */}
          <ErrorMessage message={errorMessage} />

          {/* Location Section */}
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

          {/* Problem Details Section */}
          <ProblemDetailsSection
            problemType={formData.problemType}
            description={formData.description}
            priority={formData.priority}
            onChange={onInputChange}
          />

          {/* Image Upload */}
          <ImageUpload
            imagePreview={imagePreview}
            selectedImage={selectedImage}
            imageError={imageError}
            onImageChange={onImageChange}
            onRemoveImage={onRemoveImage}
          />

          {/* Payment Section */}
          <PaymentSection
            offeredAmount={formData.offeredAmount}
            currency={formData.currency}
            onChange={onInputChange}
          />

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || (useCurrentLocation && !currentLocation)}
              className="flex-1 px-6 py-3 bg-linear-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
            >
              {isSubmitting ? 'Creating Request...' : 'Create Help Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
