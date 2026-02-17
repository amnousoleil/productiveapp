import type { Pool } from 'pg';
export interface FrontendError {
    id: string;
    message: string;
    stack?: string;
    url?: string;
    user_agent?: string;
    timestamp: Date;
    user_id?: string;
    workspace_id?: string;
    severity: 'error' | 'warning' | 'info';
    metadata?: any;
    created_at: Date;
    resolved?: boolean;
    resolved_at?: Date;
    resolved_by?: string;
}
export interface FrontendErrorStats {
    total: number;
    bySeverity: {
        error: number;
        warning: number;
        info: number;
    };
    last24h: number;
    lastWeek: number;
    uniqueUsers: number;
    byDay: Array<{
        date: string;
        count: number;
    }>;
}
export interface FrontendErrorsResult {
    errors: FrontendError[];
    total: number;
    page: number;
    limit: number;
}
/**
 * FrontendErrorsService - Gestion de la table frontend_errors
 * Service spécifique pour les erreurs frontend (différent de error_logs backend)
 */
export declare class FrontendErrorsService {
    private pool;
    constructor(pool: Pool);
    /**
     * Récupérer les erreurs avec filtres
     */
    getErrors(params: {
        limit?: number;
        offset?: number;
        severity?: string;
        userId?: string;
        startDate?: Date;
        endDate?: Date;
        resolved?: boolean;
    }): Promise<FrontendErrorsResult>;
    /**
     * Statistiques des erreurs frontend
     */
    getStats(): Promise<FrontendErrorStats>;
    /**
     * Marquer une erreur comme résolue
     */
    resolveError(errorId: string, resolvedBy: string): Promise<boolean>;
    /**
     * Supprimer une erreur
     */
    deleteError(errorId: string): Promise<boolean>;
    /**
     * Obtenir données pour export CSV
     */
    getCSVData(params: {
        severity?: string;
        startDate?: Date;
        endDate?: Date;
    }): Promise<Array<any>>;
    /**
     * Nettoyer les erreurs > 30 jours
     */
    cleanup(): Promise<number>;
}
//# sourceMappingURL=frontend-errors.service.d.ts.map