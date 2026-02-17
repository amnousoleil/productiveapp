"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditController = exports.AuditController = void 0;
const audit_service_js_1 = require("./audit.service.js");
const helpers_js_1 = require("../../utils/helpers.js");
const validation_js_1 = require("../../utils/validation.js");
const zod_1 = require("zod");
const signals_service_js_1 = require("../signals/signals.service.js");
const createJournalEntrySchema = zod_1.z.object({
    date: zod_1.z.string().datetime().optional(),
    content: zod_1.z.string().min(1).max(50000),
    mood: zod_1.z.number().int().min(1).max(10).optional(),
    energy_level: zod_1.z.number().int().min(1).max(10).optional(),
    sleep_quality: zod_1.z.number().int().min(1).max(10).optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
    highlights: zod_1.z.array(zod_1.z.string()).optional(),
    challenges: zod_1.z.array(zod_1.z.string()).optional(),
    gratitude: zod_1.z.array(zod_1.z.string()).optional(),
});
const updateJournalEntrySchema = createJournalEntrySchema.partial().omit({ date: true });
const journalQuerySchema = validation_js_1.paginationSchema.extend({
    from: zod_1.z.string().datetime().optional(),
    to: zod_1.z.string().datetime().optional(),
});
const humanDesignSchema = zod_1.z.object({
    type: zod_1.z.enum(['generator', 'manifesting_generator', 'projector', 'manifestor', 'reflector']),
    authority: zod_1.z.string().min(1),
    profile: zod_1.z.string().min(1),
    definition: zod_1.z.string().min(1),
    centers: zod_1.z.record(zod_1.z.boolean()),
    channels: zod_1.z.array(zod_1.z.string()),
    gates: zod_1.z.array(zod_1.z.number().int()),
    incarnation_cross: zod_1.z.string().min(1),
    variables: zod_1.z.record(zod_1.z.unknown()).optional(),
    birth_data: zod_1.z.object({
        date: zod_1.z.string(),
        time: zod_1.z.string(),
        location: zod_1.z.string(),
        latitude: zod_1.z.number().optional(),
        longitude: zod_1.z.number().optional(),
    }),
});
const generateReportSchema = zod_1.z.object({
    report_type: zod_1.z.enum(['quick', 'standard', 'deep', 'comprehensive']),
    period_start: zod_1.z.string().datetime(),
    period_end: zod_1.z.string().datetime(),
});
const createPsychoAuditSchema = zod_1.z.object({
    score: zod_1.z.number().int().min(0).max(100),
    answers: zod_1.z.union([zod_1.z.array(zod_1.z.unknown()), zod_1.z.record(zod_1.z.unknown())]).optional(),
    recommendations: zod_1.z.union([zod_1.z.array(zod_1.z.unknown()), zod_1.z.record(zod_1.z.unknown())]).optional(),
});
class AuditController {
    // Journal
    async createJournalEntry(req, res, next) {
        try {
            const userId = req.user.id;
            const workspaceId = req.workspace.id;
            const input = createJournalEntrySchema.parse(req.body);
            const entry = await audit_service_js_1.auditService.createJournalEntry(userId, workspaceId, input);
            res.status(201).json((0, helpers_js_1.successResponse)({ entry }));
        }
        catch (error) {
            next(error);
        }
    }
    async getJournalEntry(req, res, next) {
        try {
            const entryId = validation_js_1.uuidSchema.parse(req.params.entryId);
            const entry = await audit_service_js_1.auditService.getJournalEntry(entryId);
            res.json((0, helpers_js_1.successResponse)({ entry }));
        }
        catch (error) {
            next(error);
        }
    }
    async listJournalEntries(req, res, next) {
        try {
            const userId = req.user.id;
            const workspaceId = req.workspace.id;
            const params = journalQuerySchema.parse(req.query);
            const { entries, total } = await audit_service_js_1.auditService.getJournalEntries(userId, workspaceId, params);
            res.json((0, helpers_js_1.paginatedResponse)(entries, params, total));
        }
        catch (error) {
            next(error);
        }
    }
    async updateJournalEntry(req, res, next) {
        try {
            const entryId = validation_js_1.uuidSchema.parse(req.params.entryId);
            const input = updateJournalEntrySchema.parse(req.body);
            const entry = await audit_service_js_1.auditService.updateJournalEntry(entryId, input);
            res.json((0, helpers_js_1.successResponse)({ entry }));
        }
        catch (error) {
            next(error);
        }
    }
    async deleteJournalEntry(req, res, next) {
        try {
            const entryId = validation_js_1.uuidSchema.parse(req.params.entryId);
            await audit_service_js_1.auditService.deleteJournalEntry(entryId);
            res.json((0, helpers_js_1.successResponse)({ message: 'Entry deleted' }));
        }
        catch (error) {
            next(error);
        }
    }
    async getJournalStats(req, res, next) {
        try {
            const userId = req.user.id;
            const workspaceId = req.workspace.id;
            const stats = await audit_service_js_1.auditService.getJournalStats(userId, workspaceId);
            res.json((0, helpers_js_1.successResponse)({ stats }));
        }
        catch (error) {
            next(error);
        }
    }
    // Human Design
    async createHumanDesign(req, res, next) {
        try {
            const userId = req.user.id;
            const input = humanDesignSchema.parse(req.body);
            const profile = await audit_service_js_1.auditService.createHumanDesignProfile(userId, input);
            res.status(201).json((0, helpers_js_1.successResponse)({ profile }));
        }
        catch (error) {
            next(error);
        }
    }
    async getHumanDesign(req, res, next) {
        try {
            const userId = req.user.id;
            const profile = await audit_service_js_1.auditService.getHumanDesignProfile(userId);
            res.json((0, helpers_js_1.successResponse)({ profile }));
        }
        catch (error) {
            next(error);
        }
    }
    async updateHumanDesign(req, res, next) {
        try {
            const userId = req.user.id;
            const input = humanDesignSchema.partial().parse(req.body);
            const profile = await audit_service_js_1.auditService.updateHumanDesignProfile(userId, input);
            res.json((0, helpers_js_1.successResponse)({ profile }));
        }
        catch (error) {
            next(error);
        }
    }
    // Reports
    async generateReport(req, res, next) {
        try {
            const userId = req.user.id;
            const workspaceId = req.workspace.id;
            const input = generateReportSchema.parse(req.body);
            const report = await audit_service_js_1.auditService.generateReport(userId, workspaceId, input);
            res.status(201).json((0, helpers_js_1.successResponse)({ report }));
        }
        catch (error) {
            next(error);
        }
    }
    async getReport(req, res, next) {
        try {
            const reportId = validation_js_1.uuidSchema.parse(req.params.reportId);
            const report = await audit_service_js_1.auditService.getReport(reportId);
            res.json((0, helpers_js_1.successResponse)({ report }));
        }
        catch (error) {
            next(error);
        }
    }
    async listReports(req, res, next) {
        try {
            const userId = req.user.id;
            const workspaceId = req.workspace.id;
            const params = validation_js_1.paginationSchema.parse(req.query);
            const { reports, total } = await audit_service_js_1.auditService.getReports(userId, workspaceId, params);
            res.json((0, helpers_js_1.paginatedResponse)(reports, params, total));
        }
        catch (error) {
            next(error);
        }
    }
    async deleteReport(req, res, next) {
        try {
            const reportId = validation_js_1.uuidSchema.parse(req.params.reportId);
            await audit_service_js_1.auditService.deleteReport(reportId);
            res.json((0, helpers_js_1.successResponse)({ message: 'Report deleted' }));
        }
        catch (error) {
            next(error);
        }
    }
    // Psycho Audits
    async listPsychoAudits(req, res, next) {
        try {
            const workspaceId = req.workspace.id;
            const audits = await audit_service_js_1.auditService.listPsychoAudits(workspaceId);
            res.json((0, helpers_js_1.successResponse)({ data: audits }));
        }
        catch (error) {
            next(error);
        }
    }
    async createPsychoAudit(req, res, next) {
        try {
            const userId = req.user.id;
            const workspaceId = req.workspace.id;
            const input = createPsychoAuditSchema.parse(req.body);
            // Get previous audit for delta calculation
            const previousAudits = await audit_service_js_1.auditService.listPsychoAudits(workspaceId);
            const previousAudit = previousAudits.length > 0 ? previousAudits[0] : null;
            const audit = await audit_service_js_1.auditService.createPsychoAudit(userId, workspaceId, input);
            // Record behavioral signal
            const previousScore = previousAudit ? previousAudit.score : null;
            const timeSinceLastDays = previousAudit && previousAudit.created_at
                ? Math.round((Date.now() - new Date(previousAudit.created_at).getTime()) / (1000 * 60 * 60 * 24))
                : null;
            (0, signals_service_js_1.recordSignalAsync)(userId, workspaceId, 'audit_completed', 'psycho_audit', audit.id, {
                score: audit.score,
                previous_score: previousScore,
                delta: previousScore !== null ? audit.score - previousScore : null,
                time_since_last_audit_days: timeSinceLastDays
            });
            res.status(201).json((0, helpers_js_1.successResponse)({ data: { id: audit.id, score: audit.score, created_at: audit.created_at } }));
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AuditController = AuditController;
exports.auditController = new AuditController();
//# sourceMappingURL=audit.controller.js.map