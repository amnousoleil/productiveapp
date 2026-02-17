"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorLogService = void 0;
/**
 * ErrorLogService - Gestion de la table error_logs (migration 022)
 */
class ErrorLogService {
    pool;
    constructor(pool) {
        this.pool = pool;
    }
    /**
     * Créer un log d'erreur
     */
    async createLog(data) {
        try {
            const result = await this.pool.query(`INSERT INTO error_logs (
          message, stack, error_type, severity, url, user_agent,
          member_id, workspace_id, ip_address, http_method, request_path,
          request_body, browser_info, screen_resolution, viewport_size
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING id`, [
                data.message,
                data.stack || null,
                data.errorType,
                data.severity,
                data.url || null,
                data.userAgent || null,
                data.memberId || null,
                data.workspaceId || null,
                data.ipAddress || null,
                data.httpMethod || null,
                data.requestPath || null,
                data.requestBody ? JSON.stringify(data.requestBody) : null,
                data.browserInfo ? JSON.stringify(data.browserInfo) : null,
                data.screenResolution || null,
                data.viewportSize || null,
            ]);
            return result.rows[0].id;
        }
        catch (error) {
            console.error('[ErrorLogService] Failed to create log:', error);
            throw error;
        }
    }
    /**
     * Récupérer les logs avec filtres
     */
    async getLogs(params) {
        const { limit = 20, offset = 0, severity, errorType, memberId, startDate, endDate, } = params;
        // Count total
        const countQuery = `
      SELECT COUNT(*) as total
      FROM error_logs
      WHERE ($1::VARCHAR IS NULL OR severity = $1)
        AND ($2::VARCHAR IS NULL OR error_type = $2)
        AND ($3::UUID IS NULL OR member_id = $3::UUID)
        AND ($4::TIMESTAMP IS NULL OR created_at >= $4)
        AND ($5::TIMESTAMP IS NULL OR created_at <= $5)
    `;
        const countResult = await this.pool.query(countQuery, [
            severity || null,
            errorType || null,
            memberId || null,
            startDate || null,
            endDate || null,
        ]);
        const total = parseInt(countResult.rows[0].total, 10);
        // Get logs
        const logsQuery = `
      SELECT id, message, stack, error_type as "errorType", severity, url,
             user_agent as "userAgent", member_id as "memberId",
             workspace_id as "workspaceId", ip_address as "ipAddress",
             http_method as "httpMethod", request_path as "requestPath",
             created_at as "createdAt", metadata
      FROM error_logs
      WHERE ($1::VARCHAR IS NULL OR severity = $1)
        AND ($2::VARCHAR IS NULL OR error_type = $2)
        AND ($3::UUID IS NULL OR member_id = $3::UUID)
        AND ($4::TIMESTAMP IS NULL OR created_at >= $4)
        AND ($5::TIMESTAMP IS NULL OR created_at <= $5)
      ORDER BY created_at DESC
      LIMIT $6 OFFSET $7
    `;
        const logsResult = await this.pool.query(logsQuery, [
            severity || null,
            errorType || null,
            memberId || null,
            startDate || null,
            endDate || null,
            limit,
            offset,
        ]);
        return {
            logs: logsResult.rows,
            total,
            page: Math.floor(offset / limit) + 1,
            limit,
        };
    }
    /**
     * Stats des erreurs (24h)
     */
    async getStats() {
        const statsQuery = `
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN severity = 'critical' THEN 1 ELSE 0 END) as critical,
        SUM(CASE WHEN severity = 'error' THEN 1 ELSE 0 END) as error,
        SUM(CASE WHEN severity = 'warning' THEN 1 ELSE 0 END) as warning,
        SUM(CASE WHEN severity = 'info' THEN 1 ELSE 0 END) as info,
        SUM(CASE WHEN severity = 'debug' THEN 1 ELSE 0 END) as debug,
        SUM(CASE WHEN created_at >= NOW() - INTERVAL '24 hours' THEN 1 ELSE 0 END) as last24h,
        COUNT(DISTINCT member_id) as unique_users
      FROM error_logs
    `;
        const result = await this.pool.query(statsQuery);
        const row = result.rows[0];
        return {
            total: parseInt(row.total, 10),
            bySeverity: {
                critical: parseInt(row.critical, 10),
                error: parseInt(row.error, 10),
                warning: parseInt(row.warning, 10),
                info: parseInt(row.info, 10),
                debug: parseInt(row.debug, 10),
            },
            last24h: parseInt(row.last24h, 10),
            uniqueUsers: parseInt(row.unique_users, 10),
        };
    }
    /**
     * Nettoyer les logs > 30 jours
     */
    async cleanup() {
        try {
            const result = await this.pool.query(`DELETE FROM error_logs
         WHERE created_at < NOW() - INTERVAL '30 days'
         RETURNING id`);
            return result.rowCount || 0;
        }
        catch (error) {
            console.error('[ErrorLogService] Cleanup failed:', error);
            return 0;
        }
    }
}
exports.ErrorLogService = ErrorLogService;
//# sourceMappingURL=error-log.service.js.map