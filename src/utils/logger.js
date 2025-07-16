import { APP_CONFIG } from "../config/constants.js";

// Simple logger utility
class Logger {
  constructor() {
    this.isDevelopment = APP_CONFIG.NODE_ENV === 'development';
  }

  // Log levels
  info(message, data = null) {
    const timestamp = new Date().toISOString();
    console.log(`[INFO] ${timestamp}: ${message}`);
    if (data && this.isDevelopment) {
      console.log('Data:', data);
    }
  }

  error(message, error = null) {
    const timestamp = new Date().toISOString();
    console.error(`[ERROR] ${timestamp}: ${message}`);
    if (error && this.isDevelopment) {
      console.error('Error details:', error);
    }
  }

  warn(message, data = null) {
    const timestamp = new Date().toISOString();
    console.warn(`[WARN] ${timestamp}: ${message}`);
    if (data && this.isDevelopment) {
      console.warn('Warning data:', data);
    }
  }

  debug(message, data = null) {
    if (this.isDevelopment) {
      const timestamp = new Date().toISOString();
      console.log(`[DEBUG] ${timestamp}: ${message}`);
      if (data) {
        console.log('Debug data:', data);
      }
    }
  }

  // Database logging
  dbQuery(sql, params = null) {
    if (this.isDevelopment) {
      this.debug('Database Query:', { sql, params });
    }
  }

  dbError(error, sql = null) {
    this.error('Database Error:', { error: error.message, sql });
  }

  // API request logging
  request(method, url, ip) {
    this.info(`API Request: ${method} ${url} from ${ip}`);
  }

  response(statusCode, url) {
    this.info(`API Response: ${statusCode} for ${url}`);
  }

  // Authentication logging
  authSuccess(userId, email) {
    this.info(`Authentication successful for user: ${email} (ID: ${userId})`);
  }

  authFailure(email, reason) {
    this.warn(`Authentication failed for email: ${email}, reason: ${reason}`);
  }
}

export const logger = new Logger();
export default logger; 