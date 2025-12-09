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
