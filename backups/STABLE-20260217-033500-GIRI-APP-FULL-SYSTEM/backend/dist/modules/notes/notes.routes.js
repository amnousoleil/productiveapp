"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notes_controller_js_1 = require("./notes.controller.js");
const auth_middleware_js_1 = require("../../middleware/auth.middleware.js");
const workspace_middleware_js_1 = require("../../middleware/workspace.middleware.js");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_middleware_js_1.authMiddleware);
// Workspace notes (require workspace context)
router.get('/workspace/:workspaceId', workspace_middleware_js_1.workspaceMiddleware, notes_controller_js_1.notesController.list.bind(notes_controller_js_1.notesController));
router.post('/workspace/:workspaceId', workspace_middleware_js_1.workspaceMiddleware, notes_controller_js_1.notesController.create.bind(notes_controller_js_1.notesController));
router.get('/workspace/:workspaceId/deleted', workspace_middleware_js_1.workspaceMiddleware, notes_controller_js_1.notesController.getDeleted.bind(notes_controller_js_1.notesController));
router.get('/workspace/:workspaceId/templates', workspace_middleware_js_1.workspaceMiddleware, notes_controller_js_1.notesController.getTemplates.bind(notes_controller_js_1.notesController));
// Workspace-scoped note update (PUT + PATCH)
router.put('/workspace/:workspaceId/:noteId', workspace_middleware_js_1.workspaceMiddleware, notes_controller_js_1.notesController.update.bind(notes_controller_js_1.notesController));
router.patch('/workspace/:workspaceId/:noteId', workspace_middleware_js_1.workspaceMiddleware, notes_controller_js_1.notesController.update.bind(notes_controller_js_1.notesController));
// Workspace-scoped note delete
router.delete('/workspace/:workspaceId/:noteId', workspace_middleware_js_1.workspaceMiddleware, notes_controller_js_1.notesController.delete.bind(notes_controller_js_1.notesController));
// Note-specific routes (legacy, without workspace context)
router.get('/:noteId', notes_controller_js_1.notesController.getById.bind(notes_controller_js_1.notesController));
router.put('/:noteId', notes_controller_js_1.notesController.update.bind(notes_controller_js_1.notesController));
router.patch('/:noteId', notes_controller_js_1.notesController.update.bind(notes_controller_js_1.notesController));
router.delete('/:noteId', notes_controller_js_1.notesController.delete.bind(notes_controller_js_1.notesController));
router.post('/:noteId/restore', notes_controller_js_1.notesController.restore.bind(notes_controller_js_1.notesController));
router.delete('/:noteId/permanent', notes_controller_js_1.notesController.permanentDelete.bind(notes_controller_js_1.notesController));
// Duplicate (requires workspace context for new note)
router.post('/:noteId/duplicate/workspace/:workspaceId', workspace_middleware_js_1.workspaceMiddleware, notes_controller_js_1.notesController.duplicate.bind(notes_controller_js_1.notesController));
// Versions
router.get('/:noteId/versions', notes_controller_js_1.notesController.getVersions.bind(notes_controller_js_1.notesController));
router.post('/:noteId/versions/:versionId/restore', notes_controller_js_1.notesController.restoreVersion.bind(notes_controller_js_1.notesController));
// Links
router.get('/:noteId/links', notes_controller_js_1.notesController.getLinks.bind(notes_controller_js_1.notesController));
router.post('/:noteId/links', notes_controller_js_1.notesController.addLink.bind(notes_controller_js_1.notesController));
router.delete('/:noteId/links/:targetNoteId', notes_controller_js_1.notesController.removeLink.bind(notes_controller_js_1.notesController));
exports.default = router;
//# sourceMappingURL=notes.routes.js.map