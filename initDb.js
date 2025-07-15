import { pool } from "./config/db.js";

const tables = [
  `CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),  
    email VARCHAR(255) UNIQUE NOT NULL, 
    password VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    zip_code VARCHAR(20),
    role VARCHAR(20) CHECK (role IN ('learner', 'founder', 'existing_founder', 'other', 'admin')) DEFAULT 'learner',
    is_approved VARCHAR(20) CHECK (is_approved IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
    onboarding_status BOOLEAN DEFAULT FALSE,
    profile_pic TEXT DEFAULT NULL,
    cover_image TEXT DEFAULT NULL,
    state VARCHAR(100) DEFAULT NULL,
    city VARCHAR(100) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`
];

export const createTables = async () => {
  try {
    for (const table of tables) {
      await pool.query(table);
      console.info(`Table creation :: in progress ./.`);
    }
    console.info(`Table creation :: complete `);
  } catch (err) {
    console.error("Error creating tables", err);
  }
};
