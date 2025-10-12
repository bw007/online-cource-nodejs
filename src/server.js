require('module-alias/register');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const config = require("@config");
const app = require("@/app");
const { initializeAdmin } = require("./init/initializeAdmin");
const { gracefulShutdown, logger } = require('@utils');
const { setupProcessErrorHandlers } = require('@/middlewares');

async function startServer() {
  try {
    const nodeEnv = process.env.NODE_ENV || 'development';
    
    // Process error handlers
    setupProcessErrorHandlers();

    // Check Environment variables
    config.validateEnvironment();

    // Database connect
    await config.database.connect();

    // initializeAdmin
    await initializeAdmin();
    
    // Run Server
    const server = app.listen(config.server.port, '0.0.0.0', () => {
      logger.info(`Server running on port ${config.server.port}`);
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
    logger.error(`Server startup error: ${error.message}`);
    logger.error(error.stack);
    process.exit(1);
  }
}

// Run server
startServer();