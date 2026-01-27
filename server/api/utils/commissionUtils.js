/*
  קובץ זה אחראי על:
  - פונקציות עזר לחישוב עמלות
  - חישוב אחוז עמלה מתשלומים
  - חישוב סכום עמלה וסכום למסייע
  - הגדרות עמלה מ-environment variables

  הקובץ משמש את:
  - paymentController.js
  - adminController.js

  הקובץ אינו:
  - מבצע עסקאות - רק מחשב סכומים
*/

const COMMISSION_RATE = 0.10;

function roundToClean(value) {
    return Math.round(value * 10) / 10;
}

function calculateCommission(totalAmount) {
    if (!totalAmount || totalAmount <= 0) {
        return {
            commissionAmount: 0,
            helperAmount: 0,
            originalTotal: 0
        };
    }

    const approximateHelperAmount = totalAmount * (1 - COMMISSION_RATE);
    
    const helperAmount = roundToClean(approximateHelperAmount);
    
    const commissionAmount = totalAmount - helperAmount;

    return {
        commissionAmount: Math.max(0, commissionAmount),
        helperAmount,
        originalTotal: totalAmount
    };
}

function getCommissionRatePercentage() {
    return COMMISSION_RATE * 100;
}

module.exports = {
    calculateCommission,
    roundToClean,
    getCommissionRatePercentage,
    COMMISSION_RATE
};
