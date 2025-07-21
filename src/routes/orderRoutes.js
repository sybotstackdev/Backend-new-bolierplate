const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Public routes (if any)
// router.get('/public', orderController.somePublicFunction);

// Protected routes - require authentication
router.use(authenticateToken);

// GET /api/orders - Get all orders with filtering and pagination
router.get('/', orderController.getAllOrders);

// GET /api/orders/statistics - Get order statistics
router.get('/statistics', orderController.getOrderStatistics);

// GET /api/orders/:id - Get order by ID
router.get('/:id', orderController.getOrderById);

// POST /api/orders - Create new order
router.post('/', orderController.createOrder);

// PUT /api/orders/:id - Update order
router.put('/:id', orderController.updateOrder);

// PATCH /api/orders/:id/status - Update order status
router.patch('/:id/status', orderController.updateOrderStatus);

// DELETE /api/orders/:id - Delete order (admin only)
router.delete('/:id', requireAdmin, orderController.deleteOrder);

// GET /api/orders/customer/:customerId - Get orders by customer
router.get('/customer/:customerId', orderController.getOrdersByCustomer);

// GET /api/orders/product/:productId - Get orders by product
router.get('/product/:productId', orderController.getOrdersByProduct);

module.exports = router; 