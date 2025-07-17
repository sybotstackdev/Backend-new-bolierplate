import { query } from "../../config/db.js";
import { ApiResponse } from "../utils/response.js";
import logger from "../utils/logger.js";
import { sanitizeInput } from "../utils/validation.js";

// Get all products with pagination and filtering
export const getAllProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, search, sortBy = 'created_at', sortOrder = 'DESC' } = req.query;
    
    let whereClause = "";
    let params = [];
    let paramCount = 1;

    // Add category filter
    if (category) {
      whereClause += `WHERE category = $${paramCount}`;
      params.push(category);
      paramCount++;
    }

    // Add search filter
    if (search) {
      const searchCondition = `WHERE (name ILIKE $${paramCount} OR description ILIKE $${paramCount})`;
      if (whereClause) {
        whereClause = whereClause.replace('WHERE', 'AND');
        whereClause += ` AND (name ILIKE $${paramCount} OR description ILIKE $${paramCount})`;
      } else {
        whereClause = searchCondition;
      }
      params.push(`%${search}%`);
      paramCount++;
    }

    const offset = (page - 1) * limit;
    params.push(limit, offset);

    const result = await query(
      `SELECT id, name, description, price, category, image_url, creator_id, is_active, created_at, updated_at 
       FROM products ${whereClause}
       ORDER BY ${sortBy} ${sortOrder}
       LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
      params
    );

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) as total FROM products ${whereClause}`,
      category || search ? params.slice(0, -2) : []
    );

    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    logger.info(`Products retrieved successfully`, { count: result.rows.length, total });

    return ApiResponse.paginated(res, result.rows, {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages
    });
  } catch (error) {
    logger.error("Error getting products:", error);
    return ApiResponse.error(res, "Failed to retrieve products", 500, error);
  }
};

// Get product by ID
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await query(
      `SELECT p.*, u.first_name as creator_name 
       FROM products p 
       LEFT JOIN users u ON p.creator_id = u.id 
       WHERE p.id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return ApiResponse.notFound(res, "Product not found");
    }
    
    logger.info(`Product retrieved successfully`, { productId: id });
    return ApiResponse.success(res, result.rows[0], "Product retrieved successfully");
  } catch (error) {
    logger.error("Error getting product:", error);
    return ApiResponse.error(res, "Failed to retrieve product", 500, error);
  }
};

// Create new product
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      image_url,
      creator_id
    } = req.body;
    
    // Validate required fields
    if (!name || !description || !price || !category) {
      return ApiResponse.badRequest(res, "Missing required fields: name, description, price, category");
    }
    
    // Validate price
    if (isNaN(price) || price < 0) {
      return ApiResponse.badRequest(res, "Price must be a positive number");
    }
    
    // Check if product name already exists
    const existingProduct = await query(
      "SELECT id FROM products WHERE name = $1 AND creator_id = $2",
      [name, creator_id]
    );
    
    if (existingProduct.rows.length > 0) {
      return ApiResponse.conflict(res, "Product with this name already exists");
    }
    
    // Insert new product
    const result = await query(
      `INSERT INTO products (name, description, price, category, image_url, creator_id) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING id, name, description, price, category, image_url, creator_id, created_at`,
      [
        sanitizeInput(name),
        sanitizeInput(description),
        parseFloat(price),
        sanitizeInput(category),
        image_url || null,
        creator_id
      ]
    );
    
    logger.info(`Product created successfully`, { productId: result.rows[0].id });
    return ApiResponse.created(res, result.rows[0], "Product created successfully");
  } catch (error) {
    logger.error("Error creating product:", error);
    return ApiResponse.error(res, "Failed to create product", 500, error);
  }
};

// Update product
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      price,
      category,
      image_url,
      is_active
    } = req.body;
    
    // Check if product exists
    const existingProduct = await query("SELECT id, creator_id FROM products WHERE id = $1", [id]);
    if (existingProduct.rows.length === 0) {
      return ApiResponse.notFound(res, "Product not found");
    }
    
    // Build update query dynamically
    const updateFields = [];
    const values = [];
    let paramCount = 1;
    
    if (name) {
      updateFields.push(`name = $${paramCount}`);
      values.push(sanitizeInput(name));
      paramCount++;
    }
    if (description) {
      updateFields.push(`description = $${paramCount}`);
      values.push(sanitizeInput(description));
      paramCount++;
    }
    if (price !== undefined) {
      if (isNaN(price) || price < 0) {
        return ApiResponse.badRequest(res, "Price must be a positive number");
      }
      updateFields.push(`price = $${paramCount}`);
      values.push(parseFloat(price));
      paramCount++;
    }
    if (category) {
      updateFields.push(`category = $${paramCount}`);
      values.push(sanitizeInput(category));
      paramCount++;
    }
    if (image_url !== undefined) {
      updateFields.push(`image_url = $${paramCount}`);
      values.push(image_url);
      paramCount++;
    }
    if (is_active !== undefined) {
      updateFields.push(`is_active = $${paramCount}`);
      values.push(is_active);
      paramCount++;
    }
    
    if (updateFields.length === 0) {
      return ApiResponse.badRequest(res, "No fields to update");
    }
    
    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);
    
    const result = await query(
      `UPDATE products SET ${updateFields.join(', ')} WHERE id = $${paramCount} 
       RETURNING id, name, description, price, category, image_url, is_active, updated_at`,
      values
    );
    
    logger.info(`Product updated successfully`, { productId: id });
    return ApiResponse.success(res, result.rows[0], "Product updated successfully");
  } catch (error) {
    logger.error("Error updating product:", error);
    return ApiResponse.error(res, "Failed to update product", 500, error);
  }
};

// Delete product
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if product exists
    const existingProduct = await query("SELECT id FROM products WHERE id = $1", [id]);
    if (existingProduct.rows.length === 0) {
      return ApiResponse.notFound(res, "Product not found");
    }
    
    await query("DELETE FROM products WHERE id = $1", [id]);
    
    logger.info(`Product deleted successfully`, { productId: id });
    return ApiResponse.success(res, null, "Product deleted successfully");
  } catch (error) {
    logger.error("Error deleting product:", error);
    return ApiResponse.error(res, "Failed to delete product", 500, error);
  }
};

// Get products by creator
export const getProductsByCreator = async (req, res) => {
  try {
    const { creatorId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    const offset = (page - 1) * limit;
    
    const result = await query(
      `SELECT id, name, description, price, category, image_url, is_active, created_at 
       FROM products 
       WHERE creator_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2 OFFSET $3`,
      [creatorId, limit, offset]
    );
    
    // Get total count
    const countResult = await query(
      "SELECT COUNT(*) as total FROM products WHERE creator_id = $1",
      [creatorId]
    );
    
    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);
    
    logger.info(`Products by creator retrieved successfully`, { creatorId, count: result.rows.length });
    
    return ApiResponse.paginated(res, result.rows, {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages
    });
  } catch (error) {
    logger.error("Error getting products by creator:", error);
    return ApiResponse.error(res, "Failed to retrieve products", 500, error);
  }
};

// Toggle product active status
export const toggleProductStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if product exists
    const existingProduct = await query("SELECT id, is_active FROM products WHERE id = $1", [id]);
    if (existingProduct.rows.length === 0) {
      return ApiResponse.notFound(res, "Product not found");
    }
    
    const newStatus = !existingProduct.rows[0].is_active;
    
    const result = await query(
      "UPDATE products SET is_active = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, is_active",
      [newStatus, id]
    );
    
    logger.info(`Product status toggled successfully`, { productId: id, newStatus });
    return ApiResponse.success(res, result.rows[0], "Product status updated successfully");
  } catch (error) {
    logger.error("Error toggling product status:", error);
    return ApiResponse.error(res, "Failed to update product status", 500, error);
  }
}; 