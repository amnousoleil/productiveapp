import type { Pool } from 'pg';
export interface ErrorLogInput {
    message: string;
    stack?: string;
    errorType: string;
    severity: 'debug' | 'info' | 'warning' | 'error' | 'critical';
    url?: string;
    userAgent?: string;
    memberId?: string;
    workspaceId?: string;
    ipAddress?: string;
    httpMethod?: string;
    requestPath?: string;
    requestBody?: any;
    browserInfo?: any;
    screenResolution?: string;
    viewportSize?: string;
}
export interface ErrorLog extends ErrorLogInput {
    id: string;
    createdAt: Date;
    metadata?: any;
}
export interface ErrorStats {
    total: number;
    bySeverity: {
        critical: number;
        error: number;
        warning: number;
        info: number;
        debug: number;
    };
    last24h: number;
    uniqueUsers: number;
}
export interface ErrorLogsResult {
    logs: ErrorLog[];
    total: number;
    page: number;
    limit: number;
}
/**
 * ErrorLogService - Gestion de la table error_logs (migration 022)
 */
export declare class ErrorLogService {
    private pool;
    constructor(pool: Pool);
    /**
     * Créer un log d'erreur
     */
    createLog(data: ErrorLogInput): Promise<string>;
    /**
     * Récupérer les logs avec filtres
     */
    getLogs(params: {
        limit?: number;
        offset?: number;
        severity?: string;
        errorType?: string;
        memberId?: string;
        startDate?: Date;
        endDate?: Date;
    }): Promise<ErrorLogsResult>;
    /**
     * Stats des erreurs (24h)
     */
    getStats(): Promise<ErrorStats>;
    /**
     * Nettoyer les logs > 30 jours
     */
    cleanup(): Promise<number>;
}
//# sourceMappingURL=error-log.service.d.ts.map