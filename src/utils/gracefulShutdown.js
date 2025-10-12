const database = require("../config/database");
const logger = require("./logger");

// Graceful shutdown function
async function gracefulShutdown(server) {
  // logger.warn('Shutting down the server...');

  // Stop accepting new requests
  server.close(async () => {
    // logger.info('HTTP server closed');

    // Close the database connection
    await database.disconnect();

    // logger.info('Server shut down successfully');
    process.exit(0);
  });

  // Force shutdown if it takes more than 10 seconds
  setTimeout(() => {
    // logger.error('Force shutdown after timeout...');
    process.exit(1);
  }, 10000);
};

module.exports = gracefulShutdown;