const { User } = require("@/models");
const { ROLES } = require("@/constants/enums");
const { logger } = require("@/utils");

/**
 * Initializes the admin account if it doesn't exist.
 * 
 * This function checks the database for an existing admin user.
 * If none is found, it creates a new one using environment variables:
 * ADMIN_USERNAME, ADMIN_PASSWORD, ADMIN_EMAIL, etc.
 * 
 * It is intended to run during the application startup.
 *
 * @async
 * @function initializeAdmin
 * @returns {Promise<void>} No return value
 */

const initializeAdmin = async () => {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: ROLES.ADMIN });
    
    if (!existingAdmin) {
      logger.info('Admin not found. Creating a new one...');

      // Create admin
      const admin = new User({
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
        role: ROLES.ADMIN,
        name: process.env.ADMIN_NAME,
        isEmailVerified: true
      });

      // Save admin
      await admin.save({ validateBeforeSave: false });

      logger.info('Admin created successfully');
      logger.info(`Username: ${admin.email}`);
    } else {
      logger.info('Admin already exists');
    }
  } catch (error) {
    console.log(error);
    logger.error('Error while creating admin: ' + error.message);
  }
};

module.exports = { initializeAdmin };