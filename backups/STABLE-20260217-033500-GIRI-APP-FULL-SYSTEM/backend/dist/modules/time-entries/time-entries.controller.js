"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.timeEntriesController = exports.TimeEntriesController = void 0;
const time_entries_service_js_1 = require("./time-entries.service.js");
const helpers_js_1 = require("../../utils/helpers.js");
const validation_js_1 = require("../../utils/validation.js");
const zod_1 = require("zod");
// ============================================
// Validation Schemas
// ============================================
const createTimeEntrySchema = zod_1.z.object({
    member_id: validation_js_1.uuidSchema,
    task_id: validation_js_1.uuidSchema.nullable().optional(),
    project_id: validation_js_1.uuidSchema.nullable().optional(),
    description: zod_1.z.string().max(2000).nullable().optional(),
    start_time: zod_1.z.string().datetime(),
    end_time: zod_1.z.string().datetime().nullable().optional(),
    duration_minutes: zod_1.z.coerce.number().int().min(0).nullable().optional(),
    is_billable: zod_1.z.boolean().optional(),
    is_running: zod_1.z.boolean().optional(),
    hourly_rate: zod_1.z.coerce.number().min(0).nullable().optional(),
    currency: zod_1.z.string().max(3).nullable().optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
});
const updateTimeEntrySchema = zod_1.z.object({
    task_id: validation_js_1.uuidSchema.nullable().optional(),
    project_id: validation_js_1.uuidSchema.nullable().optional(),
    description: zod_1.z.string().max(2000).nullable().optional(),
    start_time: zod_1.z.string().datetime().optional(),
    end_time: zod_1.z.string().datetime().nullable().optional(),
    duration_minutes: zod_1.z.coerce.number().int().min(0).nullable().optional(),
    is_billable: zod_1.z.boolean().optional(),
    is_running: zod_1.z.boolean().optional(),
    hourly_rate: zod_1.z.coerce.number().min(0).nullable().optional(),
    currency: zod_1.z.string().max(3).nullable().optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
});
const listTimeEntriesSchema = validation_js_1.paginationSchema.extend({
    member_id: validation_js_1.uuidSchema.optional(),
    project_id: validation_js_1.uuidSchema.optional(),
    task_id: validation_js_1.uuidSchema.optional(),
    date_from: zod_1.z.string().datetime().optional(),
    date_to: zod_1.z.string().datetime().optional(),
    is_billable: zod_1.z
        .string()
        .optional()
        .transform((val) => {
        if (val === 'true')
            return true;
        if (val === 'false')
            return false;
        return undefined;
    }),
    is_running: zod_1.z
        .string()
        .optional()
        .transform((val) => {
        if (val === 'true')
            return true;
        if (val === 'false')
            return false;
        return undefined;
    }),
});
const setMemberRateSchema = zod_1.z.object({
    hourly_rate: zod_1.z.coerce.number().min(0),
    currency: zod_1.z.string().max(3).default('EUR'),
});
// ============================================
// Controller
// ============================================
class TimeEntriesController {
    async createEntry(req, res, next) {
        try {
            const workspaceId = req.workspace.id;
            const input = createTimeEntrySchema.parse(req.body);
            const entry = await time_entries_service_js_1.timeEntriesService.createEntry(workspaceId, input);
            res.status(201).json((0, helpers_js_1.successResponse)({ entry }));
        }
        catch (error) {
            next(error);
        }
    }
    async updateEntry(req, res, next) {
        try {
            const workspaceId = req.workspace.id;
            const entryId = validation_js_1.uuidSchema.parse(req.params.id);
            const input = updateTimeEntrySchema.parse(req.body);
            const entry = await time_entries_service_js_1.timeEntriesService.updateEntry(workspaceId, entryId, input);
            res.json((0, helpers_js_1.successResponse)({ entry }));
        }
        catch (error) {
            next(error);
        }
    }
    async deleteEntry(req, res, next) {
        try {
            const workspaceId = req.workspace.id;
            const entryId = validation_js_1.uuidSchema.parse(req.params.id);
            await time_entries_service_js_1.timeEntriesService.deleteEntry(workspaceId, entryId);
            res.status(204).send();
        }
        catch (error) {
            next(error);
        }
    }
    async getEntry(req, res, next) {
        try {
            const workspaceId = req.workspace.id;
            const entryId = validation_js_1.uuidSchema.parse(req.params.id);
            const entry = await time_entries_service_js_1.timeEntriesService.getEntry(workspaceId, entryId);
            res.json((0, helpers_js_1.successResponse)({ entry }));
        }
        catch (error) {
            next(error);
        }
    }
    async listEntries(req, res, next) {
        try {
            const workspaceId = req.workspace.id;
            const filters = listTimeEntriesSchema.parse(req.query);
            const { entries, total } = await time_entries_service_js_1.timeEntriesService.listEntries(workspaceId, filters);
            res.json((0, helpers_js_1.paginatedResponse)(entries, filters, total));
        }
        catch (error) {
            next(error);
        }
    }
    async getRunningEntry(req, res, next) {
        try {
            const workspaceId = req.workspace.id;
            const memberId = validation_js_1.uuidSchema.parse(req.query.member_id);
            const entry = await time_entries_service_js_1.timeEntriesService.getRunningEntry(workspaceId, memberId);
            if (!entry) {
                res.json((0, helpers_js_1.successResponse)({ entry: null }));
                return;
            }
            res.json((0, helpers_js_1.successResponse)({ entry }));
        }
        catch (error) {
            next(error);
        }
    }
    async stopEntry(req, res, next) {
        try {
            const workspaceId = req.workspace.id;
            const entryId = validation_js_1.uuidSchema.parse(req.params.id);
            const entry = await time_entries_service_js_1.timeEntriesService.stopEntry(workspaceId, entryId);
            res.json((0, helpers_js_1.successResponse)({ entry }));
        }
        catch (error) {
            next(error);
        }
    }
    async getWeeklySummary(req, res, next) {
        try {
            const workspaceId = req.workspace.id;
            const memberId = validation_js_1.uuidSchema.parse(req.query.member_id);
            const weekStart = zod_1.z.string().parse(req.query.week_start);
            const summary = await time_entries_service_js_1.timeEntriesService.getWeeklySummary(workspaceId, memberId, weekStart);
            res.json((0, helpers_js_1.successResponse)({ summary }));
        }
        catch (error) {
            next(error);
        }
    }
    async getMonthlySummary(req, res, next) {
        try {
            const workspaceId = req.workspace.id;
            const memberId = validation_js_1.uuidSchema.parse(req.query.member_id);
            const year = zod_1.z.coerce.number().int().min(2000).max(2100).parse(req.query.year);
            const month = zod_1.z.coerce.number().int().min(1).max(12).parse(req.query.month);
            const summary = await time_entries_service_js_1.timeEntriesService.getMonthlySummary(workspaceId, memberId, year, month);
            res.json((0, helpers_js_1.successResponse)({ summary }));
        }
        catch (error) {
            next(error);
        }
    }
    async getMemberRate(req, res, next) {
        try {
            const workspaceId = req.workspace.id;
            const memberId = validation_js_1.uuidSchema.parse(req.params.memberId);
            const rate = await time_entries_service_js_1.timeEntriesService.getMemberRate(workspaceId, memberId);
            if (!rate) {
                res.json((0, helpers_js_1.successResponse)({ rate: null }));
                return;
            }
            res.json((0, helpers_js_1.successResponse)({ rate }));
        }
        catch (error) {
            next(error);
        }
    }
    async setMemberRate(req, res, next) {
        try {
            const workspaceId = req.workspace.id;
            const memberId = validation_js_1.uuidSchema.parse(req.params.memberId);
            const { hourly_rate, currency } = setMemberRateSchema.parse(req.body);
            const rate = await time_entries_service_js_1.timeEntriesService.setMemberRate(workspaceId, memberId, hourly_rate, currency);
            res.status(201).json((0, helpers_js_1.successResponse)({ rate }));
        }
        catch (error) {
            next(error);
        }
    }
}
exports.TimeEntriesController = TimeEntriesController;
exports.timeEntriesController = new TimeEntriesController();
//# sourceMappingURL=time-entries.controller.js.map