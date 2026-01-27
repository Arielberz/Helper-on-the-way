/*
  קובץ זה אחראי על:
  - הגדרת כל סוגי הבעיות האפשריים לבקשות סיוע בדרכים
  - אספקת קבועים לשימוש במודלים ובקונטרולרים

  הקובץ משמש את:
  - מודל הבקשות (requestsModel.js)
  - קונטרולר הבקשות ושירות הבקשות
  - הצד הקליינט לתצוגת סוגי בעיות

  הקובץ אינו:
  - מכיל לוגיקה או פונקציות - רק קבועים
*/

/**
 * Problem Type Constants
 * Defines all possible problem types for roadside assistance requests
 */
module.exports = {
  FLAT_TIRE: 'flat_tire',
  DEAD_BATTERY: 'dead_battery',
  OUT_OF_FUEL: 'out_of_fuel',
  ENGINE_PROBLEM: 'engine_problem',
  LOCKED_OUT: 'locked_out',
  ACCIDENT: 'accident',
  TOWING_NEEDED: 'towing_needed',
  OTHER: 'other'
};
