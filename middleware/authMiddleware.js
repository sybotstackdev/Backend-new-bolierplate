import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      status: "error",
      code: 401,
      message: "No token provided or invalid format",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET); // Verify token

    console.log("decoded",decoded)
    // Attach only specific fields to req.user
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };
    next(); // Proceed to the next middleware
  } catch (err) {
    console.error(`JWT verification failed on ${req.path}:`, err);
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        status: "error",
        code: 401,
        message: "Token expired. Please login again.",
      });
    }
    return res.status(401).json({
      status: "error",
      code: 401,
      message: "Invalid or expired token",
    });
    
  }
};

export default authenticateToken;
