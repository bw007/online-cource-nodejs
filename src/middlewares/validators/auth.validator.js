const { body, param } = require('express-validator');
const { ROLE_VALUES, PROVIDER_VALUES } = require('@/constants/enums');

const authValidators = {
  // Signin validation
  signin: [
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email address')
      .normalizeEmail()
      .trim(),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .trim(),
    body('rememberMe')
      .optional()
      .isBoolean()
      .withMessage('Remember me must be a boolean value')
  ],

  // Signup validation
  signup: [
    body('name')
      .isLength({ min: 2, max: 200 })
      .withMessage('Name must be between 2 and 200 characters')
      .trim(),
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email address')
      .normalizeEmail()
      .trim(),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number')
      .trim()
  ],

  // Link account validation
  linkAccount: [
    body('provider')
      .isIn(PROVIDER_VALUES)
      .withMessage(`Provider must be one of: ${PROVIDER_VALUES.join(', ')}`),
    body('providerId')
      .notEmpty()
      .withMessage('Provider ID is required')
      .trim()
  ],

  // Refresh token validation
  refreshToken: [
    body('refreshToken')
      .optional()
      .isJWT()
      .withMessage('Invalid refresh token format')
  ]
};

module.exports = authValidators;