/**
 * Feedback Generator - Génère le feedback visuel et sonore
 */
export type AnimationType = 'xp_burst' | 'xp_flow' | 'level_up' | 'achievement_unlock' | 'streak_flame' | 'streak_milestone' | 'combo' | 'confetti' | 'fireworks';
export type SoundType = 'xp_gain' | 'xp_gain_big' | 'level_up' | 'achievement_unlock' | 'streak_extend' | 'streak_milestone' | 'combo' | 'celebration';
export type CelebrationLevel = 'none' | 'subtle' | 'minor' | 'medium' | 'major' | 'epic' | 'legendary';
export interface ToastNotification {
    title: string;
    subtitle?: string;
    icon: string;
    color?: string;
    durationMs: number;
}
export interface FeedbackPayload {
    primaryAnimation: AnimationType;
    secondaryAnimations: AnimationType[];
    sounds: SoundType[];
    toast: ToastNotification;
    celebrationLevel: CelebrationLevel;
    hapticFeedback?: 'light' | 'medium' | 'heavy' | 'success';
}
export interface FeedbackContext {
    xpGained: number;
    leveledUp: boolean;
    newLevel?: number;
    achievementUnlocked: boolean;
    achievementName?: string;
    achievementRarity?: string;
    streakExtended: boolean;
    currentStreak?: number;
    streakMilestone?: boolean;
    comboCount?: number;
}
/**
 * Génère le payload de feedback complet
 */
export declare function generateFeedback(context: FeedbackContext): FeedbackPayload;
/**
 * Génère un message de félicitations personnalisé
 */
export declare function generateCongratulationMessage(context: FeedbackContext): string;
//# sourceMappingURL=feedback-generator.d.ts.map