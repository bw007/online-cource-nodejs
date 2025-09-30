const { PROVIDERS } = require('@/constants/enums');
const bcrypt = require('bcryptjs');

module.exports = {
  // Instance method to compare passwords
  async comparePassword(candidatePassword) {
    if (this.provider !== PROVIDERS.LOCAL || !this.password) {
      throw new Error('Password comparison not available for OAuth users');
    }
    
    return await bcrypt.compare(candidatePassword, this.password);
  },

  // Instance method to check if user can reset password
  canResetPassword() {
    return this.provider === PROVIDERS.LOCAL && this.password;
  },

  // Instance method to check if password was changed after JWT was issued
  changedPasswordAfter(JWTTimestamp) {
    if (this.passwordChangedAt) {
      const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
      return JWTTimestamp < changedTimestamp;
    }
    return false;
  },

  // Update last login time
  async updateLastLogin() {
    this.lastLoginAt = new Date();
    return await this.save({ validateBeforeSave: false });
  },

  // Increment login count
  async incrementLoginCount() {
    this.loginCount += 1;
    this.lastLoginAt = new Date();
    return await this.save({ validateBeforeSave: false });
  },

  // Check if reset token is still valid
  isPasswordResetTokenValid() {
    return this.passwordResetToken && this.passwordResetExpires > Date.now();
  },
};
