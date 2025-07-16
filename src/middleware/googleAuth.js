import jwt from "jsonwebtoken";
import { ApiResponse } from "../utils/response.js";
import logger from "../utils/logger.js";

export const googleAuthCallback = async (req, res) => {
  try {
    const user = req.user; // User is populated by Passport after successful authentication
    if (!user) {
      return ApiResponse.unauthorized(res, "Google authentication failed");
    }

    // Generate JWT tokens
    const accessToken = jwt.sign(
      { id: user._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: "7d" }
    );
    const refreshToken = jwt.sign(
      { id: user._id }, 
      process.env.JWT_REFRESH_SECRET, 
      { expiresIn: "7d" }
    );

    logger.authSuccess(user._id, user.email);

    // Send response with user data and tokens
    return ApiResponse.success(res, {
      user,
      accessToken,
      refreshToken,
    }, "Google login successful");
  } catch (error) {
    logger.error("Google Auth Error:", error);
    return ApiResponse.error(res, "An error occurred during Google authentication", 500, error);
  }
}; 