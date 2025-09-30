const { ROLES } = require("@/constants/enums");
const { authErrors, commonErrors } = require("@/constants/errors");
const { logger, ResponseFormatter } = require("@/utils");

/**
 * Authorization Middleware Factory
 * Checks if user has required role(s)
 * 
 * @param {string|string[]} allowedRoles - Required role(s)
 * @returns {Function} Middleware function
 */
const authorize = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return ResponseFormatter.unauthorized(res, commonErrors.UNAUTHORIZED);
    }

    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    
    if (!roles.includes(req.user.role)) {
      logger.warn(`Authorization failed for user ${req.user.id}, required: ${roles}, has: ${req.user.role}`);
      return ResponseFormatter.forbidden(res, commonErrors.FORBIDDEN);
    }

    next();
  };
};

/**
 * Any Authenticated User
 */
const requireAuth = authorize([ROLES.ADMIN, ROLES.STUDENT]);

/**
 * Admin Only Middleware
 */
const requireAdmin = authorize([ROLES.ADMIN]);

/**
 * Student Only Middleware  
 */
const requireStudent = authorize([ROLES.STUDENT]);

module.exports = {
  authorize,
  requireAdmin,
  requireStudent,
  requireAuth
}