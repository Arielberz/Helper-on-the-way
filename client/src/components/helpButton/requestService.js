/*
  קובץ זה אחראי על:
  - שירותי יצירת בקשת עזרה
  - Geocoding של כתובות למיקום GPS
  - טיפול בתמונות והעלאה לשרת
  - אינטגרציה עם API של בקשות
*/

import { createRequest } from '../../services/requests.service';

export async function geocodeAddress(address) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
    );
    const data = await response.json();
    
    if (!data || data.length === 0) {
      throw new Error('Could not find the address. Please check and try again.');
    }
    
    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
      address
    };
  } catch (error) {
    console.error('Geocoding error:', error);
    throw new Error('Failed to convert address to coordinates. Please try again.');
  }
}

export async function createHelpRequest(requestData, token, navigate) {
  try {
    const response = await createRequest(requestData, navigate);

    if (!response.success) {
      throw new Error(response.message || 'Failed to create request');
    }

    return response.data;
  } catch (error) {
    // Preserve phone verification errors
    if (error.code === 'PHONE_VERIFICATION_REQUIRED') {
      throw error;
    }
    
    if (error.message.includes('image is too large') || 
        error.message.includes('session has expired') ||
        error.message.includes('Server error') ||
        error.message.includes('Network error') ||
        error.message.includes('Unable to process') ||
        error.message.includes('already have an open request')) {
      throw error;
    }
    
    throw new Error(error.message || 'Failed to create help request. Please try again.');
  }
}

export function convertImageToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve({
        url: reader.result,
        uploadedAt: new Date().toISOString()
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
