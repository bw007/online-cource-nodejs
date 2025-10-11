const jwt = require('jsonwebtoken');

const { logger } = require('@utils');
const { jwtErrors } = require('@constants/errors');

/**
 * JWT configuration and helper methods for generating,
 * verifying, decoding, and handling tokens.
 */
class JWTConfig {
  constructor() {
    /**
     * @type {string}
     */
    this.secretKey = process.env.JWT_SECRET;

    /**
     * @type {string}
     */
    this.refreshSecretKey = process.env.JWT_REFRESH_SECRET;

    /**
     * @type {string}
     */
    this.accessTokenExpiry = process.env.JWT_EXPIRES_IN || '7d';

    /**
     * @type {string}
     */
    this.refreshTokenExpiry = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
  }

  /**
   * Creates an access token with user data.
   * 
   * @param {Object} payload - User info for token
   * @returns {string} - Signed access token
   * @throws {Error} - If token generation fails
   */
  generateAccessToken(payload) {    
    try {
      const token = jwt.sign(
        {
          id: payload.id || payload._id,
          role: payload.role,
          email: payload.email,
          tokenVersion: payload.tokenVersion,
          type: 'access'
        },
        this.secretKey,
        {
          expiresIn: this.accessTokenExpiry,
          issuer: 'visually-impaired-system',
          audience: 'system-users'
        }
      );

      return token;
    } catch (error) {
      logger.error('Failed to generate access token', error);
      throw new Error(JSON.stringify(jwtErrors.GENERATE_ACCESS));
    }
  }

  /**
   * Creates a refresh token with user data.
   * 
   * @param {Object} payload - User info for token
   * @returns {string} - Signed refresh token
   * @throws {Error} - If token generation fails
   */
  generateRefreshToken(payload) {
    try {
      const token = jwt.sign(
        {
          id: payload.id || payload._id,
          tokenVersion: payload.tokenVersion,
          type: 'refresh'
        },
        this.refreshSecretKey,
        { 
          expiresIn: this.refreshTokenExpiry,
          issuer: 'visually-impaired-system',
          audience: 'system-users'
        }
      );
      return token;
    } catch (error) {
      logger.error('Failed to generate refresh token', error);
      throw new Error(JSON.stringify(jwtErrors.GENERATE_REFRESH));
    }
  }

   /**
   * Verifies and decodes an access token.
   * 
   * @param {string} token - Access token
   * @returns {Object} - Decoded token
   * @throws {Error} - If verification fails
   */
  verifyAccessToken(token) {
    try {
      if (!token) {
        logger.warn('Token is required');
        throw new Error(JSON.stringify(jwtErrors.MISSING_TOKEN));
      }

      const decoded = jwt.verify(token, this.secretKey);
      
      if (decoded.type !== 'access') {
        logger.warn('Invalid token type (expected access)');
        throw new Error(JSON.stringify(jwtErrors.INVALID_TYPE_ACCESS));
      }
      
      return decoded;
    } catch (error) {
      if (error.message?.startsWith('{')) {
        throw error;
      }

      logger.warn('Failed to verify access token', error);
      
      if (error.name === 'TokenExpiredError') {
        throw new Error(JSON.stringify(jwtErrors.ACCESS_EXPIRED));
      } else if (error.name === 'JsonWebTokenError') {
        throw new Error(JSON.stringify(jwtErrors.INVALID_ACCESS));
      } else {
        throw new Error(JSON.stringify(jwtErrors.VERIFY_ACCESS));
      }
    }
  }

  /**
   * Verifies and decodes a refresh token.
   * 
   * @param {string} token - Refresh token
   * @returns {Object} - Decoded token
   * @throws {Error} - If verification fails
   */
  verifyRefreshToken(token) {
    try {
      if (!token) {
        logger.warn('Token is required');
        throw new Error(JSON.stringify(jwtErrors.MISSING_TOKEN));
      }

      const decoded = jwt.verify(token, this.refreshSecretKey);

      if (decoded.type !== 'refresh') {
        logger.warn('Invalid token type (expected refresh)');
        throw new Error(jwtErrors.INVALID_TYPE_REFRESH);
      }

      return decoded;
    } catch (error) {
      if (error.message?.startsWith('{')) {
        throw error;
      }

      logger.warn('Failed to verify refresh token', error);

      if (error.name === 'TokenExpiredError') {
        throw new Error(JSON.stringify(jwtErrors.REFRESH_EXPIRED));
      } else if (error.name === 'JsonWebTokenError') {
        throw new Error(JSON.stringify(jwtErrors.INVALID_REFRESH));
      } else {
        throw new Error(JSON.stringify(jwtErrors.VERIFY_REFRESH));
      }
    }
  }

  /**
   * Decodes a token without verifying it.
   * 
   * @param {string} token - JWT string
   * @returns {Object} - Decoded token payload
   * @throws {Error} - If decoding fails
   */
  decodeToken(token) {
    try {
      if (!token) {
        throw new Error(JSON.stringify(jwtErrors.MISSING_TOKEN));
      }

      const decoded = jwt.decode(token);
      
      if (!decoded) {
        throw new Error(JSON.stringify(jwtErrors.MALFORMED_TOKEN));
      }
      
      return decoded;
    } catch (error) {
      if (error.message.startsWith('{')) {
        throw error;
      }

      logger.error('Failed to decode token', error);
      throw new Error(JSON.stringify(jwtErrors.DECODE));
    }
  }

  /**
   * Checks if a token is expired.
   * 
   * @param {string} token - JWT string
   * @returns {boolean} - True if expired, false if valid
   */
  isTokenExpired(token) {
    try {
      const decoded = this.decodeToken(token);
      const currentTime = Math.floor(Date.now() / 1000);
      return decoded.exp < currentTime;
    } catch (error) {
      logger.warn('Failed to calculate token remaining time');
      return true;
    }
  }

  /**
   * Returns time left before token expires (in seconds).
   * 
   * @param {string} token - JWT string
   * @returns {number} - Remaining time in seconds
   */
  getTokenRemainingTime(token) {
    try {
      const decoded = this.decodeToken(token);
      
      if (!decoded.exp) {
        throw new Error(JSON.stringify(jwtErrors.REMAINING_TIME));
      }
      
      const currentTime = Math.floor(Date.now() / 1000);
      return Math.max(0, decoded.exp - currentTime);
    } catch (error) {
      if (error.message.startsWith('{')) {
        throw error;
      }
      
      logger.warn('Failed to calculate token remaining time', error);
      return 0;
    }
  }

  /**
   * Compares token's version with expected version.
   * 
   * @param {string} token - JWT string
   * @param {number} expectedVersion - Expected token version
   * @returns {boolean} - True if versions match
   */
  validateTokenVersion(token, expectedVersion) {
    try {
      const decoded = this.decodeToken(token);
      return decoded.tokenVersion === expectedVersion;
    } catch (error) {
      return false;
    }
  }

  /**
   * Extracts user info from a token.
   * 
   * @param {string} token - JWT string
   * @returns {Object} - User data from token
   */
  getTokenInfo(token) {
    try {
      const decoded = this.decodeToken(token);
      return {
        id: decoded.id,
        role: decoded.role,
        email: decoded.email,
        type: decoded.type,
        exp: decoded.exp,
        iat: decoded.iat,
        tokenVersion: decoded.tokenVersion
      };
    } catch (error) {
      throw error;
    }
  }
}

const jwtConfig = new JWTConfig();
module.exports = jwtConfig;