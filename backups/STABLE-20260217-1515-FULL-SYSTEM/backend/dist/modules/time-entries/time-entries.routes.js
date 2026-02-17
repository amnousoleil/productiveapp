"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const time_entries_controller_js_1 = require("./time-entries.controller.js");
const auth_middleware_js_1 = require("../../middleware/auth.middleware.js");
const workspace_middleware_js_1 = require("../../middleware/workspace.middleware.js");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_middleware_js_1.authMiddleware);
// All time entry routes are workspace-scoped
// Mounted at: /api/v1/time/workspace/:workspaceId
router.use('/workspace/:workspaceId', workspace_middleware_js_1.workspaceMiddleware);
// --- Collection routes ---
router.post('/workspace/:workspaceId', time_entries_controller_js_1.timeEntriesController.createEntry.bind(time_entries_controller_js_1.timeEntriesController));
router.get('/workspace/:workspaceId', time_entries_controller_js_1.timeEntriesController.listEntries.bind(time_entries_controller_js_1.timeEntriesController));
// --- Special queries (must come before /:id to avoid param conflicts) ---
router.get('/workspace/:workspaceId/running', time_entries_controller_js_1.timeEntriesController.getRunningEntry.bind(time_entries_controller_js_1.timeEntriesController));
router.get('/workspace/:workspaceId/summary/weekly', time_entries_controller_js_1.timeEntriesController.getWeeklySummary.bind(time_entries_controller_js_1.timeEntriesController));
router.get('/workspace/:workspaceId/summary/monthly', time_entries_controller_js_1.timeEntriesController.getMonthlySummary.bind(time_entries_controller_js_1.timeEntriesController));
// --- Member rates ---
router.get('/workspace/:workspaceId/rates/:memberId', time_entries_controller_js_1.timeEntriesController.getMemberRate.bind(time_entries_controller_js_1.timeEntriesController));
router.put('/workspace/:workspaceId/rates/:memberId', time_entries_controller_js_1.timeEntriesController.setMemberRate.bind(time_entries_controller_js_1.timeEntriesController));
// --- Individual entry routes ---
router.get('/workspace/:workspaceId/:id', time_entries_controller_js_1.timeEntriesController.getEntry.bind(time_entries_controller_js_1.timeEntriesController));
router.put('/workspace/:workspaceId/:id', time_entries_controller_js_1.timeEntriesController.updateEntry.bind(time_entries_controller_js_1.timeEntriesController));
router.delete('/workspace/:workspaceId/:id', time_entries_controller_js_1.timeEntriesController.deleteEntry.bind(time_entries_controller_js_1.timeEntriesController));
router.post('/workspace/:workspaceId/:id/stop', time_entries_controller_js_1.timeEntriesController.stopEntry.bind(time_entries_controller_js_1.timeEntriesController));
exports.default = router;
//# sourceMappingURL=time-entries.routes.js.map