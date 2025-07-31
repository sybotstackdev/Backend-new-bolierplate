import { query } from '../database/connection.js';
import { logger } from '../utils/logger.js';
import { formatDate, formatNumber } from '../utils/helpers.js';

/**
 * Analytics Service - Provides comprehensive statistics and insights
 */
export class AnalyticsService {
  
  /**
   * Get overall system statistics
   */
  static async getSystemStats() {
    try {
      const stats = await query(`
        SELECT 
          (SELECT COUNT(*) FROM users) as total_users,
          (SELECT COUNT(*) FROM products) as total_products,
          (SELECT COUNT(*) FROM orders) as total_orders,
          (SELECT COUNT(*) FROM files) as total_files,
          (SELECT COUNT(*) FROM users WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as new_users_30d,
          (SELECT COUNT(*) FROM products WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as new_products_30d,
          (SELECT COUNT(*) FROM orders WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as new_orders_30d,
          (SELECT COUNT(*) FROM files WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as new_files_30d
      `);

      return stats.rows[0];
    } catch (error) {
      logger.error('Error getting system stats:', error);
      throw error;
    }
  }

  /**
   * Get user activity statistics
   */
  static async getUserActivityStats(days = 30) {
    try {
      const result = await query(`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as new_users,
          COUNT(CASE WHEN role = 'admin' THEN 1 END) as new_admins,
          COUNT(CASE WHEN role = 'user' THEN 1 END) as new_regular_users
        FROM users 
        WHERE created_at >= CURRENT_DATE - INTERVAL '${days} days'
        GROUP BY DATE(created_at)
        ORDER BY date DESC
      `);

      return result.rows;
    } catch (error) {
      logger.error('Error getting user activity stats:', error);
      throw error;
    }
  }

  /**
   * Get product performance statistics
   */
  static async getProductPerformanceStats() {
    try {
      const result = await query(`
        SELECT 
          p.id,
          p.name,
          p.category,
          p.price,
          p.is_active,
          COUNT(o.id) as total_orders,
          COALESCE(SUM(o.total_amount), 0) as total_revenue,
          AVG(o.total_amount) as avg_order_value,
          p.created_at,
          u.first_name as creator_name,
          u.last_name as creator_last_name
        FROM products p
        LEFT JOIN orders o ON p.id = o.product_id
        LEFT JOIN users u ON p.creator_id = u.id
        GROUP BY p.id, p.name, p.category, p.price, p.is_active, p.created_at, u.first_name, u.last_name
        ORDER BY total_revenue DESC
        LIMIT 20
      `);

      return result.rows;
    } catch (error) {
      logger.error('Error getting product performance stats:', error);
      throw error;
    }
  }

  /**
   * Get order analytics
   */
  static async getOrderAnalytics(days = 30) {
    try {
      const result = await query(`
        SELECT 
          DATE(o.created_at) as date,
          COUNT(o.id) as total_orders,
          COALESCE(SUM(o.total_amount), 0) as total_revenue,
          AVG(o.total_amount) as avg_order_value,
          COUNT(DISTINCT o.customer_id) as unique_customers,
          COUNT(CASE WHEN o.status = 'completed' THEN 1 END) as completed_orders,
          COUNT(CASE WHEN o.status = 'pending' THEN 1 END) as pending_orders,
          COUNT(CASE WHEN o.status = 'cancelled' THEN 1 END) as cancelled_orders
        FROM orders o
        WHERE o.created_at >= CURRENT_DATE - INTERVAL '${days} days'
        GROUP BY DATE(o.created_at)
        ORDER BY date DESC
      `);

      return result.rows;
    } catch (error) {
      logger.error('Error getting order analytics:', error);
      throw error;
    }
  }

  /**
   * Get revenue statistics
   */
  static async getRevenueStats(period = 'monthly') {
    try {
      let groupBy, dateFormat;
      
      switch (period) {
        case 'daily':
          groupBy = 'DATE(created_at)';
          dateFormat = 'YYYY-MM-DD';
          break;
        case 'weekly':
          groupBy = 'DATE_TRUNC(\'week\', created_at)';
          dateFormat = 'YYYY-MM-DD';
          break;
        case 'monthly':
          groupBy = 'DATE_TRUNC(\'month\', created_at)';
          dateFormat = 'YYYY-MM';
          break;
        default:
          groupBy = 'DATE_TRUNC(\'month\', created_at)';
          dateFormat = 'YYYY-MM';
      }

      const result = await query(`
        SELECT 
          ${groupBy} as period,
          COUNT(*) as total_orders,
          COALESCE(SUM(total_amount), 0) as total_revenue,
          AVG(total_amount) as avg_order_value,
          COUNT(DISTINCT customer_id) as unique_customers
        FROM orders 
        WHERE status = 'completed'
        GROUP BY ${groupBy}
        ORDER BY period DESC
        LIMIT 12
      `);

      return result.rows;
    } catch (error) {
      logger.error('Error getting revenue stats:', error);
      throw error;
    }
  }

  /**
   * Get category performance
   */
  static async getCategoryPerformance() {
    try {
      const result = await query(`
        SELECT 
          p.category,
          COUNT(p.id) as total_products,
          COUNT(CASE WHEN p.is_active = true THEN 1 END) as active_products,
          COUNT(o.id) as total_orders,
          COALESCE(SUM(o.total_amount), 0) as total_revenue,
          AVG(o.total_amount) as avg_order_value
        FROM products p
        LEFT JOIN orders o ON p.id = o.product_id
        GROUP BY p.category
        ORDER BY total_revenue DESC
      `);

      return result.rows;
    } catch (error) {
      logger.error('Error getting category performance:', error);
      throw error;
    }
  }

  /**
   * Get top customers
   */
  static async getTopCustomers(limit = 10) {
    try {
      const result = await query(`
        SELECT 
          u.id,
          u.first_name,
          u.last_name,
          u.email,
          COUNT(o.id) as total_orders,
          COALESCE(SUM(o.total_amount), 0) as total_spent,
          AVG(o.total_amount) as avg_order_value,
          MAX(o.created_at) as last_order_date
        FROM users u
        LEFT JOIN orders o ON u.id = o.customer_id
        WHERE o.status = 'completed'
        GROUP BY u.id, u.first_name, u.last_name, u.email
        ORDER BY total_spent DESC
        LIMIT $1
      `, [limit]);

      return result.rows;
    } catch (error) {
      logger.error('Error getting top customers:', error);
      throw error;
    }
  }

  /**
   * Get file upload statistics
   */
  static async getFileUploadStats(days = 30) {
    try {
      const result = await query(`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as total_files,
          SUM(size) as total_size,
          COUNT(CASE WHEN category = 'image' THEN 1 END) as image_count,
          COUNT(CASE WHEN category = 'document' THEN 1 END) as document_count,
          COUNT(CASE WHEN category = 'video' THEN 1 END) as video_count,
          COUNT(CASE WHEN category = 'audio' THEN 1 END) as audio_count,
          COUNT(DISTINCT uploaded_by) as unique_uploaders
        FROM files 
        WHERE created_at >= CURRENT_DATE - INTERVAL '${days} days'
        GROUP BY DATE(created_at)
        ORDER BY date DESC
      `);

      return result.rows;
    } catch (error) {
      logger.error('Error getting file upload stats:', error);
      throw error;
    }
  }

  /**
   * Get dashboard summary
   */
  static async getDashboardSummary() {
    try {
      const [
        systemStats,
        recentOrders,
        recentUsers,
        topProducts
      ] = await Promise.all([
        this.getSystemStats(),
        query(`
          SELECT o.*, p.name as product_name, u.first_name, u.last_name
          FROM orders o
          LEFT JOIN products p ON o.product_id = p.id
          LEFT JOIN users u ON o.customer_id = u.id
          ORDER BY o.created_at DESC
          LIMIT 5
        `),
        query(`
          SELECT id, first_name, last_name, email, created_at
          FROM users
          ORDER BY created_at DESC
          LIMIT 5
        `),
        query(`
          SELECT p.*, COUNT(o.id) as order_count
          FROM products p
          LEFT JOIN orders o ON p.id = o.product_id
          GROUP BY p.id
          ORDER BY order_count DESC
          LIMIT 5
        `)
      ]);

      return {
        systemStats,
        recentOrders: recentOrders.rows,
        recentUsers: recentUsers.rows,
        topProducts: topProducts.rows
      };
    } catch (error) {
      logger.error('Error getting dashboard summary:', error);
      throw error;
    }
  }
} 