const winston = require('winston');
const path = require('path');
const fs = require('fs');

const ROOT_PATH = process.cwd();
const logDir = path.join(ROOT_PATH, 'logs');

// Create logs directory if it does not exist
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// Custom formats
const { combine, timestamp, printf, colorize, errors, json } = winston.format;

// Console format (for development) - FIXED
const consoleFormat = printf(({ level, message, timestamp, stack, service, environment, ...meta }) => {
  let log = `${timestamp} [${level}] [${service}]: ${stack || message}`;
  
  // Add metadata if present (exclude service and environment from meta display)
  const cleanMeta = { ...meta };
  delete cleanMeta.service;
  delete cleanMeta.environment;
  
  if (Object.keys(cleanMeta).length > 0) {
    log += ` | ${JSON.stringify(cleanMeta)}`;
  }
  
  return log;
});

// File format (for production)
const fileFormat = printf(({ level, message, timestamp, stack, ...meta }) => {
  let log = `${timestamp} [${level.toUpperCase()}]: ${stack || message}`;
  
  // Add metadata if present
  if (Object.keys(meta).length > 0) {
    log += `\nMetadata: ${JSON.stringify(meta, null, 2)}`;
  }
  
  return log;
});

// Winston logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  format: combine(
    errors({ stack: true }), // Capture error stack traces
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' })
  ),
  defaultMeta: {
    service: 'video-course-api',
    environment: process.env.NODE_ENV || 'development'
  },
  transports: [
    // Error logs (only error level)
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      format: combine(fileFormat),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    
    // Combined logs (all levels)
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      format: combine(fileFormat),
      maxsize: 5242880, // 5MB
      maxFiles: 10
    }),

    // JSON format (for parsing)
    new winston.transports.File({
      filename: path.join(logDir, 'app.json'),
      format: combine(json()),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ],
  
  // Uncaught exception handling
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logDir, 'exceptions.log')
    })
  ],
  
  // Unhandled promise rejection handling
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logDir, 'rejections.log')
    })
  ]
});

// Add console logging for development environment - FIXED
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: combine(
      colorize({ all: true }), // Changed from false to true
      timestamp({ format: 'HH:mm:ss' }),
      consoleFormat
    ),
    level: 'debug'
  }));
}

// Add helper methods
logger.logRequest = (req, res, duration) => {
  logger.info(`${req.method} ${req.originalUrl}`, {
    method: req.method,
    url: req.originalUrl,
    statusCode: res.statusCode,
    duration: `${duration}ms`,
    userAgent: req.get('User-Agent'),
    ip: req.ip
  });
};

logger.logError = (error, req = null) => {
  const errorInfo = {
    message: error.message,
    stack: error.stack,
    name: error.name
  };
  
  if (req) {
    errorInfo.request = {
      method: req.method,
      url: req.originalUrl,
      body: req.body,
      params: req.params,
      query: req.query,
      ip: req.ip
    };
  }
  
  logger.error('Application Error', errorInfo);
};

// For database operations
logger.logDB = (operation, collection, query = null, duration = null) => {
  logger.debug(`Database ${operation}`, {
    operation,
    collection,
    query,
    duration: duration ? `${duration}ms` : null
  });
};

// Authentication logs
logger.logAuth = (action, userId, success = true, details = {}) => {
  logger.info(`Auth ${action}`, {
    action,
    userId,
    success,
    ...details
  });
};

module.exports = logger;