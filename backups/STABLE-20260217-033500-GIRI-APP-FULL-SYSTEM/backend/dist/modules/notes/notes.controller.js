"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notesController = exports.NotesController = void 0;
const notes_service_js_1 = require("./notes.service.js");
const helpers_js_1 = require("../../utils/helpers.js");
const validation_js_1 = require("../../utils/validation.js");
const zod_1 = require("zod");
const signals_service_js_1 = require("../signals/signals.service.js");
const listNotesSchema = validation_js_1.paginationSchema.extend({
    q: zod_1.z.string().optional(),
    project_id: validation_js_1.uuidSchema.nullable().optional(),
    tags: zod_1.z.string().optional().transform((val) => val?.split(',').filter(Boolean)),
    is_pinned: zod_1.z.coerce.boolean().optional(),
    is_template: zod_1.z.coerce.boolean().optional(),
    member_id: zod_1.z.string().max(100).optional(),
});
const linkSchema = zod_1.z.object({
    target_note_id: validation_js_1.uuidSchema,
});
const memberIdSchema = zod_1.z.object({
    member_id: zod_1.z.string().max(100).optional(),
});
class NotesController {
    async create(req, res, next) {
        try {
            const workspaceId = req.workspace.id;
            const userId = req.user.id;
            const input = validation_js_1.createNoteSchema.parse(req.body);
            const note = await notes_service_js_1.notesService.create(workspaceId, userId, input);
            // Record behavioral signal
            (0, signals_service_js_1.recordSignalAsync)(userId, workspaceId, 'note_created', 'notes', note.id, {
                title_length: note.title?.length || 0,
                content_length: note.content?.length || 0,
                hour: new Date().getHours()
            });
            res.status(201).json((0, helpers_js_1.successResponse)({ note }));
        }
        catch (error) {
            next(error);
        }
    }
    async getById(req, res, next) {
        try {
            const noteId = validation_js_1.uuidSchema.parse(req.params.noteId);
            const userId = req.user.id;
            const { member_id } = memberIdSchema.parse(req.query);
            const canAccess = await notes_service_js_1.notesService.canAccess(noteId, userId, member_id);
            if (!canAccess) {
                throw helpers_js_1.AppError.forbidden('Access denied to this note');
            }
            const note = await notes_service_js_1.notesService.getByIdWithAuthor(noteId);
            res.json((0, helpers_js_1.successResponse)({ note }));
        }
        catch (error) {
            next(error);
        }
    }
    async list(req, res, next) {
        try {
            const workspaceId = req.workspace.id;
            const userId = req.user.id;
            const params = listNotesSchema.parse(req.query);
            const { notes, total } = await notes_service_js_1.notesService.list(workspaceId, userId, params);
            res.json((0, helpers_js_1.paginatedResponse)(notes, params, total));
        }
        catch (error) {
            next(error);
        }
    }
    async update(req, res, next) {
        try {
            const noteId = validation_js_1.uuidSchema.parse(req.params.noteId);
            const userId = req.user.id;
            const workspaceId = req.workspace?.id || req.params.workspaceId;
            const input = validation_js_1.updateNoteSchema.parse(req.body);
            const memberId = input.member_id;
            const canAccess = await notes_service_js_1.notesService.canAccess(noteId, userId, memberId);
            if (!canAccess) {
                throw helpers_js_1.AppError.forbidden('Access denied to this note');
            }
            // Get old content length for delta calculation
            const oldNote = await notes_service_js_1.notesService.getById(noteId);
            const oldLength = oldNote?.content?.length || 0;
            const note = await notes_service_js_1.notesService.update(noteId, userId, input);
            // Record behavioral signal
            const newLength = note.content?.length || 0;
            if (workspaceId) {
                (0, signals_service_js_1.recordSignalAsync)(userId, workspaceId, 'note_edited', 'notes', note.id, {
                    content_length_delta: newLength - oldLength
                });
            }
            res.json((0, helpers_js_1.successResponse)({ note }));
        }
        catch (error) {
            next(error);
        }
    }
    async delete(req, res, next) {
        try {
            const noteId = validation_js_1.uuidSchema.parse(req.params.noteId);
            const userId = req.user.id;
            const { member_id } = memberIdSchema.parse(req.query);
            const canAccess = await notes_service_js_1.notesService.canAccess(noteId, userId, member_id);
            if (!canAccess) {
                throw helpers_js_1.AppError.forbidden('Access denied to this note');
            }
            await notes_service_js_1.notesService.delete(noteId);
            res.json((0, helpers_js_1.successResponse)({ message: 'Note deleted' }));
        }
        catch (error) {
            next(error);
        }
    }
    async restore(req, res, next) {
        try {
            const noteId = validation_js_1.uuidSchema.parse(req.params.noteId);
            const note = await notes_service_js_1.notesService.restore(noteId);
            res.json((0, helpers_js_1.successResponse)({ note }));
        }
        catch (error) {
            next(error);
        }
    }
    async permanentDelete(req, res, next) {
        try {
            const noteId = validation_js_1.uuidSchema.parse(req.params.noteId);
            await notes_service_js_1.notesService.permanentDelete(noteId);
            res.json((0, helpers_js_1.successResponse)({ message: 'Note permanently deleted' }));
        }
        catch (error) {
            next(error);
        }
    }
    async getDeleted(req, res, next) {
        try {
            const workspaceId = req.workspace.id;
            const userId = req.user.id;
            const params = validation_js_1.paginationSchema.parse(req.query);
            const { notes, total } = await notes_service_js_1.notesService.getDeleted(workspaceId, userId, params);
            res.json((0, helpers_js_1.paginatedResponse)(notes, params, total));
        }
        catch (error) {
            next(error);
        }
    }
    async getVersions(req, res, next) {
        try {
            const noteId = validation_js_1.uuidSchema.parse(req.params.noteId);
            const userId = req.user.id;
            const { member_id } = memberIdSchema.parse(req.query);
            const canAccess = await notes_service_js_1.notesService.canAccess(noteId, userId, member_id);
            if (!canAccess) {
                throw helpers_js_1.AppError.forbidden('Access denied to this note');
            }
            const versions = await notes_service_js_1.notesService.getVersions(noteId);
            res.json((0, helpers_js_1.successResponse)({ versions }));
        }
        catch (error) {
            next(error);
        }
    }
    async restoreVersion(req, res, next) {
        try {
            const noteId = validation_js_1.uuidSchema.parse(req.params.noteId);
            const versionId = validation_js_1.uuidSchema.parse(req.params.versionId);
            const userId = req.user.id;
            const note = await notes_service_js_1.notesService.restoreVersion(noteId, versionId, userId);
            res.json((0, helpers_js_1.successResponse)({ note }));
        }
        catch (error) {
            next(error);
        }
    }
    async getLinks(req, res, next) {
        try {
            const noteId = validation_js_1.uuidSchema.parse(req.params.noteId);
            const links = await notes_service_js_1.notesService.getLinks(noteId);
            res.json((0, helpers_js_1.successResponse)({ links }));
        }
        catch (error) {
            next(error);
        }
    }
    async addLink(req, res, next) {
        try {
            const noteId = validation_js_1.uuidSchema.parse(req.params.noteId);
            const { target_note_id } = linkSchema.parse(req.body);
            await notes_service_js_1.notesService.addLink(noteId, target_note_id);
            res.status(201).json((0, helpers_js_1.successResponse)({ message: 'Link added' }));
        }
        catch (error) {
            next(error);
        }
    }
    async removeLink(req, res, next) {
        try {
            const noteId = validation_js_1.uuidSchema.parse(req.params.noteId);
            const targetNoteId = validation_js_1.uuidSchema.parse(req.params.targetNoteId);
            await notes_service_js_1.notesService.removeLink(noteId, targetNoteId);
            res.json((0, helpers_js_1.successResponse)({ message: 'Link removed' }));
        }
        catch (error) {
            next(error);
        }
    }
    async duplicate(req, res, next) {
        try {
            const noteId = validation_js_1.uuidSchema.parse(req.params.noteId);
            const userId = req.user.id;
            const workspaceId = req.workspace.id;
            const note = await notes_service_js_1.notesService.duplicate(noteId, userId, workspaceId);
            res.status(201).json((0, helpers_js_1.successResponse)({ note }));
        }
        catch (error) {
            next(error);
        }
    }
    async getTemplates(req, res, next) {
        try {
            const workspaceId = req.workspace.id;
            const templates = await notes_service_js_1.notesService.getTemplates(workspaceId);
            res.json((0, helpers_js_1.successResponse)({ templates }));
        }
        catch (error) {
            next(error);
        }
    }
}
exports.NotesController = NotesController;
exports.notesController = new NotesController();
//# sourceMappingURL=notes.controller.js.map