import { query } from "../../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const result = await query("SELECT id, first_name, last_name, email, role, is_approved, created_at FROM users ORDER BY created_at DESC");
    
    res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error("Error getting users:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Get user by ID
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await query(
      "SELECT id, first_name, last_name, email, phone, address, zip_code, role, is_approved, profile_pic, created_at FROM users WHERE id = $1",
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    
    res.status(200).json({
      success: true,
      message: "User retrieved successfully",
      data: result.rows[0]
    });
  } catch (error) {
    console.error("Error getting user:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Create new user
export const createUser = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email,
      password,
      phone,
      address,
      zip_code,
      role = 'learner'
    } = req.body;
    
    // Validate required fields
    if (!first_name || !last_name || !email || !password || !address) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: first_name, last_name, email, password, address"
      });
    }
    
    // Check if user already exists
    const existingUser = await query("SELECT id FROM users WHERE email = $1", [email]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists"
      });
    }
    
    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Insert new user
    const result = await query(
      `INSERT INTO users (first_name, last_name, email, password, phone, address, zip_code, role) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING id, first_name, last_name, email, role, created_at`,
      [first_name, last_name, email, hashedPassword, phone, address, zip_code, role]
    );
    
    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: result.rows[0]
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Update user
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      first_name,
      last_name,
      phone,
      address,
      zip_code,
      profile_pic
    } = req.body;
    
    // Check if user exists
    const existingUser = await query("SELECT id FROM users WHERE id = $1", [id]);
    if (existingUser.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    
    // Build update query dynamically
    const updateFields = [];
    const values = [];
    let paramCount = 1;
    
    if (first_name) {
      updateFields.push(`first_name = $${paramCount}`);
      values.push(first_name);
      paramCount++;
    }
    if (last_name) {
      updateFields.push(`last_name = $${paramCount}`);
      values.push(last_name);
      paramCount++;
    }
    if (phone !== undefined) {
      updateFields.push(`phone = $${paramCount}`);
      values.push(phone);
      paramCount++;
    }
    if (address) {
      updateFields.push(`address = $${paramCount}`);
      values.push(address);
      paramCount++;
    }
    if (zip_code !== undefined) {
      updateFields.push(`zip_code = $${paramCount}`);
      values.push(zip_code);
      paramCount++;
    }
    if (profile_pic !== undefined) {
      updateFields.push(`profile_pic = $${paramCount}`);
      values.push(profile_pic);
      paramCount++;
    }
    
    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No fields to update"
      });
    }
    
    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);
    
    const result = await query(
      `UPDATE users SET ${updateFields.join(', ')} WHERE id = $${paramCount} 
       RETURNING id, first_name, last_name, email, phone, address, zip_code, profile_pic, updated_at`,
      values
    );
    
    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: result.rows[0]
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user exists
    const existingUser = await query("SELECT id FROM users WHERE id = $1", [id]);
    if (existingUser.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    
    await query("DELETE FROM users WHERE id = $1", [id]);
    
    res.status(200).json({
      success: true,
      message: "User deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// User login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }
    
    // Find user by email
    const result = await query(
      "SELECT id, first_name, last_name, email, password, role, is_approved FROM users WHERE email = $1",
      [email]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }
    
    const user = result.rows[0];
    
    // Check if user is approved
    if (user.is_approved !== 'approved') {
      return res.status(403).json({
        success: false,
        message: "Account not approved. Please contact administrator."
      });
    }
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );
    
    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    
    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: userWithoutPassword,
        token
      }
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
}; 