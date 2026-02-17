"use strict";
/**
 * MONITORING CONTROLLER - Simplified
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.monitoringController = exports.MonitoringController = void 0;
const monitoring_service_js_1 = require("./monitoring.service.js");
class MonitoringController {
    async logError(req, res) {
        try {
            const result = await monitoring_service_js_1.monitoringService.logError({
                ...req.body,
                userId: req.user?.id,
                workspaceId: req.user?.workspace_id,
            });
            res.json({ success: true, errorId: result.id });
        }
        catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
    async getErrors(req, res) {
        try {
            const errors = await monitoring_service_js_1.monitoringService.getErrors(req.query);
            res.json({ success: true, data: errors });
        }
        catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
    async getErrorById(_req, res) {
        try {
            res.json({ success: true, data: {} });
        }
        catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
    async resolveError(req, res) {
        try {
            await monitoring_service_js_1.monitoringService.resolveError(req.params.id);
            res.json({ success: true });
        }
        catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
    async getStats(_req, res) {
        try {
            const stats = await monitoring_service_js_1.monitoringService.getStats();
            res.json({ success: true, data: stats });
        }
        catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
    async exportCSV(_req, res) {
        try {
            const csv = await monitoring_service_js_1.monitoringService.exportCSV();
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=errors.csv');
            res.send(csv);
        }
        catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
}
exports.MonitoringController = MonitoringController;
exports.monitoringController = new MonitoringController();
//# sourceMappingURL=monitoring.controller.js.map