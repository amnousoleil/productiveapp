import type { Pool } from 'pg';
export interface PageViewStats {
    page: string;
    views: number;
    uniqueUsers: number;
    avgTimeOnPage: number;
}
export interface FeatureUsageStats {
    feature: string;
    usageCount: number;
    uniqueUsers: number;
    adoptionRate: number;
}
export interface UserActivityStats {
    totalUsers: number;
    activeToday: number;
    activeThisWeek: number;
    activeThisMonth: number;
    newUsersThisWeek: number;
}
/**
 * AnalyticsService - Analytics utilisateurs et features
 * Note: Nécessite une table 'page_views' ou 'analytics_events' (à créer si besoin)
 */
export declare class AnalyticsService {
    private pool;
    constructor(pool: Pool);
    /**
     * Stats pages les plus visitées
     * Pour l'instant, on simule avec les données disponibles
     */
    getTopPages(limit?: number): Promise<PageViewStats[]>;
    /**
     * Stats features les plus utilisées
     */
    getTopFeatures(limit?: number): Promise<FeatureUsageStats[]>;
    /**
     * Stats activité utilisateurs
     */
    getUserActivity(): Promise<UserActivityStats>;
    /**
     * Engagement par feature (taux d'utilisation)
     */
    getFeatureEngagement(): Promise<any>;
}
//# sourceMappingURL=analytics.service.d.ts.map