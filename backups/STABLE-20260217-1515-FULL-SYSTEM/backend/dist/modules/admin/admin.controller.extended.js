"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminControllerExtended = void 0;
class AdminControllerExtended {
    adminService;
    dashboardService;
    frontendErrorsService;
    analyticsService;
    constructor(adminService, dashboardService, frontendErrorsService, analyticsService) {
        this.adminService = adminService;
        this.dashboardService = dashboardService;
        this.frontendErrorsService = frontendErrorsService;
        this.analyticsService = analyticsService;
    }
    // ===== EXISTING ENDPOINTS =====
    getHealth = async (_req, res, next) => {
        try {
            const health = await this.adminService.getSystemHealth();
            res.json(health);
        }
        catch (error) {
            next(error);
        }
    };
    getStats = async (_req, res, next) => {
        try {
            const stats = await this.adminService.getSystemStats();
            res.json(stats);
        }
        catch (error) {
            next(error);
        }
    };
    getMemberActivity = async (_req, res, next) => {
        try {
            const activity = await this.adminService.getMemberActivity();
            res.json(activity);
        }
        catch (error) {
            next(error);
        }
    };
    getRecentActivity = async (req, res, next) => {
        try {
            const limit = parseInt(req.query.limit) || 20;
            const activity = await this.adminService.getRecentActivity(limit);
            res.json(activity);
        }
        catch (error) {
            next(error);
        }
    };
    getAPIMetrics = async (_req, res, next) => {
        try {
            const metrics = this.dashboardService.getAPIMetrics();
            res.json(metrics);
        }
        catch (error) {
            next(error);
        }
    };
    getTopEndpoints = async (req, res, next) => {
        try {
            const limit = parseInt(req.query.limit) || 10;
            const endpoints = this.dashboardService.getTopEndpoints(limit);
            res.json(endpoints);
        }
        catch (error) {
            next(error);
        }
    };
    // ===== NEW FRONTEND ERRORS ENDPOINTS =====
    getFrontendErrors = async (req, res, next) => {
        try {
            const limit = parseInt(req.query.limit) || 50;
            const offset = parseInt(req.query.offset) || 0;
            const severity = req.query.severity;
            const userId = req.query.userId;
            const resolved = req.query.resolved === 'true' ? true : req.query.resolved === 'false' ? false : undefined;
            const result = await this.frontendErrorsService.getErrors({
                limit,
                offset,
                severity,
                userId,
                resolved,
            });
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    };
    getFrontendErrorStats = async (_req, res, next) => {
        try {
            const stats = await this.frontendErrorsService.getStats();
            res.json(stats);
        }
        catch (error) {
            next(error);
        }
    };
    resolveFrontendError = async (req, res, next) => {
        try {
            const errorId = req.params.id;
            const resolvedBy = req.user?.id || 'admin';
            const success = await this.frontendErrorsService.resolveError(errorId, resolvedBy);
            if (success) {
                res.json({ success: true, message: 'Error marked as resolved' });
            }
            else {
                res.status(404).json({ success: false, error: 'Error not found' });
            }
        }
        catch (error) {
            next(error);
        }
    };
    deleteFrontendError = async (req, res, next) => {
        try {
            const errorId = req.params.id;
            const success = await this.frontendErrorsService.deleteError(errorId);
            if (success) {
                res.json({ success: true, message: 'Error deleted' });
            }
            else {
                res.status(404).json({ success: false, error: 'Error not found' });
            }
        }
        catch (error) {
            next(error);
        }
    };
    exportFrontendErrorsCSV = async (req, res, next) => {
        try {
            const severity = req.query.severity;
            const startDate = req.query.startDate ? new Date(req.query.startDate) : undefined;
            const endDate = req.query.endDate ? new Date(req.query.endDate) : undefined;
            const data = await this.frontendErrorsService.getCSVData({
                severity,
                startDate,
                endDate,
            });
            // Generate CSV
            const csvLines = [];
            csvLines.push('Timestamp,Severity,Message,URL,User Agent,User Name,User Email');
            for (const row of data) {
                const escapeCsv = (str) => {
                    if (str === null || str === undefined)
                        return '';
                    str = String(str).replace(/"/g, '""');
                    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                        return `"${str}"`;
                    }
                    return str;
                };
                csvLines.push([
                    escapeCsv(row.timestamp),
                    escapeCsv(row.severity),
                    escapeCsv(row.message),
                    escapeCsv(row.url),
                    escapeCsv(row.user_agent),
                    escapeCsv(row.user_name),
                    escapeCsv(row.user_email),
                ].join(','));
            }
            const csv = csvLines.join('\n');
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename="frontend-errors-export.csv"');
            res.send(csv);
        }
        catch (error) {
            next(error);
        }
    };
    // ===== NEW ANALYTICS ENDPOINTS =====
    getTopPages = async (req, res, next) => {
        try {
            const limit = parseInt(req.query.limit) || 10;
            const pages = await this.analyticsService.getTopPages(limit);
            res.json(pages);
        }
        catch (error) {
            next(error);
        }
    };
    getTopFeatures = async (req, res, next) => {
        try {
            const limit = parseInt(req.query.limit) || 10;
            const features = await this.analyticsService.getTopFeatures(limit);
            res.json(features);
        }
        catch (error) {
            next(error);
        }
    };
    getUserActivityStats = async (_req, res, next) => {
        try {
            const stats = await this.analyticsService.getUserActivity();
            res.json(stats);
        }
        catch (error) {
            next(error);
        }
    };
    getFeatureEngagement = async (_req, res, next) => {
        try {
            const engagement = await this.analyticsService.getFeatureEngagement();
            res.json(engagement);
        }
        catch (error) {
            next(error);
        }
    };
}
exports.AdminControllerExtended = AdminControllerExtended;
//# sourceMappingURL=admin.controller.extended.js.map