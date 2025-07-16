import http from 'http';
import dotenv from "dotenv";
import { pool } from "../config/db.js";
import { runMigrations } from "./database/migrate.js";
import app from "./app.js";

dotenv.config();

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
server.timeout = 300000; // 300,000ms = 5 minutes

const startServer = async () => {
  try {
    // Test database connection
    await pool.connect();
    console.log("✅ Connected to PostgreSQL database");

    // Run database migrations
    await runMigrations();
    console.log("✅ Database migrations completed");

    // Start the server
    server.listen(PORT, () => {
      console.info(`🚀 Server Running on Port: http://localhost:${PORT}`);
      console.info(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error("❌ Server startup failed:", error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

startServer(); 