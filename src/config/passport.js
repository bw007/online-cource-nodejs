const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const logger = require('@/utils/logger');
    const User = require('@/models/User');

// Serialize user
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user  
passport.deserializeUser(async (id, done) => {
  try {
    // Lazy load User model
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google OAuth Strategy - ONLY if credentials exist
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // Lazy load User model
          const User = require('@/models/User');
          
          // Check if user exists
          let user = await User.findOne({ email: profile.emails[0].value });

          if (user) {
            // User exists - update OAuth info if needed
            if (!user.providerId) {
              user.provider = 'google';
              user.providerId = profile.id;
              await user.save();
            }
            return done(null, user);
          }

          // Create new user
          user = await User.create({
            name: profile.displayName,
            email: profile.emails[0].value,
            provider: 'google',
            providerId: profile.id,
            isVerified: true,
          });

          logger.info(`New user created via Google OAuth: ${user.email}`);
          done(null, user);
        } catch (error) {
          logger.error('Google OAuth error:', error);
          done(error, null);
        }
      }
    )
  );
  logger.info('✓ Google OAuth Strategy configured');
} else {
  logger.warn('⚠ Google OAuth credentials not found - OAuth disabled');
}

module.exports = passport;