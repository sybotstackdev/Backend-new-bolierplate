const { query } = require('../config/db');
const { logger } = require('../utils/logger');

/**
 * Get all orders with filtering, pagination, and sorting
 */
const getAllOrders = async (params) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      customer_id,
      product_id,
      sortBy = 'created_at',
      sortOrder = 'DESC',
      startDate,
      endDate,
      minAmount,
      maxAmount
    } = params;

    let conditions = ['1=1'];
    let values = [];
    let valueIndex = 1;

    // Add filters
    if (status) {
      conditions.push(`o.status = $${valueIndex++}`);
      values.push(status);
    }

    if (customer_id) {
      conditions.push(`o.customer_id = $${valueIndex++}`);
      values.push(customer_id);
    }

    if (product_id) {
      conditions.push(`o.product_id = $${valueIndex++}`);
      values.push(product_id);
    }

    if (startDate) {
      conditions.push(`o.created_at >= $${valueIndex++}`);
      values.push(startDate);
    }

    if (endDate) {
      conditions.push(`o.created_at <= $${valueIndex++}`);
      values.push(endDate);
    }

    if (minAmount) {
      conditions.push(`o.total_amount >= $${valueIndex++}`);
      values.push(minAmount);
    }

    if (maxAmount) {
      conditions.push(`o.total_amount <= $${valueIndex++}`);
      values.push(maxAmount);
    }

    const whereClause = conditions.join(' AND ');

    // Count total records
    const countQuery = `
      SELECT COUNT(*) as total
      FROM orders o
      WHERE ${whereClause}
    `;
    
    const countResult = await query(countQuery, values);
    const total = parseInt(countResult.rows[0].total);

    // Calculate pagination
    const offset = (page - 1) * limit;
    const totalPages = Math.ceil(total / limit);

    // Get orders with joins
    const ordersQuery = `
      SELECT 
        o.id,
        o.customer_id,
        o.product_id,
        o.quantity,
        o.total_amount,
        o.status,
        o.notes,
        o.created_at,
        o.updated_at,
        u.first_name as customer_first_name,
        u.last_name as customer_last_name,
        u.email as customer_email,
        p.name as product_name,
        p.description as product_description,
        p.price as product_price,
        p.category as product_category
      FROM orders o
      LEFT JOIN users u ON o.customer_id = u.id
      LEFT JOIN products p ON o.product_id = p.id
      WHERE ${whereClause}
      ORDER BY o.${sortBy} ${sortOrder}
      LIMIT $${valueIndex++} OFFSET $${valueIndex++}
    `;

    values.push(limit, offset);
    const result = await query(ordersQuery, values);

    return {
      data: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
  } catch (error) {
    logger.error('Error in getAllOrders service', { error: error.message });
    throw error;
  }
};

/**
 * Get order by ID
 */
const getOrderById = async (id) => {
  try {
    const query = `
      SELECT 
        o.id,
        o.customer_id,
        o.product_id,
        o.quantity,
        o.total_amount,
        o.status,
        o.notes,
        o.created_at,
        o.updated_at,
        u.first_name as customer_first_name,
        u.last_name as customer_last_name,
        u.email as customer_email,
        p.name as product_name,
        p.description as product_description,
        p.price as product_price,
        p.category as product_category
      FROM orders o
      LEFT JOIN users u ON o.customer_id = u.id
      LEFT JOIN products p ON o.product_id = p.id
      WHERE o.id = $1
    `;

    const result = await query(query, [id]);
    return result.rows[0] || null;
  } catch (error) {
    logger.error('Error in getOrderById service', { error: error.message, orderId: id });
    throw error;
  }
};

/**
 * Create new order
 */
const createOrder = async (orderData) => {
  try {
    const {
      customer_id,
      product_id,
      quantity,
      total_amount,
      status = 'pending',
      notes,
      created_by
    } = orderData;

    const query = `
      INSERT INTO orders (customer_id, product_id, quantity, total_amount, status, notes, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const values = [customer_id, product_id, quantity, total_amount, status, notes, created_by];
    const result = await query(query, values);

    return result.rows[0];
  } catch (error) {
    logger.error('Error in createOrder service', { error: error.message });
    throw error;
  }
};

/**
 * Update order
 */
const updateOrder = async (id, updateData) => {
  try {
    const fields = [];
    const values = [];
    let valueIndex = 1;

    // Build dynamic update query
    Object.keys(updateData).forEach(key => {
      if (key !== 'id' && updateData[key] !== undefined) {
        fields.push(`${key} = $${valueIndex++}`);
        values.push(updateData[key]);
      }
    });

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const query = `
      UPDATE orders 
      SET ${fields.join(', ')}
      WHERE id = $${valueIndex}
      RETURNING *
    `;

    const result = await query(query, values);
    return result.rows[0];
  } catch (error) {
    logger.error('Error in updateOrder service', { error: error.message, orderId: id });
    throw error;
  }
};

/**
 * Delete order
 */
const deleteOrder = async (id) => {
  try {
    const query = 'DELETE FROM orders WHERE id = $1 RETURNING *';
    const result = await query(query, [id]);
    return result.rows[0];
  } catch (error) {
    logger.error('Error in deleteOrder service', { error: error.message, orderId: id });
    throw error;
  }
};

/**
 * Update order status
 */
const updateOrderStatus = async (id, status, updatedBy) => {
  try {
    const query = `
      UPDATE orders 
      SET status = $1, updated_at = NOW(), updated_by = $2
      WHERE id = $3
      RETURNING *
    `;

    const result = await query(query, [status, updatedBy, id]);
    return result.rows[0];
  } catch (error) {
    logger.error('Error in updateOrderStatus service', { error: error.message, orderId: id });
    throw error;
  }
};

/**
 * Get orders by customer
 */
const getOrdersByCustomer = async (customerId, params) => {
  try {
    const { page = 1, limit = 10, status } = params;

    let conditions = ['o.customer_id = $1'];
    let values = [customerId];
    let valueIndex = 2;

    if (status) {
      conditions.push(`o.status = $${valueIndex++}`);
      values.push(status);
    }

    const whereClause = conditions.join(' AND ');

    // Count total records
    const countQuery = `
      SELECT COUNT(*) as total
      FROM orders o
      WHERE ${whereClause}
    `;
    
    const countResult = await query(countQuery, values);
    const total = parseInt(countResult.rows[0].total);

    // Calculate pagination
    const offset = (page - 1) * limit;
    const totalPages = Math.ceil(total / limit);

    // Get orders
    const ordersQuery = `
      SELECT 
        o.id,
        o.customer_id,
        o.product_id,
        o.quantity,
        o.total_amount,
        o.status,
        o.notes,
        o.created_at,
        o.updated_at,
        p.name as product_name,
        p.description as product_description,
        p.price as product_price,
        p.category as product_category
      FROM orders o
      LEFT JOIN products p ON o.product_id = p.id
      WHERE ${whereClause}
      ORDER BY o.created_at DESC
      LIMIT $${valueIndex++} OFFSET $${valueIndex++}
    `;

    values.push(limit, offset);
    const result = await query(ordersQuery, values);

    return {
      data: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
  } catch (error) {
    logger.error('Error in getOrdersByCustomer service', { error: error.message, customerId });
    throw error;
  }
};

/**
 * Get orders by product
 */
const getOrdersByProduct = async (productId, params) => {
  try {
    const { page = 1, limit = 10, status } = params;

    let conditions = ['o.product_id = $1'];
    let values = [productId];
    let valueIndex = 2;

    if (status) {
      conditions.push(`o.status = $${valueIndex++}`);
      values.push(status);
    }

    const whereClause = conditions.join(' AND ');

    // Count total records
    const countQuery = `
      SELECT COUNT(*) as total
      FROM orders o
      WHERE ${whereClause}
    `;
    
    const countResult = await query(countQuery, values);
    const total = parseInt(countResult.rows[0].total);

    // Calculate pagination
    const offset = (page - 1) * limit;
    const totalPages = Math.ceil(total / limit);

    // Get orders
    const ordersQuery = `
      SELECT 
        o.id,
        o.customer_id,
        o.product_id,
        o.quantity,
        o.total_amount,
        o.status,
        o.notes,
        o.created_at,
        o.updated_at,
        u.first_name as customer_first_name,
        u.last_name as customer_last_name,
        u.email as customer_email
      FROM orders o
      LEFT JOIN users u ON o.customer_id = u.id
      WHERE ${whereClause}
      ORDER BY o.created_at DESC
      LIMIT $${valueIndex++} OFFSET $${valueIndex++}
    `;

    values.push(limit, offset);
    const result = await query(ordersQuery, values);

    return {
      data: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
  } catch (error) {
    logger.error('Error in getOrdersByProduct service', { error: error.message, productId });
    throw error;
  }
};

/**
 * Get order statistics
 */
const getOrderStatistics = async (params) => {
  try {
    const { startDate, endDate, status } = params;

    let conditions = ['1=1'];
    let values = [];
    let valueIndex = 1;

    if (startDate) {
      conditions.push(`created_at >= $${valueIndex++}`);
      values.push(startDate);
    }

    if (endDate) {
      conditions.push(`created_at <= $${valueIndex++}`);
      values.push(endDate);
    }

    if (status) {
      conditions.push(`status = $${valueIndex++}`);
      values.push(status);
    }

    const whereClause = conditions.join(' AND ');

    // Get various statistics
    const statsQuery = `
      SELECT 
        COUNT(*) as total_orders,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_orders,
        COUNT(CASE WHEN status = 'processing' THEN 1 END) as processing_orders,
        COUNT(CASE WHEN status = 'shipped' THEN 1 END) as shipped_orders,
        COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered_orders,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_orders,
        SUM(total_amount) as total_revenue,
        AVG(total_amount) as average_order_value,
        MIN(created_at) as first_order_date,
        MAX(created_at) as last_order_date
      FROM orders
      WHERE ${whereClause}
    `;

    const result = await query(statsQuery, values);
    return result.rows[0];
  } catch (error) {
    logger.error('Error in getOrderStatistics service', { error: error.message });
    throw error;
  }
};

module.exports = {
  getAllOrders,
  getOrderById,
  createOrder,
  updateOrder,
  deleteOrder,
  updateOrderStatus,
  getOrdersByCustomer,
  getOrdersByProduct,
  getOrderStatistics
}; 