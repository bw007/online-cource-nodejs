module.exports = {
  MISSING_CREDENTIALS: {
    message: "Email and password are required",
    code: "MISSING_CREDENTIALS",
  },
  MISSING_FIELDS: {
    message: "Name, email and password are required",
    code: "MISSING_FIELDS",
  },
  INVALID_CREDENTIALS: {
    message: "Invalid email or password",
    code: "INVALID_CREDENTIALS",
  },
  USER_EXISTS: {
    message: "User with this email already exists",
    code: "USER_EXISTS",
  },
  USER_NOT_FOUND: {
    message: "User not found",
    code: "USER_NOT_FOUND",
  },
  ACCOUNT_DISABLED: {
    message: "Your account has been disabled. Contact support.",
    code: "ACCOUNT_DISABLED",
  },
  INVALID_SESSION: {
    message: "Invalid session. Please login again.",
    code: "INVALID_SESSION",
  },
  OAUTH_LOGIN_REQUIRED: {
    message: "Please login using your social account",
    code: "OAUTH_LOGIN_REQUIRED",
  },
  EMAIL_NOT_VERIFIED: {
    message: "Please verify your email address",
    code: "EMAIL_NOT_VERIFIED",
  },
  INVALID_RESET_TOKEN: {
    message: "Invalid or expired password reset token",
    code: "INVALID_RESET_TOKEN",
  },
  INVALID_VERIFICATION_TOKEN: {
    message: "Invalid or expired verification token",
    code: "INVALID_VERIFICATION_TOKEN",
  },
  CURRENT_PASSWORD_INCORRECT: {
    message: "Current password is incorrect",
    code: "CURRENT_PASSWORD_INCORRECT",
  },
  SAME_PASSWORD: {
    message: "New password must be different from current password",
    code: "SAME_PASSWORD",
  },
  // OAUTH ERRORS
  OAUTH_ERROR: {
    message: "OAuth authentication failed",
    code: "OAUTH_ERROR",
  },
  OAUTH_STATE_ERROR: {
    message: "OAuth state validation failed",
    code: "OAUTH_STATE_ERROR",
  },
  EMAIL_ALREADY_EXISTS_DIFFERENT_PROVIDER: {
    message: "User with this email already exists with different provider",
    code: "EMAIL_ALREADY_EXISTS_DIFFERENT_PROVIDER",
  },
};
