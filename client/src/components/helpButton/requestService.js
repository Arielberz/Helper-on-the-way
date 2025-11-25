const API_BASE = import.meta.env.VITE_API_URL;

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

export async function createHelpRequest(requestData, token) {
  try {
    const response = await fetch(`${API_BASE}/api/requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(requestData)
    });

    // Handle specific HTTP error codes
    if (response.status === 413) {
      throw new Error('The uploaded image is too large. Please select a smaller image (max 5MB).');
    }

    if (response.status === 401) {
      throw new Error('Your session has expired. Please log in again.');
    }

    if (response.status === 500) {
      throw new Error('Server error. Please try again later.');
    }

    if (!response.ok) {
      throw new Error('Network error. Please check your connection and try again.');
    }

    // Try to parse JSON response
    let result;
    try {
      result = await response.json();
    } catch (parseError) {
      throw new Error('Unable to process server response. Please try again.');
    }

    if (!result.success) {
      throw new Error(result.message || 'Failed to create request');
    }

    return result.data;
  } catch (error) {
    // Re-throw our custom errors
    if (error.message.includes('image is too large') || 
        error.message.includes('session has expired') ||
        error.message.includes('Server error') ||
        error.message.includes('Network error') ||
        error.message.includes('Unable to process')) {
      throw error;
    }
    
    // Handle network failures
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Cannot connect to server. Please check your internet connection.');
    }
    
    // Generic error fallback
    throw new Error('Failed to create help request. Please try again.');
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
