const { jwtConfig } = require("@/config");
const { authErrors, commonErrors } = require("@/constants/errors");
const { User } = require("@/models");
const { ResponseFormatter, logger } = require("@/utils");
const { asyncHandler } = require("@/middlewares/errors");

/**
 * Authentication Middleware
 * Verifies JWT token and sets req.user
 */
const authenticate = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return ResponseFormatter.unauthorized(res, commonErrors.MISSING_TOKEN);
  }

  const token = authHeader.substring(7); // Remove 'Bearer '
  
  // Verify access token
  const decoded = jwtConfig.verifyAccessToken(token);
  
  if (!decoded) {
    return ResponseFormatter.unauthorized(res, commonErrors.INVALID_TOKEN);
  }

  // Get user from database
  const user = await User.findById(decoded.id)
    .select('-password -refreshToken');

  if (!user) {
    return ResponseFormatter.unauthorized(res, authErrors.USER_NOT_FOUND);
  }

  // Check if user is active
  if (!user.isActive) {
    return ResponseFormatter.forbidden(res, authErrors.ACCOUNT_DISABLED);
  }

  // Check token version (session validation)
  if (decoded.tokenVersion !== user.tokenVersion) {
    return ResponseFormatter.unauthorized(res, authErrors.INVALID_SESSION);
  }

  // Set user info in request
  req.user = {
    id: user._id,
    email: user.email,
    role: user.role,
    tokenVersion: user.tokenVersion
  };
  
  next();
});

/**
 * Optional Authentication Middleware
 * Sets req.user if token exists, but doesn't require it
 */
const optionalAuth = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(); // Continue without authentication
  }

  const token = authHeader.substring(7);
  const decoded = jwtConfig.verifyAccessToken(token);
  
  if (decoded) {
    const user = await User.findById(decoded.id).select('-password -refreshToken');
    
    if (user && user.isActive && decoded.tokenVersion === user.tokenVersion) {
      req.user = {
        id: user._id,
        email: user.email,
        role: user.role,
        tokenVersion: user.tokenVersion
      };
    }
  }
  
  next();
});

module.exports = {
  authenticate,
  optionalAuth,
};