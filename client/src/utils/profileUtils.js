// Utility functions for profile page

export const maskEmail = (email) => {
  if (!email) return "לא זמין";
  const [username, domain] = email.split('@');
  return `${"*".repeat(username.length)}@${domain}`;
};

export const formatPhoneForDisplay = (phone) => {
  if (!phone) return "לא זמין";
  // Convert +9725XXXXXXXX to 05XXXXXXXX for display
  if (phone.startsWith('+9725')) {
    return '0' + phone.substring(4);
  }
  return phone;
};

export const maskPhone = (phone) => {
  if (!phone) return "לא זמין";
  return "*".repeat(phone.length);
};

// Calculate distance between two points using Haversine formula
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

export const getProblemTypeLabel = (type) => {
  const labels = {
    'flat_tire': 'פנצ\'ר',
    'dead_battery': 'מצבר מת',
    'out_of_fuel': 'גמר דלק',
    'engine_problem': 'בעיית מנוע',
    'locked_out': 'נעול בחוץ',
    'accident': 'תאונה',
    'towing_needed': 'נדרש גרירה',
    'other': 'אחר'
  };
  return labels[type] || type;
};

export const getStatusLabel = (status) => {
  const labels = {
    'pending': '⏳ ממתין',
    'assigned': '👤 שובץ',
    'in_progress': '🔄 בטיפול',
    'completed': '✅ הושלם',
    'cancelled': '❌ בוטל'
  };
  return labels[status] || status;
};
