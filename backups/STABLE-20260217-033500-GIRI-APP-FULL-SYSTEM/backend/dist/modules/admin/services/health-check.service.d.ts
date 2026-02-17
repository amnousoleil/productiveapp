import type { Pool } from 'pg';
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
export declare class HealthCheckService {
    private pool;
    constructor(pool: Pool);
    /**
     * Exécuter un health check complet
     */
    runCheck(): Promise<HealthCheckResult>;
    /**
     * Sauvegarder le health check dans la table health_checks
     */
    private saveCheck;
    /**
     * Récupérer l'historique des health checks
     */
    getHistory(limit?: number): Promise<HealthCheckHistory[]>;
    /**
     * Récupérer le dernier check
     */
    getLatest(): Promise<HealthCheckHistory | null>;
    /**
     * Nettoyer les checks > 7 jours
     */
    cleanup(): Promise<number>;
}
//# sourceMappingURL=health-check.service.d.ts.map