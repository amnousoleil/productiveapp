/**
 * Level Phases - Système de niveaux enrichi avec phases et titres
 */
export type LevelPhase = 'awakening' | 'exploration' | 'mastery' | 'excellence' | 'transcendence' | 'architect';
export interface LevelInfo {
    level: number;
    phase: LevelPhase;
    title: string;
    description: string;
    xpRequired: number;
    totalXpRequired: number;
}
export interface LevelStatus {
    current: number;
    title: string;
    phase: LevelPhase;
    currentXP: number;
    xpToNextLevel: number;
    progressPercent: number;
    totalXP: number;
    prestigeLevel: number;
}
/**
 * Obtient la phase pour un niveau donné
 */
export declare function getPhaseForLevel(level: number): {
    phase: LevelPhase;
    name: string;
};
/**
 * Obtient le titre pour un niveau
 */
export declare function getTitleForLevel(level: number): string;
/**
 * Calcule l'XP requis pour un niveau (formule exponentielle)
 * Base: 100 XP, multiplicateur: 1.15
 */
export declare function getXPForLevel(level: number): number;
/**
 * Calcule l'XP total cumulé pour atteindre un niveau
 */
export declare function getTotalXPForLevel(level: number): number;
/**
 * Calcule le niveau à partir de l'XP total
 */
export declare function getLevelFromXP(totalXP: number): number;
/**
 * Obtient les infos complètes d'un niveau
 */
export declare function getLevelInfo(level: number): LevelInfo;
/**
 * Calcule le statut de niveau d'un utilisateur
 */
export declare function getLevelStatus(totalXP: number, prestigeLevel?: number): LevelStatus;
/**
 * Vérifie si un level up s'est produit
 */
export declare function checkLevelUp(oldXP: number, newXP: number): {
    leveledUp: boolean;
    oldLevel: number;
    newLevel: number;
    newTitle?: string;
    newPhase?: LevelPhase;
};
//# sourceMappingURL=level-phases.d.ts.map