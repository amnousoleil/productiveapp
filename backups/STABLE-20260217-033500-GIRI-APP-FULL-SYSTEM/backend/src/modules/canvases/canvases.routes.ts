import { Router } from 'express';
import { canvasesController } from './canvases.controller.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { workspaceMiddleware } from '../../middleware/workspace.middleware.js';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Workspace canvases (require workspace context)
router.get('/workspace/:workspaceId', workspaceMiddleware, canvasesController.list.bind(canvasesController));
router.post('/workspace/:workspaceId', workspaceMiddleware, canvasesController.create.bind(canvasesController));
router.get('/workspace/:workspaceId/templates', workspaceMiddleware, canvasesController.getTemplates.bind(canvasesController));

// Canvas-specific routes
router.get('/:canvasId', canvasesController.getById.bind(canvasesController));
router.put('/:canvasId', canvasesController.update.bind(canvasesController));
router.delete('/:canvasId', canvasesController.delete.bind(canvasesController));

// Duplicate (requires workspace context)
router.post('/:canvasId/duplicate/workspace/:workspaceId', workspaceMiddleware, canvasesController.duplicate.bind(canvasesController));

// Collaborators
router.post('/:canvasId/collaborators', canvasesController.addCollaborator.bind(canvasesController));
router.delete('/:canvasId/collaborators/:userId', canvasesController.removeCollaborator.bind(canvasesController));

export default router;
