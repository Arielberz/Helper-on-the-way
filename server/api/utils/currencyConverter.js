/*
  קובץ זה אחראי על:
  - פונקציות עזר להמרת מטבע
  - המרה בין אגורות לשקלים
  - ולידציות של סכומים
  - פורמט מחרוזות כספיות

  הקובץ משמש את:
  - paypalService.js
  - paymentController.js
  - requestsController.js

  הקובץ אינו:
  - מבצע המרות מטבע חיצוניות - רק ILS/אגורות
*/

function ilsToAgorot(ilsAmount) {
    if (typeof ilsAmount !== 'number' || isNaN(ilsAmount)) {
        throw new Error('Invalid ILS amount: must be a number');
    }
    if (ilsAmount < 0) {
        throw new Error('Invalid ILS amount: must be positive');
    }
    return Math.round(ilsAmount * 100);
}

function agorotToIlsString(agorot) {
    if (typeof agorot !== 'number' || isNaN(agorot) || !Number.isInteger(agorot)) {
        throw new Error('Invalid agorot amount: must be an integer');
    }
    if (agorot < 0) {
        throw new Error('Invalid agorot amount: must be positive');
    }
    const ils = agorot / 100;
    return ils.toFixed(2);
}

function agorotToIls(agorot) {
    if (typeof agorot !== 'number' || isNaN(agorot) || !Number.isInteger(agorot)) {
        throw new Error('Invalid agorot amount: must be an integer');
    }
    if (agorot < 0) {
        throw new Error('Invalid agorot amount: must be positive');
    }
    return Math.round(agorot) / 100;
}

function isValidAgorotAmount(agorot) {
    return typeof agorot === 'number' && 
           Number.isInteger(agorot) && 
           agorot >= 0;
}

module.exports = {
    ilsToAgorot,
    agorotToIlsString,
    agorotToIls,
    isValidAgorotAmount
};
