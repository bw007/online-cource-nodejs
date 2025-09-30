const passport = require('passport');

/**
 * Simple OAuth middleware for Google authentication
 */

// Google OAuth initiation
const googleAuth = passport.authenticate('google', { 
  scope: ['profile', 'email'],
  session: false
});

// Google OAuth callback handler
const googleCallback = passport.authenticate('google', { 
  failureRedirect: process.env.FRONTEND_URL + '/login?error=oauth_failed',
  session: false
});

module.exports = {
  googleAuth,
  googleCallback
};