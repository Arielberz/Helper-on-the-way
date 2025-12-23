/**
 * Currency conversion utilities for handling Israeli Shekels (ILS) on the frontend
 * All amounts are stored in the backend as agorot (1 ILS = 100 agorot)
 */

/**
 * Convert ILS amount to agorot (cents)
 * @param {number} ilsAmount - Amount in ILS (e.g., 50.00)
 * @returns {number} Amount in agorot (e.g., 5000)
 */
export function ilsToAgorot(ilsAmount) {
    if (typeof ilsAmount !== 'number' || isNaN(ilsAmount)) {
        throw new Error('Invalid ILS amount: must be a number');
    }
    if (ilsAmount < 0) {
        throw new Error('Invalid ILS amount: must be positive');
    }
    // Round to avoid floating-point precision issues
    return Math.round(ilsAmount * 100);
}

/**
 * Convert agorot to ILS number with proper decimal
 * @param {number} agorot - Amount in agorot (e.g., 5000)
 * @returns {number} Amount in ILS (e.g., 50.00)
 */
export function agorotToIls(agorot) {
    if (typeof agorot !== 'number' || isNaN(agorot) || !Number.isInteger(agorot)) {
        throw new Error('Invalid agorot amount: must be an integer');
    }
    if (agorot < 0) {
        throw new Error('Invalid agorot amount: must be positive');
    }
    return Math.round(agorot) / 100;
}

/**
 * Format agorot as ILS string with ₪ symbol
 * @param {number} agorot - Amount in agorot
 * @returns {string} Formatted string (e.g., "50.00₪")
 */
export function formatAgorotAsIls(agorot) {
    const ils = agorotToIls(agorot);
    return `${ils.toFixed(2)}₪`;
}

/**
 * Format ILS amount with ₪ symbol
 * @param {number} ilsAmount - Amount in ILS
 * @returns {string} Formatted string (e.g., "50₪")
 */
export function formatIls(ilsAmount) {
    if (typeof ilsAmount !== 'number' || isNaN(ilsAmount)) {
        return '0₪';
    }
    // If it's a whole number, don't show decimals
    if (Number.isInteger(ilsAmount)) {
        return `${ilsAmount}₪`;
    }
    // Otherwise show 2 decimals
    return `${ilsAmount.toFixed(2)}₪`;
}

/**
 * Validate agorot amount
 * @param {number} agorot - Amount to validate
 * @returns {boolean} True if valid
 */
export function isValidAgorotAmount(agorot) {
    return typeof agorot === 'number' && 
           Number.isInteger(agorot) && 
           agorot >= 0;
}
