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
  const response = await fetch(`${API_BASE}/api/requests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(requestData)
  });

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.message || 'Failed to create request');
  }

  return result.data;
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
