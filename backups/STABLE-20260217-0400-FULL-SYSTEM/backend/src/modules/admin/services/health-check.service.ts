import type { Pool } from 'pg';
import os from 'os';

export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  database: {
    status: 'ok' | 'slow' | 'error';
    responseTimeMs: number;
  };
  memory: {
    usedMb: number;
    totalMb: number;
    percent: number;
  };
  cpu: {
    percent: number;
    cores: number;
  };
  uptime: number;
  activeConnections: number;
  timestamp: Date;
}

export interface HealthCheckHistory {
  id: string;
  status: string;
  databaseStatus: string;
  memoryUsedMb: number;
  memoryTotalMb?: number;
  memoryPercent?: number;
  cpuPercent?: number;
  uptimeSeconds?: number;
  activeConnections?: number;
  diskUsagePercent?: number;
  checkedAt: Date;
  metadata?: any;
}

/**
 * HealthCheckService - Collecte métriques système et sauvegarde dans health_checks
 */
export class HealthCheckService {
  constructor(private pool: Pool) {}

  /**
   * Exécuter un health check complet
   */
  async runCheck(): Promise<HealthCheckResult> {
    // 1. Check database
    const dbStart = Date.now();
    let dbStatus: 'ok' | 'slow' | 'error' = 'error';
    let dbResponseTime = 0;

    try {
      await this.pool.query('SELECT 1');
      dbResponseTime = Date.now() - dbStart;
      dbStatus = dbResponseTime < 100 ? 'ok' : dbResponseTime < 1000 ? 'slow' : 'error';
    } catch (error) {
      console.error('[HealthCheckService] DB check failed:', error);
      dbResponseTime = Date.now() - dbStart;
    }

    // 2. Memory
    const mem = process.memoryUsage();
    const memoryUsedMb = Math.round(mem.heapUsed / 1024 / 1024);
    const totalMemMb = Math.round(os.totalmem() / 1024 / 1024);
    const memoryPercent = Math.round((memoryUsedMb / totalMemMb) * 100);

    // 3. CPU (load average pour 1 minute divisé par nombre de cores)
    const cpus = os.cpus();
    const loadAvg = os.loadavg()[0]; // 1 minute
    const cpuPercent = Math.min(Math.round((loadAvg / cpus.length) * 100), 100);

    // 4. Uptime
    const uptime = process.uptime();

    // 5. Active connections (requête PostgreSQL)
    let activeConnections = 0;
    try {
      const connResult = await this.pool.query<{ count: string }>(
        `SELECT COUNT(*) as count FROM pg_stat_activity WHERE state = 'active'`
      );
      activeConnections = parseInt(connResult.rows[0]?.count || '0', 10);
    } catch (error) {
      console.error('[HealthCheckService] Connection count failed:', error);
    }

    // 6. Déterminer status global
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    if (dbStatus === 'error' || memoryPercent > 90 || cpuPercent > 90) {
      status = 'unhealthy';
    } else if (dbStatus === 'slow' || memoryPercent > 75 || cpuPercent > 75) {
      status = 'degraded';
    }

    const result: HealthCheckResult = {
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
  private async saveCheck(result: HealthCheckResult): Promise<void> {
    try {
      await this.pool.query(
        `INSERT INTO health_checks (
          status, database_status, memory_used_mb, memory_total_mb,
          memory_percent, cpu_percent, uptime_seconds, active_connections
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          result.status,
          result.database.status,
          result.memory.usedMb,
          result.memory.totalMb,
          result.memory.percent,
          result.cpu.percent,
          result.uptime,
          result.activeConnections,
        ]
      );
    } catch (error) {
      console.error('[HealthCheckService] Failed to save check:', error);
    }
  }

  /**
   * Récupérer l'historique des health checks
   */
  async getHistory(limit: number = 100): Promise<HealthCheckHistory[]> {
    try {
      const result = await this.pool.query<HealthCheckHistory>(
        `SELECT
          id, status, database_status as "databaseStatus",
          memory_used_mb as "memoryUsedMb", memory_total_mb as "memoryTotalMb",
          memory_percent as "memoryPercent", cpu_percent as "cpuPercent",
          uptime_seconds as "uptimeSeconds", active_connections as "activeConnections",
          disk_usage_percent as "diskUsagePercent", checked_at as "checkedAt",
          metadata
        FROM health_checks
        ORDER BY checked_at DESC
        LIMIT $1`,
        [limit]
      );

      return result.rows;
    } catch (error) {
      console.error('[HealthCheckService] Failed to get history:', error);
      return [];
    }
  }

  /**
   * Récupérer le dernier check
   */
  async getLatest(): Promise<HealthCheckHistory | null> {
    const history = await this.getHistory(1);
    return history.length > 0 ? history[0] : null;
  }

  /**
   * Nettoyer les checks > 7 jours
   */
  async cleanup(): Promise<number> {
    try {
      const result = await this.pool.query(
        `DELETE FROM health_checks
         WHERE checked_at < NOW() - INTERVAL '7 days'
         RETURNING id`
      );
      return result.rowCount || 0;
    } catch (error) {
      console.error('[HealthCheckService] Cleanup failed:', error);
      return 0;
    }
  }
}
