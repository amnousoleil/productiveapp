"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.canvasesController = exports.CanvasesController = void 0;
const canvases_service_js_1 = require("./canvases.service.js");
const helpers_js_1 = require("../../utils/helpers.js");
const validation_js_1 = require("../../utils/validation.js");
const zod_1 = require("zod");
const createCanvasSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(255),
    project_id: validation_js_1.uuidSchema.nullable().optional(),
    elements: zod_1.z.record(zod_1.z.unknown()).optional(),
    app_state: zod_1.z.record(zod_1.z.unknown()).optional(),
    is_template: zod_1.z.boolean().optional(),
    is_public: zod_1.z.boolean().optional(),
});
const updateCanvasSchema = createCanvasSchema.partial().extend({
    thumbnail_url: zod_1.z.string().url().nullable().optional(),
});
const listCanvasesSchema = validation_js_1.paginationSchema.extend({
    project_id: validation_js_1.uuidSchema.nullable().optional(),
    is_template: zod_1.z.coerce.boolean().optional(),
});
const addCollaboratorSchema = zod_1.z.object({
    user_id: validation_js_1.uuidSchema,
    permission: zod_1.z.enum(['view', 'edit']),
});
class CanvasesController {
    async create(req, res, next) {
        try {
            const workspaceId = req.workspace.id;
            const userId = req.user.id;
            const input = createCanvasSchema.parse(req.body);
            const canvas = await canvases_service_js_1.canvasesService.create(workspaceId, userId, input);
            res.status(201).json((0, helpers_js_1.successResponse)({ canvas }));
        }
        catch (error) {
            next(error);
        }
    }
    async getById(req, res, next) {
        try {
            const canvasId = validation_js_1.uuidSchema.parse(req.params.canvasId);
            const userId = req.user.id;
            const canAccess = await canvases_service_js_1.canvasesService.canAccess(canvasId, userId);
            if (!canAccess) {
                throw helpers_js_1.AppError.forbidden('Access denied to this canvas');
            }
            const canvas = await canvases_service_js_1.canvasesService.getByIdWithCollaborators(canvasId);
            // Update last accessed
            await canvases_service_js_1.canvasesService.updateLastAccessed(canvasId, userId);
            res.json((0, helpers_js_1.successResponse)({ canvas }));
        }
        catch (error) {
            next(error);
        }
    }
    async list(req, res, next) {
        try {
            const workspaceId = req.workspace.id;
            const userId = req.user.id;
            const params = listCanvasesSchema.parse(req.query);
            const { canvases, total } = await canvases_service_js_1.canvasesService.list(workspaceId, userId, params);
            res.json((0, helpers_js_1.paginatedResponse)(canvases, params, total));
        }
        catch (error) {
            next(error);
        }
    }
    async update(req, res, next) {
        try {
            const canvasId = validation_js_1.uuidSchema.parse(req.params.canvasId);
            const userId = req.user.id;
            const input = updateCanvasSchema.parse(req.body);
            const canEdit = await canvases_service_js_1.canvasesService.canEdit(canvasId, userId);
            if (!canEdit) {
                throw helpers_js_1.AppError.forbidden('No edit permission for this canvas');
            }
            const canvas = await canvases_service_js_1.canvasesService.update(canvasId, input);
            res.json((0, helpers_js_1.successResponse)({ canvas }));
        }
        catch (error) {
            next(error);
        }
    }
    async delete(req, res, next) {
        try {
            const canvasId = validation_js_1.uuidSchema.parse(req.params.canvasId);
            await canvases_service_js_1.canvasesService.delete(canvasId);
            res.json((0, helpers_js_1.successResponse)({ message: 'Canvas deleted' }));
        }
        catch (error) {
            next(error);
        }
    }
    async addCollaborator(req, res, next) {
        try {
            const canvasId = validation_js_1.uuidSchema.parse(req.params.canvasId);
            const input = addCollaboratorSchema.parse(req.body);
            await canvases_service_js_1.canvasesService.addCollaborator(canvasId, input);
            res.status(201).json((0, helpers_js_1.successResponse)({ message: 'Collaborator added' }));
        }
        catch (error) {
            next(error);
        }
    }
    async removeCollaborator(req, res, next) {
        try {
            const canvasId = validation_js_1.uuidSchema.parse(req.params.canvasId);
            const userId = validation_js_1.uuidSchema.parse(req.params.userId);
            await canvases_service_js_1.canvasesService.removeCollaborator(canvasId, userId);
            res.json((0, helpers_js_1.successResponse)({ message: 'Collaborator removed' }));
        }
        catch (error) {
            next(error);
        }
    }
    async duplicate(req, res, next) {
        try {
            const canvasId = validation_js_1.uuidSchema.parse(req.params.canvasId);
            const userId = req.user.id;
            const workspaceId = req.workspace.id;
            const canvas = await canvases_service_js_1.canvasesService.duplicate(canvasId, userId, workspaceId);
            res.status(201).json((0, helpers_js_1.successResponse)({ canvas }));
        }
        catch (error) {
            next(error);
        }
    }
    async getTemplates(req, res, next) {
        try {
            const workspaceId = req.workspace.id;
            const templates = await canvases_service_js_1.canvasesService.getTemplates(workspaceId);
            res.json((0, helpers_js_1.successResponse)({ templates }));
        }
        catch (error) {
            next(error);
        }
    }
}
exports.CanvasesController = CanvasesController;
exports.canvasesController = new CanvasesController();
//# sourceMappingURL=canvases.controller.js.map