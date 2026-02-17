"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const canvases_controller_js_1 = require("./canvases.controller.js");
const auth_middleware_js_1 = require("../../middleware/auth.middleware.js");
const workspace_middleware_js_1 = require("../../middleware/workspace.middleware.js");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_middleware_js_1.authMiddleware);
// Workspace canvases (require workspace context)
router.get('/workspace/:workspaceId', workspace_middleware_js_1.workspaceMiddleware, canvases_controller_js_1.canvasesController.list.bind(canvases_controller_js_1.canvasesController));
router.post('/workspace/:workspaceId', workspace_middleware_js_1.workspaceMiddleware, canvases_controller_js_1.canvasesController.create.bind(canvases_controller_js_1.canvasesController));
router.get('/workspace/:workspaceId/templates', workspace_middleware_js_1.workspaceMiddleware, canvases_controller_js_1.canvasesController.getTemplates.bind(canvases_controller_js_1.canvasesController));
// Canvas-specific routes
router.get('/:canvasId', canvases_controller_js_1.canvasesController.getById.bind(canvases_controller_js_1.canvasesController));
router.put('/:canvasId', canvases_controller_js_1.canvasesController.update.bind(canvases_controller_js_1.canvasesController));
router.delete('/:canvasId', canvases_controller_js_1.canvasesController.delete.bind(canvases_controller_js_1.canvasesController));
// Duplicate (requires workspace context)
router.post('/:canvasId/duplicate/workspace/:workspaceId', workspace_middleware_js_1.workspaceMiddleware, canvases_controller_js_1.canvasesController.duplicate.bind(canvases_controller_js_1.canvasesController));
// Collaborators
router.post('/:canvasId/collaborators', canvases_controller_js_1.canvasesController.addCollaborator.bind(canvases_controller_js_1.canvasesController));
router.delete('/:canvasId/collaborators/:userId', canvases_controller_js_1.canvasesController.removeCollaborator.bind(canvases_controller_js_1.canvasesController));
exports.default = router;
//# sourceMappingURL=canvases.routes.js.map