require('module-alias/register');
const dotenv = require("dotenv");

console.log('=== SERVER STARTING ===');
console.log('Node version:', process.version);
console.log('Working directory:', process.cwd());

// Environment config
const nodeEnv = process.env.NODE_ENV || "development";
console.log('NODE_ENV:', nodeEnv);

// Faqat development'da .env fayl yukla
if (nodeEnv === 'development') {
  console.log('Loading .env file for development...');
  const envFilePath = `.env.${nodeEnv}.local`;
  dotenv.config({ path: envFilePath, debug: false });
} else {
  console.log('Production mode - using Railway environment variables');
}

// Environment variables tekshirish
console.log('Environment variables check:');
console.log('PORT:', process.env.PORT);
console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);
console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);

const config = require("@config");
const app = require("@/app");
const { initializeAdmin } = require("./init/initializeAdmin");
const { gracefulShutdown, logger } = require('@utils');
const { setupProcessErrorHandlers } = require('@/middlewares');

async function startServer() {
  try {
    console.log('Starting server function...');
    
    // Process error handlers
    setupProcessErrorHandlers();
    console.log('✓ Error handlers setup');

    // Check Environment variables
    console.log('Validating environment variables...');
    config.validateEnvironment();

    // Database connect
    console.log('Connecting to database...');
    await config.database.connect();

    // initializeAdmin
    console.log('Initializing admin...');
    await initializeAdmin();
    
    // Run Server
    console.log('Starting HTTP server...');
    const server = app.listen(config.server.port, '0.0.0.0', () => {
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
    console.error('=== SERVER ERROR ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    logger.error(`Server running error: ${error.message}`);
    process.exit(1);
  }
};

// Run server
console.log('Calling startServer()...');
startServer();