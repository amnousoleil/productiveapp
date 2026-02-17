import { Router } from 'express';
import { projectsController } from './projects.controller.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { workspaceMiddleware } from '../../middleware/workspace.middleware.js';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// User's projects across all workspaces
router.get('/my', projectsController.getMyProjects.bind(projectsController));

// Workspace projects (require workspace context)
router.get(
  '/workspace/:workspaceId',
  workspaceMiddleware,
  projectsController.list.bind(projectsController)
);

router.post(
  '/workspace/:workspaceId',
  workspaceMiddleware,
  projectsController.create.bind(projectsController)
);

router.post(
  '/workspace/:workspaceId/reorder',
  workspaceMiddleware,
  projectsController.reorder.bind(projectsController)
);

// Project-specific routes
router.get('/:projectId', projectsController.getById.bind(projectsController));
router.put('/:projectId', projectsController.update.bind(projectsController));
router.delete('/:projectId', projectsController.delete.bind(projectsController));
router.post('/:projectId/archive', projectsController.archive.bind(projectsController));
router.post('/:projectId/restore', projectsController.restore.bind(projectsController));

// Project members
router.get('/:projectId/members', projectsController.getMembers.bind(projectsController));
router.post('/:projectId/members', projectsController.addMember.bind(projectsController));
router.put('/:projectId/members/:userId', projectsController.updateMemberRole.bind(projectsController));
router.delete('/:projectId/members/:userId', projectsController.removeMember.bind(projectsController));

export default router;
