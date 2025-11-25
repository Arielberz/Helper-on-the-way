import React from 'react';
import { InlineError } from './ErrorMessage';

export default function ImageUpload({
  imagePreview,
  selectedImage,
  imageError,
  onImageChange,
  onRemoveImage
}) {
  return (
    <div>
      <InlineError message={imageError} />
      
      {!imagePreview ? (
        <div className="relative">
          <input
            type="file"
            accept="image/*"
            onChange={onImageChange}
            className="hidden"
            id="image-upload"
          />
          <label
            htmlFor="image-upload"
            className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all"
          >
            <div className="bg-blue-50 p-3 rounded-full mb-3">
              <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-600">Tap to add photo</span>
            <span className="text-xs text-gray-400 mt-1">Max size: 5MB</span>
          </label>
        </div>
      ) : (
        <div className="relative">
          <img
            src={imagePreview}
            alt="Preview"
            className="w-full h-48 object-cover rounded-lg border border-gray-300"
          />
          <button
            type="button"
            onClick={onRemoveImage}
            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="mt-2 text-xs text-gray-600">
            <strong>Selected:</strong> {selectedImage?.name}
          </div>
        </div>
      )}
    </div>
  );
}
