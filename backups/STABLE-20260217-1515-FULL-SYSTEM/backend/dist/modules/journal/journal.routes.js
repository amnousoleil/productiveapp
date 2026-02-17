"use strict";
// =============================================
// JOURNAL MODULE - ROUTES
// =============================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.createJournalRouter = createJournalRouter;
const express_1 = require("express");
const journal_controller_1 = require("./journal.controller");
const journal_service_1 = require("./journal.service");
const auth_middleware_js_1 = require("../../middleware/auth.middleware.js");
const workspace_middleware_js_1 = require("../../middleware/workspace.middleware.js");
function createJournalRouter(pool) {
    const router = (0, express_1.Router)();
    const journalService = new journal_service_1.JournalService(pool);
    const journalController = new journal_controller_1.JournalController(journalService);
    // All routes require authentication
    router.use(auth_middleware_js_1.authMiddleware);
    // Workspace-scoped routes (require workspace context)
    router.get('/workspace/:workspaceId', workspace_middleware_js_1.workspaceMiddleware, journalController.getEntries);
    router.post('/workspace/:workspaceId', workspace_middleware_js_1.workspaceMiddleware, journalController.upsertEntry);
    router.get('/workspace/:workspaceId/statistics', workspace_middleware_js_1.workspaceMiddleware, journalController.getStatistics);
    router.get('/workspace/:workspaceId/date/:date', workspace_middleware_js_1.workspaceMiddleware, journalController.getEntryByDate);
    router.get('/workspace/:workspaceId/:id', workspace_middleware_js_1.workspaceMiddleware, journalController.getEntryById);
    router.put('/workspace/:workspaceId/:id', workspace_middleware_js_1.workspaceMiddleware, journalController.updateEntry);
    router.delete('/workspace/:workspaceId/:id', workspace_middleware_js_1.workspaceMiddleware, journalController.deleteEntry);
    return router;
}
//# sourceMappingURL=journal.routes.js.map