import rateLimit from "express-rate-limit";
import { APP_CONFIG } from "../config/constants.js";

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: "Too many requests from this IP, please try again after 15 minutes"
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter limiter for authentication endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: "Too many authentication attempts, please try again after 15 minutes"
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// User registration limiter
export const registrationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each IP to 3 registration attempts per hour
  message: {
    success: false,
    message: "Too many registration attempts, please try again after 1 hour"
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// File upload limiter
export const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 uploads per 15 minutes
  message: {
    success: false,
    message: "Too many file uploads, please try again after 15 minutes"
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Admin endpoints limiter
export const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 requests per windowMs
  message: {
    success: false,
    message: "Too many admin requests, please try again after 15 minutes"
  },
  standardHeaders: true,
  legacyHeaders: false,
}); 