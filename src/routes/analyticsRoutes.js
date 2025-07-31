import express from 'express';
import {
  getSystemStats,
  getUserActivityStats,
  getProductPerformanceStats,
  getOrderAnalytics,
  getRevenueStats,
  getCategoryPerformance,
  getTopCustomers,
  getFileUploadStats,
  getDashboardSummary,
  getAnalyticsReport
} from '../controllers/analyticsController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// All analytics routes require authentication
router.use(authenticateToken);

// System and overview statistics
router.get('/system-stats', getSystemStats);
router.get('/dashboard', getDashboardSummary);
router.get('/report', getAnalyticsReport);

// User analytics
router.get('/user-activity', getUserActivityStats);
router.get('/top-customers', getTopCustomers);

// Product analytics
router.get('/product-performance', getProductPerformanceStats);
router.get('/category-performance', getCategoryPerformance);

// Order and revenue analytics
router.get('/order-analytics', getOrderAnalytics);
router.get('/revenue-stats', getRevenueStats);

// File analytics
router.get('/file-stats', getFileUploadStats);

export default router; 