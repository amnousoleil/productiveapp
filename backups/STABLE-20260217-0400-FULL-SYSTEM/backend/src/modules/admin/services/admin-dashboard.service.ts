import type { Pool } from 'pg';
import type { DatabaseMetrics, UserAnalytics, VersionInfo, ChangelogEntry } from '../admin.types.js';
import { APIMetricsService } from './api-metrics.service.js';
import { ErrorLogService } from './error-log.service.js';
import { HealthCheckService } from './health-check.service.js';
import { SystemAlertService } from './system-alert.service.js';
import fs from 'fs';
import path from 'path';

/**
 * AdminDashboardService - Méthodes étendues pour le dashboard admin
 * Agrège les données des 4 services spécialisés
 */
export class AdminDashboardService {
  private pool: Pool;
  private apiMetricsService: APIMetricsService;
  private errorLogService: ErrorLogService;
  private healthCheckService: HealthCheckService;
  private systemAlertService: SystemAlertService;

  constructor(
    pool: Pool,
    apiMetricsService: APIMetricsService,
    errorLogService: ErrorLogService,
    healthCheckService: HealthCheckService,
    systemAlertService: SystemAlertService
  ) {
    this.pool = pool;
    this.apiMetricsService = apiMetricsService;
    this.errorLogService = errorLogService;
    this.healthCheckService = healthCheckService;
    this.systemAlertService = systemAlertService;
  }

  /**
   * Métriques API (délégation)
   */
  getAPIMetrics() {
    return this.apiMetricsService.getMetrics();
  }

  /**
   * Top N endpoints par requêtes
   */
  getTopEndpoints(limit: number = 10) {
    return this.apiMetricsService.getTopEndpoints(limit);
  }

  /**
   * Endpoints les plus lents
   */
  getSlowestEndpoints(limit: number = 10) {
    return this.apiMetricsService.getSlowestEndpoints(limit);
  }

  /**
   * Logs d'erreurs avec filtres (délégation)
   */
  async getErrorLogs(params: any) {
    return this.errorLogService.getLogs(params);
  }

  /**
   * Stats erreurs (délégation)
   */
  async getErrorStats() {
    return this.errorLogService.getStats();
  }

  /**
   * Historique health checks (délégation)
   */
  async getHealthHistory(limit: number = 100) {
    return this.healthCheckService.getHistory(limit);
  }

  /**
   * Alertes système (délégation)
   */
  async getSystemAlerts(filters: any) {
    return this.systemAlertService.getAlerts(filters);
  }

  /**
   * Métriques base de données
   */
  async getDatabaseMetrics(): Promise<DatabaseMetrics> {
    // 1. Taille BDD
    const sizeResult = await this.pool.query<{ size_mb: string }>(
      `SELECT ROUND(pg_database_size(current_database()) / 1024.0 / 1024.0, 2) as size_mb`
    );
    const sizeMb = parseFloat(sizeResult.rows[0]?.size_mb || '0');

    // 2. Nombre de tables
    const tableCountResult = await this.pool.query<{ count: string }>(
      `SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = 'public'`
    );
    const tableCount = parseInt(tableCountResult.rows[0]?.count || '0', 10);

    // 3. Requêtes lentes (nécessite pg_stat_statements extension)
    let slowQueries: any[] = [];
    try {
      const slowQueriesResult = await this.pool.query(
        `SELECT
          LEFT(query, 100) as query,
          calls,
          ROUND(mean_exec_time::numeric, 2) as mean_time_ms,
          ROUND(max_exec_time::numeric, 2) as max_time_ms
        FROM pg_stat_statements
        WHERE mean_exec_time > 100
        ORDER BY mean_exec_time DESC
        LIMIT 10`
      );
      slowQueries = slowQueriesResult.rows.map((row) => ({
        query: row.query,
        calls: parseInt(row.calls, 10),
        meanTimeMs: parseFloat(row.mean_time_ms),
        maxTimeMs: parseFloat(row.max_time_ms),
      }));
    } catch (error) {
      // pg_stat_statements non activé
      console.warn('[AdminDashboard] pg_stat_statements not available');
    }

    // 4. Index manquants (tables avec beaucoup de seq scans)
    const missingIndexesResult = await this.pool.query(
      `SELECT
        schemaname as schema_name,
        tablename as table_name,
        seq_scan,
        seq_tup_read
      FROM pg_stat_user_tables
      WHERE seq_scan > 1000 AND idx_scan < seq_scan / 10
      ORDER BY seq_scan DESC
      LIMIT 10`
    );
    const missingIndexes = missingIndexesResult.rows.map((row) => ({
      schemaName: row.schema_name,
      tableName: row.table_name,
      seqScans: parseInt(row.seq_scan, 10),
      seqTupRead: parseInt(row.seq_tup_read, 10),
      recommendation: `Consider adding index on ${row.table_name} (${row.seq_scan} sequential scans)`,
    }));

    return {
      sizeMb,
      tableCount,
      slowQueries,
      missingIndexes,
    };
  }

  /**
   * Analytics utilisateurs
   */
  async getUserAnalytics(
    startDate?: Date,
    endDate?: Date
  ): Promise<UserAnalytics[]> {
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 jours
    const end = endDate || new Date();

    const result = await this.pool.query(
      `SELECT
        u.id as member_id,
        u.name as member_name,
        ug.last_activity_at as last_login,
        COALESCE(
          (SELECT COUNT(*) FROM user_gamification ug2
           WHERE ug2.user_id = u.id
           AND ug2.last_activity_at >= $1
           AND ug2.last_activity_at <= $2),
          0
        ) as login_count_week,
        COALESCE((SELECT COUNT(*) FROM notes n WHERE n.member_id::uuid = u.id), 0) as notes_count,
        COALESCE((SELECT COUNT(*) FROM tasks t WHERE t.user_id = u.id), 0) as tasks_count,
        COALESCE((SELECT COUNT(*) FROM projects p WHERE p.user_id = u.id), 0) as projects_count
      FROM users u
      LEFT JOIN user_gamification ug ON u.id = ug.user_id
      ORDER BY ug.last_activity_at DESC NULLS LAST`,
      [start, end]
    );

    return result.rows.map((row) => ({
      memberId: row.member_id,
      memberName: row.member_name,
      lastLogin: row.last_login,
      loginCountWeek: parseInt(row.login_count_week, 10),
      notesCount: parseInt(row.notes_count, 10),
      tasksCount: parseInt(row.tasks_count, 10),
      projectsCount: parseInt(row.projects_count, 10),
      totalActions:
        parseInt(row.notes_count, 10) +
        parseInt(row.tasks_count, 10) +
        parseInt(row.projects_count, 10),
      timeSpentMinutes: parseInt(row.login_count_week, 10) * 30, // Estimation
    }));
  }

  /**
   * Version info + changelog
   */
  async getVersionInfo(): Promise<VersionInfo> {
    // 1. Lire package.json pour version
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    let appVersion = '1.0.0';
    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      appVersion = packageJson.version || '1.0.0';
    } catch (error) {
      console.warn('[AdminDashboard] Could not read package.json');
    }

    // 2. Node version
    const nodeVersion = process.version;

    // 3. Environment
    const environment = process.env.NODE_ENV || 'development';

    // 4. Uptime
    const uptime = process.uptime();

    // 5. Parser MEMORY.md pour changelog (dernières 10 entrées)
    const changelog = await this.parseChangelog();

    return {
      appVersion,
      nodeVersion,
      environment,
      uptime,
      changelog,
    };
  }

  /**
   * Parser MEMORY.md pour extraire changelog
   */
  private async parseChangelog(): Promise<ChangelogEntry[]> {
    const memoryPath = '/root/.claude/projects/-root/memory/MEMORY.md';
    const entries: ChangelogEntry[] = [];

    try {
      const content = fs.readFileSync(memoryPath, 'utf-8');
      const lines = content.split('\n');

      let currentEntry: ChangelogEntry | null = null;

      for (const line of lines) {
        // Match section headers like "## Critical Bugs Fixed (2026-02-06)"
        const headerMatch = line.match(/^## (.+?) \((\d{4}-\d{2}-\d{2})\)/);
        if (headerMatch) {
          if (currentEntry) {
            entries.push(currentEntry);
          }
          currentEntry = {
            date: headerMatch[2],
            title: headerMatch[1],
            changes: [],
          };
          continue;
        }

        // Match bullet points
        if (currentEntry && line.match(/^- \*\*(.+?)\*\*/)) {
          const changeMatch = line.match(/^- \*\*(.+?)\*\*: (.+)/);
          if (changeMatch) {
            currentEntry.changes.push(`${changeMatch[1]}: ${changeMatch[2]}`);
          }
        }
      }

      if (currentEntry) {
        entries.push(currentEntry);
      }
    } catch (error) {
      console.warn('[AdminDashboard] Could not parse MEMORY.md:', error);
    }

    return entries.slice(0, 10); // Dernières 10 entrées
  }
}
