require('module-alias/register');
const dotenv = require("dotenv");

// Environment config
const nodeEnv = process.env.NODE_ENV || "production"; // production 
const envFilePath = `.env.${nodeEnv}.local`;

if (nodeEnv !== 'production') {
  dotenv.config({ path: envFilePath, debug: false });
} else {
  // Production'da Render o'z environment variables'larini beradi
  console.log('Running in production mode - using Render environment variables');
}

const config = require("@config");
const app = require("@/app");
const { initializeAdmin } = require("./init/initializeAdmin");
const { gracefulShutdown, logger } = require('@utils');
const { setupProcessErrorHandlers } = require('@/middlewares');

async function startServer() {
  try {
    // Process error handlers
    setupProcessErrorHandlers();

    logger.info(`NODE_ENV: ${process.env.NODE_ENV}`);
    logger.info(`MONGODB_URI exists: ${!!process.env.MONGODB_URI}`);
    logger.info(`PORT: ${process.env.PORT}`);

    // Check Environment variables
    config.validateEnvironment();

    // Log MongoDB URI (masking password for security)
    const mongoUri = config.database.uri || process.env.MONGODB_URI || process.env.MONGO_URI;
    if (mongoUri) {
      const maskedUri = mongoUri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');
      logger.info(`Attempting to connect to MongoDB: ${maskedUri}`);
    } else {
      logger.error('MongoDB URI not found in environment variables!');
      throw new Error('MONGODB_URI is required');
    }

    // Database connect with timeout and retry logic
    logger.info('Connecting to MongoDB...');
    const maxRetries = 3;
    let retryCount = 0;
    
    while (retryCount < maxRetries) {
      try {
        await config.database.connect();
        logger.info('Successfully connected to MongoDB!');
        break;
      } catch (dbError) {
        retryCount++;
        logger.error(`MongoDB connection attempt ${retryCount}/${maxRetries} failed: ${dbError.message}`);
        
        if (retryCount >= maxRetries) {
          throw new Error(`Failed to connect to MongoDB after ${maxRetries} attempts: ${dbError.message}`);
        }
        
        // Wait before retrying (exponential backoff)
        const waitTime = Math.min(1000 * Math.pow(2, retryCount), 10000);
        logger.info(`Retrying in ${waitTime/1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }

    // initializeAdmin
    await initializeAdmin();
    
    // Run Server
    const server = app.listen(config.server.port, () => {
      logger.info(`Server running on http://localhost:${config.server.port}/api (${nodeEnv})`);
      logger.info(`Environment: ${nodeEnv}`);
      logger.info(`Database: ${config.database.getConnectionStatus()}`);
      logger.info(`Health check: http://localhost:${config.server.port}/api/health`);

      // Swagger info
      if (config.swagger.enabled && nodeEnv !== 'production') {
        logger.info(`API Docs: http://localhost:${config.server.port}${config.swagger.path}`);
        logger.info(`API JSON: http://localhost:${config.server.port}${config.swagger.jsonPath}`);
      }
    });
    
    // Graceful shutdown
    process.on('SIGTERM', () => gracefulShutdown(server));
    process.on('SIGINT', () => gracefulShutdown(server));
    
  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
    logger.error(`Stack trace: ${error.stack}`);
    
    // Give some time for logs to flush
    setTimeout(() => {
      process.exit(1);
    }, 1000);
  }
}

// Run server
startServer();