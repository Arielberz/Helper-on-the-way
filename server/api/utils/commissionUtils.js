/**
 * Platform commission calculation utility
 * The helper receives a clean rounded amount, platform takes the remainder
 */

const COMMISSION_RATE = 0.10; // 10% commission (approximate)

/**
 * Round to one decimal place (0.1 precision)
 * Examples: 3.73 → 3.7, 8.21 → 8.2, 12.5 → 12.5, 49.93 → 49.9
 * 
 * @param {number} value - The value to round
 * @returns {number} Rounded to 1 decimal place
 */
function roundToClean(value) {
    // Round to one decimal place
    return Math.round(value * 10) / 10;
}

/**
 * Calculate platform commission and helper payout amount
 * HELPER RECEIVES CLEAN ROUNDED AMOUNT, platform takes the remainder
 * 
 * @param {number} totalAmount - The total transaction amount
 * @returns {Object} Object containing:
 *   - commissionAmount: Platform commission (whatever is left after rounding helper amount)
 *   - helperAmount: Amount helper receives (ALWAYS CLEAN/ROUNDED)
 *   - originalTotal: Original transaction amount
 */
function calculateCommission(totalAmount) {
    if (!totalAmount || totalAmount <= 0) {
        return {
            commissionAmount: 0,
            helperAmount: 0,
            originalTotal: 0
        };
    }

    // Calculate approximate helper amount (90% of total)
    const approximateHelperAmount = totalAmount * (1 - COMMISSION_RATE);
    
    // Round helper amount to clean number (0.5 or whole)
    const helperAmount = roundToClean(approximateHelperAmount);
    
    // Commission is whatever is left over
    const commissionAmount = totalAmount - helperAmount;

    return {
        commissionAmount: Math.max(0, commissionAmount), // Ensure non-negative
        helperAmount,
        originalTotal: totalAmount
    };
}

/**
 * Get the current commission rate as a percentage
 * @returns {number} Commission rate as percentage (e.g., 10)
 */
function getCommissionRatePercentage() {
    return COMMISSION_RATE * 100;
}

module.exports = {
    calculateCommission,
    roundToClean,
    getCommissionRatePercentage,
    COMMISSION_RATE
};
