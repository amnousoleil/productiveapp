"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const audit_controller_js_1 = require("./audit.controller.js");
const auth_middleware_js_1 = require("../../middleware/auth.middleware.js");
const workspace_middleware_js_1 = require("../../middleware/workspace.middleware.js");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_middleware_js_1.authMiddleware);
// Human Design (user-level, no workspace needed)
router.get('/human-design', audit_controller_js_1.auditController.getHumanDesign.bind(audit_controller_js_1.auditController));
router.post('/human-design', audit_controller_js_1.auditController.createHumanDesign.bind(audit_controller_js_1.auditController));
router.put('/human-design', audit_controller_js_1.auditController.updateHumanDesign.bind(audit_controller_js_1.auditController));
// Journal entries (require workspace context)
router.get('/workspace/:workspaceId/journal', workspace_middleware_js_1.workspaceMiddleware, audit_controller_js_1.auditController.listJournalEntries.bind(audit_controller_js_1.auditController));
router.post('/workspace/:workspaceId/journal', workspace_middleware_js_1.workspaceMiddleware, audit_controller_js_1.auditController.createJournalEntry.bind(audit_controller_js_1.auditController));
router.get('/workspace/:workspaceId/journal/stats', workspace_middleware_js_1.workspaceMiddleware, audit_controller_js_1.auditController.getJournalStats.bind(audit_controller_js_1.auditController));
router.get('/journal/:entryId', audit_controller_js_1.auditController.getJournalEntry.bind(audit_controller_js_1.auditController));
router.put('/journal/:entryId', audit_controller_js_1.auditController.updateJournalEntry.bind(audit_controller_js_1.auditController));
router.delete('/journal/:entryId', audit_controller_js_1.auditController.deleteJournalEntry.bind(audit_controller_js_1.auditController));
// Reports (require workspace context)
router.get('/workspace/:workspaceId/reports', workspace_middleware_js_1.workspaceMiddleware, audit_controller_js_1.auditController.listReports.bind(audit_controller_js_1.auditController));
router.post('/workspace/:workspaceId/reports', workspace_middleware_js_1.workspaceMiddleware, audit_controller_js_1.auditController.generateReport.bind(audit_controller_js_1.auditController));
router.get('/reports/:reportId', audit_controller_js_1.auditController.getReport.bind(audit_controller_js_1.auditController));
router.delete('/reports/:reportId', audit_controller_js_1.auditController.deleteReport.bind(audit_controller_js_1.auditController));
// Psycho Audits (require workspace context)
router.get('/workspace/:workspaceId/psycho', workspace_middleware_js_1.workspaceMiddleware, audit_controller_js_1.auditController.listPsychoAudits.bind(audit_controller_js_1.auditController));
router.post('/workspace/:workspaceId/psycho', workspace_middleware_js_1.workspaceMiddleware, audit_controller_js_1.auditController.createPsychoAudit.bind(audit_controller_js_1.auditController));
exports.default = router;
//# sourceMappingURL=audit.routes.js.map