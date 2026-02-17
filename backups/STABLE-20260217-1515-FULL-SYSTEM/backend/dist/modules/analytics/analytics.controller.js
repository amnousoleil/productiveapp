"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyticsController = exports.AnalyticsController = void 0;
const analytics_service_js_1 = require("./analytics.service.js");
const helpers_js_1 = require("../../utils/helpers.js");
const validation_js_1 = require("../../utils/validation.js");
const zod_1 = require("zod");
const dateRangeSchema = zod_1.z.object({
    from: zod_1.z.string().datetime(),
    to: zod_1.z.string().datetime(),
});
const activityLogsSchema = validation_js_1.paginationSchema.extend({
    user_id: validation_js_1.uuidSchema.optional(),
    action: zod_1.z.string().optional(),
    entity_type: zod_1.z.string().optional(),
});
const logActivitySchema = zod_1.z.object({
    action: zod_1.z.enum(['create', 'update', 'delete', 'view', 'login', 'logout', 'invite', 'join', 'leave', 'archive', 'restore']),
    entity_type: zod_1.z.enum(['note', 'task', 'message', 'canvas', 'project', 'workspace']).optional(),
    entity_id: validation_js_1.uuidSchema.optional(),
    metadata: zod_1.z.record(zod_1.z.unknown()).optional(),
});
class AnalyticsController {
    async logActivity(req, res, next) {
        try {
            const userId = req.user.id;
            const workspaceId = req.workspace.id;
            const input = logActivitySchema.parse(req.body);
            const ip = req.ip;
            const userAgent = req.headers['user-agent'];
            const activity = await analytics_service_js_1.analyticsService.logActivity(userId, workspaceId, input, ip, userAgent);
            res.status(201).json((0, helpers_js_1.successResponse)({ activity }));
        }
        catch (error) {
            next(error);
        }
    }
    async getActivityLogs(req, res, next) {
        try {
            const workspaceId = req.workspace.id;
            const params = activityLogsSchema.parse(req.query);
            const { activities, total } = await analytics_service_js_1.analyticsService.getActivityLogs(workspaceId, params);
            res.json((0, helpers_js_1.paginatedResponse)(activities, params, total));
        }
        catch (error) {
            next(error);
        }
    }
    async getActivitySummary(req, res, next) {
        try {
            const userId = req.user.id;
            const workspaceId = req.workspace.id;
            const dateRange = dateRangeSchema.parse(req.query);
            const summary = await analytics_service_js_1.analyticsService.getActivitySummary(userId, workspaceId, dateRange);
            res.json((0, helpers_js_1.successResponse)({ summary }));
        }
        catch (error) {
            next(error);
        }
    }
    async getDailyStats(req, res, next) {
        try {
            const userId = req.user.id;
            const workspaceId = req.workspace.id;
            const dateRange = dateRangeSchema.parse(req.query);
            const stats = await analytics_service_js_1.analyticsService.getDailyStats(userId, workspaceId, dateRange);
            res.json((0, helpers_js_1.successResponse)({ stats }));
        }
        catch (error) {
            next(error);
        }
    }
    async getWorkspaceStats(req, res, next) {
        try {
            const workspaceId = req.workspace.id;
            const dateRange = dateRangeSchema.parse(req.query);
            const stats = await analytics_service_js_1.analyticsService.getWorkspaceStats(workspaceId, dateRange);
            res.json((0, helpers_js_1.successResponse)({ stats }));
        }
        catch (error) {
            next(error);
        }
    }
    async getProductivityStats(req, res, next) {
        try {
            const userId = req.user.id;
            const workspaceId = req.workspace.id;
            const stats = await analytics_service_js_1.analyticsService.getUserProductivityStats(userId, workspaceId);
            res.json((0, helpers_js_1.successResponse)({ stats }));
        }
        catch (error) {
            next(error);
        }
    }
    async updateDailyStats(req, res, next) {
        try {
            const userId = req.user.id;
            const workspaceId = req.workspace.id;
            const stats = await analytics_service_js_1.analyticsService.updateDailyStats(userId, workspaceId);
            res.json((0, helpers_js_1.successResponse)({ stats }));
        }
        catch (error) {
            next(error);
        }
    }
    async updateWorkspaceStats(req, res, next) {
        try {
            const workspaceId = req.workspace.id;
            const stats = await analytics_service_js_1.analyticsService.updateWorkspaceStats(workspaceId);
            res.json((0, helpers_js_1.successResponse)({ stats }));
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AnalyticsController = AnalyticsController;
exports.analyticsController = new AnalyticsController();
//# sourceMappingURL=analytics.controller.js.map