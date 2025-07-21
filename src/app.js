import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import passport from "passport";
import { fileURLToPath } from "url";
import { dirname } from "path";

// Import middleware
import { errorHandler, notFoundHandler, requestLogger } from "./middleware/errorHandler.js";
import { apiLimiter } from "./middleware/rateLimiter.js";

// Import routes
import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config();

// Create Express app
const app = express();

const allowedOrigins = ["http://localhost:3000", "http://localhost:3001", "http://localhost:5000"];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // Allow cookies if needed
  })
);

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ limit: "15mb", extended: true }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname + '/../public'));
app.use(bodyParser.json());

// Request logging middleware
app.use(requestLogger);

// Rate limiting
app.use("/api", apiLimiter);

// Routes
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);

app.get("/", async (req, res) => {
  res.send("Hello")
});

// Error handling middleware (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

export default app; 