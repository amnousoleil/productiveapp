"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiMetricsService = void 0;
exports.requestTrackerMiddleware = requestTrackerMiddleware;
const api_metrics_service_js_1 = require("../modules/admin/services/api-metrics.service.js");
const pool_js_1 = __importDefault(require("../modules/accounting/pool.js"));
// Instance globale du service metrics
const apiMetricsService = new api_metrics_service_js_1.APIMetricsService(pool_js_1.default);
exports.apiMetricsService = apiMetricsService;
/**
 * Middleware pour tracker toutes les requêtes API
 * Enregistre: endpoint, latency, error status
 */
function requestTrackerMiddleware(req, res, next) {
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
//# sourceMappingURL=request-tracker.middleware.js.map