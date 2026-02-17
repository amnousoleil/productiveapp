import type { Pool } from 'pg';
export interface SystemAlert {
    id: string;
    alertType: string;
    title: string;
    description?: string;
    severity: 'info' | 'warning' | 'critical';
    status: 'active' | 'acknowledged' | 'resolved';
    createdAt: Date;
    acknowledgedAt?: Date;
    resolvedAt?: Date;
    resolvedBy?: string;
    resolutionNotes?: string;
    metadata?: any;
}
export interface CreateAlertInput {
    alertType: string;
    title: string;
    description?: string;
    severity: 'info' | 'warning' | 'critical';
    metadata?: any;
}
export interface AlertsResult {
    alerts: SystemAlert[];
    total: number;
}
/**
 * SystemAlertService - Gestion de la table system_alerts
 * Auto-création d'alertes basées sur seuils (DB lente, memory haute, etc.)
 */
export declare class SystemAlertService {
    private pool;
    constructor(pool: Pool);
    /**
     * Créer une alerte
     */
    createAlert(data: CreateAlertInput): Promise<string>;
    /**
     * Récupérer les alertes avec filtres
     */
    getAlerts(params: {
        status?: 'active' | 'acknowledged' | 'resolved';
        severity?: 'info' | 'warning' | 'critical';
        limit?: number;
        offset?: number;
    }): Promise<AlertsResult>;
    /**
     * Acquitter une alerte
     */
    acknowledgeAlert(alertId: string): Promise<boolean>;
    /**
     * Résoudre une alerte
     */
    resolveAlert(alertId: string, resolvedBy: string, resolutionNotes?: string): Promise<boolean>;
    /**
     * Vérifier et créer alertes basées sur seuils
     * Appelé périodiquement ou après health check
     */
    checkThresholdsAndCreateAlerts(healthData: {
        dbResponseTime: number;
        memoryPercent: number;
        cpuPercent: number;
    }): Promise<void>;
    /**
     * Créer une alerte seulement si elle n'existe pas déjà en status active
     */
    private createAlertIfNotExists;
    /**
     * Nettoyer les alertes résolues > 30 jours
     */
    cleanup(): Promise<number>;
}
//# sourceMappingURL=system-alert.service.d.ts.map