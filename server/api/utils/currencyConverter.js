/**
 * Currency conversion utilities for handling Israeli Shekels (ILS)
 * All amounts are stored internally as agorot (1 ILS = 100 agorot) to avoid floating-point errors
 */

/**
 * Convert ILS amount to agorot (cents)
 * @param {number} ilsAmount - Amount in ILS (e.g., 50.00)
 * @returns {number} Amount in agorot (e.g., 5000)
 */
function ilsToAgorot(ilsAmount) {
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
 * Convert agorot to ILS string with 2 decimal places
 * @param {number} agorot - Amount in agorot (e.g., 5000)
 * @returns {string} Amount in ILS as string (e.g., "50.00")
 */
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

/**
 * Convert agorot to ILS number with proper decimal
 * @param {number} agorot - Amount in agorot (e.g., 5000)
 * @returns {number} Amount in ILS (e.g., 50.00)
 */
function agorotToIls(agorot) {
    if (typeof agorot !== 'number' || isNaN(agorot) || !Number.isInteger(agorot)) {
        throw new Error('Invalid agorot amount: must be an integer');
    }
    if (agorot < 0) {
        throw new Error('Invalid agorot amount: must be positive');
    }
    return Math.round(agorot) / 100;
}

/**
 * Validate agorot amount
 * @param {number} agorot - Amount to validate
 * @returns {boolean} True if valid
 */
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
