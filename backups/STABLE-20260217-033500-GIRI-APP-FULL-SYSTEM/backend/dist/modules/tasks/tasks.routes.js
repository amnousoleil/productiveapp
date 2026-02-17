"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tasks_controller_js_1 = require("./tasks.controller.js");
const auth_middleware_js_1 = require("../../middleware/auth.middleware.js");
const workspace_middleware_js_1 = require("../../middleware/workspace.middleware.js");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_middleware_js_1.authMiddleware);
// User's tasks across all workspaces
router.get('/my', tasks_controller_js_1.tasksController.getMyTasks.bind(tasks_controller_js_1.tasksController));
// Workspace tasks (require workspace context)
router.get('/workspace/:workspaceId', workspace_middleware_js_1.workspaceMiddleware, tasks_controller_js_1.tasksController.list.bind(tasks_controller_js_1.tasksController));
router.post('/workspace/:workspaceId', workspace_middleware_js_1.workspaceMiddleware, tasks_controller_js_1.tasksController.create.bind(tasks_controller_js_1.tasksController));
router.post('/workspace/:workspaceId/reorder', workspace_middleware_js_1.workspaceMiddleware, tasks_controller_js_1.tasksController.reorder.bind(tasks_controller_js_1.tasksController));
router.get('/workspace/:workspaceId/due-soon', workspace_middleware_js_1.workspaceMiddleware, tasks_controller_js_1.tasksController.getDueSoon.bind(tasks_controller_js_1.tasksController));
router.get('/workspace/:workspaceId/overdue', workspace_middleware_js_1.workspaceMiddleware, tasks_controller_js_1.tasksController.getOverdue.bind(tasks_controller_js_1.tasksController));
router.get('/workspace/:workspaceId/active-users', workspace_middleware_js_1.workspaceMiddleware, tasks_controller_js_1.tasksController.getActiveUsers.bind(tasks_controller_js_1.tasksController));
// Task-specific routes
router.get('/:taskId', tasks_controller_js_1.tasksController.getById.bind(tasks_controller_js_1.tasksController));
router.put('/:taskId', tasks_controller_js_1.tasksController.update.bind(tasks_controller_js_1.tasksController));
router.delete('/:taskId', tasks_controller_js_1.tasksController.delete.bind(tasks_controller_js_1.tasksController));
router.get('/:taskId/subtasks', tasks_controller_js_1.tasksController.getSubtasks.bind(tasks_controller_js_1.tasksController));
// Comments
router.get('/:taskId/comments', tasks_controller_js_1.tasksController.getComments.bind(tasks_controller_js_1.tasksController));
router.post('/:taskId/comments', tasks_controller_js_1.tasksController.addComment.bind(tasks_controller_js_1.tasksController));
router.put('/comments/:commentId', tasks_controller_js_1.tasksController.updateComment.bind(tasks_controller_js_1.tasksController));
router.delete('/comments/:commentId', tasks_controller_js_1.tasksController.deleteComment.bind(tasks_controller_js_1.tasksController));
exports.default = router;
//# sourceMappingURL=tasks.routes.js.map