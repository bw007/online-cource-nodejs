// Step 1: Basic logs FIRST
console.log('=== SERVER STARTING ===');
console.log('Node version:', process.version);
console.log('Working directory:', process.cwd());

try {
  // Step 2: Module alias
  console.log('Loading module-alias...');
  require('module-alias/register');
  console.log('✓ Module alias loaded');

  // Step 3: Environment
  console.log('Loading environment...');
  if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
  }
  console.log('✓ Environment loaded');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('PORT:', process.env.PORT);
  console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);

  // Step 4: Config
  console.log('Loading config...');
  const config = require("@config");
  console.log('✓ Config loaded');

  // Step 5: App
  console.log('Loading app...');
  const app = require("@/app");
  console.log('✓ App loaded');

  // Step 6: Utils
  console.log('Loading utils...');
  const { initializeAdmin } = require("./init/initializeAdmin");
  const { gracefulShutdown, logger } = require('@utils');
  const { setupProcessErrorHandlers } = require('@/middlewares');
  console.log('✓ Utils loaded');

  // Step 7: Start server
  async function startServer() {
    try {
      console.log('Starting server function...');
      
      const nodeEnv = process.env.NODE_ENV || 'development';
      
      setupProcessErrorHandlers();
      console.log('✓ Error handlers setup');
      
      config.validateEnvironment();
      console.log('✓ Environment validated');
      
      await config.database.connect();
      console.log('✓ Database connected');
      
      await initializeAdmin();
      console.log('✓ Admin initialized');
      
      const server = app.listen(config.server.port, '0.0.0.0', () => {
        logger.info(`✅ Server running on port ${config.server.port}`);
        logger.info(`Environment: ${nodeEnv}`);
        logger.info(`Database: ${config.database.getConnectionStatus()}`);
      });
      
      process.on('SIGTERM', () => gracefulShutdown(server));
      process.on('SIGINT', () => gracefulShutdown(server));
      
    } catch (error) {
      console.error('❌ Server startup error:', error.message);
      console.error('Stack:', error.stack);
      process.exit(1);
    }
  }

  startServer();

} catch (error) {
  console.error('❌ Critical error during initialization:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
}