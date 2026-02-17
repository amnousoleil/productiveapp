/**
 * Event Emitter - Système d'événements de gamification
 */
export type GamificationEventType = 'xp_gained' | 'level_up' | 'achievement_unlocked' | 'streak_extended' | 'streak_broken' | 'streak_milestone' | 'combo_achieved' | 'prestige_reset' | 'daily_reward_claimed';
export interface GamificationEvent {
    type: GamificationEventType;
    userId: string;
    timestamp: string;
    data: Record<string, unknown>;
}
export interface XPGainedEvent extends GamificationEvent {
    type: 'xp_gained';
    data: {
        amount: number;
        reason: string;
        multipliers: {
            type: string;
            value: number;
        }[];
        totalXP: number;
        newLevel: number;
    };
}
export interface LevelUpEvent extends GamificationEvent {
    type: 'level_up';
    data: {
        oldLevel: number;
        newLevel: number;
        newTitle: string;
        newPhase?: string;
    };
}
export interface AchievementUnlockedEvent extends GamificationEvent {
    type: 'achievement_unlocked';
    data: {
        achievementId: string;
        achievementName: string;
        rarity: string;
        xpRewarded: number;
    };
}
export interface StreakEvent extends GamificationEvent {
    type: 'streak_extended' | 'streak_broken' | 'streak_milestone';
    data: {
        oldStreak: number;
        newStreak: number;
        jokerUsed?: boolean;
        milestone?: number;
    };
}
type EventHandler<T extends GamificationEvent = GamificationEvent> = (event: T) => void | Promise<void>;
/**
 * Event Emitter singleton pour la gamification
 */
declare class GamificationEventEmitter {
    private handlers;
    private globalHandlers;
    private eventHistory;
    private maxHistorySize;
    /**
     * S'abonne à un type d'événement spécifique
     */
    on<T extends GamificationEvent>(type: T['type'], handler: EventHandler<T>): () => void;
    /**
     * S'abonne à tous les événements
     */
    onAll(handler: EventHandler): () => void;
    /**
     * Se désabonne d'un événement
     */
    off(type: GamificationEventType, handler: EventHandler): void;
    /**
     * Émet un événement
     */
    emit<T extends GamificationEvent>(event: T): Promise<void>;
    /**
     * Émet un événement XP gagné
     */
    emitXPGained(userId: string, amount: number, reason: string, multipliers: {
        type: string;
        value: number;
    }[], totalXP: number, newLevel: number): void;
    /**
     * Émet un événement level up
     */
    emitLevelUp(userId: string, oldLevel: number, newLevel: number, newTitle: string, newPhase?: string): void;
    /**
     * Émet un événement achievement débloqué
     */
    emitAchievementUnlocked(userId: string, achievementId: string, achievementName: string, rarity: string, xpRewarded: number): void;
    /**
     * Émet un événement streak
     */
    emitStreakEvent(userId: string, type: 'streak_extended' | 'streak_broken' | 'streak_milestone', oldStreak: number, newStreak: number, jokerUsed?: boolean, milestone?: number): void;
    /**
     * Obtient l'historique des événements pour un utilisateur
     */
    getHistoryForUser(userId: string, limit?: number): GamificationEvent[];
    /**
     * Obtient l'historique par type
     */
    getHistoryByType(type: GamificationEventType, limit?: number): GamificationEvent[];
    /**
     * Efface l'historique
     */
    clearHistory(): void;
    /**
     * Efface tous les handlers
     */
    clearHandlers(): void;
}
export declare function getEventEmitter(): GamificationEventEmitter;
export declare function resetEventEmitter(): void;
export {};
//# sourceMappingURL=event-emitter.d.ts.map