/*
  קובץ זה אחראי על:
  - רכיב העלאת תמונה לבקשת עזרה
  - תצוגה מקדימה של התמונה שנבחרה
  - ממשק גרירה ושחרור לבחירת תמונות
  - ולידציה של קבצי תמונה
*/

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
            className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed cursor-pointer transition-all"
            style={{
              borderColor: 'var(--glass-border)',
              borderRadius: 'var(--rounded-lg)',
              transitionDuration: 'var(--transition-mid)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--primary)';
              e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--glass-border)';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <div className="p-3 mb-3"
                 style={{
                   backgroundColor: 'rgba(59, 130, 246, 0.1)',
                   borderRadius: 'var(--rounded-full)'
                 }}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                   style={{ color: 'var(--primary)' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>לחץ להוספת תמונה</span>
            <span className="text-xs mt-1" style={{ color: 'var(--text-light)' }}>גודל מקסימלי: 5MB</span>
          </label>
        </div>
      ) : (
        <div className="relative">
          <img
            src={imagePreview}
            alt="Preview"
            className="w-full h-48 object-cover"
            style={{
              borderRadius: 'var(--rounded-md)',
              border: '1px solid var(--glass-border)'
            }}
          />
          <button
            type="button"
            onClick={onRemoveImage}
            className="absolute p-2 transition-colors"
            style={{
              top: 'var(--space-sm)',
              right: 'var(--space-sm)',
              backgroundColor: 'var(--danger)',
              color: 'var(--text-inverted)',
              borderRadius: 'var(--rounded-full)',
              boxShadow: 'var(--shadow-lg)',
              transitionDuration: 'var(--transition-mid)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="mt-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
            <strong>נבחר:</strong> {selectedImage?.name}
          </div>
        </div>
      )}
    </div>
  );
}
