/**
 * MONITORING SERVICE - Simplified version
 */

import { sql as pg } from '../../config/database.js';

export class MonitoringService {
  async logError(data: any) {
    const result = await pg`
      INSERT INTO frontend_errors (message, stack, url, user_agent, timestamp, user_id, workspace_id, severity, resolved)
      VALUES (${data.message}, ${data.stack || null}, ${data.url || null}, ${data.userAgent || null}, 
              ${data.timestamp || new Date().toISOString()}, ${data.userId || null}, 
              ${data.workspaceId || null}, ${data.severity || 'error'}, false)
      RETURNING id`;
    return { id: result[0].id };
  }

  async getErrors(_filters: any = {}) {
    const result = await pg`SELECT * FROM frontend_errors ORDER BY timestamp DESC LIMIT 50`;
    return result;
  }

  async resolveError(id: string) {
    const result = await pg`UPDATE frontend_errors SET resolved = true WHERE id = ${id}`;
    return result.count > 0;
  }

  async getStats() {
    const errors = await pg`SELECT COUNT(*) as count FROM frontend_errors WHERE severity = 'error'`;
    const warnings = await pg`SELECT COUNT(*) as count FROM frontend_errors WHERE severity = 'warning'`;
    const resolved = await pg`SELECT COUNT(*) as count FROM frontend_errors WHERE resolved = true`;
    const today = await pg`SELECT COUNT(*) as count FROM frontend_errors WHERE timestamp >= NOW() - INTERVAL '1 day'`;
    
    return {
      errors: parseInt(errors[0].count),
      warnings: parseInt(warnings[0].count),
      resolved: parseInt(resolved[0].count),
      today: parseInt(today[0].count),
    };
  }

  async exportCSV() {
    const errors = await pg`SELECT * FROM frontend_errors ORDER BY timestamp DESC LIMIT 500`;
    const headers = 'timestamp,message,severity,resolved\n';
    const rows = errors.map((e: any) => 
      `${e.timestamp},"${(e.message || '').replace(/"/g, '""')}",${e.severity},${e.resolved}`
    ).join('\n');
    return headers + rows;
  }
}

export const monitoringService = new MonitoringService();
