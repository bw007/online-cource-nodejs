const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const { logger } = require('@utils');
const { notFoundHandler, errorHandler } = require('./errors');

function setupBasicMiddleware(app) {
  // CORS config
  const corsOptions = {
    origin: process.env.NODE_ENV === 'production' 
      ? process.env.ALLOWED_ORIGINS?.split(',') 
      : ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
  };

  app.use(cors(corsOptions));

  // Cookie parser
  app.use(cookieParser());

  // Security headers
  app.use(helmet({
    contentSecurityPolicy: process.env.NODE_ENV === 'production',
    crossOriginEmbedderPolicy: false
  }));

  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Dev request logging
  if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
  }
  
  logger.info('Basic middleware configured');
};

function setupErrorMiddleware(app) {
  // Error handlers
  app.use(notFoundHandler);
  app.use(errorHandler);
}

module.exports = { setupBasicMiddleware, setupErrorMiddleware };