import { query } from '../database/connection.js';
import { ApiResponse } from '../utils/response.js';
import { logger } from '../utils/logger.js';
import { generateUUID, formatBytes, isValidURL } from '../utils/helpers.js';
import path from 'path';
import fs from 'fs';

/**
 * File Controller - Handles file upload, download, and management
 */

// Allowed file types and their MIME types
const ALLOWED_FILE_TYPES = {
  'image': ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  'document': ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  'video': ['video/mp4', 'video/avi', 'video/mov'],
  'audio': ['audio/mpeg', 'audio/wav', 'audio/ogg']
};

// Maximum file size (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * Upload a file
 * @route POST /api/files/upload
 */
export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return ApiResponse.badRequest(res, 'No file uploaded');
    }

    const { originalname, mimetype, size, filename } = req.file;
    const { category = 'general', description = '' } = req.body;
    const uploadedBy = req.user.id;

    // Validate file size
    if (size > MAX_FILE_SIZE) {
      return ApiResponse.badRequest(res, `File size exceeds maximum limit of ${formatBytes(MAX_FILE_SIZE)}`);
    }

    // Validate file type
    const isValidType = Object.values(ALLOWED_FILE_TYPES).flat().includes(mimetype);
    if (!isValidType) {
      return ApiResponse.badRequest(res, 'File type not allowed');
    }

    // Generate unique file ID
    const fileId = generateUUID();
    const fileExtension = path.extname(originalname);
    const newFilename = `${fileId}${fileExtension}`;

    // Move file to permanent location
    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const newPath = path.join(uploadDir, newFilename);
    fs.renameSync(req.file.path, newPath);

    // Save file info to database
    const result = await query(
      `INSERT INTO files (id, original_name, filename, mime_type, size, category, description, uploaded_by, file_path)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [fileId, originalname, newFilename, mimetype, size, category, description, uploadedBy, newPath]
    );

    const fileData = result.rows[0];
    logger.info('File uploaded successfully', { fileId, originalName: originalname, size });

    return ApiResponse.created(res, 'File uploaded successfully', {
      id: fileData.id,
      originalName: fileData.original_name,
      filename: fileData.filename,
      size: fileData.size,
      mimeType: fileData.mime_type,
      category: fileData.category,
      uploadedAt: fileData.created_at
    });

  } catch (error) {
    logger.error('Error uploading file:', error);
    return ApiResponse.error(res, 'Failed to upload file', 500, error);
  }
};

/**
 * Get all files with pagination and filtering
 * @route GET /api/files
 */
export const getAllFiles = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, uploadedBy, search } = req.query;
    const offset = (page - 1) * limit;

    let whereConditions = ['1=1'];
    let params = [];
    let paramCount = 1;

    if (category) {
      whereConditions.push(`category = $${paramCount++}`);
      params.push(category);
    }

    if (uploadedBy) {
      whereConditions.push(`uploaded_by = $${paramCount++}`);
      params.push(uploadedBy);
    }

    if (search) {
      whereConditions.push(`(original_name ILIKE $${paramCount++} OR description ILIKE $${paramCount})`);
      params.push(`%${search}%`, `%${search}%`);
    }

    const whereClause = whereConditions.join(' AND ');

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) as total FROM files WHERE ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].total);

    // Get files with user info
    params.push(limit, offset);
    const result = await query(
      `SELECT f.*, u.first_name, u.last_name, u.email as uploader_email
       FROM files f
       LEFT JOIN users u ON f.uploaded_by = u.id
       WHERE ${whereClause}
       ORDER BY f.created_at DESC
       LIMIT $${paramCount++} OFFSET $${paramCount}`,
      params
    );

    const totalPages = Math.ceil(total / limit);

    return ApiResponse.success(res, {
      files: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    logger.error('Error getting files:', error);
    return ApiResponse.error(res, 'Failed to get files', 500, error);
  }
};

/**
 * Get file by ID
 * @route GET /api/files/:id
 */
export const getFileById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT f.*, u.first_name, u.last_name, u.email as uploader_email
       FROM files f
       LEFT JOIN users u ON f.uploaded_by = u.id
       WHERE f.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return ApiResponse.notFound(res, 'File not found');
    }

    return ApiResponse.success(res, result.rows[0]);

  } catch (error) {
    logger.error('Error getting file by ID:', error);
    return ApiResponse.error(res, 'Failed to get file', 500, error);
  }
};

/**
 * Download file
 * @route GET /api/files/:id/download
 */
export const downloadFile = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      'SELECT * FROM files WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return ApiResponse.notFound(res, 'File not found');
    }

    const file = result.rows[0];
    const filePath = file.file_path;

    if (!fs.existsSync(filePath)) {
      return ApiResponse.notFound(res, 'File not found on disk');
    }

    // Set headers for download
    res.setHeader('Content-Disposition', `attachment; filename="${file.original_name}"`);
    res.setHeader('Content-Type', file.mime_type);
    res.setHeader('Content-Length', file.size);

    // Stream the file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    logger.info('File downloaded', { fileId: id, originalName: file.original_name });

  } catch (error) {
    logger.error('Error downloading file:', error);
    return ApiResponse.error(res, 'Failed to download file', 500, error);
  }
};

/**
 * Delete file
 * @route DELETE /api/files/:id
 */
export const deleteFile = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Check if file exists
    const result = await query(
      'SELECT * FROM files WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return ApiResponse.notFound(res, 'File not found');
    }

    const file = result.rows[0];

    // Check permissions (only admin or file owner can delete)
    if (userRole !== 'admin' && file.uploaded_by !== userId) {
      return ApiResponse.forbidden(res, 'You do not have permission to delete this file');
    }

    // Delete file from disk
    if (fs.existsSync(file.file_path)) {
      fs.unlinkSync(file.file_path);
    }

    // Delete from database
    await query('DELETE FROM files WHERE id = $1', [id]);

    logger.info('File deleted successfully', { fileId: id, deletedBy: userId });

    return ApiResponse.success(res, 'File deleted successfully');

  } catch (error) {
    logger.error('Error deleting file:', error);
    return ApiResponse.error(res, 'Failed to delete file', 500, error);
  }
};

/**
 * Get file statistics
 * @route GET /api/files/stats
 */
export const getFileStats = async (req, res) => {
  try {
    const statsResult = await query(`
      SELECT 
        COUNT(*) as total_files,
        SUM(size) as total_size,
        COUNT(DISTINCT uploaded_by) as unique_uploaders,
        COUNT(CASE WHEN category = 'image' THEN 1 END) as image_count,
        COUNT(CASE WHEN category = 'document' THEN 1 END) as document_count,
        COUNT(CASE WHEN category = 'video' THEN 1 END) as video_count,
        COUNT(CASE WHEN category = 'audio' THEN 1 END) as audio_count
      FROM files
    `);

    const stats = statsResult.rows[0];

    return ApiResponse.success(res, {
      totalFiles: parseInt(stats.total_files),
      totalSize: parseInt(stats.total_size || 0),
      totalSizeFormatted: formatBytes(parseInt(stats.total_size || 0)),
      uniqueUploaders: parseInt(stats.unique_uploaders),
      byCategory: {
        images: parseInt(stats.image_count),
        documents: parseInt(stats.document_count),
        videos: parseInt(stats.video_count),
        audio: parseInt(stats.audio_count)
      }
    });

  } catch (error) {
    logger.error('Error getting file stats:', error);
    return ApiResponse.error(res, 'Failed to get file statistics', 500, error);
  }
}; 