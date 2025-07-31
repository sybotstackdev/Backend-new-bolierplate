import { ApiResponse } from '../utils/response.js';
import { logger } from '../utils/logger.js';
import { AnalyticsService } from '../services/analyticsService.js';

/**
 * Analytics Controller - Handles analytics and statistics endpoints
 */

/**
 * Get system overview statistics
 * @route GET /api/analytics/system-stats
 */
export const getSystemStats = async (req, res) => {
  try {
    const stats = await AnalyticsService.getSystemStats();
    
    logger.info('System stats retrieved successfully');
    
    return ApiResponse.success(res, {
      message: 'System statistics retrieved successfully',
      data: stats
    });
  } catch (error) {
    logger.error('Error getting system stats:', error);
    return ApiResponse.error(res, 'Failed to get system statistics', 500, error);
  }
};

/**
 * Get user activity statistics
 * @route GET /api/analytics/user-activity
 */
export const getUserActivityStats = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const stats = await AnalyticsService.getUserActivityStats(parseInt(days));
    
    logger.info('User activity stats retrieved successfully', { days });
    
    return ApiResponse.success(res, {
      message: 'User activity statistics retrieved successfully',
      data: stats,
      period: `${days} days`
    });
  } catch (error) {
    logger.error('Error getting user activity stats:', error);
    return ApiResponse.error(res, 'Failed to get user activity statistics', 500, error);
  }
};

/**
 * Get product performance statistics
 * @route GET /api/analytics/product-performance
 */
export const getProductPerformanceStats = async (req, res) => {
  try {
    const stats = await AnalyticsService.getProductPerformanceStats();
    
    logger.info('Product performance stats retrieved successfully');
    
    return ApiResponse.success(res, {
      message: 'Product performance statistics retrieved successfully',
      data: stats
    });
  } catch (error) {
    logger.error('Error getting product performance stats:', error);
    return ApiResponse.error(res, 'Failed to get product performance statistics', 500, error);
  }
};

/**
 * Get order analytics
 * @route GET /api/analytics/order-analytics
 */
export const getOrderAnalytics = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const analytics = await AnalyticsService.getOrderAnalytics(parseInt(days));
    
    logger.info('Order analytics retrieved successfully', { days });
    
    return ApiResponse.success(res, {
      message: 'Order analytics retrieved successfully',
      data: analytics,
      period: `${days} days`
    });
  } catch (error) {
    logger.error('Error getting order analytics:', error);
    return ApiResponse.error(res, 'Failed to get order analytics', 500, error);
  }
};

/**
 * Get revenue statistics
 * @route GET /api/analytics/revenue-stats
 */
export const getRevenueStats = async (req, res) => {
  try {
    const { period = 'monthly' } = req.query;
    const stats = await AnalyticsService.getRevenueStats(period);
    
    logger.info('Revenue stats retrieved successfully', { period });
    
    return ApiResponse.success(res, {
      message: 'Revenue statistics retrieved successfully',
      data: stats,
      period
    });
  } catch (error) {
    logger.error('Error getting revenue stats:', error);
    return ApiResponse.error(res, 'Failed to get revenue statistics', 500, error);
  }
};

/**
 * Get category performance
 * @route GET /api/analytics/category-performance
 */
export const getCategoryPerformance = async (req, res) => {
  try {
    const performance = await AnalyticsService.getCategoryPerformance();
    
    logger.info('Category performance retrieved successfully');
    
    return ApiResponse.success(res, {
      message: 'Category performance retrieved successfully',
      data: performance
    });
  } catch (error) {
    logger.error('Error getting category performance:', error);
    return ApiResponse.error(res, 'Failed to get category performance', 500, error);
  }
};

/**
 * Get top customers
 * @route GET /api/analytics/top-customers
 */
export const getTopCustomers = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const customers = await AnalyticsService.getTopCustomers(parseInt(limit));
    
    logger.info('Top customers retrieved successfully', { limit });
    
    return ApiResponse.success(res, {
      message: 'Top customers retrieved successfully',
      data: customers,
      limit: parseInt(limit)
    });
  } catch (error) {
    logger.error('Error getting top customers:', error);
    return ApiResponse.error(res, 'Failed to get top customers', 500, error);
  }
};

/**
 * Get file upload statistics
 * @route GET /api/analytics/file-stats
 */
export const getFileUploadStats = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const stats = await AnalyticsService.getFileUploadStats(parseInt(days));
    
    logger.info('File upload stats retrieved successfully', { days });
    
    return ApiResponse.success(res, {
      message: 'File upload statistics retrieved successfully',
      data: stats,
      period: `${days} days`
    });
  } catch (error) {
    logger.error('Error getting file upload stats:', error);
    return ApiResponse.error(res, 'Failed to get file upload statistics', 500, error);
  }
};

/**
 * Get dashboard summary
 * @route GET /api/analytics/dashboard
 */
export const getDashboardSummary = async (req, res) => {
  try {
    const summary = await AnalyticsService.getDashboardSummary();
    
    logger.info('Dashboard summary retrieved successfully');
    
    return ApiResponse.success(res, {
      message: 'Dashboard summary retrieved successfully',
      data: summary
    });
  } catch (error) {
    logger.error('Error getting dashboard summary:', error);
    return ApiResponse.error(res, 'Failed to get dashboard summary', 500, error);
  }
};

/**
 * Get comprehensive analytics report
 * @route GET /api/analytics/report
 */
export const getAnalyticsReport = async (req, res) => {
  try {
    const { period = '30' } = req.query;
    
    const [
      systemStats,
      userActivity,
      orderAnalytics,
      revenueStats,
      categoryPerformance,
      topCustomers,
      fileStats
    ] = await Promise.all([
      AnalyticsService.getSystemStats(),
      AnalyticsService.getUserActivityStats(parseInt(period)),
      AnalyticsService.getOrderAnalytics(parseInt(period)),
      AnalyticsService.getRevenueStats('monthly'),
      AnalyticsService.getCategoryPerformance(),
      AnalyticsService.getTopCustomers(10),
      AnalyticsService.getFileUploadStats(parseInt(period))
    ]);
    
    const report = {
      period: `${period} days`,
      generatedAt: new Date().toISOString(),
      systemStats,
      userActivity,
      orderAnalytics,
      revenueStats,
      categoryPerformance,
      topCustomers,
      fileStats
    };
    
    logger.info('Analytics report generated successfully', { period });
    
    return ApiResponse.success(res, {
      message: 'Analytics report generated successfully',
      data: report
    });
  } catch (error) {
    logger.error('Error generating analytics report:', error);
    return ApiResponse.error(res, 'Failed to generate analytics report', 500, error);
  }
}; 