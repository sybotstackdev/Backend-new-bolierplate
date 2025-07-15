import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

const { JWT_SECRET, JWT_REFRESH_SECRET } = process.env;

export const googleAuthCallback = async (req, res) => {
  try {
    const user = req.user; // User is populated by Passport after successful authentication
    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "Google authentication failed",
      });
    }

    // Generate JWT tokens
    const accessToken = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });
    const refreshToken = jwt.sign({ id: user._id }, JWT_REFRESH_SECRET, { expiresIn: "7d" });

    // Send response with user data and tokens
    res.status(200).json({
      status: "success",
      message: "Google login successful",
      user,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error("Google Auth Error:", error);
    res.status(500).json({
      status: "error",
      message: "An error occurred during Google authentication",
    });
  }
};
