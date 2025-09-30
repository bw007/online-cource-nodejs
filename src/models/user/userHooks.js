const { PROVIDERS } = require('@/constants/enums');
const bcrypt = require('bcryptjs');

module.exports = function(schema) {
  // Pre-save middleware for password hashing
  schema.pre('save', async function(next) {
    // Only hash password if it's modified and provider is LOCAL
    if (!this.isModified('password') || this.provider !== PROVIDERS.LOCAL) {
      return next();
    }
    
    const bcrypt = require('bcryptjs');
    this.password = await bcrypt.hash(this.password, 12);
    
    // Set password changed timestamp
    if (!this.isNew) {
      this.passwordChangedAt = new Date();
    }
    
    next();
  });
};
