import { query } from "../../config/db.js";
import bcrypt from "bcryptjs";
import { isValidEmail, isValidPassword, sanitizeInput, isValidPhone } from "../utils/validation.js";

export class UserService {
  // Get all users with pagination
  static async getAllUsers(page = 1, limit = 10, role = null) {
    try {
      let whereClause = "";
      let params = [];
      let paramCount = 1;

      if (role) {
        whereClause = "WHERE role = $" + paramCount;
        params.push(role);
        paramCount++;
      }

      const offset = (page - 1) * limit;
      params.push(limit, offset);

      const result = await query(
        `SELECT id, first_name, last_name, email, role, is_approved, created_at 
         FROM users ${whereClause}
         ORDER BY created_at DESC 
         LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
        params
      );

      // Get total count
      const countResult = await query(
        `SELECT COUNT(*) as total FROM users ${whereClause}`,
        role ? [role] : []
      );

      return {
        users: result.rows,
        pagination: {
          page,
          limit,
          total: parseInt(countResult.rows[0].total),
          totalPages: Math.ceil(countResult.rows[0].total / limit)
        }
      };
    } catch (error) {
      throw new Error(`Failed to get users: ${error.message}`);
    }
  }

  // Get user by ID
  static async getUserById(id) {
    try {
      const result = await query(
        "SELECT id, first_name, last_name, email, phone, address, zip_code, role, is_approved, profile_pic, created_at FROM users WHERE id = $1",
        [id]
      );

      if (result.rows.length === 0) {
        throw new Error("User not found");
      }

      return result.rows[0];
    } catch (error) {
      throw new Error(`Failed to get user: ${error.message}`);
    }
  }

  // Create new user
  static async createUser(userData) {
    try {
      // Validate input
      const validation = this.validateUserData(userData);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      // Check if user already exists
      const existingUser = await query("SELECT id FROM users WHERE email = $1", [userData.email]);
      if (existingUser.rows.length > 0) {
        throw new Error("User with this email already exists");
      }

      // Hash password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

      // Insert new user
      const result = await query(
        `INSERT INTO users (first_name, last_name, email, password, phone, address, zip_code, role) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
         RETURNING id, first_name, last_name, email, role, created_at`,
        [
          sanitizeInput(userData.first_name),
          sanitizeInput(userData.last_name),
          userData.email.toLowerCase(),
          hashedPassword,
          userData.phone ? sanitizeInput(userData.phone) : null,
          sanitizeInput(userData.address),
          userData.zip_code ? sanitizeInput(userData.zip_code) : null,
          userData.role || 'learner'
        ]
      );

      return result.rows[0];
    } catch (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

  // Update user
  static async updateUser(id, updateData) {
    try {
      // Check if user exists
      const existingUser = await query("SELECT id FROM users WHERE id = $1", [id]);
      if (existingUser.rows.length === 0) {
        throw new Error("User not found");
      }

      // Validate update data
      const validation = this.validateUpdateData(updateData);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      // Build update query dynamically
      const updateFields = [];
      const values = [];
      let paramCount = 1;

      if (updateData.first_name) {
        updateFields.push(`first_name = $${paramCount}`);
        values.push(sanitizeInput(updateData.first_name));
        paramCount++;
      }
      if (updateData.last_name) {
        updateFields.push(`last_name = $${paramCount}`);
        values.push(sanitizeInput(updateData.last_name));
        paramCount++;
      }
      if (updateData.phone !== undefined) {
        updateFields.push(`phone = $${paramCount}`);
        values.push(updateData.phone ? sanitizeInput(updateData.phone) : null);
        paramCount++;
      }
      if (updateData.address) {
        updateFields.push(`address = $${paramCount}`);
        values.push(sanitizeInput(updateData.address));
        paramCount++;
      }
      if (updateData.zip_code !== undefined) {
        updateFields.push(`zip_code = $${paramCount}`);
        values.push(updateData.zip_code ? sanitizeInput(updateData.zip_code) : null);
        paramCount++;
      }
      if (updateData.profile_pic !== undefined) {
        updateFields.push(`profile_pic = $${paramCount}`);
        values.push(updateData.profile_pic);
        paramCount++;
      }

      if (updateFields.length === 0) {
        throw new Error("No fields to update");
      }

      updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(id);

      const result = await query(
        `UPDATE users SET ${updateFields.join(', ')} WHERE id = $${paramCount} 
         RETURNING id, first_name, last_name, email, phone, address, zip_code, profile_pic, updated_at`,
        values
      );

      return result.rows[0];
    } catch (error) {
      throw new Error(`Failed to update user: ${error.message}`);
    }
  }

  // Delete user
  static async deleteUser(id) {
    try {
      const result = await query("DELETE FROM users WHERE id = $1 RETURNING id", [id]);
      
      if (result.rows.length === 0) {
        throw new Error("User not found");
      }

      return { message: "User deleted successfully" };
    } catch (error) {
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }

  // Validate user data for creation
  static validateUserData(data) {
    const errors = [];

    if (!data.first_name || data.first_name.trim().length < 2) {
      errors.push("First name must be at least 2 characters");
    }

    if (!data.last_name || data.last_name.trim().length < 2) {
      errors.push("Last name must be at least 2 characters");
    }

    if (!data.email || !isValidEmail(data.email)) {
      errors.push("Valid email is required");
    }

    if (!data.password || !isValidPassword(data.password)) {
      errors.push("Password must be at least 8 characters with uppercase, lowercase, and number");
    }

    if (!data.address || data.address.trim().length < 10) {
      errors.push("Address must be at least 10 characters");
    }

    if (data.role && !['learner', 'founder', 'existing_founder', 'other', 'admin'].includes(data.role)) {
      errors.push("Invalid role");
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Validate update data
  static validateUpdateData(data) {
    const errors = [];

    if (data.first_name && data.first_name.trim().length < 2) {
      errors.push("First name must be at least 2 characters");
    }

    if (data.last_name && data.last_name.trim().length < 2) {
      errors.push("Last name must be at least 2 characters");
    }

    if (data.address && data.address.trim().length < 10) {
      errors.push("Address must be at least 10 characters");
    }

    if (data.phone && !isValidPhone(data.phone)) {
      errors.push("Invalid phone number format");
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
} 