require('module-alias/register');
const dotenv = require("dotenv");

// Environment config
const nodeEnv = process.env.NODE_ENV || "development";
const envFilePath = `.env.${nodeEnv}.local`;
dotenv.config({ path: envFilePath, debug: false });

const config = require("@config");
const app = require("@/app");
const { initializeAdmin } = require("./init/initializeAdmin");
const { gracefulShutdown, logger } = require('@utils');
const { setupProcessErrorHandlers } = require('@/middlewares');

async function startServer() {
  try {
    // Process error handlers
    setupProcessErrorHandlers();

    // Check Environment variables
    config.validateEnvironment();

    // Database connect
    await config.database.connect();

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
    logger.error(`Server running error: ${error.message}`);
    process.exit(1);
  }
};

// Run server
startServer();