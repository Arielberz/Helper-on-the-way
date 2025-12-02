export const PROBLEM_TYPES = [
  { value: 'flat_tire', label: 'פנצר' },
  { value: 'dead_battery', label: 'מצבר מת' },
  { value: 'out_of_fuel', label: 'נגמר דלק' },
  { value: 'engine_problem', label: 'בעיית מנוע' },
  { value: 'locked_out', label: 'נעול בחוץ' },
  { value: 'accident', label: 'תאונה' },
  { value: 'towing_needed', label: 'נדרש גרירה' },
  { value: 'other', label: 'אחר' }
];

export const PROBLEM_LABELS = Object.fromEntries(PROBLEM_TYPES.map(t => [t.value, t.label]));

export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};
