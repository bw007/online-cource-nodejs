require('module-alias/register');
const dotenv = require("dotenv");

// Environment config
const nodeEnv = process.env.NODE_ENV || "development";
if (nodeEnv === "development") {
  const envFilePath = `.env.${nodeEnv}.local`;
  dotenv.config({ path: envFilePath, debug: false });
}

const config = require("@config");
const app = require("@/app");
const { initializeAdmin } = require("./init/initializeAdmin");
const { gracefulShutdown, logger } = require('@utils');
const { setupProcessErrorHandlers } = require('@/middlewares');

async function startServer() {
  try {
    setupProcessErrorHandlers();
    config.validateEnvironment();

    await config.database.connect();
    await initializeAdmin();

    const PORT = process.env.PORT || config.server.port || 8080;

    const server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT} (${nodeEnv})`);
    });

    process.on('SIGTERM', () => gracefulShutdown(server));
    process.on('SIGINT', () => gracefulShutdown(server));
  } catch (error) {
    logger.error(`Server running error: ${error.message}`);
    process.exit(1);
  }
}

startServer();
