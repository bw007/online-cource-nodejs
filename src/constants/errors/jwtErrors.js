module.exports = {
  GENERATE_ACCESS: {
    message: 'Failed to generate access token',
    code: 'JWT_GENERATE_ACCESS_ERROR'
  },
  GENERATE_REFRESH: {
    message: 'Failed to generate refresh token',
    code: 'JWT_GENERATE_REFRESH_ERROR'
  },
  VERIFY_ACCESS: {
    message: 'Failed to verify access token',
    code: 'JWT_VERIFY_ACCESS_ERROR'
  },
  VERIFY_REFRESH: {
    message: 'Failed to verify refresh token',
    code: 'JWT_VERIFY_REFRESH_ERROR'
  },
  INVALID_ACCESS: {
    message: 'Invalid access token',
    code: 'JWT_INVALID_ACCESS_TOKEN'
  },
  INVALID_REFRESH: {
    message: 'Invalid refresh token',
    code: 'JWT_INVALID_REFRESH_TOKEN'
  },
  ACCESS_EXPIRED: {
    message: 'Access token expired',
    code: 'JWT_ACCESS_TOKEN_EXPIRED'
  },
  REFRESH_EXPIRED: {
    message: 'Refresh token expired',
    code: 'JWT_REFRESH_TOKEN_EXPIRED'
  },
  INVALID_TYPE_ACCESS: {
    message: 'Invalid token type (expected access)',
    code: 'JWT_INVALID_ACCESS_TYPE'
  },
  INVALID_TYPE_REFRESH: {
    message: 'Invalid token type (expected refresh)',
    code: 'JWT_INVALID_REFRESH_TYPE'
  },
  DECODE: {
    message: 'Failed to decode token',
    code: 'JWT_DECODE_ERROR'
  },
  REMAINING_TIME: {
    message: 'Failed to calculate token remaining time',
    code: 'JWT_REMAINING_TIME_ERROR'
  },
  MISSING_TOKEN: {
    message: 'Token is required',
    code: 'JWT_MISSING_TOKEN'
  },
  MALFORMED_TOKEN: {
    message: 'Token is malformed',
    code: 'JWT_MALFORMED_TOKEN'
  },
  TOKEN_VERSION_MISMATCH: {
    message: 'Invalid session. Please login again.',
    code: 'JWT_TOKEN_VERSION_MISMATCH'
  }
};