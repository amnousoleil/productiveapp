"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectsController = exports.ProjectsController = void 0;
const projects_service_js_1 = require("./projects.service.js");
const helpers_js_1 = require("../../utils/helpers.js");
const validation_js_1 = require("../../utils/validation.js");
const zod_1 = require("zod");
const listProjectsSchema = validation_js_1.paginationSchema.extend({
    status: zod_1.z.enum(['active', 'archived', 'deleted']).optional(),
    parent_id: validation_js_1.uuidSchema.nullable().optional(),
});
const addMemberSchema = zod_1.z.object({
    user_id: validation_js_1.uuidSchema,
    role: zod_1.z.enum(['owner', 'editor', 'viewer']).optional(),
});
const updateMemberRoleSchema = zod_1.z.object({
    role: zod_1.z.enum(['editor', 'viewer']),
});
const reorderSchema = zod_1.z.object({
    project_ids: zod_1.z.array(validation_js_1.uuidSchema).min(1),
});
class ProjectsController {
    async create(req, res, next) {
        try {
            const workspaceId = req.workspace.id;
            const userId = req.user.id;
            const input = validation_js_1.createProjectSchema.parse(req.body);
            const project = await projects_service_js_1.projectsService.create(workspaceId, userId, input);
            res.status(201).json((0, helpers_js_1.successResponse)({ project }));
        }
        catch (error) {
            next(error);
        }
    }
    async getById(req, res, next) {
        try {
            const projectId = validation_js_1.uuidSchema.parse(req.params.projectId);
            const userId = req.user.id;
            const canAccess = await projects_service_js_1.projectsService.canAccess(projectId, userId);
            if (!canAccess) {
                throw helpers_js_1.AppError.forbidden('Access denied to this project');
            }
            const project = await projects_service_js_1.projectsService.getByIdWithStats(projectId);
            res.json((0, helpers_js_1.successResponse)({ project }));
        }
        catch (error) {
            next(error);
        }
    }
    async list(req, res, next) {
        try {
            const workspaceId = req.workspace.id;
            const userId = req.user.id;
            const params = listProjectsSchema.parse(req.query);
            const { projects, total } = await projects_service_js_1.projectsService.getWorkspaceProjects(workspaceId, userId, params);
            res.json((0, helpers_js_1.paginatedResponse)(projects, params, total));
        }
        catch (error) {
            next(error);
        }
    }
    async getMyProjects(req, res, next) {
        try {
            const userId = req.user.id;
            const projects = await projects_service_js_1.projectsService.getUserProjects(userId);
            res.json((0, helpers_js_1.successResponse)({ projects }));
        }
        catch (error) {
            next(error);
        }
    }
    async update(req, res, next) {
        try {
            const projectId = validation_js_1.uuidSchema.parse(req.params.projectId);
            const userId = req.user.id;
            const input = validation_js_1.updateProjectSchema.parse(req.body);
            const canAccess = await projects_service_js_1.projectsService.canAccess(projectId, userId);
            if (!canAccess) {
                throw helpers_js_1.AppError.forbidden('Access denied to this project');
            }
            const project = await projects_service_js_1.projectsService.update(projectId, input);
            res.json((0, helpers_js_1.successResponse)({ project }));
        }
        catch (error) {
            next(error);
        }
    }
    async delete(req, res, next) {
        try {
            const projectId = validation_js_1.uuidSchema.parse(req.params.projectId);
            const userId = req.user.id;
            const canAccess = await projects_service_js_1.projectsService.canAccess(projectId, userId);
            if (!canAccess) {
                throw helpers_js_1.AppError.forbidden('Access denied to this project');
            }
            await projects_service_js_1.projectsService.delete(projectId);
            res.json((0, helpers_js_1.successResponse)({ message: 'Project deleted' }));
        }
        catch (error) {
            next(error);
        }
    }
    async archive(req, res, next) {
        try {
            const projectId = validation_js_1.uuidSchema.parse(req.params.projectId);
            const userId = req.user.id;
            const canAccess = await projects_service_js_1.projectsService.canAccess(projectId, userId);
            if (!canAccess) {
                throw helpers_js_1.AppError.forbidden('Access denied to this project');
            }
            const project = await projects_service_js_1.projectsService.archive(projectId);
            res.json((0, helpers_js_1.successResponse)({ project }));
        }
        catch (error) {
            next(error);
        }
    }
    async restore(req, res, next) {
        try {
            const projectId = validation_js_1.uuidSchema.parse(req.params.projectId);
            const userId = req.user.id;
            const canAccess = await projects_service_js_1.projectsService.canAccess(projectId, userId);
            if (!canAccess) {
                throw helpers_js_1.AppError.forbidden('Access denied to this project');
            }
            const project = await projects_service_js_1.projectsService.restore(projectId);
            res.json((0, helpers_js_1.successResponse)({ project }));
        }
        catch (error) {
            next(error);
        }
    }
    async getMembers(req, res, next) {
        try {
            const projectId = validation_js_1.uuidSchema.parse(req.params.projectId);
            const userId = req.user.id;
            const canAccess = await projects_service_js_1.projectsService.canAccess(projectId, userId);
            if (!canAccess) {
                throw helpers_js_1.AppError.forbidden('Access denied to this project');
            }
            const members = await projects_service_js_1.projectsService.getMembers(projectId);
            res.json((0, helpers_js_1.successResponse)({ members }));
        }
        catch (error) {
            next(error);
        }
    }
    async addMember(req, res, next) {
        try {
            const projectId = validation_js_1.uuidSchema.parse(req.params.projectId);
            const input = addMemberSchema.parse(req.body);
            await projects_service_js_1.projectsService.addMember(projectId, input);
            res.status(201).json((0, helpers_js_1.successResponse)({ message: 'Member added' }));
        }
        catch (error) {
            next(error);
        }
    }
    async updateMemberRole(req, res, next) {
        try {
            const projectId = validation_js_1.uuidSchema.parse(req.params.projectId);
            const userId = validation_js_1.uuidSchema.parse(req.params.userId);
            const { role } = updateMemberRoleSchema.parse(req.body);
            await projects_service_js_1.projectsService.updateMemberRole(projectId, userId, role);
            res.json((0, helpers_js_1.successResponse)({ message: 'Member role updated' }));
        }
        catch (error) {
            next(error);
        }
    }
    async removeMember(req, res, next) {
        try {
            const projectId = validation_js_1.uuidSchema.parse(req.params.projectId);
            const userId = validation_js_1.uuidSchema.parse(req.params.userId);
            await projects_service_js_1.projectsService.removeMember(projectId, userId);
            res.json((0, helpers_js_1.successResponse)({ message: 'Member removed' }));
        }
        catch (error) {
            next(error);
        }
    }
    async reorder(req, res, next) {
        try {
            const workspaceId = req.workspace.id;
            const userId = req.user.id;
            const { project_ids } = reorderSchema.parse(req.body);
            await projects_service_js_1.projectsService.reorder(workspaceId, userId, project_ids);
            res.json((0, helpers_js_1.successResponse)({ message: 'Projects reordered' }));
        }
        catch (error) {
            next(error);
        }
    }
}
exports.ProjectsController = ProjectsController;
exports.projectsController = new ProjectsController();
//# sourceMappingURL=projects.controller.js.map