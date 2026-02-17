"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const workspaces_controller_js_1 = require("./workspaces.controller.js");
const auth_middleware_js_1 = require("../../middleware/auth.middleware.js");
const workspace_middleware_js_1 = require("../../middleware/workspace.middleware.js");
const role_middleware_js_1 = require("../../middleware/role.middleware.js");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_middleware_js_1.authMiddleware);
// User's workspaces
router.get('/', workspaces_controller_js_1.workspacesController.getMyWorkspaces.bind(workspaces_controller_js_1.workspacesController));
router.post('/', workspaces_controller_js_1.workspacesController.create.bind(workspaces_controller_js_1.workspacesController));
// Accept invitation (before workspace middleware since user isn't member yet)
router.post('/invitations/accept', workspaces_controller_js_1.workspacesController.acceptInvitation.bind(workspaces_controller_js_1.workspacesController));
// Get workspace by slug (public info)
router.get('/slug/:slug', workspaces_controller_js_1.workspacesController.getBySlug.bind(workspaces_controller_js_1.workspacesController));
// Workspace-specific routes (require membership)
router.get('/:workspaceId', workspace_middleware_js_1.workspaceMiddleware, workspaces_controller_js_1.workspacesController.getById.bind(workspaces_controller_js_1.workspacesController));
router.put('/:workspaceId', workspace_middleware_js_1.workspaceMiddleware, (0, role_middleware_js_1.requireRole)(['owner', 'admin']), workspaces_controller_js_1.workspacesController.update.bind(workspaces_controller_js_1.workspacesController));
router.delete('/:workspaceId', workspace_middleware_js_1.workspaceMiddleware, (0, role_middleware_js_1.requireRole)(['owner']), workspaces_controller_js_1.workspacesController.delete.bind(workspaces_controller_js_1.workspacesController));
// Members
router.get('/:workspaceId/members', workspace_middleware_js_1.workspaceMiddleware, workspaces_controller_js_1.workspacesController.getMembers.bind(workspaces_controller_js_1.workspacesController));
router.put('/:workspaceId/members/:userId', workspace_middleware_js_1.workspaceMiddleware, (0, role_middleware_js_1.requireRole)(['owner', 'admin']), workspaces_controller_js_1.workspacesController.updateMemberRole.bind(workspaces_controller_js_1.workspacesController));
router.delete('/:workspaceId/members/:userId', workspace_middleware_js_1.workspaceMiddleware, (0, role_middleware_js_1.requireRole)(['owner', 'admin']), workspaces_controller_js_1.workspacesController.removeMember.bind(workspaces_controller_js_1.workspacesController));
// Invitations
router.get('/:workspaceId/invitations', workspace_middleware_js_1.workspaceMiddleware, (0, role_middleware_js_1.requireRole)(['owner', 'admin']), workspaces_controller_js_1.workspacesController.getInvitations.bind(workspaces_controller_js_1.workspacesController));
router.post('/:workspaceId/invitations', workspace_middleware_js_1.workspaceMiddleware, (0, role_middleware_js_1.requireRole)(['owner', 'admin']), workspaces_controller_js_1.workspacesController.invite.bind(workspaces_controller_js_1.workspacesController));
router.delete('/:workspaceId/invitations/:invitationId', workspace_middleware_js_1.workspaceMiddleware, (0, role_middleware_js_1.requireRole)(['owner', 'admin']), workspaces_controller_js_1.workspacesController.cancelInvitation.bind(workspaces_controller_js_1.workspacesController));
// Leave workspace
router.post('/:workspaceId/leave', workspace_middleware_js_1.workspaceMiddleware, workspaces_controller_js_1.workspacesController.leave.bind(workspaces_controller_js_1.workspacesController));
// Transfer ownership
router.post('/:workspaceId/transfer', workspace_middleware_js_1.workspaceMiddleware, (0, role_middleware_js_1.requireRole)(['owner']), workspaces_controller_js_1.workspacesController.transferOwnership.bind(workspaces_controller_js_1.workspacesController));
exports.default = router;
//# sourceMappingURL=workspaces.routes.js.map