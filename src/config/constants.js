// Application constants
export const APP_CONFIG = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
  JWT_EXPIRES_IN: '24h',
  CORS_ORIGINS: ["http://localhost:3000", "http://localhost:3001", "http://localhost:5000"],
  UPLOAD_LIMIT: "20mb",
  URL_ENCODED_LIMIT: "15mb"
};

// Database constants
export const DB_CONFIG = {
  CONNECTION_TIMEOUT: 300000, // 5 minutes
  KEEP_ALIVE_INTERVAL: 4 * 60 * 1000, // 4 minutes
  MAX_CONNECTIONS: 20,
  IDLE_TIMEOUT: 30000
};

// User roles
export const USER_ROLES = {
  LEARNER: 'learner',
  FOUNDER: 'founder',
  EXISTING_FOUNDER: 'existing_founder',
  OTHER: 'other',
  ADMIN: 'admin'
};

// Approval status
export const APPROVAL_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
};

// HTTP status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500
};

// Validation rules
export const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 8,
  NAME_MIN_LENGTH: 2,
  ADDRESS_MIN_LENGTH: 10,
  EMAIL_MAX_LENGTH: 255,
  PHONE_MAX_LENGTH: 20,
  ZIP_CODE_MAX_LENGTH: 10
};

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100
};

// File upload limits
export const FILE_LIMITS = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
}; 