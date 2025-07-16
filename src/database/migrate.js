import { pool } from "../../config/db.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import logger from "../utils/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Migration table to track executed migrations
const createMigrationsTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    logger.info("Migrations table created/verified");
  } catch (error) {
    logger.error("Error creating migrations table:", error);
    throw error;
  }
};

// Get list of migration files
const getMigrationFiles = () => {
  const migrationsDir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort(); // Sort to ensure order
  return files;
};

// Check if migration has been executed
const isMigrationExecuted = async (migrationName) => {
  try {
    const result = await pool.query(
      "SELECT id FROM migrations WHERE name = $1",
      [migrationName]
    );
    return result.rows.length > 0;
  } catch (error) {
    logger.error("Error checking migration status:", error);
    return false;
  }
};

// Mark migration as executed
const markMigrationExecuted = async (migrationName) => {
  try {
    await pool.query(
      "INSERT INTO migrations (name) VALUES ($1)",
      [migrationName]
    );
    logger.info(`Migration ${migrationName} marked as executed`);
  } catch (error) {
    logger.error("Error marking migration as executed:", error);
    throw error;
  }
};

// Execute a single migration
const executeMigration = async (migrationName) => {
  try {
    const migrationPath = path.join(__dirname, 'migrations', migrationName);
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    await pool.query(sql);
    await markMigrationExecuted(migrationName);
    
    logger.info(`Migration ${migrationName} executed successfully`);
  } catch (error) {
    logger.error(`Error executing migration ${migrationName}:`, error);
    throw error;
  }
};

// Run all pending migrations
export const runMigrations = async () => {
  try {
    logger.info("Starting database migrations...");
    
    // Create migrations table if it doesn't exist
    await createMigrationsTable();
    
    // Get all migration files
    const migrationFiles = getMigrationFiles();
    logger.info(`Found ${migrationFiles.length} migration files`);
    
    // Execute pending migrations
    for (const migrationFile of migrationFiles) {
      const isExecuted = await isMigrationExecuted(migrationFile);
      
      if (!isExecuted) {
        logger.info(`Executing migration: ${migrationFile}`);
        await executeMigration(migrationFile);
      } else {
        logger.info(`Migration ${migrationFile} already executed, skipping`);
      }
    }
    
    logger.info("All migrations completed successfully");
  } catch (error) {
    logger.error("Migration failed:", error);
    throw error;
  }
};

// Run migrations if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigrations()
    .then(() => {
      logger.info("Migrations completed");
      process.exit(0);
    })
    .catch((error) => {
      logger.error("Migration failed:", error);
      process.exit(1);
    });
} 