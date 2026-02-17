"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.APIMetricsService = void 0;
/**
 * APIMetricsService - Collecte et agrège les métriques API en temps réel
 * Stockage en mémoire pour performance, sauvegarde périodique dans health_checks
 */
class APIMetricsService {
    metrics = new Map();
    pool;
    constructor(pool) {
        this.pool = pool;
    }
    /**
     * Enregistrer une requête API
     */
    recordRequest(endpoint, latency, isError) {
        const existing = this.metrics.get(endpoint);
        if (existing) {
            existing.count++;
            existing.totalLatency += latency;
            existing.avgLatency = existing.totalLatency / existing.count;
            existing.maxLatency = Math.max(existing.maxLatency, latency);
            if (isError)
                existing.errorCount++;
            existing.errorRate = (existing.errorCount / existing.count) * 100;
            existing.lastHit = new Date();
        }
        else {
            this.metrics.set(endpoint, {
                endpoint,
                count: 1,
                totalLatency: latency,
                avgLatency: latency,
                maxLatency: latency,
                errorCount: isError ? 1 : 0,
                errorRate: isError ? 100 : 0,
                lastHit: new Date(),
            });
        }
    }
    /**
     * Récupérer toutes les métriques
     */
    getMetrics() {
        const endpoints = Array.from(this.metrics.values());
        const totalRequests = endpoints.reduce((sum, e) => sum + e.count, 0);
        const totalErrors = endpoints.reduce((sum, e) => sum + e.errorCount, 0);
        const totalLatency = endpoints.reduce((sum, e) => sum + e.totalLatency, 0);
        return {
            totalRequests,
            totalErrors,
            avgLatency: totalRequests > 0 ? totalLatency / totalRequests : 0,
            endpoints,
            collectedAt: new Date(),
        };
    }
    /**
     * Top N endpoints par nombre de requêtes
     */
    getTopEndpoints(limit = 10) {
        return Array.from(this.metrics.values())
            .sort((a, b) => b.count - a.count)
            .slice(0, limit);
    }
    /**
     * Endpoints les plus lents
     */
    getSlowestEndpoints(limit = 10) {
        return Array.from(this.metrics.values())
            .sort((a, b) => b.avgLatency - a.avgLatency)
            .slice(0, limit);
    }
    /**
     * Reset des métriques (pour tests ou reset manuel)
     */
    reset() {
        this.metrics.clear();
    }
    /**
     * Sauvegarder les métriques dans health_checks.metadata
     * (optionnel, pour historique)
     */
    async saveSnapshot() {
        try {
            const metrics = this.getMetrics();
            await this.pool.query(`INSERT INTO health_checks (status, database_status, memory_used_mb, metadata)
         VALUES ($1, $2, $3, $4)`, ['healthy', 'ok', 0, JSON.stringify({ api_metrics: metrics })]);
        }
        catch (error) {
            console.error('[APIMetricsService] Failed to save snapshot:', error);
        }
    }
}
exports.APIMetricsService = APIMetricsService;
//# sourceMappingURL=api-metrics.service.js.map