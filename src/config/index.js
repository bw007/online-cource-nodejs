const { logger } = require("@utils");
const database = require("./database");
const jwtConfig = require("./jwt");
const { getCookieOptions, getClearCookieOptions } = require("./cookieOptions");

/**
 * List of required environment variables.
 * Used to ensure app configuration is complete.
 * @type {string[]}
 */
const requiredEnvVars = [
  'NODE_ENV',
  'PORT', 
  'MONGODB_URI',
  'JWT_SECRET'
];

/**
 * Checks if all required environment variables are defined.
 * Logs an error and exits the app if any are missing.
 */
function validateEnvironment() {
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    logger.error('Missing required environment variables:');
    missingVars.forEach(varName => {
      console.error(`  - ${varName}`);
    });
    process.exit(1); // Stop the app if any variable is missing
  }

  logger.info('All required environment variables are set');
}

/**
 * Server config: port and environment.
 * @type {{ port: string | number, env: string }}
 */
const serverConfig = {
  port: process.env.PORT || 3000,
  env: process.env.NODE_ENV || 'development'
};

/**
 * Swagger configuration options.
 * @type {{ enabled: boolean, path: string, jsonPath: string }}
 */
const swaggerConfig = {
  enabled: process.env.SWAGGER_ENABLED !== 'false', // Default true
  path: process.env.SWAGGER_PATH || '/api-docs',
  jsonPath: process.env.SWAGGER_JSON_PATH || '/api-docs.json'
};

module.exports = {
  database,
  jwtConfig,
  getCookieOptions,
  getClearCookieOptions,
  server: serverConfig,
  swagger: swaggerConfig,
  validateEnvironment
};