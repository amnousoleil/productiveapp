import { ActivityLogEntry, CreateActivityLogDto, BehavioralInsight, UserPattern, DailySnapshot, PsychologicalProfile, TimelineQuery, ActivityStatsQuery, ActivityStats, HourlyDistribution, DailyTrend, LifeInsightsExport } from './life-insights.types';
export declare class LifeInsightsService {
    /**
     * Enregistre une nouvelle activité utilisateur
     */
    static logActivity(dto: CreateActivityLogDto): Promise<ActivityLogEntry>;
    /**
     * Récupère les activités d'un utilisateur
     */
    static getActivities(query: TimelineQuery): Promise<ActivityLogEntry[]>;
    /**
     * Récupère les statistiques d'activité d'un utilisateur
     */
    static getActivityStats(query: ActivityStatsQuery): Promise<ActivityStats>;
    /**
     * Récupère la distribution horaire des activités
     */
    static getHourlyDistribution(userId: string, days?: number): Promise<HourlyDistribution[]>;
    /**
     * Récupère les tendances quotidiennes
     */
    static getDailyTrends(userId: string, days?: number): Promise<DailyTrend[]>;
    /**
     * Crée un nouvel insight
     */
    static createInsight(insight: BehavioralInsight): Promise<BehavioralInsight>;
    /**
     * Récupère les insights actifs d'un utilisateur
     */
    static getInsights(userId: string, memberId?: string | null): Promise<BehavioralInsight[]>;
    /**
     * Marque un insight comme lu
     */
    static markInsightAsRead(insightId: number): Promise<void>;
    /**
     * Récupère les patterns actifs d'un utilisateur
     */
    static getPatterns(userId: string, memberId?: string | null): Promise<UserPattern[]>;
    /**
     * Enregistre ou met à jour un pattern
     */
    static upsertPattern(pattern: UserPattern): Promise<UserPattern>;
    /**
     * Récupère ou crée le snapshot du jour
     */
    static getTodaySnapshot(userId: string, memberId?: string | null): Promise<DailySnapshot | null>;
    /**
     * Met à jour le snapshot quotidien
     */
    static updateDailySnapshot(snapshot: DailySnapshot): Promise<DailySnapshot>;
    /**
     * Récupère le profil psychologique d'un utilisateur
     */
    static getProfile(userId: string, memberId?: string | null): Promise<PsychologicalProfile | null>;
    /**
     * Crée ou met à jour le profil psychologique
     */
    static upsertProfile(profile: PsychologicalProfile): Promise<PsychologicalProfile>;
    /**
     * Exporte toutes les données Life Insights d'un utilisateur
     */
    static exportUserData(userId: string, memberId?: string | null): Promise<LifeInsightsExport>;
}
//# sourceMappingURL=life-insights.service.d.ts.map