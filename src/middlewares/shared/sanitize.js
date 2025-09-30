const xss = require('xss');

/**
 * Production-ready Sanitization Middleware
 */
const sanitizeInput = (req, res, next) => {
  try {
    // Sanitize request body
    if (req.body && typeof req.body === 'object') {
      req.body = sanitizeAndCleanObject(req.body);
    }
    
    // Sanitize query parameters  
    if (req.query && typeof req.query === 'object') {
      req.query = sanitizeAndCleanObject(req.query);
    }
    
    // Sanitize URL parameters
    if (req.params && typeof req.params === 'object') {
      req.params = sanitizeAndCleanObject(req.params);
    }
    
    next();
  } catch (error) {
    console.error('Sanitization error:', error);
    next();
  }
};

/**
 * Sanitize va MongoDB injection prevent
 * @param {*} obj - Object to clean
 * @returns {*} Cleaned object
 */
const sanitizeAndCleanObject = (obj) => {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (typeof obj !== 'object') {
    return sanitizeValue(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(sanitizeAndCleanObject);
  }
  
  const cleaned = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof key === 'string' && key.startsWith('$')) {
      console.warn(`Blocked MongoDB operator: ${key}`);
      continue;
    }
    
    // NoSQL injection prevention: dangerous patterns
    if (typeof key === 'string' && isDangerousKey(key)) {
      console.warn(`Blocked dangerous key: ${key}`);
      continue;
    }
    
    const cleanKey = sanitizeValue(key);
    cleaned[cleanKey] = sanitizeAndCleanObject(value);
  }
  
  return cleaned;
};

/**
 * XSS
 * @param {*} value - Value to sanitize
 * @returns {*} Sanitized value
 */
const sanitizeValue = (value) => {
  if (typeof value !== 'string') {
    return value;
  }
  
  // XSS prevention
  let sanitized = xss(value, {
    whiteList: {},
    stripIgnoreTag: true,
    stripIgnoreTagBody: ['script', 'style'],
    css: false
  });
  
  // Trim whitespace
  sanitized = sanitized.trim();
  
  // Additional dangerous patterns
  sanitized = sanitized.replace(/javascript:/gi, '');
  sanitized = sanitized.replace(/data:/gi, '');
  sanitized = sanitized.replace(/vbscript:/gi, '');
  
  return sanitized;
};

/**
 * Dangerous key patterns check
 * @param {string} key - Key to check
 * @returns {boolean} Is dangerous
 */
const isDangerousKey = (key) => {
  const dangerousPatterns = [
    /^\$/, // MongoDB operators
    /^__proto__$/, // Prototype pollution
    /^constructor$/, // Constructor pollution
    /^prototype$/, // Prototype pollution
    /eval/i, // eval injection
    /function/i, // function injection
  ];
  
  return dangerousPatterns.some(pattern => pattern.test(key));
};

/**
 * Input validation middleware
 */
const validateInput = (req, res, next) => {
  // Request body size check (10MB limit)
  if (req.body && JSON.stringify(req.body).length > 10 * 1024 * 1024) {
    return res.status(413).json({
      success: false,
      message: 'Request body too large',
      code: 'PAYLOAD_TOO_LARGE'
    });
  }
  
  // Content-Type check for POST/PUT requests
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentType = req.get('Content-Type');
    if (contentType && !contentType.includes('application/json') && !contentType.includes('multipart/form-data')) {
      if (req.body && Object.keys(req.body).length > 0) {
        console.warn(`Unexpected content type: ${contentType} with body data`);
      }
    }
  }
  
  next();
};

/**
 * Rate limiting helper
 * Suspicious activity detection
 */
const detectSuspiciousActivity = (req, res, next) => {
  const suspiciousPatterns = [
    /\b(union|select|insert|delete|drop|create|alter)\b/i, // SQL injection attempts
    /<script.*?>.*?<\/script>/gi, // Script tags
    /javascript:/gi, // JavaScript protocol
    /on\w+\s*=/gi, // Event handlers
  ];
  
  const requestString = JSON.stringify({
    body: req.body,
    query: req.query,
    params: req.params
  });
  
  const suspicious = suspiciousPatterns.some(pattern => pattern.test(requestString));
  
  if (suspicious) {
    console.warn('Suspicious activity detected:', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.originalUrl,
      method: req.method
    });
  }
  
  next();
};

module.exports = {
  sanitizeInput,
  validateInput,
  detectSuspiciousActivity,
  sanitizeAndCleanObject,
  sanitizeValue
};