const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { User } = require('@/models');
const { PROVIDERS } = require('@/constants/enums');
const { logger } = require('@/utils');
const { v4: uuidv4 } = require('uuid');

/**
 * Passport.js configuration for Google OAuth 2.0
 */

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).select('-password -refreshToken');
    done(null, user);
  } catch (error) {
    logger.error('Passport deserializeUser error:', error);
    done(error, null);
  }
});

/**
 * Google OAuth Strategy Configuration
 */
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL || "/api/auth/google/callback"
},
async (accessToken, refreshToken, profile, done) => {
  try {
    logger.info(`Google OAuth attempt for email: ${profile.emails[0].value}`);

    // Extract user data from Google profile
    const googleProfile = {
      id: profile.id,
      name: profile.displayName,
      email: profile.emails[0].value,
      picture: profile.photos[0].value,
      provider: PROVIDERS.GOOGLE
    };

    // Try to find existing OAuth user
    let user = await User.findOne({ 
      provider: PROVIDERS.GOOGLE, 
      providerId: profile.id 
    });

    if (user) {
      // Existing OAuth user found
      logger.info(`Existing Google user found: ${user._id}`);
      
      // Update avatar if changed
      if (user.avatar !== googleProfile.picture) {
        await User.findByIdAndUpdate(user._id, {
          avatar: googleProfile.picture
        });
        user.avatar = googleProfile.picture;
      }
      
      return done(null, user);
    }

    // Check if user exists with same email but different provider
    const existingUser = await User.findOne({ 
      email: googleProfile.email.toLowerCase() 
    });

    if (existingUser) {
      // User exists with same email but different provider
      if (existingUser.provider === PROVIDERS.LOCAL) {
        // Local user wants to link Google account
        logger.info(`Linking Google account to existing local user: ${existingUser._id}`);
        
        const updatedUser = await User.findByIdAndUpdate(
          existingUser._id,
          {
            provider: PROVIDERS.GOOGLE,
            providerId: profile.id,
            avatar: googleProfile.picture,
            isEmailVerified: true
          },
          { new: true }
        );
        
        return done(null, updatedUser);
      } else {
        // User with different OAuth provider
        const error = new Error('User already exists with different provider');
        error.code = 'EMAIL_ALREADY_EXISTS_DIFFERENT_PROVIDER';
        return done(error, null);
      }
    }

    // Create new OAuth user
    logger.info(`Creating new Google user for email: ${googleProfile.email}`);
    
    const newUser = await User.create({
      name: googleProfile.name,
      email: googleProfile.email.toLowerCase(),
      avatar: googleProfile.picture,
      provider: PROVIDERS.GOOGLE,
      providerId: profile.id,
      isEmailVerified: true,
      tokenVersion: uuidv4()
    });

    logger.info(`New Google user created: ${newUser._id}`);
    return done(null, newUser);

  } catch (error) {
    logger.error('Google OAuth strategy error:', error);
    return done(error, null);
  }
}));

module.exports = passport;