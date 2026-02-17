/**
 * XP Calculator v2 - Calcul avancé avec multiplicateurs
 */
export type ActionType = 'note_created' | 'note_updated' | 'task_created' | 'task_completed' | 'task_completed_easy' | 'task_completed_medium' | 'task_completed_hard' | 'task_completed_epic' | 'streak_bonus' | 'achievement' | 'daily_login' | 'daily_goal' | 'weekly_goal';
export interface XPMultiplier {
    type: 'streak' | 'first_of_day' | 'night_owl' | 'combo' | 'event' | 'prestige';
    value: number;
    label: string;
}
export interface XPCalculation {
    baseXP: number;
    difficultyBonus: number;
    tagBonus: number;
    multipliers: XPMultiplier[];
    totalMultiplier: number;
    finalXP: number;
}
export interface CalculateOptions {
    actionType: ActionType;
    difficulty?: number;
    tags?: string[];
    currentStreak?: number;
    isFirstOfDay?: boolean;
    hourOfDay?: number;
    comboCount?: number;
    prestigeLevel?: number;
    eventMultiplier?: number;
}
/**
 * Calcule le multiplicateur de streak
 * 3+ jours: x1.1, 7+ jours: x1.25, 14+ jours: x1.5, 30+ jours: x1.75, 60+ jours: x2.0, 90+ jours: x2.5
 */
export declare function getStreakMultiplier(streak: number): number;
/**
 * Calcule l'XP avec tous les multiplicateurs
 */
export declare function calculateXP(options: CalculateOptions): XPCalculation;
/**
 * Estime l'XP sans calcul complet
 */
export declare function estimateXP(actionType: ActionType, difficulty?: number): number;
//# sourceMappingURL=xp-calculator.d.ts.map