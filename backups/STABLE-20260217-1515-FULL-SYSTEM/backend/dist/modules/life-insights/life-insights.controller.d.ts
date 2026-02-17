import { Request, Response } from 'express';
export declare class LifeInsightsController {
    /**
     * POST /api/v1/life-insights/activities
     * Enregistre une nouvelle activité
     */
    static logActivity(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * GET /api/v1/life-insights/activities
     * Récupère les activités de l'utilisateur
     */
    static getActivities(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * GET /api/v1/life-insights/stats
     * Récupère les statistiques d'activité
     */
    static getStats(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * GET /api/v1/life-insights/stats/hourly
     * Récupère la distribution horaire
     */
    static getHourlyDistribution(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * GET /api/v1/life-insights/stats/daily
     * Récupère les tendances quotidiennes
     */
    static getDailyTrends(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * GET /api/v1/life-insights/insights
     * Récupère les insights comportementaux
     */
    static getInsights(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * PUT /api/v1/life-insights/insights/:id/read
     * Marque un insight comme lu
     */
    static markInsightAsRead(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * GET /api/v1/life-insights/patterns
     * Récupère les patterns détectés
     */
    static getPatterns(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * GET /api/v1/life-insights/profile
     * Récupère le profil psychologique
     */
    static getProfile(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * POST /api/v1/life-insights/analyze
     * Lance une analyse complète de l'utilisateur
     */
    static analyzeUser(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * GET /api/v1/life-insights/snapshots/today
     * Récupère le snapshot du jour
     */
    static getTodaySnapshot(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * GET /api/v1/life-insights/export
     * Exporte toutes les données Life Insights
     */
    static exportData(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=life-insights.controller.d.ts.map