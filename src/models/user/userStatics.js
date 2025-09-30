const { v4: uuidv4 } = require('uuid');
const { PROVIDERS } = require("@/constants/enums");

module.exports = {
  // Static method to find by email and provider
  findByEmailAndProvider (email, provider = PROVIDERS.LOCAL) {
    return this.findOne({ email, provider });
  },

  // Static method to find OAuth user
  findOAuthUser(provider, providerId) {
    return this.findOne({ provider, providerId });
  },

  // Google OAuth
  async findOrCreateOAuthUser(profile, provider) {
    // by providerId
    let user = await this.findOAuthUser(provider, profile.id);
    
    if (user) {
      return user;
    }

    // by email and provider
    const existingUser = await this.findByEmailAndProvider(profile.email, PROVIDERS.LOCAL);
    
    if (existingUser) {
      // custom error
      const error = new Error('User with this email already exists with different provider');
      error.status = 409;
      error.code = 'EMAIL_ALREADY_EXISTS';
      throw error;
    }

    // new oauth user
    return await this.create({
      name: profile.name,
      email: profile.email,
      avatar: profile.picture,
      provider: provider,
      providerId: profile.id,
      isEmailVerified: true,
      tokenVersion: uuidv4()
    });
  }
};
