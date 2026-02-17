import { Router } from 'express';
import { workspacesController } from './workspaces.controller.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { workspaceMiddleware } from '../../middleware/workspace.middleware.js';
import { requireRole } from '../../middleware/role.middleware.js';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// User's workspaces
router.get('/', workspacesController.getMyWorkspaces.bind(workspacesController));
router.post('/', workspacesController.create.bind(workspacesController));

// Accept invitation (before workspace middleware since user isn't member yet)
router.post('/invitations/accept', workspacesController.acceptInvitation.bind(workspacesController));

// Get workspace by slug (public info)
router.get('/slug/:slug', workspacesController.getBySlug.bind(workspacesController));

// Workspace-specific routes (require membership)
router.get('/:workspaceId', workspaceMiddleware, workspacesController.getById.bind(workspacesController));
router.put('/:workspaceId', workspaceMiddleware, requireRole(['owner', 'admin']), workspacesController.update.bind(workspacesController));
router.delete('/:workspaceId', workspaceMiddleware, requireRole(['owner']), workspacesController.delete.bind(workspacesController));

// Members
router.get('/:workspaceId/members', workspaceMiddleware, workspacesController.getMembers.bind(workspacesController));
router.put('/:workspaceId/members/:userId', workspaceMiddleware, requireRole(['owner', 'admin']), workspacesController.updateMemberRole.bind(workspacesController));
router.delete('/:workspaceId/members/:userId', workspaceMiddleware, requireRole(['owner', 'admin']), workspacesController.removeMember.bind(workspacesController));

// Invitations
router.get('/:workspaceId/invitations', workspaceMiddleware, requireRole(['owner', 'admin']), workspacesController.getInvitations.bind(workspacesController));
router.post('/:workspaceId/invitations', workspaceMiddleware, requireRole(['owner', 'admin']), workspacesController.invite.bind(workspacesController));
router.delete('/:workspaceId/invitations/:invitationId', workspaceMiddleware, requireRole(['owner', 'admin']), workspacesController.cancelInvitation.bind(workspacesController));

// Leave workspace
router.post('/:workspaceId/leave', workspaceMiddleware, workspacesController.leave.bind(workspacesController));

// Transfer ownership
router.post('/:workspaceId/transfer', workspaceMiddleware, requireRole(['owner']), workspacesController.transferOwnership.bind(workspacesController));

export default router;
