import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import { randomUUID } from 'crypto';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import type { AuthenticatedRequest } from '../../types/index.js';
import { successResponse } from '../../utils/helpers.js';

const router = Router();

// Configure multer storage
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(process.cwd(), 'uploads'));
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${randomUUID()}${ext}`;
    cb(null, uniqueName);
  }
});

// File filter
const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Allow common file types
  const allowedMimes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'application/zip',
    'application/x-rar-compressed',
    'audio/mpeg',
    'video/mp4'
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'));
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  },
  fileFilter
});

// All routes require authentication
router.use(authMiddleware);

// Upload file for messaging
router.post('/message', upload.single('file'), (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  try {
    const file = req.file;

    if (!file) {
      res.status(400).json({
        success: false,
        error: { code: 'NO_FILE', message: 'No file uploaded' }
      });
      return;
    }

    const fileUrl = `/uploads/${file.filename}`;

    res.status(201).json(successResponse({
      url: fileUrl,
      filename: file.originalname,
      size: file.size,
      mimetype: file.mimetype
    }));
  } catch (error) {
    next(error);
  }
});

// Upload multiple files
router.post('/multiple', upload.array('files', 10), (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  try {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      res.status(400).json({
        success: false,
        error: { code: 'NO_FILES', message: 'No files uploaded' }
      });
      return;
    }

    const uploadedFiles = files.map(file => ({
      url: `/uploads/${file.filename}`,
      filename: file.originalname,
      size: file.size,
      mimetype: file.mimetype
    }));

    res.status(201).json(successResponse({ files: uploadedFiles }));
  } catch (error) {
    next(error);
  }
});

export default router;
