const { default: mongoose } = require("mongoose");
const { logger } = require("@utils");

/**
 * Handles MongoDB database connection using Mongoose.
 */
class Database {
  constructor() {
    /**
     * @type {mongoose.Mongoose | null}
     */
    this.connection = null;
  }

  /**
   * Connects to MongoDB using Mongoose.
   * Sets up connection event listeners.
   * Exits the process if connection fails.
   *
   * @returns {Promise<void>}
   */
  async connect() {
    try {
      /**
       * Mongoose connection options.
       * - maxPoolSize: Number of connections to keep in pool.
       * - serverSelectionTimeoutMS: Timeout for trying to connect to server.
       * - socketTimeoutMS: Time to wait before closing inactive sockets.
       */
      const options = {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      };

      this.connection = await mongoose.connect(process.env.MONGODB_URI, options);
  
      logger.info('Successfully connected to MongoDB');
      logger.info(`Database: ${this.connection.connection.name}`);

      // MongoDB connection event handlers
      const dbConnection = this.connection.connection;

      dbConnection.on('error', (err) => {
        logger.error('MongoDB error:', err);
      });

      dbConnection.on('disconnected', () => {
        logger.warn('MongoDB disconnected');
      });

      dbConnection.on('reconnected', () => {
        logger.info('MongoDB reconnected');
      });

    } catch (error) {
      logger.error('Failed to connect to MongoDB:', error.message);
      process.exit(1);
    }
  }

  /**
   * Closes the current MongoDB connection.
   *
   * @returns {Promise<void>}
   */
  async disconnect() {
    try {
      if (this.connection) {
        await mongoose.connection.close();
        logger.info('MongoDB connection closed');
      }
    } catch (error) {
      logger.error('Error while closing MongoDB connection:', error.message);
    }
  }

  /**
   * Returns the active MongoDB connection instance.
   *
   * @returns {mongoose.Mongoose | null}
   */
  getConnection() {
    return this.connection;
  }

  /**
   * Returns the current connection status as a string.
   *
   * @returns {string} - One of: 'Disconnected', 'Connected', 'Connecting', 'Disconnecting'
   */
  getConnectionStatus() {
    const states = ['Disconnected', 'Connected', 'Connecting', 'Disconnecting'];
    const stateCode = this.connection?.connection?.readyState ?? 0;
    return states[stateCode] || 'Unknown';
  }
};

const database = new Database();
module.exports = database;