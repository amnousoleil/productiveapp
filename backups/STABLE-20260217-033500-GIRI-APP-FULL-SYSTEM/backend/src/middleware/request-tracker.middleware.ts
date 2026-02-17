import type { Request, Response, NextFunction } from 'express';
import { APIMetricsService } from '../modules/admin/services/api-metrics.service.js';
import pool from '../modules/accounting/pool.js';

// Instance globale du service metrics
const apiMetricsService = new APIMetricsService(pool);

/**
 * Middleware pour tracker toutes les requêtes API
 * Enregistre: endpoint, latency, error status
 */
export function requestTrackerMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const startTime = Date.now();

  // Intercepter la fin de la réponse
  res.on('finish', () => {
    const latency = Date.now() - startTime;
    const endpoint = `${req.method} ${req.route?.path || req.path}`;
    const isError = res.statusCode >= 400;

    // Enregistrer dans le service metrics
    apiMetricsService.recordRequest(endpoint, latency, isError);
  });

  next();
}

// Export du service pour accès global
export { apiMetricsService };
