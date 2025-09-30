const { logger, ResponseFormatter } = require("@/utils");
const { validationResult } = require("express-validator");

/**
 * Validation Error Handler
 * Processes validation results and returns formatted errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      field: error.param,
      message: error.msg,
      value: error.value
    }));

    logger.warn('Validation failed:', {
      errors: formattedErrors,
      url: req.originalUrl,
      method: req.method,
      body: req.body,
      userId: req.user?.id
    });

    return ResponseFormatter.validationError(res, formattedErrors );
  }
  
  next();
};

module.exports = handleValidationErrors;