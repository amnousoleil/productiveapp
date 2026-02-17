import type { Request, Response, NextFunction } from 'express';
import { APIMetricsService } from '../modules/admin/services/api-metrics.service.js';
declare const apiMetricsService: APIMetricsService;
/**
 * Middleware pour tracker toutes les requêtes API
 * Enregistre: endpoint, latency, error status
 */
export declare function requestTrackerMiddleware(req: Request, res: Response, next: NextFunction): void;
export { apiMetricsService };
//# sourceMappingURL=request-tracker.middleware.d.ts.map