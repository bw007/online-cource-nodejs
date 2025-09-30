const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');
const fs = require('fs');
const { logger } = require('@/utils');

/**
 * Check if directory exists and has JS files
 */
const hasJSFiles = (dirPath) => {
  try {
    if (!fs.existsSync(dirPath)) {
      return false;
    }
    
    const files = fs.readdirSync(dirPath, { recursive: true });
    return files.some(file => file.endsWith('.js'));
  } catch (error) {
    return false;
  }
};

/**
 * Safely create Swagger specs with error handling
 */
const createSpecs = () => {
  try {
    const apis = [];
    
    // Always include schemas and paths (these should exist)
    const schemasPath = path.join(__dirname, './schemas/**/*.js');
    const pathsPath = path.join(__dirname, './paths/**/*.js');
    
    apis.push(schemasPath);
    apis.push(pathsPath);
    
    // Conditionally add routes if they exist
    const routesDir = path.join(__dirname, '../routes');
    if (hasJSFiles(routesDir)) {
      apis.push(path.join(__dirname, '../routes/**/*.js'));
      logger.info('Including routes in Swagger documentation');
    } else {
      logger.warn('Routes directory not found or empty - skipping routes scan');
    }
    
    // Conditionally add controllers if they exist
    const controllersDir = path.join(__dirname, '../controllers');
    if (hasJSFiles(controllersDir)) {
      apis.push(path.join(__dirname, '../controllers/**/*.js'));
      logger.info('Including controllers in Swagger documentation');
    } else {
      logger.warn('Controllers directory not found or empty - skipping controllers scan');
    }

    const swaggerOptions = {
      definition: {
        openapi: '3.0.0',
        info: { 
          title: 'Video Course Platform API', 
          version: '1.0.0', 
          description: 'Online video course platform API documentation',
          contact: {
            name: 'API Support',
            email: 'support@example.com'
          }
        },
        servers: [
          { 
            url: process.env.BASE_URL || 'http://localhost:3000/api', 
            description: 'Development server' 
          }
        ],
        components: {
          securitySchemes: { 
            bearerAuth: { 
              type: 'http', 
              scheme: 'bearer', 
              bearerFormat: 'JWT',
              description: 'JWT Authorization header using the Bearer scheme'
            } 
          }
        },
        security: [{ bearerAuth: [] }],
        // swaggerOptions.js ichida tags qismini yangilash
        tags: [
          {
            name: 'Authentication',
            description: 'User authentication and registration endpoints',
            externalDocs: {
              description: 'Auth documentation',
              url: 'https://docs.example.com/auth'
            }
          },
          {
            name: 'OAuth',
            description: 'OAuth authentication with Google and other providers'
          },
          {
            name: 'Public',
            description: 'Public endpoints accessible without authentication - browse courses and preview lessons'
          },
          {
            name: 'Student',
            description: 'Student-specific endpoints - course enrollment, progress tracking, and learning management'
          },
          {
            name: 'Admin - Courses',
            description: 'Course management operations for administrators - create, update, publish, and delete courses'
          },
          {
            name: 'Admin - Lessons',
            description: 'Lesson management operations for administrators - create lessons, manage videos, and control publishing'
          },
          {
            name: 'Upload',
            description: 'File upload endpoints for videos, images, and documents'
          },
          {
            name: 'Analytics',
            description: 'Analytics and reporting endpoints for admin dashboard'
          },
          {
            name: 'Video Streaming',
            description: 'Video streaming and playback endpoints'
          }
        ]
      },
      apis: apis,
    };

    const specs = swaggerJsdoc(swaggerOptions);
    logger.info(`Swagger documentation generated successfully with ${apis.length} API sources`);
    return specs;
    
  } catch (error) {
    logger.error('Error creating Swagger specs:', error);
    
    // Return minimal specs if there's an error
    return {
      openapi: '3.0.0',
      info: { 
        title: 'API Documentation', 
        version: '1.0.0',
        description: 'API documentation (limited due to configuration error)'
      },
      paths: {},
      components: {}
    };
  }
};

module.exports = {
  swaggerOptions: createSpecs,
  createSpecs
};