import jwt from "jsonwebtoken";
import { ApiResponse } from "../utils/response.js";
import logger from "../utils/logger.js";

// Legacy authentication middleware (for backward compatibility)
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return ApiResponse.unauthorized(res, "No token provided or invalid format");
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach only specific fields to req.user
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };
    
    logger.debug("Token verified successfully", { userId: decoded.id });
    next();
  } catch (err) {
    logger.error("JWT verification failed:", err);
    
    if (err.name === "TokenExpiredError") {
      return ApiResponse.unauthorized(res, "Token expired. Please login again.");
    }
    
    return ApiResponse.unauthorized(res, "Invalid or expired token");
  }
};

// Legacy admin authentication middleware
export const authenticateForAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return ApiResponse.unauthorized(res, "No token provided or invalid format");
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    
    // Check if user is admin
    if (req.user.role !== "admin") {
      return ApiResponse.forbidden(res, "Access denied. Admin only.");
    }

    logger.debug("Admin access granted", { userId: decoded.id });
    next();
  } catch (err) {
    logger.error("Admin JWT verification failed:", err);

    if (err.name === "TokenExpiredError") {
      return ApiResponse.unauthorized(res, "Token expired. Please login again.");
    }

    return ApiResponse.unauthorized(res, "Invalid or expired token");
  }
}; 