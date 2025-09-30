const { 
  commonErrors, 
  uploadErrors, 
  authErrors, 
  jwtErrors,
  adminErrors,
  courseErrors,
  lessonErrors,
  userErrors 
} = require("@/constants/errors");
const { logger, ResponseFormatter } = require("@/utils");

/**
 * Comprehensive Global Error Handler Middleware
 * Handles all possible errors in the application with dynamic constants
 */
const errorHandler = (err, req, res, next) => {
  logger.error('Global error handler:', {
    error: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id,
    errorName: err.name,
    errorCode: err.code,
    statusCode: err.status || err.statusCode
  });

  // ============ MONGOOSE ERRORS ============
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(error => ({
      field: error.path,
      message: error.message,
      value: error.value
    }));

    return ResponseFormatter.validationError(res, errors);
  }

  // Mongoose duplicate key error (11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];

    const errorDef = commonErrors.DUPLICATE_ENTRY;
    
    return ResponseFormatter.conflict(res, {
      message: typeof errorDef.message === 'function' ? errorDef.message(field) : errorDef.message,
      code: errorDef.code,
      field,
      value
    });
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    return ResponseFormatter.badRequest(res, {
      message: `Invalid ${err.path}: ${err.value}`,
      code: 'INVALID_ID',
      field: err.path,
      value: err.value
    });
  }

  // MongoDB connection errors
  if (err.name === 'MongoNetworkError' || err.name === 'MongoServerError') {
    return ResponseFormatter.serviceUnavailable(res, commonErrors.SERVICE_UNAVAILABLE);
  }

  // MongoDB timeout errors
  if (err.name === 'MongoServerSelectionError') {
    return ResponseFormatter.serviceUnavailable(res, commonErrors.SERVICE_UNAVAILABLE);
  }

  // ============ JWT ERRORS ============
  
  if (err.name === 'JsonWebTokenError') {
    return ResponseFormatter.unauthorized(res, jwtErrors.INVALID_ACCESS);
  }

  if (err.name === 'TokenExpiredError') {
    return ResponseFormatter.unauthorized(res, jwtErrors.ACCESS_EXPIRED);
  }

  if (err.name === 'NotBeforeError') {
    return ResponseFormatter.unauthorized(res, {
      message: 'Token not active yet',
      code: 'TOKEN_NOT_ACTIVE'
    });
  }

  // ============ OAUTH ERRORS ============
  
  // Passport.js OAuth errors
  if (err.name === 'GoogleStrategyError' || err.name === 'InternalOAuthError') {
    return ResponseFormatter.unauthorized(res, {
      message: authErrors.OAUTH_ERROR?.message || 'OAuth authentication failed',
      code: authErrors.OAUTH_ERROR?.code || 'OAUTH_ERROR',
      provider: err.provider || 'google'
    });
  }

  // OAuth state mismatch
  if (err.message && err.message.includes('state')) {
    return ResponseFormatter.badRequest(res, {
      message: authErrors.OAUTH_STATE_ERROR?.message || 'OAuth state validation failed',
      code: authErrors.OAUTH_STATE_ERROR?.code || 'OAUTH_STATE_ERROR'
    });
  }

  // ============ FILE UPLOAD ERRORS ============
  
  if (err.code === 'LIMIT_FILE_SIZE') {
    return ResponseFormatter.badRequest(res, {
      ...uploadErrors.FILE_TOO_LARGE,
      limit: err.limit,
      field: err.field
    });
  }

  if (err.code === 'LIMIT_FILE_COUNT') {
    return ResponseFormatter.badRequest(res, {
      ...uploadErrors.TOO_MANY_FILES,
      limit: err.limit
    });
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return ResponseFormatter.badRequest(res, {
      ...uploadErrors.UNEXPECTED_FILE,
      field: err.field
    });
  }

  if (err.code === 'LIMIT_PART_COUNT') {
    return ResponseFormatter.badRequest(res, {
      message: uploadErrors.TOO_MANY_PARTS?.message || 'Too many parts in multipart request',
      code: uploadErrors.TOO_MANY_PARTS?.code || 'TOO_MANY_PARTS'
    });
  }

  if (err.code === 'LIMIT_FIELD_COUNT') {
    return ResponseFormatter.badRequest(res, {
      message: uploadErrors.TOO_MANY_FIELDS?.message || 'Too many fields in request',
      code: uploadErrors.TOO_MANY_FIELDS?.code || 'TOO_MANY_FIELDS'
    });
  }

  if (err.code === 'LIMIT_FIELD_KEY') {
    return ResponseFormatter.badRequest(res, {
      message: uploadErrors.FIELD_NAME_TOO_LONG?.message || 'Field name too long',
      code: uploadErrors.FIELD_NAME_TOO_LONG?.code || 'FIELD_NAME_TOO_LONG'
    });
  }

  if (err.code === 'LIMIT_FIELD_VALUE') {
    return ResponseFormatter.badRequest(res, {
      message: uploadErrors.FIELD_VALUE_TOO_LONG?.message || 'Field value too long',
      code: uploadErrors.FIELD_VALUE_TOO_LONG?.code || 'FIELD_VALUE_TOO_LONG'
    });
  }

  // ============ BODY PARSER ERRORS ============
  
  // JSON parsing errors
  if (err.type === 'entity.parse.failed') {
    return ResponseFormatter.badRequest(res, {
      message: commonErrors.INVALID_JSON?.message || 'Invalid JSON format in request body',
      code: commonErrors.INVALID_JSON?.code || 'INVALID_JSON'
    });
  }

  if (err.type === 'entity.too.large') {
    return ResponseFormatter.badRequest(res, commonErrors.BAD_REQUEST);
  }

  if (err.type === 'encoding.unsupported') {
    return ResponseFormatter.badRequest(res, commonErrors.BAD_REQUEST);
  }

  if (err.type === 'request.aborted') {
    return ResponseFormatter.badRequest(res, commonErrors.BAD_REQUEST);
  }

  // ============ RATE LIMITING ERRORS ============
  
  if (err.status === 429 || err.statusCode === 429) {
    return ResponseFormatter.tooManyRequests(res, {
      ...commonErrors.TOO_MANY_REQUESTS,
      retryAfter: err.retryAfter,
      limit: err.limit
    });
  }

  // ============ VALIDATION ERRORS ============
  
  // Express-validator errors (already handled in handleValidationErrors middleware)
  if (err.name === 'ExpressValidatorError') {
    return ResponseFormatter.validationError(res, err.errors || []);
  }

  // ============ NETWORK ERRORS ============
  
  // External service errors
  if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND' || err.code === 'ETIMEDOUT') {
    return ResponseFormatter.serviceUnavailable(res, commonErrors.SERVICE_UNAVAILABLE);
  }

  // ============ CORS ERRORS ============
  
  if (err.message && err.message.includes('CORS')) {
    return ResponseFormatter.forbidden(res, commonErrors.FORBIDDEN);
  }

  // ============ SYSTEM ERRORS ============
  
  // Memory errors
  if (err.code === 'ENOMEM') {
    return ResponseFormatter.serviceUnavailable(res, commonErrors.SERVICE_UNAVAILABLE);
  }

  // File system errors
  if (err.code === 'ENOENT') {
    return ResponseFormatter.notFound(res, uploadErrors.FILE_NOT_FOUND);
  }

  if (err.code === 'EACCES' || err.code === 'EPERM') {
    return ResponseFormatter.forbidden(res, commonErrors.FORBIDDEN);
  }

  if (err.code === 'ENOSPC') {
    return ResponseFormatter.serviceUnavailable(res, commonErrors.SERVICE_UNAVAILABLE);
  }

  // ============ CUSTOM STATUS-BASED ERRORS ============
  
  if (err.status || err.statusCode) {
    const status = err.status || err.statusCode;
    
    switch (status) {
      case 400:
        return ResponseFormatter.badRequest(res, {
          message: err.message || commonErrors.BAD_REQUEST.message,
          code: err.code || commonErrors.BAD_REQUEST.code,
          details: err.details
        });
        
      case 401:
        return ResponseFormatter.unauthorized(res, {
          message: err.message || commonErrors.UNAUTHORIZED.message,
          code: err.code || commonErrors.UNAUTHORIZED.code,
          details: err.details
        });
        
      case 403:
        return ResponseFormatter.forbidden(res, {
          message: err.message || commonErrors.FORBIDDEN.message,
          code: err.code || commonErrors.FORBIDDEN.code,
          details: err.details
        });
        
      case 404:
        return ResponseFormatter.notFound(res, {
          message: err.message || commonErrors.NOT_FOUND.message,
          code: err.code || commonErrors.NOT_FOUND.code,
          details: err.details
        });
        
      case 409:
        return ResponseFormatter.conflict(res, {
          message: err.message,
          code: err.code || 'CONFLICT',
          details: err.details
        });
        
      case 422:
        return ResponseFormatter.validationError(res, err.errors || [], {
          message: err.message || commonErrors.VALIDATION_ERROR.message,
          code: err.code || commonErrors.VALIDATION_ERROR.code
        });
        
      case 500:
        return ResponseFormatter.internalError(res, {
          message: process.env.NODE_ENV === 'production' 
            ? commonErrors.INTERNAL_ERROR.message 
            : err.message || commonErrors.INTERNAL_ERROR.message,
          code: err.code || commonErrors.INTERNAL_ERROR.code
        });
        
      case 503:
        return ResponseFormatter.serviceUnavailable(res, commonErrors.SERVICE_UNAVAILABLE);
        
      default:
        return ResponseFormatter.internalError(res, commonErrors.INTERNAL_ERROR);
    }
  }

  // ============ DEFAULT FALLBACK ============
  
  // Log unhandled errors for debugging
  if (process.env.NODE_ENV !== 'production') {
    console.error('Unhandled error details:', {
      name: err.name,
      message: err.message,
      code: err.code,
      status: err.status,
      stack: err.stack
    });
  }

  // Default fallback uses constants
  return ResponseFormatter.internalError(res, {
    message: process.env.NODE_ENV === 'production' 
      ? commonErrors.INTERNAL_ERROR.message 
      : err.message || commonErrors.INTERNAL_ERROR.message,
    code: commonErrors.INTERNAL_ERROR.code
  });
};

/**
 * 404 Not Found Handler
 */
const notFoundHandler = (req, res) => {
  return ResponseFormatter.notFound(res, {
    message: `Route ${req.originalUrl} not found`,
    code: 'ROUTE_NOT_FOUND',
    path: req.originalUrl,
    method: req.method
  });
};

/**
 * Async Error Wrapper
 * Wraps async route handlers to catch errors
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Process-level error handlers
 */
const setupProcessErrorHandlers = () => {
  // Unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Don't exit in production, just log
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
  });

  // Uncaught exceptions
  process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception:', err);
    // Exit gracefully
    process.exit(1);
  });

  // Warning handler
  process.on('warning', (warning) => {
    logger.warn('Process warning:', {
      name: warning.name,
      message: warning.message,
      stack: warning.stack
    });
  });
};

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler,
  setupProcessErrorHandlers
};