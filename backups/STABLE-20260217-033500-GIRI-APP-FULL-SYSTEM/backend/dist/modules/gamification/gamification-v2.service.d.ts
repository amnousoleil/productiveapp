/**
 * Gamification Service V2 - Service enrichi avec les nouvelles fonctionnalités
 *
 * Étend le service existant avec:
 * - Calcul XP avancé avec multiplicateurs
 * - Niveaux avec phases et titres
 * - Protection de streak (jokers/freezes)
 * - Analyse des habitudes
 * - Feedback riche
 * - Contexte IA
 */
import { type CalculateOptions, type LevelStatus, type FeedbackPayload, type HabitPattern, type AIContext, type StreakCheckResult } from './v2/index.js';
import type { UUID } from '../../types/index.js';
export interface AddXpV2Input {
    actionType: CalculateOptions['actionType'];
    difficulty?: number;
    tags?: string[];
    entityType?: string;
    entityId?: UUID;
    metadata?: Record<string, unknown>;
}
export interface AddXpV2Result {
    xpGained: number;
    baseXP: number;
    multipliers: {
        type: string;
        value: number;
        label: string;
    }[];
    totalMultiplier: number;
    leveledUp: boolean;
    newLevel?: number;
    newTitle?: string;
    newPhase?: string;
    feedback: FeedbackPayload;
    streakResult?: StreakCheckResult;
    achievementsUnlocked: {
        id: string;
        name: string;
        rarity: string;
    }[];
}
export declare class GamificationServiceV2 {
    private emitter;
    /**
     * Ajoute de l'XP avec le système v2 (multiplicateurs, feedback, etc.)
     */
    addXpV2(userId: UUID, workspaceId: UUID, input: AddXpV2Input): Promise<AddXpV2Result>;
    /**
     * Obtient le statut de niveau enrichi
     */
    getLevelStatusV2(userId: UUID, workspaceId: UUID): Promise<LevelStatus>;
    /**
     * Analyse les habitudes de l'utilisateur
     */
    analyzeUserHabits(userId: UUID, workspaceId: UUID, days?: number): Promise<HabitPattern>;
    /**
     * Génère le contexte IA pour l'utilisateur
     */
    getAIContext(userId: UUID, workspaceId: UUID): Promise<AIContext>;
    private checkAndUpdateStreak;
    private isFirstActionOfDay;
    private mapActionToReason;
    private isStreakMilestone;
}
export declare const gamificationServiceV2: GamificationServiceV2;
//# sourceMappingURL=gamification-v2.service.d.ts.map