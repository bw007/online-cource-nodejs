const { commonErrors } = require("@/constants/errors");
const httpStatus = require("@/constants/httpStatus");

/**
 * Response formatter utility
 * Provides consistent response structure across all API endpoints
 */

class ResponseFormatter {
  /**
   * timestamp
  */
  static _timestamp() {
    return new Date().toISOString();
  }

  /**
   * Builds a custom response with given status code and extra fields.
   * @param {Object} res - Express response object
   * @param {number} statusCode - HTTP status code
   * @param {boolean} success - Indicates if the response is successful
   * @param {Object} [extra={}] - Additional fields to include in the response
   * @returns {Object} JSON response
   */
  static _buildResponse(res, statusCode, success, extra = {}) {
    const response = {
      success,
      timestamp: this._timestamp(),
      ...extra
    };
    
    return res.status(statusCode).json(response);
  }
  
  /**
   * Success response (200)
   * @param {Object} res - Express response object
   * @param {Object} data - Response data
   * @returns {Object} JSON response
   */
  static success(res, data = {}) {
    const responseData = {
      message: data.message || 'Success',
      ...data
    };
    
    return this._buildResponse(res, httpStatus.OK, true, responseData);
  }

  /**
   * Created response (201)
   * @param {Object} res - Express response object
   * @param {Object} data - Response data
   * @returns {Object} JSON response
   */
  static created(res, data = {}) {
    const responseData = {
      message: data.message || 'Created successfully',
      ...data
    };
    
    return this._buildResponse(res, httpStatus.CREATED, true, responseData);
  }

  /**
   * Bad request response (400)
   * @param {Object} res - Express response object
   * @param {Object} data - Response data
   * @returns {Object} JSON response
   */
  static badRequest(res, data = {}) {
    const responseData = {
      message: data.message || 'Bad request',
      code: data.code || 'BAD_REQUEST',
      ...data
    };
    
    return this._buildResponse(res, httpStatus.BAD_REQUEST, false, responseData);
  }

  /**
   * Unauthorized response (401)
   * @param {Object} res - Express response object
   * @param {Object} data - Response data
   * @returns {Object} JSON response
   */
  static unauthorized(res, data = {}) {
    const responseData = {
      message: data.message || 'Unauthorized',
      code: data.code || 'UNAUTHORIZED',
      ...data
    };
    
    return this._buildResponse(res, httpStatus.UNAUTHORIZED, false, responseData);
  }

  /**
   * Forbidden response (403)
   * @param {Object} res - Express response object
   * @param {Object} data - Response data
   * @returns {Object} JSON response
   */
  static forbidden(res, data = {}) {
    const responseData = {
      message: data.message || 'Forbidden',
      code: data.code || 'FORBIDDEN',
      ...data
    };
    
    return this._buildResponse(res, httpStatus.FORBIDDEN, false, responseData);
  }

  /**
   * Not found response (404)
   * @param {Object} res - Express response object
   * @param {Object} data - Response data
   * @returns {Object} JSON response
   */
  static notFound(res, data = {}) {
    const responseData = {
      message: data.message || 'Not found',
      code: data.code || 'NOT_FOUND',
      ...data
    };
    
    return this._buildResponse(res, httpStatus.NOT_FOUND, false, responseData);
  }

  /**
   * Validation error response (422)
   * @param {Object} res - Express response object
   * @param {Array} errors - Validation errors
   * @param {Object} data - Additional response data
   * @returns {Object} JSON response
   */
  static validationError(res, errors = [], data = {}) {
    const defaultError = commonErrors.VALIDATION_ERROR || {};
    
    const responseData = {
      message: data.message || defaultError.message || 'Validation failed',
      code: data.code || defaultError.code || 'VALIDATION_ERROR',
      errors: errors,
      ...data
    };
    
    return this._buildResponse(res, httpStatus.VALIDATION_FAILED, false, responseData);
  }

  /**
   * Too many requests response (429)
   * @param {Object} res - Express response object
   * @param {Object} data - Response data
   * @returns {Object} JSON response
   */
  static tooManyRequests(res, data = {}) {
    const defaultError = commonErrors.TOO_MANY_REQUESTS || {};
    
    const responseData = {
      message: data.message || defaultError.message || 'Too many requests',
      code: data.code || defaultError.code || 'TOO_MANY_REQUESTS',
      ...data
    };
    
    return this._buildResponse(res, httpStatus.TOO_MANY_REQUESTS, false, responseData);
  }

  /**
   * Internal server error response (500)
   * @param {Object} res - Express response object
   * @param {Object} data - Response data
   * @returns {Object} JSON response
   */
  static internalError(res, data = {}) {
    const defaultError = commonErrors.INTERNAL_ERROR || {};
    
    const responseData = {
      message: data.message || defaultError.message || 'Internal server error',
      code: data.code || defaultError.code || 'INTERNAL_ERROR',
      ...data
    };
    
    return this._buildResponse(res, httpStatus.INTERNAL_SERVER_ERROR, false, responseData);
  }

  /**
   * Service unavailable response (503)
   * @param {Object} res - Express response object
   * @param {Object} data - Response data
   * @returns {Object} JSON response
   */
  static serviceUnavailable(res, data = {}) {
    const defaultError = commonErrors.SERVICE_UNAVAILABLE || {};
    
    const responseData = {
      message: data.message || defaultError.message || 'Service unavailable',
      code: data.code || defaultError.code || 'SERVICE_UNAVAILABLE',
      ...data
    };
    
    return this._buildResponse(res, httpStatus.SERVICE_UNAVAILABLE, false, responseData);
  }

  /**
   * Conflict response (409)
   * @param {Object} res - Express response object
   * @param {Object} data - Response data
   * @returns {Object} JSON response
   */
  static conflict(res, data = {}) {
    const responseData = {
      message: data.message || 'Conflict',
      code: data.code || 'CONFLICT',
      ...data
    };
    
    return this._buildResponse(res, httpStatus.CONFLICT, false, responseData);
  }

  /**
   * No content response (204)
   * @param {Object} res - Express response object
   * @param {Object} data - Response data (optional, for headers or metadata)
   * @returns {Object} JSON response
   */
  static noContent(res, data = {}) {
    // 204 No Content should not have a response body by HTTP specification
    // But we can set headers if needed
    if (data.headers) {
      Object.entries(data.headers).forEach(([key, value]) => {
        res.set(key, value);
      });
    }
    
    return res.status(httpStatus.NO_CONTENT).send();
  }

  /**
   * Accepted response (202)
   * @param {Object} res - Express response object
   * @param {Object} data - Response data
   * @returns {Object} JSON response
   */
  static accepted(res, data = {}) {
    const responseData = {
      message: data.message || 'Accepted',
      ...data
    };
    
    return this._buildResponse(res, httpStatus.ACCEPTED, true, responseData);
  }
}

module.exports = ResponseFormatter;