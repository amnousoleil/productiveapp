import type { Pool } from 'pg';
import type { DatabaseMetrics, UserAnalytics, VersionInfo } from '../admin.types.js';
import { APIMetricsService } from './api-metrics.service.js';
import { ErrorLogService } from './error-log.service.js';
import { HealthCheckService } from './health-check.service.js';
import { SystemAlertService } from './system-alert.service.js';
/**
 * AdminDashboardService - Méthodes étendues pour le dashboard admin
 * Agrège les données des 4 services spécialisés
 */
export declare class AdminDashboardService {
    private pool;
    private apiMetricsService;
    private errorLogService;
    private healthCheckService;
    private systemAlertService;
    constructor(pool: Pool, apiMetricsService: APIMetricsService, errorLogService: ErrorLogService, healthCheckService: HealthCheckService, systemAlertService: SystemAlertService);
    /**
     * Métriques API (délégation)
     */
    getAPIMetrics(): import("./api-metrics.service.js").APIMetrics;
    /**
     * Top N endpoints par requêtes
     */
    getTopEndpoints(limit?: number): import("./api-metrics.service.js").EndpointMetric[];
    /**
     * Endpoints les plus lents
     */
    getSlowestEndpoints(limit?: number): import("./api-metrics.service.js").EndpointMetric[];
    /**
     * Logs d'erreurs avec filtres (délégation)
     */
    getErrorLogs(params: any): Promise<import("./error-log.service.js").ErrorLogsResult>;
    /**
     * Stats erreurs (délégation)
     */
    getErrorStats(): Promise<import("./error-log.service.js").ErrorStats>;
    /**
     * Historique health checks (délégation)
     */
    getHealthHistory(limit?: number): Promise<import("./health-check.service.js").HealthCheckHistory[]>;
    /**
     * Alertes système (délégation)
     */
    getSystemAlerts(filters: any): Promise<import("./system-alert.service.js").AlertsResult>;
    /**
     * Métriques base de données
     */
    getDatabaseMetrics(): Promise<DatabaseMetrics>;
    /**
     * Analytics utilisateurs
     */
    getUserAnalytics(startDate?: Date, endDate?: Date): Promise<UserAnalytics[]>;
    /**
     * Version info + changelog
     */
    getVersionInfo(): Promise<VersionInfo>;
    /**
     * Parser MEMORY.md pour extraire changelog
     */
    private parseChangelog;
}
//# sourceMappingURL=admin-dashboard.service.d.ts.map