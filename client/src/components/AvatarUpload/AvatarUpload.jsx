/*
  קובץ זה אחראי על:
  - העלאת ועריכת תמונת פרופיל (אווטר) של המשתמש
  - תצוגה מקדימה של התמונה לפני העלאה
  - מחיקה והחלפה של תמונת הפרופיל
  - ניהול תהליך העלאה עם הודעות משוב למשתמש
*/

import React, { useState } from 'react';
import { uploadAvatar, deleteAvatar } from '../../services/users.service';

export default function AvatarUpload({ currentAvatar, onAvatarUpdate }) {
  const [imagePreview, setImagePreview] = useState(currentAvatar);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('נא לבחור קובץ תמונה תקין');
      e.target.value = '';
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('גודל התמונה חייב להיות פחות מ-2MB');
      e.target.value = '';
      return;
    }

    setError('');
    setUploading(true);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Image = reader.result;
      setImagePreview(base64Image);

      try {
        const data = await uploadAvatar(base64Image);
        onAvatarUpdate(data.data.user.avatar);
        setError('');
      } catch (err) {
        console.error('Error uploading avatar:', err);
        setError(err.message || 'שגיאה בהעלאת התמונה');
        setImagePreview(currentAvatar);
      } finally {
        setUploading(false);
        e.target.value = '';
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = async () => {
    if (!confirm('האם אתה בטוח שברצונך להסיר את תמונת הפרופיל?')) {
      return;
    }

    setUploading(true);
    try {
      await deleteAvatar();
      setImagePreview(null);
      onAvatarUpdate(null);
      setError('');
    } catch (err) {
      console.error('Error deleting avatar:', err);
      setError(err.message || 'שגיאה במחיקת התמונה');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">

      <div className="relative group">
        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-100 flex items-center justify-center">
          {imagePreview ? (
            <img 
              src={imagePreview} 
              alt="Profile Avatar" 
              className="w-full h-full object-cover"
            />
          ) : (
            <svg className="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          )}
        </div>
        
        {uploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        )}
      </div>


      {error && (
        <div className="text-red-600 text-sm bg-red-50 px-4 py-2 rounded-lg border border-red-200">
          {error}
        </div>
      )}


      <div className="flex gap-2">
        <label
          htmlFor="avatar-upload"
          className={`px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-2 ${
            uploading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>{imagePreview ? 'שנה תמונה' : 'העלה תמונה'}</span>
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
          id="avatar-upload"
          disabled={uploading}
        />
        
        {imagePreview && (
          <button
            onClick={handleRemoveAvatar}
            disabled={uploading}
            className={`px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2 ${
              uploading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span>הסר תמונה</span>
          </button>
        )}
      </div>

      <p className="text-xs text-gray-500 text-center">
        תמונה בפורמט JPG, PNG או GIF. גודל מקסימלי: 2MB
      </p>
    </div>
  );
}
