require('module-alias/register');
const dotenv = require("dotenv");

if (process.env.NODE_ENV !== "production") {
  const envFilePath = `.env.${process.env.NODE_ENV || "development"}.local`;
  dotenv.config({ path: envFilePath, debug: false });
} else {
  dotenv.config(); // Railway uchun kerak — Variables’dan o‘qiydi
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
      logger.info(`✅ Server running on port ${PORT} (${process.env.NODE_ENV})`);
    });

    process.on('SIGTERM', () => gracefulShutdown(server));
    process.on('SIGINT', () => gracefulShutdown(server));
  } catch (error) {
    console.error("❌ Server error:", error);
    process.exit(1);
  }
}

startServer();
