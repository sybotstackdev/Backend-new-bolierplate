import express from 'express';
import multer from 'multer';
import path from 'path';
import {
  uploadFile,
  getAllFiles,
  getFileById,
  downloadFile,
  deleteFile,
  getFileStats
} from '../controllers/fileController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'temp/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow common file types
    const allowedMimes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'video/mp4', 'video/avi', 'video/mov',
      'audio/mpeg', 'audio/wav', 'audio/ogg'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
});

// Public routes (no authentication required)
router.get('/', getAllFiles);
router.get('/stats', getFileStats);
router.get('/:id', getFileById);
router.get('/:id/download', downloadFile);

// Protected routes (authentication required)
router.post('/upload', authenticateToken, upload.single('file'), uploadFile);
router.delete('/:id', authenticateToken, deleteFile);

export default router; 