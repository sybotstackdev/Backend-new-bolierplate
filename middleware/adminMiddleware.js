import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

const authenticateForAdmin = (req, res, next) => {
    const authHeader = req.headers.authorization;

    // Check if the 
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            status: "error",
            code: 401,
            message: "No token provided or invalid format.",
        });
    }

    const token = authHeader.split(" ")[1];

    try {
        // for jwt token
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        console.log("decoded", decoded)
        // role is Admin
        // console.log("role",req.user.role)
        if (req.user.role !== "admin") {
            return res.status(403).json({
                status: "error",
                code: 403,
                message: "Access denied. Admin only.",
            });
        }

        next();
    } catch (err) {
        console.error("JWT verification failed:", err);

        if (err.name === "TokenExpiredError") {
            return res.status(403).json({
                status: "error",
                code: 403,
                message: "Token expired. Please login again.",
            });
        }

        return res.status(403).json({
            status: "error",
            code: 403,
            message: "Invalid or expired token.",
        });
    }
};

export default authenticateForAdmin;
