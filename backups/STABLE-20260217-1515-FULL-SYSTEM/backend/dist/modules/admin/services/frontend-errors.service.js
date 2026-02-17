"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FrontendErrorsService = void 0;
/**
 * FrontendErrorsService - Gestion de la table frontend_errors
 * Service spécifique pour les erreurs frontend (différent de error_logs backend)
 */
class FrontendErrorsService {
    pool;
    constructor(pool) {
        this.pool = pool;
    }
    /**
     * Récupérer les erreurs avec filtres
     */
    async getErrors(params) {
        const { limit = 50, offset = 0, severity, userId, startDate, endDate, resolved, } = params;
        // Count total
        const countQuery = `
      SELECT COUNT(*) as total
      FROM frontend_errors
      WHERE ($1::VARCHAR IS NULL OR severity = $1)
        AND ($2::UUID IS NULL OR user_id = $2::UUID)
        AND ($3::TIMESTAMP IS NULL OR timestamp >= $3)
        AND ($4::TIMESTAMP IS NULL OR timestamp <= $4)
        AND ($5::BOOLEAN IS NULL OR
             (CASE WHEN $5 = true THEN metadata->>'resolved' = 'true'
                   ELSE (metadata->>'resolved' IS NULL OR metadata->>'resolved' != 'true')
              END))
    `;
        const countResult = await this.pool.query(countQuery, [
            severity || null,
            userId || null,
            startDate || null,
            endDate || null,
            resolved !== undefined ? resolved : null,
        ]);
        const total = parseInt(countResult.rows[0].total, 10);
        // Get errors with user names
        const errorsQuery = `
      SELECT
        fe.id,
        fe.message,
        fe.stack,
        fe.url,
        fe.user_agent,
        fe.timestamp,
        fe.user_id,
        fe.workspace_id,
        fe.severity,
        fe.metadata,
        fe.created_at,
        u.name as user_name,
        u.email as user_email
      FROM frontend_errors fe
      LEFT JOIN users u ON fe.user_id = u.id
      WHERE ($1::VARCHAR IS NULL OR fe.severity = $1)
        AND ($2::UUID IS NULL OR fe.user_id = $2::UUID)
        AND ($3::TIMESTAMP IS NULL OR fe.timestamp >= $3)
        AND ($4::TIMESTAMP IS NULL OR fe.timestamp <= $4)
        AND ($5::BOOLEAN IS NULL OR
             (CASE WHEN $5 = true THEN fe.metadata->>'resolved' = 'true'
                   ELSE (fe.metadata->>'resolved' IS NULL OR fe.metadata->>'resolved' != 'true')
              END))
      ORDER BY fe.timestamp DESC
      LIMIT $6 OFFSET $7
    `;
        const errorsResult = await this.pool.query(errorsQuery, [
            severity || null,
            userId || null,
            startDate || null,
            endDate || null,
            resolved !== undefined ? resolved : null,
            limit,
            offset,
        ]);
        return {
            errors: errorsResult.rows,
            total,
            page: Math.floor(offset / limit) + 1,
            limit,
        };
    }
    /**
     * Statistiques des erreurs frontend
     */
    async getStats() {
        // Stats globales
        const statsQuery = `
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN severity = 'error' THEN 1 ELSE 0 END) as error,
        SUM(CASE WHEN severity = 'warning' THEN 1 ELSE 0 END) as warning,
        SUM(CASE WHEN severity = 'info' THEN 1 ELSE 0 END) as info,
        SUM(CASE WHEN timestamp >= NOW() - INTERVAL '24 hours' THEN 1 ELSE 0 END) as last24h,
        SUM(CASE WHEN timestamp >= NOW() - INTERVAL '7 days' THEN 1 ELSE 0 END) as last_week,
        COUNT(DISTINCT user_id) as unique_users
      FROM frontend_errors
    `;
        const statsResult = await this.pool.query(statsQuery);
        const row = statsResult.rows[0];
        // Erreurs par jour (7 derniers jours)
        const byDayQuery = `
      SELECT
        DATE(timestamp) as date,
        COUNT(*) as count
      FROM frontend_errors
      WHERE timestamp >= NOW() - INTERVAL '7 days'
      GROUP BY DATE(timestamp)
      ORDER BY date DESC
    `;
        const byDayResult = await this.pool.query(byDayQuery);
        return {
            total: parseInt(row.total, 10),
            bySeverity: {
                error: parseInt(row.error, 10),
                warning: parseInt(row.warning, 10),
                info: parseInt(row.info, 10),
            },
            last24h: parseInt(row.last24h, 10),
            lastWeek: parseInt(row.last_week, 10),
            uniqueUsers: parseInt(row.unique_users, 10),
            byDay: byDayResult.rows.map(r => ({
                date: r.date,
                count: parseInt(r.count, 10),
            })),
        };
    }
    /**
     * Marquer une erreur comme résolue
     */
    async resolveError(errorId, resolvedBy) {
        try {
            const result = await this.pool.query(`UPDATE frontend_errors
         SET metadata = jsonb_set(
           COALESCE(metadata, '{}'::jsonb),
           '{resolved}',
           'true'::jsonb
         ) || jsonb_build_object(
           'resolved_at', NOW()::TEXT,
           'resolved_by', $2
         )
         WHERE id = $1
         RETURNING id`, [errorId, resolvedBy]);
            return result.rowCount !== null && result.rowCount > 0;
        }
        catch (error) {
            console.error('[FrontendErrorsService] Failed to resolve error:', error);
            return false;
        }
    }
    /**
     * Supprimer une erreur
     */
    async deleteError(errorId) {
        try {
            const result = await this.pool.query(`DELETE FROM frontend_errors WHERE id = $1`, [errorId]);
            return result.rowCount !== null && result.rowCount > 0;
        }
        catch (error) {
            console.error('[FrontendErrorsService] Failed to delete error:', error);
            return false;
        }
    }
    /**
     * Obtenir données pour export CSV
     */
    async getCSVData(params) {
        const { severity, startDate, endDate } = params;
        const query = `
      SELECT
        fe.timestamp,
        fe.severity,
        fe.message,
        fe.url,
        fe.user_agent,
        u.name as user_name,
        u.email as user_email,
        fe.stack,
        fe.metadata
      FROM frontend_errors fe
      LEFT JOIN users u ON fe.user_id = u.id
      WHERE ($1::VARCHAR IS NULL OR fe.severity = $1)
        AND ($2::TIMESTAMP IS NULL OR fe.timestamp >= $2)
        AND ($3::TIMESTAMP IS NULL OR fe.timestamp <= $3)
      ORDER BY fe.timestamp DESC
    `;
        const result = await this.pool.query(query, [
            severity || null,
            startDate || null,
            endDate || null,
        ]);
        return result.rows;
    }
    /**
     * Nettoyer les erreurs > 30 jours
     */
    async cleanup() {
        try {
            const result = await this.pool.query(`DELETE FROM frontend_errors
         WHERE timestamp < NOW() - INTERVAL '30 days'
         AND (metadata->>'resolved' = 'true' OR severity = 'info')`);
            return result.rowCount || 0;
        }
        catch (error) {
            console.error('[FrontendErrorsService] Cleanup failed:', error);
            return 0;
        }
    }
}
exports.FrontendErrorsService = FrontendErrorsService;
//# sourceMappingURL=frontend-errors.service.js.map