"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const users_controller_js_1 = require("./users.controller.js");
const auth_middleware_js_1 = require("../../middleware/auth.middleware.js");
const workspace_middleware_js_1 = require("../../middleware/workspace.middleware.js");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_middleware_js_1.authMiddleware);
// User profile routes
router.get('/me', users_controller_js_1.usersController.getMe.bind(users_controller_js_1.usersController));
router.put('/me', users_controller_js_1.usersController.update.bind(users_controller_js_1.usersController));
router.delete('/me', users_controller_js_1.usersController.deleteAccount.bind(users_controller_js_1.usersController));
// Search users
router.get('/search', users_controller_js_1.usersController.search.bind(users_controller_js_1.usersController));
// Get user by ID
router.get('/:id', users_controller_js_1.usersController.getById.bind(users_controller_js_1.usersController));
// Workspace members (requires workspace context)
router.get('/workspace/:workspaceId/members', workspace_middleware_js_1.workspaceMiddleware, users_controller_js_1.usersController.getWorkspaceMembers.bind(users_controller_js_1.usersController));
exports.default = router;
//# sourceMappingURL=users.routes.js.map