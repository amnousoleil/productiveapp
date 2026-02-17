/**
 * AI Context - Génère le contexte pour l'IA
 */
import type { HabitPattern, DailyStats } from '../streaks/habit-analyzer.js';
import type { LevelStatus } from '../core/level-phases.js';
export interface BehaviorPattern {
    type: 'time_preference' | 'task_preference' | 'productivity_cycle' | 'learning_style';
    description: string;
    confidence: number;
    data: Record<string, unknown>;
}
export interface Prediction {
    type: 'churn_risk' | 'engagement_trend' | 'goal_completion' | 'optimal_time' | 'burnout_risk';
    score: number;
    confidence: number;
    factors: {
        name: string;
        impact: number;
        description: string;
    }[];
    recommendations: string[];
}
export interface AIContext {
    userId: string;
    generatedAt: string;
    currentStatus: {
        level: LevelStatus;
        currentStreak: number;
        bestStreak: number;
        recentXP: number;
        todayActive: boolean;
    };
    recentHistory: {
        last7DaysXP: number;
        last30DaysXP: number;
        activeDaysLast7: number;
        activeDaysLast30: number;
        recentAchievements: string[];
    };
    trends: {
        xpTrend: 'increasing' | 'stable' | 'decreasing';
        activityTrend: 'increasing' | 'stable' | 'decreasing';
        streakHealth: 'healthy' | 'at_risk' | 'recovering' | 'broken';
        engagementScore: number;
    };
    patterns: BehaviorPattern[];
    predictions: Prediction[];
    suggestedPrompts: string[];
}
export interface AIContextInput {
    userId: string;
    levelStatus: LevelStatus;
    currentStreak: number;
    bestStreak: number;
    habitPattern: HabitPattern;
    recentDailyStats: DailyStats[];
    recentAchievements: string[];
}
/**
 * Génère le contexte complet pour l'IA
 */
export declare function generateAIContext(input: AIContextInput): AIContext;
//# sourceMappingURL=ai-context.d.ts.map