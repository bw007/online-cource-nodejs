const crypto = require('crypto');

/**
 * Generate 6-digit OTP code
 * @returns {string} 6-digit OTP
 */
function generateOTP() {
  return crypto.randomInt(100000, 999999).toString();
}

/**
 * Get OTP expiry time (default 10 minutes)
 * @param {number} minutes - Minutes until expiry
 * @returns {Date} Expiry date
 */
function getOTPExpiry(minutes = 20) {
  return new Date(Date.now() + minutes * 60 * 1000);
}

module.exports = {
  generateOTP,
  getOTPExpiry
};