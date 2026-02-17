"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const projects_controller_js_1 = require("./projects.controller.js");
const auth_middleware_js_1 = require("../../middleware/auth.middleware.js");
const workspace_middleware_js_1 = require("../../middleware/workspace.middleware.js");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_middleware_js_1.authMiddleware);
// User's projects across all workspaces
router.get('/my', projects_controller_js_1.projectsController.getMyProjects.bind(projects_controller_js_1.projectsController));
// Workspace projects (require workspace context)
router.get('/workspace/:workspaceId', workspace_middleware_js_1.workspaceMiddleware, projects_controller_js_1.projectsController.list.bind(projects_controller_js_1.projectsController));
router.post('/workspace/:workspaceId', workspace_middleware_js_1.workspaceMiddleware, projects_controller_js_1.projectsController.create.bind(projects_controller_js_1.projectsController));
router.post('/workspace/:workspaceId/reorder', workspace_middleware_js_1.workspaceMiddleware, projects_controller_js_1.projectsController.reorder.bind(projects_controller_js_1.projectsController));
// Project-specific routes
router.get('/:projectId', projects_controller_js_1.projectsController.getById.bind(projects_controller_js_1.projectsController));
router.put('/:projectId', projects_controller_js_1.projectsController.update.bind(projects_controller_js_1.projectsController));
router.delete('/:projectId', projects_controller_js_1.projectsController.delete.bind(projects_controller_js_1.projectsController));
router.post('/:projectId/archive', projects_controller_js_1.projectsController.archive.bind(projects_controller_js_1.projectsController));
router.post('/:projectId/restore', projects_controller_js_1.projectsController.restore.bind(projects_controller_js_1.projectsController));
// Project members
router.get('/:projectId/members', projects_controller_js_1.projectsController.getMembers.bind(projects_controller_js_1.projectsController));
router.post('/:projectId/members', projects_controller_js_1.projectsController.addMember.bind(projects_controller_js_1.projectsController));
router.put('/:projectId/members/:userId', projects_controller_js_1.projectsController.updateMemberRole.bind(projects_controller_js_1.projectsController));
router.delete('/:projectId/members/:userId', projects_controller_js_1.projectsController.removeMember.bind(projects_controller_js_1.projectsController));
exports.default = router;
//# sourceMappingURL=projects.routes.js.map