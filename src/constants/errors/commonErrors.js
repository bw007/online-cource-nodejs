module.exports = {
  INTERNAL_ERROR: {
    message: "Internal server error. Please try again later.",
    code: "INTERNAL_ERROR",
  },
  UNAUTHORIZED: {
    message: "Access denied. Please login to continue.",
    code: "UNAUTHORIZED",
  },
  FORBIDDEN: {
    message: "You do not have permission to perform this action",
    code: "FORBIDDEN",
  },
  NOT_FOUND: {
    message: "Requested resource not found",
    code: "NOT_FOUND",
  },
  BAD_REQUEST: {
    message: "Invalid request data",
    code: "BAD_REQUEST",
  },
  VALIDATION_ERROR: {
    message: "Validation failed",
    code: "VALIDATION_ERROR",
  },
  DUPLICATE_ENTRY: {
    message: (field) => `${field} entry found`,
    code: "DUPLICATE_ENTRY",
  },
  TOO_MANY_REQUESTS: {
    message: "Too many requests. Please try again later.",
    code: "TOO_MANY_REQUESTS",
  },
  SERVICE_UNAVAILABLE: {
    message: "Service temporarily unavailable",
    code: "SERVICE_UNAVAILABLE",
  },
  INVALID_TOKEN: {
    message: "Invalid or expired token",
    code: "INVALID_TOKEN",
  },
  MISSING_TOKEN: {
    message: "Authentication token is required",
    code: "MISSING_TOKEN",
  },
  EXPIRED_TOKEN: {
    message: "Authentication token has expired",
    code: "EXPIRED_TOKEN",
  },
  // Body parser errors
  INVALID_JSON: {
    message: "Invalid JSON format in request body",
    code: "INVALID_JSON",
  },
  BODY_TOO_LARGE: {
    message: "Request body too large",
    code: "BODY_TOO_LARGE",
  },
  UNSUPPORTED_ENCODING: {
    message: "Unsupported content encoding",
    code: "UNSUPPORTED_ENCODING",
  },
  REQUEST_ABORTED: {
    message: "Request was aborted",
    code: "REQUEST_ABORTED",
  },
};
