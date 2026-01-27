/*
  קובץ זה אחראי על:
  - המרת מטבעות בין שקלים לאגורות (1 ₪ = 100 אגורות)
  - עיצוב תצוגת מחירים בפורמט ישראלי
  - וולידציה של סכומי כסף

  הקובץ משמש את:
  - רכיב התשלום בצ'אט (PaymentModal)
  - דף הפרופיל להצגת מאזן הארנק
  - כל מקום שמציג או מעבד סכומי כסף

  הקובץ אינו:
  - מבצע חישובי עמלות - רק המרות בסיסיות
  - תומך במטבעות זרים - רק שקלים
*/

export function ilsToAgorot(ilsAmount) {
    if (typeof ilsAmount !== 'number' || isNaN(ilsAmount)) {
        throw new Error('Invalid ILS amount: must be a number');
    }
    if (ilsAmount < 0) {
        throw new Error('Invalid ILS amount: must be positive');
    }
    return Math.round(ilsAmount * 100);
}

export function agorotToIls(agorot) {
    if (typeof agorot !== 'number' || isNaN(agorot) || !Number.isInteger(agorot)) {
        throw new Error('Invalid agorot amount: must be an integer');
    }
    if (agorot < 0) {
        throw new Error('Invalid agorot amount: must be positive');
    }
    return Math.round(agorot) / 100;
}

export function formatAgorotAsIls(agorot) {
    const ils = agorotToIls(agorot);
    return `${ils.toFixed(2)}₪`;
}

export function formatIls(ilsAmount) {
    if (typeof ilsAmount !== 'number' || isNaN(ilsAmount)) {
        return '0₪';
    }
    if (Number.isInteger(ilsAmount)) {
        return `${ilsAmount}₪`;
    }
    return `${ilsAmount.toFixed(2)}₪`;
}

export function isValidAgorotAmount(agorot) {
    return typeof agorot === 'number' && 
           Number.isInteger(agorot) && 
           agorot >= 0;
}
