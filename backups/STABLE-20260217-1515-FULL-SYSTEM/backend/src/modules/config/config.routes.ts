import express from 'express';
import multer from 'multer';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import * as configController from './config.controller.js';

const router = express.Router();

// Multer config - upload en mémoire (max 5MB)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only images allowed'));
    }
    cb(null, true);
  }
});

// TOUTES les routes avec authMiddleware
router.get('/', authMiddleware, configController.getConfig);
router.put('/', authMiddleware, configController.updateConfig);
router.post('/upload-logo', authMiddleware, upload.single('logo'), configController.uploadLogo);
router.delete('/logo', authMiddleware, configController.deleteLogo);

export default router;
