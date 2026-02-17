"use strict";
/**
 * AI Reports Controller
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiReportsController = exports.AIReportsController = void 0;
const ai_reports_service_js_1 = require("./ai-reports.service.js");
const helpers_js_1 = require("../../utils/helpers.js");
const zod_1 = require("zod");
const generateSchema = zod_1.z.object({
    report_type: zod_1.z.enum(['standard', 'audit', 'meta_synthesis']).optional(),
    title: zod_1.z.string().max(255).optional(),
    period_type: zod_1.z.enum(['week', 'month', 'year']).optional(),
    custom_prompt: zod_1.z.string().max(1000).optional(),
    workspace_id: zod_1.z.string().uuid().optional(),
});
const metaSynthesisSchema = zod_1.z.object({
    report_ids: zod_1.z.array(zod_1.z.string().uuid()).optional(),
    period_type: zod_1.z.enum(['week', 'month', 'year']).optional(),
    focus_areas: zod_1.z.array(zod_1.z.string()).optional(),
    workspace_id: zod_1.z.string().uuid().optional(),
});
const listSchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().min(1).optional(),
    limit: zod_1.z.coerce.number().int().min(1).max(100).optional(),
    report_type: zod_1.z.enum(['standard', 'audit', 'meta_synthesis']).optional(),
    from: zod_1.z.string().optional(),
    to: zod_1.z.string().optional(),
    workspace_id: zod_1.z.string().uuid().optional(),
});
class AIReportsController {
    /**
     * Generate a new AI report
     */
    async generate(req, res, next) {
        try {
            const input = generateSchema.parse(req.body);
            const workspaceId = req.workspace?.id || input.workspace_id;
            const userId = req.user?.id;
            if (!workspaceId || !userId) {
                res.status(400).json({ success: false, error: { message: 'Missing workspace or user' } });
                return;
            }
            console.log(`📊 Generating AI report for user ${userId}, type: ${input.report_type || 'standard'}`);
            const report = await ai_reports_service_js_1.aiReportsService.generateReport(workspaceId, userId, input);
            res.json((0, helpers_js_1.successResponse)(report));
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Get list of AI reports
     */
    async list(req, res, next) {
        try {
            const params = listSchema.parse(req.query);
            const workspaceId = req.workspace?.id || params.workspace_id;
            const userId = req.user?.id;
            if (!workspaceId || !userId) {
                res.status(400).json({ success: false, error: { message: 'Missing workspace or user' } });
                return;
            }
            const result = await ai_reports_service_js_1.aiReportsService.getReports(workspaceId, userId, params);
            res.json((0, helpers_js_1.successResponse)(result));
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Get a single report by ID
     */
    async getById(req, res, next) {
        try {
            const { reportId } = req.params;
            const workspaceId = req.workspace?.id || req.query.workspace_id;
            if (!workspaceId) {
                res.status(400).json({ success: false, error: { message: 'Missing workspace' } });
                return;
            }
            const report = await ai_reports_service_js_1.aiReportsService.getReportById(reportId, workspaceId);
            if (!report) {
                res.status(404).json({ success: false, error: { message: 'Report not found' } });
                return;
            }
            res.json((0, helpers_js_1.successResponse)(report));
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Generate meta-synthesis
     */
    async metaSynthesis(req, res, next) {
        try {
            const input = metaSynthesisSchema.parse(req.body);
            const workspaceId = req.workspace?.id || input.workspace_id;
            const userId = req.user?.id;
            if (!workspaceId || !userId) {
                res.status(400).json({ success: false, error: { message: 'Missing workspace or user' } });
                return;
            }
            console.log(`🧠 Generating meta-synthesis for user ${userId}`);
            const report = await ai_reports_service_js_1.aiReportsService.generateMetaSynthesis(workspaceId, userId, input);
            res.json((0, helpers_js_1.successResponse)(report));
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Get visualization data for charts
     */
    async visualizations(req, res, next) {
        try {
            const periodType = req.query.period_type || 'week';
            const workspaceId = req.workspace?.id || req.query.workspace_id;
            const userId = req.user?.id;
            if (!workspaceId || !userId) {
                res.status(400).json({ success: false, error: { message: 'Missing workspace or user' } });
                return;
            }
            const data = await ai_reports_service_js_1.aiReportsService.getVisualizationData(workspaceId, userId, periodType);
            res.json((0, helpers_js_1.successResponse)(data));
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AIReportsController = AIReportsController;
exports.aiReportsController = new AIReportsController();
//# sourceMappingURL=ai-reports.controller.js.map