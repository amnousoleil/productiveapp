import { Router } from 'express';
import { tasksController } from './tasks.controller.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { workspaceMiddleware } from '../../middleware/workspace.middleware.js';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// User's tasks across all workspaces
router.get('/my', tasksController.getMyTasks.bind(tasksController));

// Workspace tasks (require workspace context)
router.get('/workspace/:workspaceId', workspaceMiddleware, tasksController.list.bind(tasksController));
router.post('/workspace/:workspaceId', workspaceMiddleware, tasksController.create.bind(tasksController));
router.post('/workspace/:workspaceId/reorder', workspaceMiddleware, tasksController.reorder.bind(tasksController));
router.get('/workspace/:workspaceId/due-soon', workspaceMiddleware, tasksController.getDueSoon.bind(tasksController));
router.get('/workspace/:workspaceId/overdue', workspaceMiddleware, tasksController.getOverdue.bind(tasksController));
router.get('/workspace/:workspaceId/active-users', workspaceMiddleware, tasksController.getActiveUsers.bind(tasksController));

// Task-specific routes
router.get('/:taskId', tasksController.getById.bind(tasksController));
router.put('/:taskId', tasksController.update.bind(tasksController));
router.delete('/:taskId', tasksController.delete.bind(tasksController));
router.get('/:taskId/subtasks', tasksController.getSubtasks.bind(tasksController));

// Comments
router.get('/:taskId/comments', tasksController.getComments.bind(tasksController));
router.post('/:taskId/comments', tasksController.addComment.bind(tasksController));
router.put('/comments/:commentId', tasksController.updateComment.bind(tasksController));
router.delete('/comments/:commentId', tasksController.deleteComment.bind(tasksController));

export default router;
