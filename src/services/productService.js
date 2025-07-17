import { query } from "../../config/db.js";
import { sanitizeInput } from "../utils/validation.js";
import logger from "../utils/logger.js";

export class ProductService {
  // Get all products with advanced filtering
  static async getAllProducts(filters = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        category,
        search,
        sortBy = 'created_at',
        sortOrder = 'DESC',
        minPrice,
        maxPrice,
        isActive = true
      } = filters;
      
      let whereClause = "WHERE is_active = $1";
      let params = [isActive];
      let paramCount = 2;

      // Add category filter
      if (category) {
        whereClause += ` AND category = $${paramCount}`;
        params.push(category);
        paramCount++;
      }

      // Add search filter
      if (search) {
        whereClause += ` AND (name ILIKE $${paramCount} OR description ILIKE $${paramCount})`;
        params.push(`%${search}%`);
        paramCount++;
      }

      // Add price range filters
      if (minPrice !== undefined) {
        whereClause += ` AND price >= $${paramCount}`;
        params.push(minPrice);
        paramCount++;
      }

      if (maxPrice !== undefined) {
        whereClause += ` AND price <= $${paramCount}`;
        params.push(maxPrice);
        paramCount++;
      }

      const offset = (page - 1) * limit;
      params.push(limit, offset);

      const result = await query(
        `SELECT p.*, u.first_name as creator_name, u.last_name as creator_last_name
         FROM products p
         LEFT JOIN users u ON p.creator_id = u.id
         ${whereClause}
         ORDER BY p.${sortBy} ${sortOrder}
         LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
        params
      );

      // Get total count
      const countResult = await query(
        `SELECT COUNT(*) as total FROM products p ${whereClause}`,
        params.slice(0, -2)
      );

      const total = parseInt(countResult.rows[0].total);
      const totalPages = Math.ceil(total / limit);

      return {
        products: result.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      };
    } catch (error) {
      logger.error("ProductService.getAllProducts error:", error);
      throw new Error(`Failed to get products: ${error.message}`);
    }
  }

  // Get product by ID with creator details
  static async getProductById(id) {
    try {
      const result = await query(
        `SELECT p.*, u.first_name as creator_name, u.last_name as creator_last_name, u.email as creator_email
         FROM products p
         LEFT JOIN users u ON p.creator_id = u.id
         WHERE p.id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        throw new Error("Product not found");
      }

      return result.rows[0];
    } catch (error) {
      logger.error("ProductService.getProductById error:", error);
      throw new Error(`Failed to get product: ${error.message}`);
    }
  }

  // Create new product
  static async createProduct(productData) {
    try {
      // Validate input
      const validation = this.validateProductData(productData);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      // Check if product name already exists for this creator
      const existingProduct = await query(
        "SELECT id FROM products WHERE name = $1 AND creator_id = $2",
        [productData.name, productData.creator_id]
      );
      
      if (existingProduct.rows.length > 0) {
        throw new Error("Product with this name already exists for this creator");
      }

      // Insert new product
      const result = await query(
        `INSERT INTO products (name, description, price, category, image_url, creator_id) 
         VALUES ($1, $2, $3, $4, $5, $6) 
         RETURNING id, name, description, price, category, image_url, creator_id, created_at`,
        [
          sanitizeInput(productData.name),
          sanitizeInput(productData.description),
          parseFloat(productData.price),
          sanitizeInput(productData.category),
          productData.image_url || null,
          productData.creator_id
        ]
      );

      logger.info("Product created successfully", { productId: result.rows[0].id });
      return result.rows[0];
    } catch (error) {
      logger.error("ProductService.createProduct error:", error);
      throw new Error(`Failed to create product: ${error.message}`);
    }
  }

  // Update product
  static async updateProduct(id, updateData) {
    try {
      // Check if product exists
      const existingProduct = await query("SELECT id, creator_id FROM products WHERE id = $1", [id]);
      if (existingProduct.rows.length === 0) {
        throw new Error("Product not found");
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

      if (updateData.name) {
        updateFields.push(`name = $${paramCount}`);
        values.push(sanitizeInput(updateData.name));
        paramCount++;
      }
      if (updateData.description) {
        updateFields.push(`description = $${paramCount}`);
        values.push(sanitizeInput(updateData.description));
        paramCount++;
      }
      if (updateData.price !== undefined) {
        if (isNaN(updateData.price) || updateData.price < 0) {
          throw new Error("Price must be a positive number");
        }
        updateFields.push(`price = $${paramCount}`);
        values.push(parseFloat(updateData.price));
        paramCount++;
      }
      if (updateData.category) {
        updateFields.push(`category = $${paramCount}`);
        values.push(sanitizeInput(updateData.category));
        paramCount++;
      }
      if (updateData.image_url !== undefined) {
        updateFields.push(`image_url = $${paramCount}`);
        values.push(updateData.image_url);
        paramCount++;
      }
      if (updateData.is_active !== undefined) {
        updateFields.push(`is_active = $${paramCount}`);
        values.push(updateData.is_active);
        paramCount++;
      }

      if (updateFields.length === 0) {
        throw new Error("No fields to update");
      }

      values.push(id);

      const result = await query(
        `UPDATE products SET ${updateFields.join(', ')} WHERE id = $${paramCount} 
         RETURNING id, name, description, price, category, image_url, is_active, updated_at`,
        values
      );

      logger.info("Product updated successfully", { productId: id });
      return result.rows[0];
    } catch (error) {
      logger.error("ProductService.updateProduct error:", error);
      throw new Error(`Failed to update product: ${error.message}`);
    }
  }

  // Delete product
  static async deleteProduct(id) {
    try {
      const result = await query("DELETE FROM products WHERE id = $1 RETURNING id", [id]);
      
      if (result.rows.length === 0) {
        throw new Error("Product not found");
      }

      logger.info("Product deleted successfully", { productId: id });
      return { message: "Product deleted successfully" };
    } catch (error) {
      logger.error("ProductService.deleteProduct error:", error);
      throw new Error(`Failed to delete product: ${error.message}`);
    }
  }

  // Get products by creator
  static async getProductsByCreator(creatorId, page = 1, limit = 10) {
    try {
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
      
      return {
        products: result.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      };
    } catch (error) {
      logger.error("ProductService.getProductsByCreator error:", error);
      throw new Error(`Failed to get products by creator: ${error.message}`);
    }
  }

  // Toggle product status
  static async toggleProductStatus(id) {
    try {
      const existingProduct = await query("SELECT id, is_active FROM products WHERE id = $1", [id]);
      if (existingProduct.rows.length === 0) {
        throw new Error("Product not found");
      }
      
      const newStatus = !existingProduct.rows[0].is_active;
      
      const result = await query(
        "UPDATE products SET is_active = $1 WHERE id = $2 RETURNING id, is_active",
        [newStatus, id]
      );
      
      logger.info("Product status toggled successfully", { productId: id, newStatus });
      return result.rows[0];
    } catch (error) {
      logger.error("ProductService.toggleProductStatus error:", error);
      throw new Error(`Failed to toggle product status: ${error.message}`);
    }
  }

  // Validate product data for creation
  static validateProductData(data) {
    const errors = [];

    if (!data.name || data.name.trim().length < 3) {
      errors.push("Product name must be at least 3 characters");
    }

    if (!data.description || data.description.trim().length < 10) {
      errors.push("Product description must be at least 10 characters");
    }

    if (!data.price || isNaN(data.price) || data.price < 0) {
      errors.push("Price must be a positive number");
    }

    if (!data.category || data.category.trim().length < 2) {
      errors.push("Category must be at least 2 characters");
    }

    if (!data.creator_id) {
      errors.push("Creator ID is required");
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Validate update data
  static validateUpdateData(data) {
    const errors = [];

    if (data.name && data.name.trim().length < 3) {
      errors.push("Product name must be at least 3 characters");
    }

    if (data.description && data.description.trim().length < 10) {
      errors.push("Product description must be at least 10 characters");
    }

    if (data.price !== undefined && (isNaN(data.price) || data.price < 0)) {
      errors.push("Price must be a positive number");
    }

    if (data.category && data.category.trim().length < 2) {
      errors.push("Category must be at least 2 characters");
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
} 