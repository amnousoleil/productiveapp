"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const files_controller_js_1 = require("./files.controller.js");
const auth_middleware_js_1 = require("../../middleware/auth.middleware.js");
const workspace_middleware_js_1 = require("../../middleware/workspace.middleware.js");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_middleware_js_1.authMiddleware);
// User storage
router.get('/my-storage', files_controller_js_1.filesController.getMyStorageUsage.bind(files_controller_js_1.filesController));
// Workspace files (require workspace context)
router.get('/workspace/:workspaceId', workspace_middleware_js_1.workspaceMiddleware, files_controller_js_1.filesController.list.bind(files_controller_js_1.filesController));
router.post('/workspace/:workspaceId', workspace_middleware_js_1.workspaceMiddleware, files_controller_js_1.filesController.upload.bind(files_controller_js_1.filesController));
router.get('/workspace/:workspaceId/storage', workspace_middleware_js_1.workspaceMiddleware, files_controller_js_1.filesController.getStorageUsage.bind(files_controller_js_1.filesController));
// Files by entity
router.get('/entity/:entityType/:entityId', files_controller_js_1.filesController.getByEntity.bind(files_controller_js_1.filesController));
// File-specific routes
router.get('/:fileId', files_controller_js_1.filesController.getById.bind(files_controller_js_1.filesController));
router.delete('/:fileId', files_controller_js_1.filesController.delete.bind(files_controller_js_1.filesController));
exports.default = router;
//# sourceMappingURL=files.routes.js.map