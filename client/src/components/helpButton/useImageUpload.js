/*
  קובץ זה אחראי על:
  - Hook לניהול העלאת תמונות
  - מצב של תמונה נבחרת ותצוגה מקדימה
  - ולידציה של קבצי תמונה
  - טיפול בשגיאות העלאה
*/

import { useState } from 'react';

export function useImageUpload() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageError, setImageError] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setImageError('Please select a valid image file');
        e.target.value = '';
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setImageError('Image size must be less than 5MB');
        e.target.value = '';
        return;
      }

      setImageError('');
      setSelectedImage(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setImageError('');
  };

  const resetImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setImageError('');
  };

  return {
    selectedImage,
    imagePreview,
    imageError,
    handleImageChange,
    handleRemoveImage,
    resetImage
  };
}
