import { HTTP_STATUS } from "../config/constants.js";

// Standard API response utility
export class ApiResponse {
  static success(res, data = null, message = "Success", statusCode = HTTP_STATUS.OK) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    });
  }

  static error(res, message = "Error occurred", statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR, error = null) {
    const response = {
      success: false,
      message,
      timestamp: new Date().toISOString()
    };

    if (error && process.env.NODE_ENV === 'development') {
      response.error = error.message || error;
    }

    return res.status(statusCode).json(response);
  }

  static created(res, data = null, message = "Resource created successfully") {
    return this.success(res, data, message, HTTP_STATUS.CREATED);
  }

  static badRequest(res, message = "Bad request", errors = null) {
    const response = {
      success: false,
      message,
      timestamp: new Date().toISOString()
    };

    if (errors) {
      response.errors = errors;
    }

    return res.status(HTTP_STATUS.BAD_REQUEST).json(response);
  }

  static unauthorized(res, message = "Unauthorized") {
    return this.error(res, message, HTTP_STATUS.UNAUTHORIZED);
  }

  static forbidden(res, message = "Forbidden") {
    return this.error(res, message, HTTP_STATUS.FORBIDDEN);
  }

  static notFound(res, message = "Resource not found") {
    return this.error(res, message, HTTP_STATUS.NOT_FOUND);
  }

  static conflict(res, message = "Resource conflict") {
    return this.error(res, message, HTTP_STATUS.CONFLICT);
  }

  static validationError(res, errors) {
    return this.badRequest(res, "Validation failed", errors);
  }

  static paginated(res, data, pagination) {
    return this.success(res, {
      data,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
        totalPages: pagination.totalPages,
        hasNext: pagination.page < pagination.totalPages,
        hasPrev: pagination.page > 1
      }
    }, "Data retrieved successfully");
  }
}

// Error response helper
export const createErrorResponse = (message, statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR, details = null) => {
  return {
    success: false,
    message,
    statusCode,
    details,
    timestamp: new Date().toISOString()
  };
};

// Success response helper
export const createSuccessResponse = (data = null, message = "Success") => {
  return {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  };
}; 