/*
  קובץ זה אחראי על:
  - ייצור קודי אימות אקראיים
  - קודים בן 6 ספרות לאימות אימייל
  - קודים לשחזור סיסמה

  הקובץ משמש את:
  - usersService.js

  הקובץ אינו:
  - מייצר טוכנים או הצפנות - רק קודי אימות
*/

/**
 * Generate a random numeric verification code
 * @param {number} length - The length of the code (default 6)
 * @returns {string} A numeric string of the specified length
 */
function generateCode(length = 6) {
    let code = '';
    for (let i = 0; i < length; i++) {
        code += Math.floor(Math.random() * 10);
    }
    return code;
}

module.exports = generateCode;
