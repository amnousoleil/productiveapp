"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.filesController = exports.FilesController = void 0;
const files_service_js_1 = require("./files.service.js");
const helpers_js_1 = require("../../utils/helpers.js");
const validation_js_1 = require("../../utils/validation.js");
const zod_1 = require("zod");
const uploadFileSchema = zod_1.z.object({
    filename: zod_1.z.string().min(1).max(255),
    original_filename: zod_1.z.string().min(1).max(255),
    file_url: zod_1.z.string().url(),
    file_size: zod_1.z.number().int().min(0),
    mime_type: zod_1.z.string().min(1).max(100),
    entity_type: zod_1.z.enum(['note', 'task', 'message', 'canvas', 'project', 'workspace']).optional(),
    entity_id: validation_js_1.uuidSchema.optional(),
});
const listFilesSchema = validation_js_1.paginationSchema.extend({
    q: zod_1.z.string().optional(),
    entity_type: zod_1.z.enum(['note', 'task', 'message', 'canvas', 'project', 'workspace']).optional(),
    entity_id: validation_js_1.uuidSchema.optional(),
    mime_type: zod_1.z.string().optional(),
});
class FilesController {
    async upload(req, res, next) {
        try {
            const workspaceId = req.workspace.id;
            const userId = req.user.id;
            const input = uploadFileSchema.parse(req.body);
            const file = await files_service_js_1.filesService.create(workspaceId, userId, input);
            res.status(201).json((0, helpers_js_1.successResponse)({ file }));
        }
        catch (error) {
            next(error);
        }
    }
    async getById(req, res, next) {
        try {
            const fileId = validation_js_1.uuidSchema.parse(req.params.fileId);
            const file = await files_service_js_1.filesService.getByIdWithUploader(fileId);
            res.json((0, helpers_js_1.successResponse)({ file }));
        }
        catch (error) {
            next(error);
        }
    }
    async list(req, res, next) {
        try {
            const workspaceId = req.workspace.id;
            const params = listFilesSchema.parse(req.query);
            const { files, total } = await files_service_js_1.filesService.list(workspaceId, params);
            res.json((0, helpers_js_1.paginatedResponse)(files, params, total));
        }
        catch (error) {
            next(error);
        }
    }
    async getByEntity(req, res, next) {
        try {
            const entityType = req.params.entityType;
            const entityId = validation_js_1.uuidSchema.parse(req.params.entityId);
            const files = await files_service_js_1.filesService.getByEntity(entityType, entityId);
            res.json((0, helpers_js_1.successResponse)({ files }));
        }
        catch (error) {
            next(error);
        }
    }
    async delete(req, res, next) {
        try {
            const fileId = validation_js_1.uuidSchema.parse(req.params.fileId);
            await files_service_js_1.filesService.delete(fileId);
            res.json((0, helpers_js_1.successResponse)({ message: 'File deleted' }));
        }
        catch (error) {
            next(error);
        }
    }
    async getStorageUsage(req, res, next) {
        try {
            const workspaceId = req.workspace.id;
            const usage = await files_service_js_1.filesService.getStorageUsage(workspaceId);
            res.json((0, helpers_js_1.successResponse)({ usage }));
        }
        catch (error) {
            next(error);
        }
    }
    async getMyStorageUsage(req, res, next) {
        try {
            const userId = req.user.id;
            const usage = await files_service_js_1.filesService.getUserStorageUsage(userId);
            res.json((0, helpers_js_1.successResponse)({ usage }));
        }
        catch (error) {
            next(error);
        }
    }
}
exports.FilesController = FilesController;
exports.filesController = new FilesController();
//# sourceMappingURL=files.controller.js.map