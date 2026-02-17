"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportsController = exports.ReportsController = void 0;
const reports_service_js_1 = require("./reports.service.js");
const helpers_js_1 = require("../../utils/helpers.js");
const validation_js_1 = require("../../utils/validation.js");
const zod_1 = require("zod");
const periodTypeSchema = zod_1.z.enum(['week', 'month', 'year']);
const reportListSchema = validation_js_1.paginationSchema.extend({
    period_type: periodTypeSchema.optional(),
    from: zod_1.z.string().optional(),
    to: zod_1.z.string().optional(),
});
const generateReportSchema = zod_1.z.object({
    period_type: periodTypeSchema.default('week'),
    period_start: zod_1.z.string().optional(),
    period_end: zod_1.z.string().optional(),
}).transform(data => ({
    ...data,
    period_type: data.period_type
}));
const summaryQuerySchema = zod_1.z.object({
    period: periodTypeSchema.default('week'),
});
class ReportsController {
    /**
     * GET /reports/workspace/:workspaceId
     * List reports with pagination and filters
     */
    async getReports(req, res, next) {
        try {
            const workspaceId = req.workspace.id;
            const userId = req.user.id;
            const params = reportListSchema.parse(req.query);
            const { reports, total } = await reports_service_js_1.reportsService.getReports(workspaceId, userId, params);
            res.json((0, helpers_js_1.paginatedResponse)(reports, params, total));
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * GET /reports/workspace/:workspaceId/:reportId
     * Get single report by ID
     */
    async getReportById(req, res, next) {
        try {
            const workspaceId = req.workspace.id;
            const reportId = validation_js_1.uuidSchema.parse(req.params.reportId);
            const report = await reports_service_js_1.reportsService.getReportById(reportId, workspaceId);
            if (!report) {
                throw helpers_js_1.AppError.notFound('Report');
            }
            res.json((0, helpers_js_1.successResponse)({ report }));
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * GET /reports/workspace/:workspaceId/summary
     * Get quick summary for current period
     */
    async getSummary(req, res, next) {
        try {
            const workspaceId = req.workspace.id;
            const userId = req.user.id;
            const { period } = summaryQuerySchema.parse(req.query);
            const summary = await reports_service_js_1.reportsService.getSummary(workspaceId, userId, period);
            res.json((0, helpers_js_1.successResponse)({ summary }));
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * POST /reports/workspace/:workspaceId/generate
     * Generate a new report
     */
    async generateReport(req, res, next) {
        try {
            const workspaceId = req.workspace.id;
            const userId = req.user.id;
            const input = generateReportSchema.parse(req.body);
            const report = await reports_service_js_1.reportsService.generateReport(workspaceId, userId, input);
            res.status(201).json((0, helpers_js_1.successResponse)({ report }));
        }
        catch (error) {
            next(error);
        }
    }
}
exports.ReportsController = ReportsController;
exports.reportsController = new ReportsController();
//# sourceMappingURL=reports.controller.js.map