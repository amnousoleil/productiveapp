"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
class AdminController {
    adminService;
    dashboardService;
    errorLogService;
    constructor(adminService, dashboardService, errorLogService) {
        this.adminService = adminService;
        this.dashboardService = dashboardService;
        this.errorLogService = errorLogService;
    }
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
    // ===== NEW DASHBOARD ENDPOINTS =====
    getAPIMetrics = async (_req, res, next) => {
        try {
            if (!this.dashboardService) {
                res.status(501).json({ error: 'Dashboard service not initialized' });
                return;
            }
            const metrics = this.dashboardService.getAPIMetrics();
            res.json(metrics);
        }
        catch (error) {
            next(error);
        }
    };
    getTopEndpoints = async (req, res, next) => {
        try {
            if (!this.dashboardService) {
                res.status(501).json({ error: 'Dashboard service not initialized' });
                return;
            }
            const limit = parseInt(req.query.limit) || 10;
            const endpoints = this.dashboardService.getTopEndpoints(limit);
            res.json(endpoints);
        }
        catch (error) {
            next(error);
        }
    };
    getErrorLogs = async (req, res, next) => {
        try {
            if (!this.dashboardService) {
                res.status(501).json({ error: 'Dashboard service not initialized' });
                return;
            }
            const limit = parseInt(req.query.limit) || 20;
            const offset = parseInt(req.query.offset) || 0;
            const severity = req.query.severity;
            const errorType = req.query.errorType;
            const result = await this.dashboardService.getErrorLogs({
                limit,
                offset,
                severity,
                errorType,
            });
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    };
    getErrorStats = async (_req, res, next) => {
        try {
            if (!this.dashboardService) {
                res.status(501).json({ error: 'Dashboard service not initialized' });
                return;
            }
            const stats = await this.dashboardService.getErrorStats();
            res.json(stats);
        }
        catch (error) {
            next(error);
        }
    };
    createErrorLog = async (req, res, next) => {
        try {
            if (!this.errorLogService) {
                res.status(501).json({ error: 'Error log service not initialized' });
                return;
            }
            const id = await this.errorLogService.createLog(req.body);
            res.status(201).json({ id });
        }
        catch (error) {
            next(error);
        }
    };
    getHealthHistory = async (req, res, next) => {
        try {
            if (!this.dashboardService) {
                res.status(501).json({ error: 'Dashboard service not initialized' });
                return;
            }
            const limit = parseInt(req.query.limit) || 100;
            const history = await this.dashboardService.getHealthHistory(limit);
            res.json(history);
        }
        catch (error) {
            next(error);
        }
    };
    getDatabaseMetrics = async (_req, res, next) => {
        try {
            if (!this.dashboardService) {
                res.status(501).json({ error: 'Dashboard service not initialized' });
                return;
            }
            const metrics = await this.dashboardService.getDatabaseMetrics();
            res.json(metrics);
        }
        catch (error) {
            next(error);
        }
    };
    getSystemAlerts = async (req, res, next) => {
        try {
            if (!this.dashboardService) {
                res.status(501).json({ error: 'Dashboard service not initialized' });
                return;
            }
            const status = req.query.status;
            const severity = req.query.severity;
            const result = await this.dashboardService.getSystemAlerts({ status, severity });
            res.json(result);
        }
        catch (error) {
            next(error);
        }
    };
    getUserAnalytics = async (req, res, next) => {
        try {
            if (!this.dashboardService) {
                res.status(501).json({ error: 'Dashboard service not initialized' });
                return;
            }
            const startDate = req.query.startDate ? new Date(req.query.startDate) : undefined;
            const endDate = req.query.endDate ? new Date(req.query.endDate) : undefined;
            const analytics = await this.dashboardService.getUserAnalytics(startDate, endDate);
            res.json(analytics);
        }
        catch (error) {
            next(error);
        }
    };
    getVersion = async (_req, res, next) => {
        try {
            if (!this.dashboardService) {
                res.status(501).json({ error: 'Dashboard service not initialized' });
                return;
            }
            const version = await this.dashboardService.getVersionInfo();
            res.json(version);
        }
        catch (error) {
            next(error);
        }
    };
}
exports.AdminController = AdminController;
//# sourceMappingURL=admin.controller.js.map