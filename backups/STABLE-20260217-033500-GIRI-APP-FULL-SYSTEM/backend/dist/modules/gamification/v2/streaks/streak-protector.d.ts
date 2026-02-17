/**
 * Streak Protector - Jokers, Freezes et Recovery
 */
export interface StreakProtectionState {
    userId: string;
    currentStreak: number;
    bestStreak: number;
    lastActiveDate: string;
    jokersUsedThisMonth: number;
    freezesUsedThisMonth: number;
    isFrozen: boolean;
    freezeEndDate: string | null;
    lastJokerResetMonth: string;
}
export interface ProtectionConfig {
    maxJokersPerMonth: number;
    maxFreezesPerMonth: number;
    freezeDurationHours: number;
    recoveryWindowHours: number;
    recoveryCostXP: number;
}
export interface StreakCheckResult {
    action: 'continue' | 'auto_joker' | 'broken' | 'frozen' | 'recovered';
    newStreak: number;
    jokerUsed: boolean;
    message: string;
    canRecover: boolean;
    recoveryCost: number;
}
/**
 * Reset mensuel des jokers si nécessaire
 */
export declare function checkMonthlyReset(state: StreakProtectionState): StreakProtectionState;
/**
 * Vérifie et met à jour le streak
 */
export declare function checkStreak(state: StreakProtectionState, config?: ProtectionConfig, timezone?: string): StreakCheckResult;
/**
 * Active un freeze manuel
 */
export declare function activateFreeze(state: StreakProtectionState, config?: ProtectionConfig): {
    success: boolean;
    state: StreakProtectionState;
    message: string;
};
/**
 * Tente de récupérer un streak cassé (coûte de l'XP)
 */
export declare function attemptRecovery(state: StreakProtectionState, userXP: number, config?: ProtectionConfig): {
    success: boolean;
    state: StreakProtectionState;
    xpCost: number;
    message: string;
};
/**
 * Calcule les protections restantes
 */
export declare function getRemainingProtections(state: StreakProtectionState, config?: ProtectionConfig): {
    jokersRemaining: number;
    freezesRemaining: number;
};
//# sourceMappingURL=streak-protector.d.ts.map