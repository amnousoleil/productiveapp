/**
 * Habit Analyzer - Analyse des patterns d'activité
 */
export interface ActivityRecord {
    date: string;
    hour: number;
    actionType: string;
    xpGained: number;
}
export interface HabitPattern {
    peakHours: number[];
    bestDays: string[];
    avgActionsPerDay: number;
    avgXPPerDay: number;
    productivityScore: number;
    consistencyScore: number;
    streakHealth: 'healthy' | 'at_risk' | 'recovering' | 'broken';
}
export interface DailyStats {
    date: string;
    actionCount: number;
    xpGained: number;
    peakHour: number;
    isActive: boolean;
}
/**
 * Analyse les activités des 30 derniers jours
 */
export declare function analyzeHabits(activities: ActivityRecord[]): HabitPattern;
/**
 * Agrège les activités par jour
 */
export declare function aggregateByDay(activities: ActivityRecord[]): DailyStats[];
/**
 * Génère un heatmap des 7 derniers jours par heure
 */
export declare function generateWeeklyHeatmap(activities: ActivityRecord[]): number[][];
/**
 * Prédit le meilleur moment pour être productif
 */
export declare function predictBestTime(pattern: HabitPattern): {
    hour: number;
    day: string;
    reason: string;
};
/**
 * Génère des insights basés sur les patterns
 */
export declare function generateInsights(pattern: HabitPattern): string[];
//# sourceMappingURL=habit-analyzer.d.ts.map