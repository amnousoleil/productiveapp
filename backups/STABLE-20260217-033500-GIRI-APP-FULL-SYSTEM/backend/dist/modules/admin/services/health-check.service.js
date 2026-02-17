"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthCheckService = void 0;
const os_1 = __importDefault(require("os"));
/**
 * HealthCheckService - Collecte métriques système et sauvegarde dans health_checks
 */
class HealthCheckService {
    pool;
    constructor(pool) {
        this.pool = pool;
    }
    /**
     * Exécuter un health check complet
     */
    async runCheck() {
        // 1. Check database
        const dbStart = Date.now();
        let dbStatus = 'error';
        let dbResponseTime = 0;
        try {
            await this.pool.query('SELECT 1');
            dbResponseTime = Date.now() - dbStart;
            dbStatus = dbResponseTime < 100 ? 'ok' : dbResponseTime < 1000 ? 'slow' : 'error';
        }
        catch (error) {
            console.error('[HealthCheckService] DB check failed:', error);
            dbResponseTime = Date.now() - dbStart;
        }
        // 2. Memory
        const mem = process.memoryUsage();
        const memoryUsedMb = Math.round(mem.heapUsed / 1024 / 1024);
        const totalMemMb = Math.round(os_1.default.totalmem() / 1024 / 1024);
        const memoryPercent = Math.round((memoryUsedMb / totalMemMb) * 100);
        // 3. CPU (load average pour 1 minute divisé par nombre de cores)
        const cpus = os_1.default.cpus();
        const loadAvg = os_1.default.loadavg()[0]; // 1 minute
        const cpuPercent = Math.min(Math.round((loadAvg / cpus.length) * 100), 100);
        // 4. Uptime
        const uptime = process.uptime();
        // 5. Active connections (requête PostgreSQL)
        let activeConnections = 0;
        try {
            const connResult = await this.pool.query(`SELECT COUNT(*) as count FROM pg_stat_activity WHERE state = 'active'`);
            activeConnections = parseInt(connResult.rows[0]?.count || '0', 10);
        }
        catch (error) {
            console.error('[HealthCheckService] Connection count failed:', error);
        }
        // 6. Déterminer status global
        let status = 'healthy';
        if (dbStatus === 'error' || memoryPercent > 90 || cpuPercent > 90) {
            status = 'unhealthy';
        }
        else if (dbStatus === 'slow' || memoryPercent > 75 || cpuPercent > 75) {
            status = 'degraded';
        }
        const result = {
            status,
            database: {
                status: dbStatus,
                responseTimeMs: dbResponseTime,
            },
            memory: {
                usedMb: memoryUsedMb,
                totalMb: totalMemMb,
                percent: memoryPercent,
            },
            cpu: {
                percent: cpuPercent,
                cores: cpus.length,
            },
            uptime,
            activeConnections,
            timestamp: new Date(),
        };
        // Sauvegarder dans DB
        await this.saveCheck(result);
        return result;
    }
    /**
     * Sauvegarder le health check dans la table health_checks
     */
    async saveCheck(result) {
        try {
            await this.pool.query(`INSERT INTO health_checks (
          status, database_status, memory_used_mb, memory_total_mb,
          memory_percent, cpu_percent, uptime_seconds, active_connections
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`, [
                result.status,
                result.database.status,
                result.memory.usedMb,
                result.memory.totalMb,
                result.memory.percent,
                result.cpu.percent,
                result.uptime,
                result.activeConnections,
            ]);
        }
        catch (error) {
            console.error('[HealthCheckService] Failed to save check:', error);
        }
    }
    /**
     * Récupérer l'historique des health checks
     */
    async getHistory(limit = 100) {
        try {
            const result = await this.pool.query(`SELECT
          id, status, database_status as "databaseStatus",
          memory_used_mb as "memoryUsedMb", memory_total_mb as "memoryTotalMb",
          memory_percent as "memoryPercent", cpu_percent as "cpuPercent",
          uptime_seconds as "uptimeSeconds", active_connections as "activeConnections",
          disk_usage_percent as "diskUsagePercent", checked_at as "checkedAt",
          metadata
        FROM health_checks
        ORDER BY checked_at DESC
        LIMIT $1`, [limit]);
            return result.rows;
        }
        catch (error) {
            console.error('[HealthCheckService] Failed to get history:', error);
            return [];
        }
    }
    /**
     * Récupérer le dernier check
     */
    async getLatest() {
        const history = await this.getHistory(1);
        return history.length > 0 ? history[0] : null;
    }
    /**
     * Nettoyer les checks > 7 jours
     */
    async cleanup() {
        try {
            const result = await this.pool.query(`DELETE FROM health_checks
         WHERE checked_at < NOW() - INTERVAL '7 days'
         RETURNING id`);
            return result.rowCount || 0;
        }
        catch (error) {
            console.error('[HealthCheckService] Cleanup failed:', error);
            return 0;
        }
    }
}
exports.HealthCheckService = HealthCheckService;
//# sourceMappingURL=health-check.service.js.map