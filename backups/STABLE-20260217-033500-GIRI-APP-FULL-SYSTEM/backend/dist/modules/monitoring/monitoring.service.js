"use strict";
/**
 * MONITORING SERVICE - Simplified version
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.monitoringService = exports.MonitoringService = void 0;
const database_js_1 = require("../../config/database.js");
class MonitoringService {
    async logError(data) {
        const result = await (0, database_js_1.sql) `
      INSERT INTO frontend_errors (message, stack, url, user_agent, timestamp, user_id, workspace_id, severity, resolved)
      VALUES (${data.message}, ${data.stack || null}, ${data.url || null}, ${data.userAgent || null}, 
              ${data.timestamp || new Date().toISOString()}, ${data.userId || null}, 
              ${data.workspaceId || null}, ${data.severity || 'error'}, false)
      RETURNING id`;
        return { id: result[0].id };
    }
    async getErrors(_filters = {}) {
        const result = await (0, database_js_1.sql) `SELECT * FROM frontend_errors ORDER BY timestamp DESC LIMIT 50`;
        return result;
    }
    async resolveError(id) {
        const result = await (0, database_js_1.sql) `UPDATE frontend_errors SET resolved = true WHERE id = ${id}`;
        return result.count > 0;
    }
    async getStats() {
        const errors = await (0, database_js_1.sql) `SELECT COUNT(*) as count FROM frontend_errors WHERE severity = 'error'`;
        const warnings = await (0, database_js_1.sql) `SELECT COUNT(*) as count FROM frontend_errors WHERE severity = 'warning'`;
        const resolved = await (0, database_js_1.sql) `SELECT COUNT(*) as count FROM frontend_errors WHERE resolved = true`;
        const today = await (0, database_js_1.sql) `SELECT COUNT(*) as count FROM frontend_errors WHERE timestamp >= NOW() - INTERVAL '1 day'`;
        return {
            errors: parseInt(errors[0].count),
            warnings: parseInt(warnings[0].count),
            resolved: parseInt(resolved[0].count),
            today: parseInt(today[0].count),
        };
    }
    async exportCSV() {
        const errors = await (0, database_js_1.sql) `SELECT * FROM frontend_errors ORDER BY timestamp DESC LIMIT 500`;
        const headers = 'timestamp,message,severity,resolved\n';
        const rows = errors.map((e) => `${e.timestamp},"${(e.message || '').replace(/"/g, '""')}",${e.severity},${e.resolved}`).join('\n');
        return headers + rows;
    }
}
exports.MonitoringService = MonitoringService;
exports.monitoringService = new MonitoringService();
//# sourceMappingURL=monitoring.service.js.map