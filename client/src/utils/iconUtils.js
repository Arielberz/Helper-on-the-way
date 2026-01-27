/*
  קובץ זה אחראי על:
  - יצירת אייקונים מותאמים למפת Leaflet
  - מיפוי בין סוגי בעיות לתמונות אייקון
  - תרגום סוגי בעיות לעברית

  הקובץ משמש את:
  - MapLive - הצגת סמנים על המפה
  - RequestMarkers - רנדור סמני בקשות עזרה
  - פופאפים ורשימות בקשות

  הקובץ אינו:
  - מנהל מצב של המפה - רק מספק אייקונים
  - מטפל באירועי לחיצה - רק ויזואליים
*/

import L from 'leaflet';

const ICON_MAP = {
  flat_tire: '/flat-tire.png',
  dead_battery: '/battary.png',
  out_of_fuel: '/out_of_fuel.png',
  engine_problem: '/engine_problem.png',
  locked_out: '/locked_out.png',
  accident: '/accident.png',
  towing_needed: '/towing_needed.png',
  other: '/other.png'
};

export const getProblemIcon = (problemType) => {
  const iconUrl = ICON_MAP[problemType] || ICON_MAP.other;
  
  return new L.Icon({
    iconUrl: iconUrl,
    iconRetinaUrl: iconUrl,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [48, 48],
    iconAnchor: [24, 48],
    popupAnchor: [0, -48],
    shadowSize: [60, 60],
    shadowAnchor: [18, 60]
  });
};

export const getProblemTypeLabel = (problemType) => {
  const labels = {
    flat_tire: 'פנצ׳ר',
    dead_battery: 'בטריה מתה',
    out_of_fuel: 'נגמר הדלק',
    engine_problem: 'בעיה במנוע',
    locked_out: 'נעול בחוץ',
    accident: 'תאונה',
    towing_needed: 'נדרש גרר',
    other: 'אחר'
  };
  
  return labels[problemType] || problemType;
};

export const getUserPositionIcon = () => {
  return new L.Icon({
    iconUrl: '/user-position.png',
    iconRetinaUrl: '/user-position.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [48, 48],
    iconAnchor: [24, 48],
    popupAnchor: [0, -48],
    shadowSize: [60, 60],
    shadowAnchor: [18, 60]
  });
};
