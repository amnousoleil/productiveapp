import { Router } from 'express';
import { notesController } from './notes.controller.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { workspaceMiddleware } from '../../middleware/workspace.middleware.js';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Workspace notes (require workspace context)
router.get('/workspace/:workspaceId', workspaceMiddleware, notesController.list.bind(notesController));
router.post('/workspace/:workspaceId', workspaceMiddleware, notesController.create.bind(notesController));
router.get('/workspace/:workspaceId/deleted', workspaceMiddleware, notesController.getDeleted.bind(notesController));
router.get('/workspace/:workspaceId/templates', workspaceMiddleware, notesController.getTemplates.bind(notesController));

// Workspace-scoped note update (PUT + PATCH)
router.put('/workspace/:workspaceId/:noteId', workspaceMiddleware, notesController.update.bind(notesController));
router.patch('/workspace/:workspaceId/:noteId', workspaceMiddleware, notesController.update.bind(notesController));

// Workspace-scoped note delete
router.delete('/workspace/:workspaceId/:noteId', workspaceMiddleware, notesController.delete.bind(notesController));

// Note-specific routes (legacy, without workspace context)
router.get('/:noteId', notesController.getById.bind(notesController));
router.put('/:noteId', notesController.update.bind(notesController));
router.patch('/:noteId', notesController.update.bind(notesController));
router.delete('/:noteId', notesController.delete.bind(notesController));
router.post('/:noteId/restore', notesController.restore.bind(notesController));
router.delete('/:noteId/permanent', notesController.permanentDelete.bind(notesController));

// Duplicate (requires workspace context for new note)
router.post('/:noteId/duplicate/workspace/:workspaceId', workspaceMiddleware, notesController.duplicate.bind(notesController));

// Versions
router.get('/:noteId/versions', notesController.getVersions.bind(notesController));
router.post('/:noteId/versions/:versionId/restore', notesController.restoreVersion.bind(notesController));

// Links
router.get('/:noteId/links', notesController.getLinks.bind(notesController));
router.post('/:noteId/links', notesController.addLink.bind(notesController));
router.delete('/:noteId/links/:targetNoteId', notesController.removeLink.bind(notesController));

export default router;
