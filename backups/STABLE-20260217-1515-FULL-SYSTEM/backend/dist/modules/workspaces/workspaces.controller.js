"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.workspacesController = exports.WorkspacesController = void 0;
const workspaces_service_js_1 = require("./workspaces.service.js");
const helpers_js_1 = require("../../utils/helpers.js");
const validation_js_1 = require("../../utils/validation.js");
const zod_1 = require("zod");
const updateMemberRoleSchema = zod_1.z.object({
    role: zod_1.z.enum(['admin', 'member', 'guest']),
});
const transferOwnershipSchema = zod_1.z.object({
    new_owner_id: validation_js_1.uuidSchema,
});
const acceptInvitationSchema = zod_1.z.object({
    token: zod_1.z.string().min(1),
});
class WorkspacesController {
    async create(req, res, next) {
        try {
            const userId = req.user.id;
            const input = validation_js_1.createWorkspaceSchema.parse(req.body);
            const workspace = await workspaces_service_js_1.workspacesService.create(userId, input);
            res.status(201).json((0, helpers_js_1.successResponse)({ workspace }));
        }
        catch (error) {
            next(error);
        }
    }
    async getMyWorkspaces(req, res, next) {
        try {
            const userId = req.user.id;
            const workspaces = await workspaces_service_js_1.workspacesService.getUserWorkspaces(userId);
            res.json((0, helpers_js_1.successResponse)({ workspaces }));
        }
        catch (error) {
            next(error);
        }
    }
    async getById(req, res, next) {
        try {
            const workspaceId = validation_js_1.uuidSchema.parse(req.params.id);
            const workspace = await workspaces_service_js_1.workspacesService.getById(workspaceId);
            res.json((0, helpers_js_1.successResponse)({ workspace }));
        }
        catch (error) {
            next(error);
        }
    }
    async getBySlug(req, res, next) {
        try {
            const slug = req.params.slug;
            const workspace = await workspaces_service_js_1.workspacesService.getBySlug(slug);
            res.json((0, helpers_js_1.successResponse)({ workspace }));
        }
        catch (error) {
            next(error);
        }
    }
    async update(req, res, next) {
        try {
            const workspaceId = req.workspace.id;
            const input = validation_js_1.updateWorkspaceSchema.parse(req.body);
            const workspace = await workspaces_service_js_1.workspacesService.update(workspaceId, input);
            res.json((0, helpers_js_1.successResponse)({ workspace }));
        }
        catch (error) {
            next(error);
        }
    }
    async delete(req, res, next) {
        try {
            const workspaceId = req.workspace.id;
            await workspaces_service_js_1.workspacesService.delete(workspaceId);
            res.json((0, helpers_js_1.successResponse)({ message: 'Workspace deleted' }));
        }
        catch (error) {
            next(error);
        }
    }
    async getMembers(req, res, next) {
        try {
            const workspaceId = req.workspace.id;
            const params = validation_js_1.paginationSchema.parse(req.query);
            const { members, total } = await workspaces_service_js_1.workspacesService.getMembers(workspaceId, params);
            res.json((0, helpers_js_1.paginatedResponse)(members, params, total));
        }
        catch (error) {
            next(error);
        }
    }
    async updateMemberRole(req, res, next) {
        try {
            const workspaceId = req.workspace.id;
            const userId = validation_js_1.uuidSchema.parse(req.params.userId);
            const { role } = updateMemberRoleSchema.parse(req.body);
            await workspaces_service_js_1.workspacesService.updateMemberRole(workspaceId, userId, role);
            res.json((0, helpers_js_1.successResponse)({ message: 'Member role updated' }));
        }
        catch (error) {
            next(error);
        }
    }
    async removeMember(req, res, next) {
        try {
            const workspaceId = req.workspace.id;
            const userId = validation_js_1.uuidSchema.parse(req.params.userId);
            await workspaces_service_js_1.workspacesService.removeMember(workspaceId, userId);
            res.json((0, helpers_js_1.successResponse)({ message: 'Member removed' }));
        }
        catch (error) {
            next(error);
        }
    }
    async invite(req, res, next) {
        try {
            const workspaceId = req.workspace.id;
            const inviterId = req.user.id;
            const input = validation_js_1.inviteToWorkspaceSchema.parse(req.body);
            const result = await workspaces_service_js_1.workspacesService.invite(workspaceId, inviterId, input);
            res.status(201).json((0, helpers_js_1.successResponse)(result));
        }
        catch (error) {
            next(error);
        }
    }
    async acceptInvitation(req, res, next) {
        try {
            const userId = req.user.id;
            const { token } = acceptInvitationSchema.parse(req.body);
            const workspace = await workspaces_service_js_1.workspacesService.acceptInvitation(token, userId);
            res.json((0, helpers_js_1.successResponse)({ workspace }));
        }
        catch (error) {
            next(error);
        }
    }
    async getInvitations(req, res, next) {
        try {
            const workspaceId = req.workspace.id;
            const invitations = await workspaces_service_js_1.workspacesService.getInvitations(workspaceId);
            res.json((0, helpers_js_1.successResponse)({ invitations }));
        }
        catch (error) {
            next(error);
        }
    }
    async cancelInvitation(req, res, next) {
        try {
            const workspaceId = req.workspace.id;
            const invitationId = validation_js_1.uuidSchema.parse(req.params.invitationId);
            await workspaces_service_js_1.workspacesService.cancelInvitation(workspaceId, invitationId);
            res.json((0, helpers_js_1.successResponse)({ message: 'Invitation cancelled' }));
        }
        catch (error) {
            next(error);
        }
    }
    async leave(req, res, next) {
        try {
            const workspaceId = req.workspace.id;
            const userId = req.user.id;
            await workspaces_service_js_1.workspacesService.leave(workspaceId, userId);
            res.json((0, helpers_js_1.successResponse)({ message: 'Left workspace' }));
        }
        catch (error) {
            next(error);
        }
    }
    async transferOwnership(req, res, next) {
        try {
            const workspaceId = req.workspace.id;
            const currentOwnerId = req.user.id;
            const { new_owner_id } = transferOwnershipSchema.parse(req.body);
            await workspaces_service_js_1.workspacesService.transferOwnership(workspaceId, currentOwnerId, new_owner_id);
            res.json((0, helpers_js_1.successResponse)({ message: 'Ownership transferred' }));
        }
        catch (error) {
            next(error);
        }
    }
}
exports.WorkspacesController = WorkspacesController;
exports.workspacesController = new WorkspacesController();
//# sourceMappingURL=workspaces.controller.js.map