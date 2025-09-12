const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const { User } = require('@/models');
const { PROVIDERS } = require('@/constants/enums');
const { jwtConfig, getCookieOptions, getClearCookieOptions } = require('@/config');
const { logger, ResponseFormatter } = require('@utils');

const { commonErrors, authErrors, jwtErrors } = require('@/constants/errors');
const { authSuccess, jwtSuccess } = require('@/constants/success');

/**
 * Authentication Controller
 * Handles user authentication operations including signin, signup, verification, and logout
 */
class AuthController {

  /**
   * User signin (login) endpoint
   * Validates user credentials and returns JWT tokens
   * 
   * @async
   * @param {Object} req - Express request object
   * @param {Object} req.body - Request body
   * @param {string} req.body.email - User email
   * @param {string} req.body.password - User password
   * @param {Object} res - Express response object
   * @returns {Object} JSON response with user data and tokens
   * 
   * @example
   * POST /api/v1/auth/signin
   * {
   *   "email": "user@example.com",
   *   "password": "password123"
   * }
   * 
   * Success Response:
   * {
   *   "success": true,
   *   "message": "Login successful",
   *   "data": {
   *     "user": { "id": "...", "name": "...", "email": "...", "role": "..." },
   *     "accessToken": "...",
   *     "refreshToken": "..."
   *   }
   * }
   */
  async signin(req, res) {
    const { email, password, rememberMe = false } = req.body;

    // Validate required fields
    if (!email || !password) {
      return ResponseFormatter.badRequest(res, authErrors.MISSING_CREDENTIALS);
    }

    // Find user with password field included
    const user = await User.findOne({ email: email.toLowerCase() })
      .select('+password +refreshToken +tokenVersion');

    if (!user) {
      logger.warn(`Failed login attempt for email: ${email}`);
      return ResponseFormatter.unauthorized(res, authErrors.INVALID_CREDENTIALS);
    }    

    // Check if account is active
    if (!user.isActive) {
      return ResponseFormatter.forbidden(res, authErrors.ACCOUNT_DISABLED);
    }

    // For OAuth users, password login is not allowed
    if (user.provider !== PROVIDERS.LOCAL) {
      return ResponseFormatter.badRequest(res, authErrors.OAUTH_LOGIN_REQUIRED);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      logger.warn(`Invalid password attempt for user: ${user._id}`);
      return ResponseFormatter.unauthorized(res, authErrors.INVALID_CREDENTIALS);
    }

    // Generate new token version using UUID
    const tokenVersion = uuidv4();
    
    // Generate tokens
    const accessToken = jwtConfig.generateAccessToken({
      id: user._id,
      email: user.email,
      role: user.role,
      tokenVersion
    });

    const refreshToken = jwtConfig.generateRefreshToken({
      id: user._id,
      tokenVersion
    });

    // Update user with new tokens and login info
    await User.findByIdAndUpdate(user._id, {
      tokenVersion,
      refreshToken,
      refreshTokenExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      lastTokenRefresh: new Date(),
      lastLoginAt: new Date(),
      $inc: { loginCount: 1 }
    }, { new: true });
    
    logger.info(`User ${user._id} logged in successfully`);

    // Return user data without sensitive fields
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      isEmailVerified: user.isEmailVerified,
      enrolledCourses: user.enrolledCourses
    };

    // Set refresh token as httpOnly cookie
    res.cookie('refreshToken', refreshToken, getCookieOptions(rememberMe));

    return ResponseFormatter.success(res, {
      ...authSuccess.LOGIN_SUCCESS,
      data: { 
        user: userData, 
        accessToken, 
        refreshToken 
      }
    });
  }

  /**
   * User signup (registration) endpoint
   * Creates new user account with validation
   * 
   * @async
   * @param {Object} req - Express request object
   * @param {Object} req.body - Request body
   * @param {string} req.body.name - User full name
   * @param {string} req.body.email - User email
   * @param {string} req.body.password - User password
   * @param {Object} res - Express response object
   * @returns {Object} JSON response with created user data and tokens
   * 
   * @example
   * POST /api/v1/auth/signup
   * {
   *   "name": "John Doe",
   *   "email": "john@example.com",
   *   "password": "password123"
   * }
   * 
   * Success Response:
   * {
   *   "success": true,
   *   "message": "Registration successful",
   *   "data": {
   *     "user": { "id": "...", "name": "...", "email": "...", "role": "..." },
   *     "accessToken": "...",
   *     "refreshToken": "..."
   *   }
   * }
   */
  async signup(req, res) {
    const { name, email, password } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return ResponseFormatter.badRequest(res, authErrors.MISSING_FIELDS);
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      email: email.toLowerCase()
    });

    if (existingUser) {
      return ResponseFormatter.conflict(res, authErrors.USER_EXISTS);
    }
    
    // Generate new token version using UUID
    const tokenVersion = uuidv4();

    // Create new user
    const newUser = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      tokenVersion,
      provider: PROVIDERS.LOCAL
    });

    // Generate tokens
    const accessToken = jwtConfig.generateAccessToken({
      id: newUser._id,
      email: newUser.email,
      role: newUser.role,
      tokenVersion
    });

    const refreshToken = jwtConfig.generateRefreshToken({
      id: newUser._id,
      tokenVersion
    });

    // Update user with tokens
    await User.findByIdAndUpdate(newUser._id, {
      refreshToken,
      refreshTokenExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      lastTokenRefresh: new Date(),
      lastLoginAt: new Date(),
      loginCount: 1
    });

    logger.info(`New user registered: ${newUser._id}`);

    // Return user data without sensitive fields
    const userData = {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      avatar: newUser.avatar,
      isEmailVerified: newUser.isEmailVerified,
      enrolledCourses: newUser.enrolledCourses
    };

    return ResponseFormatter.created(res, {
      ...authSuccess.REGISTRATION_SUCCESS,
      data: { 
        user: userData, 
        accessToken, 
        refreshToken 
      }
    });
  }

  /**
   * Refresh access token using refresh token
   * 
   * @async
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} JSON response with new access token
   */
  async refreshToken(req, res) {
    // Get refresh token from cookie or request body
    const refreshToken = req.cookies.refreshToken || req.body?.refreshToken;
    
    if (!refreshToken) {
      return ResponseFormatter.unauthorized(res, jwtErrors.MISSING_TOKEN);
    }

    // Verify refresh token signature and expiration
    const decoded = jwtConfig.verifyRefreshToken(refreshToken);
    
    // Find user with token version and refresh token fields
    const user = await User.findById(decoded.id)
      .select('+refreshToken +tokenVersion');

    if (!user) {
      return ResponseFormatter.unauthorized(res, authErrors.USER_NOT_FOUND);
    }

    // Validate token version and refresh token match
    if (user.tokenVersion !== decoded.tokenVersion || user.refreshToken !== refreshToken) {
      return ResponseFormatter.unauthorized(res, authErrors.INVALID_SESSION);
    }

    // Check if refresh token has expired
    if (user.refreshTokenExpiresAt < new Date()) {
      return ResponseFormatter.unauthorized(res, jwtErrors.REFRESH_EXPIRED);
    }

    // Ensure account is still active
    if (!user.isActive) {
      return ResponseFormatter.forbidden(res, authErrors.ACCOUNT_DISABLED);
    }

    // Generate new access token with current user data
    const newTokenVersion = uuidv4();

    const newAccessToken = jwtConfig.generateAccessToken({
      id: user._id,
      email: user.email,
      role: user.role,
      tokenVersion: newTokenVersion
    });

    // Update last token refresh timestamp
    await User.findByIdAndUpdate(user._id, {
      tokenVersion: newTokenVersion,
      lastTokenRefresh: new Date()
    });

    logger.info(`Token refreshed for user: ${user._id}`);

    return ResponseFormatter.success(res, {
      ...jwtSuccess.TOKEN_REFRESHED,
      data: { 
        accessToken: newAccessToken,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    });
  }

  /**
   * Google OAuth callback handler
   * Processes Google OAuth response and creates/authenticates user
   * 
   * @async
   * @param {Object} req - Express request object
   * @param {Object} req.user - User data from Passport strategy
   * @param {Object} res - Express response object
   * @returns {Object} JSON response or redirect
   * 
   * @example
   * GET /api/auth/google/callback?code=...&state=...
   * 
   * Success Response:
   * {
   *   "success": true,
   *   "message": "Google authentication successful",
   *   "data": {
   *     "user": { "id": "...", "name": "...", "email": "...", "role": "..." },
   *     "accessToken": "...",
   *     "refreshToken": "..."
   *   }
   * }
   */
  async googleCallback(req, res) {
    // User data comes from Passport strategy
    if (!req.user) {
      logger.warn('Google OAuth callback: No user data received');
      return ResponseFormatter.unauthorized(res, authErrors.OAUTH_ERROR);
    }

    const user = req.user;

    // Check if account is active
    if (!user.isActive) {
      logger.warn(`Google OAuth: Disabled account attempted login: ${user._id}`);
      return ResponseFormatter.forbidden(res, authErrors.ACCOUNT_DISABLED);
    }

    // Generate new token version using UUID
    const tokenVersion = uuidv4();

    // Generate tokens
    const accessToken = jwtConfig.generateAccessToken({
      id: user._id,
      email: user.email,
      role: user.role,
      tokenVersion
    });

    const refreshToken = jwtConfig.generateRefreshToken({
      id: user._id,
      tokenVersion
    });

    // Update user with new tokens and login info
    await User.findByIdAndUpdate(user._id, {
      tokenVersion,
      refreshToken,
      refreshTokenExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      lastTokenRefresh: new Date(),
      lastLoginAt: new Date(),
      $inc: { loginCount: 1 }
    });

    logger.info(`Google OAuth successful for user: ${user._id}`);

    // Return user data without sensitive fields
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      isEmailVerified: user.isEmailVerified,
      enrolledCourses: user.enrolledCourses,
      provider: user.provider
    };

    // Return JSON response (for API-only apps)
    return ResponseFormatter.success(res, {
      message: 'Google authentication successful',
      data: { 
        user: userData, 
        accessToken, 
        refreshToken 
      }
    });
  }

  /**
   * OAuth account linking (optional feature)
   * Links existing local account with OAuth provider
   * 
   * @async
   * @param {Object} req - Express request object
   * @param {Object} req.user - Current authenticated user
   * @param {Object} req.body - Request body
   * @param {string} req.body.provider - OAuth provider (google, facebook, etc.)
   * @param {string} req.body.providerId - Provider user ID
   * @param {Object} res - Express response object
   * @returns {Object} JSON response
   * 
   * @example
   * POST /api/auth/link-account
   * Headers: { Authorization: "Bearer <access_token>" }
   * {
   *   "provider": "google",
   *   "providerId": "google_user_id_here"
   * }
   */
  async linkAccount(req, res) {
    const userId = req.user.id;
    const { provider, providerId } = req.body;

    if (!provider || !providerId) {
      return ResponseFormatter.badRequest(res, {
        message: 'Provider and provider ID are required',
        code: 'MISSING_OAUTH_DATA'
      });
    }

    // Check if this provider account is already linked to another user
    const existingOAuthUser = await User.findOne({ 
      provider, 
      providerId,
      _id: { $ne: userId } // Exclude current user
    });

    if (existingOAuthUser) {
      return ResponseFormatter.conflict(res, {
        message: 'This social account is already linked to another user',
        code: 'OAUTH_ACCOUNT_ALREADY_LINKED'
      });
    }

    // Update current user with OAuth info
    const user = await User.findByIdAndUpdate(
      userId,
      {
        provider,
        providerId,
        isEmailVerified: true // OAuth accounts are pre-verified
      },
      { new: true }
    ).select('-password -refreshToken -tokenVersion');

    if (!user) {
      return ResponseFormatter.notFound(res, authErrors.USER_NOT_FOUND);
    }

    logger.info(`Account linked: User ${userId} linked with ${provider}`);

    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      isEmailVerified: user.isEmailVerified,
      provider: user.provider,
      enrolledCourses: user.enrolledCourses
    };

    return ResponseFormatter.success(res, {
      message: 'Account linked successfully',
      data: { user: userData }
    });
  }

  /**
   * Unlink OAuth account (revert to local account)
   * Removes OAuth provider info and requires password setup
   * 
   * @async
   * @param {Object} req - Express request object
   * @param {Object} req.user - Current authenticated user
   * @param {Object} res - Express response object
   * @returns {Object} JSON response
   * 
   * @example
   * POST /api/auth/unlink-account
   * Headers: { Authorization: "Bearer <access_token>" }
   */
  async unlinkAccount(req, res) {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return ResponseFormatter.notFound(res, authErrors.USER_NOT_FOUND);
    }

    // Don't allow unlinking if user doesn't have a password (OAuth-only account)
    if (user.provider !== PROVIDERS.LOCAL && !user.password) {
      return ResponseFormatter.badRequest(res, {
        message: 'Cannot unlink account. Please set a password first.',
        code: 'PASSWORD_REQUIRED_FOR_UNLINK'
      });
    }

    // Update user to local provider
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        provider: PROVIDERS.LOCAL,
        providerId: null
      },
      { new: true }
    ).select('-password -refreshToken -tokenVersion');

    logger.info(`Account unlinked: User ${userId} unlinked from OAuth`);

    const userData = {
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      avatar: updatedUser.avatar,
      isEmailVerified: updatedUser.isEmailVerified,
      provider: updatedUser.provider,
      enrolledCourses: updatedUser.enrolledCourses
    };

    return ResponseFormatter.success(res, {
      message: 'Account unlinked successfully',
      data: { user: userData }
    });
  }

  /**
   * Get OAuth providers linked to current user
   * Returns list of connected social accounts
   * 
   * @async
   * @param {Object} req - Express request object
   * @param {Object} req.user - Current authenticated user
   * @param {Object} res - Express response object
   * @returns {Object} JSON response with connected providers
   * 
   * @example
   * GET /api/auth/connected-accounts
   * Headers: { Authorization: "Bearer <access_token>" }
   */
  async getConnectedAccounts(req, res) {
    const userId = req.user.id;

    const user = await User.findById(userId)
      .select('provider providerId email isEmailVerified');

    if (!user) {
      return ResponseFormatter.notFound(res, authErrors.USER_NOT_FOUND);
    }

    const connectedAccounts = {
      local: user.provider === PROVIDERS.LOCAL,
      google: user.provider === PROVIDERS.GOOGLE,
      // Add more providers as needed
      email: user.email,
      isEmailVerified: user.isEmailVerified
    };

    return ResponseFormatter.success(res, {
      message: 'Connected accounts retrieved',
      data: { connectedAccounts }
    });
  }

  /**
   * Verify user authentication status
   * Validates JWT token and returns current user data
   * Used for route protection and page refresh scenarios
   * 
   * @async
   * @param {Object} req - Express request object
   * @param {Object} req.user - User data from auth middleware
   * @param {Object} res - Express response object
   * @returns {Object} JSON response with current user data
   * 
   * @example
   * GET /api/v1/auth/verify
   * Headers: { Authorization: "Bearer <access_token>" }
   * 
   * Success Response:
   * {
   *   "success": true,
   *   "message": "User verified successfully",
   *   "data": {
   *     "user": { "id": "...", "name": "...", "email": "...", "role": "..." }
   *   }
   * }
   */
  async verify(req, res) {
    const userId = req.user.id;
    
    // Fetch current user data
    const user = await User.findById(userId)
      // .populate('enrolledCourses', 'title thumbnail')
      .select('-password -refreshToken -emailVerificationToken -passwordResetToken');

    if (!user) {
      return ResponseFormatter.notFound(res, authErrors.USER_NOT_FOUND);
    }

    // Check if account is still active
    if (!user.isActive) {
      return ResponseFormatter.forbidden(res, authErrors.ACCOUNT_DISABLED);
    }

    // Verify token version matches (session validation)
    if (req.user.tokenVersion !== user.tokenVersion) {
      return ResponseFormatter.unauthorized(res, authErrors.INVALID_SESSION);
    }

    logger.info(`User ${userId} verification successful`);

    // Return user data
    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      isEmailVerified: user.isEmailVerified,
      enrolledCourses: user.enrolledCourses,
      lastLoginAt: user.lastLoginAt
    };

    return ResponseFormatter.success(res, {
      ...authSuccess.VERIFICATION_SUCCESS,
      data: { user: userData }
    });
  }

  /**
   * User logout endpoint
   * Invalidates user session and clears refresh token
   * 
   * @async
   * @param {Object} req - Express request object
   * @param {Object} req.user - User data from auth middleware
   * @param {Object} res - Express response object
   * @returns {Object} JSON response confirming logout
   * 
   * @example
   * POST /api/v1/auth/logout
   * Headers: { Authorization: "Bearer <access_token>" }
   * 
   * Success Response:
   * {
   *   "success": true,
   *   "message": "Logout successful"
   * }
   */
  async logout(req, res) {
    const userId = req.user.id;

    // Clear refresh token and token version to invalidate all sessions
    await User.findByIdAndUpdate(userId, {
      refreshToken: null,
      refreshTokenExpiresAt: null,
      tokenVersion: null, // This invalidates all existing tokens
      lastTokenRefresh: null
    });

    res.clearCookie('refreshToken', getClearCookieOptions());

    logger.info(`User ${userId} logged out successfully`);
    return ResponseFormatter.success(res, authSuccess.LOGOUT_SUCCESS);
  }
}

// Export controller instance
const authController = new AuthController();
module.exports = authController;