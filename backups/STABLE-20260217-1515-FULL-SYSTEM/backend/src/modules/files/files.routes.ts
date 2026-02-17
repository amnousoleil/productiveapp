import { Router } from 'express';
import { filesController } from './files.controller.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { workspaceMiddleware } from '../../middleware/workspace.middleware.js';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// User storage
router.get('/my-storage', filesController.getMyStorageUsage.bind(filesController));

// Workspace files (require workspace context)
router.get('/workspace/:workspaceId', workspaceMiddleware, filesController.list.bind(filesController));
router.post('/workspace/:workspaceId', workspaceMiddleware, filesController.upload.bind(filesController));
router.get('/workspace/:workspaceId/storage', workspaceMiddleware, filesController.getStorageUsage.bind(filesController));

// Files by entity
router.get('/entity/:entityType/:entityId', filesController.getByEntity.bind(filesController));

// File-specific routes
router.get('/:fileId', filesController.getById.bind(filesController));
router.delete('/:fileId', filesController.delete.bind(filesController));

export default router;
