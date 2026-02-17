import { Router } from 'express';
import { usersController } from './users.controller.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { workspaceMiddleware } from '../../middleware/workspace.middleware.js';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// User profile routes
router.get('/me', usersController.getMe.bind(usersController));
router.put('/me', usersController.update.bind(usersController));
router.delete('/me', usersController.deleteAccount.bind(usersController));

// Search users
router.get('/search', usersController.search.bind(usersController));

// Get user by ID
router.get('/:id', usersController.getById.bind(usersController));

// Workspace members (requires workspace context)
router.get(
  '/workspace/:workspaceId/members',
  workspaceMiddleware,
  usersController.getWorkspaceMembers.bind(usersController)
);

export default router;
