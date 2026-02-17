"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersController = exports.UsersController = void 0;
const users_service_js_1 = require("./users.service.js");
const helpers_js_1 = require("../../utils/helpers.js");
const validation_js_1 = require("../../utils/validation.js");
const zod_1 = require("zod");
const searchParamsSchema = zod_1.z.object({
    q: zod_1.z.string().optional(),
    workspace_id: validation_js_1.uuidSchema.optional(),
    page: zod_1.z.coerce.number().int().min(1).default(1),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(20),
});
class UsersController {
    async getMe(req, res, next) {
        try {
            const userId = req.user.id;
            const user = await users_service_js_1.usersService.getByIdWithWorkspaces(userId);
            res.json((0, helpers_js_1.successResponse)({ user }));
        }
        catch (error) {
            next(error);
        }
    }
    async getById(req, res, next) {
        try {
            const userId = validation_js_1.uuidSchema.parse(req.params.id);
            const user = await users_service_js_1.usersService.getById(userId);
            res.json((0, helpers_js_1.successResponse)({ user }));
        }
        catch (error) {
            next(error);
        }
    }
    async update(req, res, next) {
        try {
            const userId = req.user.id;
            const input = validation_js_1.updateUserSchema.parse(req.body);
            const user = await users_service_js_1.usersService.update(userId, input);
            res.json((0, helpers_js_1.successResponse)({ user }));
        }
        catch (error) {
            next(error);
        }
    }
    async search(req, res, next) {
        try {
            const params = searchParamsSchema.parse(req.query);
            const { users, total } = await users_service_js_1.usersService.search(params);
            res.json((0, helpers_js_1.paginatedResponse)(users, params, total));
        }
        catch (error) {
            next(error);
        }
    }
    async getWorkspaceMembers(req, res, next) {
        try {
            const workspaceId = req.workspace.id;
            const params = validation_js_1.paginationSchema.parse(req.query);
            const { members, total } = await users_service_js_1.usersService.getWorkspaceMembers(workspaceId, params);
            res.json((0, helpers_js_1.paginatedResponse)(members, params, total));
        }
        catch (error) {
            next(error);
        }
    }
    async deleteAccount(req, res, next) {
        try {
            const userId = req.user.id;
            await users_service_js_1.usersService.deleteAccount(userId);
            res.json((0, helpers_js_1.successResponse)({ message: 'Account deleted successfully' }));
        }
        catch (error) {
            next(error);
        }
    }
}
exports.UsersController = UsersController;
exports.usersController = new UsersController();
//# sourceMappingURL=users.controller.js.map