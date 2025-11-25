// Helper function to convert problem type codes to Hebrew labels
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

// Helper function to get status labels with emojis
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

// Helper function to get status colors
export const getStatusColor = (status) => {
  const colors = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'assigned': 'bg-blue-100 text-blue-800',
    'in_progress': 'bg-purple-100 text-purple-800',
    'completed': 'bg-green-100 text-green-800',
    'cancelled': 'bg-red-100 text-red-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};
