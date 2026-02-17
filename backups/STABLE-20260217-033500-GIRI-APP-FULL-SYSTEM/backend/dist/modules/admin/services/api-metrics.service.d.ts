import type { Pool } from 'pg';
export interface EndpointMetric {
    endpoint: string;
    count: number;
    totalLatency: number;
    avgLatency: number;
    maxLatency: number;
    errorCount: number;
    errorRate: number;
    lastHit: Date;
}
export interface APIMetrics {
    totalRequests: number;
    totalErrors: number;
    avgLatency: number;
    endpoints: EndpointMetric[];
    collectedAt: Date;
}
/**
 * APIMetricsService - Collecte et agrège les métriques API en temps réel
 * Stockage en mémoire pour performance, sauvegarde périodique dans health_checks
 */
export declare class APIMetricsService {
    private metrics;
    private pool;
    constructor(pool: Pool);
    /**
     * Enregistrer une requête API
     */
    recordRequest(endpoint: string, latency: number, isError: boolean): void;
    /**
     * Récupérer toutes les métriques
     */
    getMetrics(): APIMetrics;
    /**
     * Top N endpoints par nombre de requêtes
     */
    getTopEndpoints(limit?: number): EndpointMetric[];
    /**
     * Endpoints les plus lents
     */
    getSlowestEndpoints(limit?: number): EndpointMetric[];
    /**
     * Reset des métriques (pour tests ou reset manuel)
     */
    reset(): void;
    /**
     * Sauvegarder les métriques dans health_checks.metadata
     * (optionnel, pour historique)
     */
    saveSnapshot(): Promise<void>;
}
//# sourceMappingURL=api-metrics.service.d.ts.map