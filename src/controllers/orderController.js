const { ApiResponse } = require('../utils/response');
const { logger } = require('../utils/logger');
const { validateRequiredFields, isValidUUID } = require('../utils/validation');
const orderService = require('../services/orderService');

/**
 * Get all orders with filtering, pagination, and sorting
 */
const getAllOrders = async (req, res) => {
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
    } = req.query;

    const result = await orderService.getAllOrders({
      page: parseInt(page),
      limit: parseInt(limit),
      status,
      customer_id,
      product_id,
      sortBy,
      sortOrder,
      startDate,
      endDate,
      minAmount: minAmount ? parseFloat(minAmount) : undefined,
      maxAmount: maxAmount ? parseFloat(maxAmount) : undefined
    });

    logger.info('Orders retrieved successfully', { 
      count: result.data.length,
      page: parseInt(page),
      limit: parseInt(limit)
    });

    return ApiResponse.success(res, 'Orders retrieved successfully', result);
  } catch (error) {
    logger.error('Error retrieving orders', { error: error.message });
    return ApiResponse.error(res, 'Failed to retrieve orders', error.message);
  }
};

/**
 * Get order by ID
 */
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidUUID(id)) {
      return ApiResponse.badRequest(res, 'Invalid order ID format');
    }

    const order = await orderService.getOrderById(id);

    if (!order) {
      return ApiResponse.notFound(res, 'Order not found');
    }

    logger.info('Order retrieved successfully', { orderId: id });
    return ApiResponse.success(res, 'Order retrieved successfully', order);
  } catch (error) {
    logger.error('Error retrieving order', { error: error.message, orderId: req.params.id });
    return ApiResponse.error(res, 'Failed to retrieve order', error.message);
  }
};

/**
 * Create new order
 */
const createOrder = async (req, res) => {
  try {
    const orderData = req.body;

    // Validate required fields
    const requiredFields = ['customer_id', 'product_id', 'quantity', 'total_amount'];
    const missingFields = validateRequiredFields(orderData, requiredFields);
    
    if (missingFields.length > 0) {
      return ApiResponse.badRequest(res, `Missing required fields: ${missingFields.join(', ')}`);
    }

    // Validate UUIDs
    if (!isValidUUID(orderData.customer_id)) {
      return ApiResponse.badRequest(res, 'Invalid customer ID format');
    }

    if (!isValidUUID(orderData.product_id)) {
      return ApiResponse.badRequest(res, 'Invalid product ID format');
    }

    // Validate quantity and amount
    if (orderData.quantity <= 0) {
      return ApiResponse.badRequest(res, 'Quantity must be greater than 0');
    }

    if (orderData.total_amount <= 0) {
      return ApiResponse.badRequest(res, 'Total amount must be greater than 0');
    }

    const newOrder = await orderService.createOrder({
      ...orderData,
      status: orderData.status || 'pending',
      created_by: req.user.id
    });

    logger.info('Order created successfully', { 
      orderId: newOrder.id,
      customerId: orderData.customer_id,
      productId: orderData.product_id
    });

    return ApiResponse.created(res, 'Order created successfully', newOrder);
  } catch (error) {
    logger.error('Error creating order', { error: error.message });
    return ApiResponse.error(res, 'Failed to create order', error.message);
  }
};

/**
 * Update order
 */
const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!isValidUUID(id)) {
      return ApiResponse.badRequest(res, 'Invalid order ID format');
    }

    // Check if order exists
    const existingOrder = await orderService.getOrderById(id);
    if (!existingOrder) {
      return ApiResponse.notFound(res, 'Order not found');
    }

    // Validate UUIDs if provided
    if (updateData.customer_id && !isValidUUID(updateData.customer_id)) {
      return ApiResponse.badRequest(res, 'Invalid customer ID format');
    }

    if (updateData.product_id && !isValidUUID(updateData.product_id)) {
      return ApiResponse.badRequest(res, 'Invalid product ID format');
    }

    // Validate quantity and amount if provided
    if (updateData.quantity !== undefined && updateData.quantity <= 0) {
      return ApiResponse.badRequest(res, 'Quantity must be greater than 0');
    }

    if (updateData.total_amount !== undefined && updateData.total_amount <= 0) {
      return ApiResponse.badRequest(res, 'Total amount must be greater than 0');
    }

    const updatedOrder = await orderService.updateOrder(id, {
      ...updateData,
      updated_by: req.user.id
    });

    logger.info('Order updated successfully', { 
      orderId: id,
      updatedBy: req.user.id
    });

    return ApiResponse.success(res, 'Order updated successfully', updatedOrder);
  } catch (error) {
    logger.error('Error updating order', { error: error.message, orderId: req.params.id });
    return ApiResponse.error(res, 'Failed to update order', error.message);
  }
};

/**
 * Delete order
 */
const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidUUID(id)) {
      return ApiResponse.badRequest(res, 'Invalid order ID format');
    }

    // Check if order exists
    const existingOrder = await orderService.getOrderById(id);
    if (!existingOrder) {
      return ApiResponse.notFound(res, 'Order not found');
    }

    await orderService.deleteOrder(id);

    logger.info('Order deleted successfully', { 
      orderId: id,
      deletedBy: req.user.id
    });

    return ApiResponse.success(res, 'Order deleted successfully', null);
  } catch (error) {
    logger.error('Error deleting order', { error: error.message, orderId: req.params.id });
    return ApiResponse.error(res, 'Failed to delete order', error.message);
  }
};

/**
 * Update order status
 */
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!isValidUUID(id)) {
      return ApiResponse.badRequest(res, 'Invalid order ID format');
    }

    if (!status) {
      return ApiResponse.badRequest(res, 'Status is required');
    }

    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return ApiResponse.badRequest(res, `Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    // Check if order exists
    const existingOrder = await orderService.getOrderById(id);
    if (!existingOrder) {
      return ApiResponse.notFound(res, 'Order not found');
    }

    const updatedOrder = await orderService.updateOrderStatus(id, status, req.user.id);

    logger.info('Order status updated successfully', { 
      orderId: id,
      newStatus: status,
      updatedBy: req.user.id
    });

    return ApiResponse.success(res, 'Order status updated successfully', updatedOrder);
  } catch (error) {
    logger.error('Error updating order status', { error: error.message, orderId: req.params.id });
    return ApiResponse.error(res, 'Failed to update order status', error.message);
  }
};

/**
 * Get orders by customer
 */
const getOrdersByCustomer = async (req, res) => {
  try {
    const { customerId } = req.params;
    const { page = 1, limit = 10, status } = req.query;

    if (!isValidUUID(customerId)) {
      return ApiResponse.badRequest(res, 'Invalid customer ID format');
    }

    const result = await orderService.getOrdersByCustomer(customerId, {
      page: parseInt(page),
      limit: parseInt(limit),
      status
    });

    logger.info('Customer orders retrieved successfully', { 
      customerId,
      count: result.data.length
    });

    return ApiResponse.success(res, 'Customer orders retrieved successfully', result);
  } catch (error) {
    logger.error('Error retrieving customer orders', { error: error.message, customerId: req.params.customerId });
    return ApiResponse.error(res, 'Failed to retrieve customer orders', error.message);
  }
};

/**
 * Get orders by product
 */
const getOrdersByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10, status } = req.query;

    if (!isValidUUID(productId)) {
      return ApiResponse.badRequest(res, 'Invalid product ID format');
    }

    const result = await orderService.getOrdersByProduct(productId, {
      page: parseInt(page),
      limit: parseInt(limit),
      status
    });

    logger.info('Product orders retrieved successfully', { 
      productId,
      count: result.data.length
    });

    return ApiResponse.success(res, 'Product orders retrieved successfully', result);
  } catch (error) {
    logger.error('Error retrieving product orders', { error: error.message, productId: req.params.productId });
    return ApiResponse.error(res, 'Failed to retrieve product orders', error.message);
  }
};

/**
 * Get order statistics
 */
const getOrderStatistics = async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;

    const stats = await orderService.getOrderStatistics({
      startDate,
      endDate,
      status
    });

    logger.info('Order statistics retrieved successfully');

    return ApiResponse.success(res, 'Order statistics retrieved successfully', stats);
  } catch (error) {
    logger.error('Error retrieving order statistics', { error: error.message });
    return ApiResponse.error(res, 'Failed to retrieve order statistics', error.message);
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