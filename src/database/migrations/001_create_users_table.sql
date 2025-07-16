-- Migration: Create users table
-- Created: 2024-01-01
-- Description: Initial users table creation

CREATE TABLE IF NOT EXISTS users (
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
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Create index on role for filtering
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Create index on is_approved for filtering
CREATE INDEX IF NOT EXISTS idx_users_approved ON users(is_approved);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC); 