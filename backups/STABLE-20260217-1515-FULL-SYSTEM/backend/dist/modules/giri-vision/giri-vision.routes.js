"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const giri_vision_controller_js_1 = require("./giri-vision.controller.js");
const auth_middleware_js_1 = require("../../middleware/auth.middleware.js");
const workspace_middleware_js_1 = require("../../middleware/workspace.middleware.js");
const router = (0, express_1.Router)();
router.use(auth_middleware_js_1.authMiddleware);
// POST /api/giri-vision/meetings
router.post('/meetings', workspace_middleware_js_1.workspaceMiddleware, giri_vision_controller_js_1.giriVisionController.createMeeting);
// GET /api/giri-vision/meetings
router.get('/meetings', workspace_middleware_js_1.workspaceMiddleware, giri_vision_controller_js_1.giriVisionController.getMeetings);
// GET /api/giri-vision/meetings/:roomId
router.get('/meetings/:roomId', giri_vision_controller_js_1.giriVisionController.getMeeting);
// POST /api/giri-vision/meetings/:roomId/join
router.post('/meetings/:roomId/join', giri_vision_controller_js_1.giriVisionController.joinMeeting);
// POST /api/giri-vision/meetings/:roomId/end
router.post('/meetings/:roomId/end', giri_vision_controller_js_1.giriVisionController.endMeeting);
// DELETE /api/giri-vision/meetings/:roomId
router.delete('/meetings/:roomId', giri_vision_controller_js_1.giriVisionController.deleteMeeting);
exports.default = router;
//# sourceMappingURL=giri-vision.routes.js.map