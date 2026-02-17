"use strict";
/**
 * Level Phases - Système de niveaux enrichi avec phases et titres
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPhaseForLevel = getPhaseForLevel;
exports.getTitleForLevel = getTitleForLevel;
exports.getXPForLevel = getXPForLevel;
exports.getTotalXPForLevel = getTotalXPForLevel;
exports.getLevelFromXP = getLevelFromXP;
exports.getLevelInfo = getLevelInfo;
exports.getLevelStatus = getLevelStatus;
exports.checkLevelUp = checkLevelUp;
// Phases par paliers de niveaux
const PHASES = [
    { maxLevel: 10, phase: 'awakening', name: 'Éveil' },
    { maxLevel: 25, phase: 'exploration', name: 'Exploration' },
    { maxLevel: 50, phase: 'mastery', name: 'Maîtrise' },
    { maxLevel: 75, phase: 'excellence', name: 'Excellence' },
    { maxLevel: 99, phase: 'transcendence', name: 'Transcendance' },
    { maxLevel: Infinity, phase: 'architect', name: 'Architecte' },
];
// Titres par niveau (sélection)
const LEVEL_TITLES = {
    1: 'Éveillé',
    5: 'Apprenti',
    10: 'Initié',
    15: 'Explorateur',
    20: 'Aventurier',
    25: 'Découvreur',
    30: 'Artisan',
    35: 'Expert',
    40: 'Maître',
    45: 'Virtuose',
    50: 'Légende',
    60: 'Champion',
    70: 'Héros',
    80: 'Titan',
    90: 'Immortel',
    100: 'Architecte des Galaxies',
};
/**
 * Obtient la phase pour un niveau donné
 */
function getPhaseForLevel(level) {
    for (const p of PHASES) {
        if (level <= p.maxLevel)
            return { phase: p.phase, name: p.name };
    }
    return { phase: 'architect', name: 'Architecte' };
}
/**
 * Obtient le titre pour un niveau
 */
function getTitleForLevel(level) {
    // Chercher le titre exact ou le plus proche inférieur
    const levels = Object.keys(LEVEL_TITLES).map(Number).sort((a, b) => b - a);
    for (const l of levels) {
        if (level >= l)
            return LEVEL_TITLES[l];
    }
    return 'Novice';
}
/**
 * Calcule l'XP requis pour un niveau (formule exponentielle)
 * Base: 100 XP, multiplicateur: 1.15
 */
function getXPForLevel(level) {
    if (level <= 1)
        return 0;
    const BASE_XP = 100;
    const MULTIPLIER = 1.15;
    return Math.floor(BASE_XP * Math.pow(MULTIPLIER, level - 2));
}
/**
 * Calcule l'XP total cumulé pour atteindre un niveau
 */
function getTotalXPForLevel(level) {
    let total = 0;
    for (let l = 2; l <= level; l++) {
        total += getXPForLevel(l);
    }
    return total;
}
/**
 * Calcule le niveau à partir de l'XP total
 */
function getLevelFromXP(totalXP) {
    let level = 1;
    let xpNeeded = getXPForLevel(2);
    let accumulated = 0;
    while (accumulated + xpNeeded <= totalXP) {
        accumulated += xpNeeded;
        level++;
        xpNeeded = getXPForLevel(level + 1);
    }
    return level;
}
/**
 * Obtient les infos complètes d'un niveau
 */
function getLevelInfo(level) {
    const { phase } = getPhaseForLevel(level);
    return {
        level,
        phase,
        title: getTitleForLevel(level),
        description: getPhaseDescription(phase),
        xpRequired: getXPForLevel(level),
        totalXpRequired: getTotalXPForLevel(level),
    };
}
/**
 * Calcule le statut de niveau d'un utilisateur
 */
function getLevelStatus(totalXP, prestigeLevel = 0) {
    const level = getLevelFromXP(totalXP);
    const { phase } = getPhaseForLevel(level);
    const xpForCurrentLevel = getTotalXPForLevel(level);
    const xpForNextLevel = getXPForLevel(level + 1);
    const currentXP = totalXP - xpForCurrentLevel;
    const progressPercent = Math.min(100, Math.floor((currentXP / xpForNextLevel) * 100));
    return {
        current: level,
        title: getTitleForLevel(level),
        phase,
        currentXP,
        xpToNextLevel: xpForNextLevel - currentXP,
        progressPercent,
        totalXP,
        prestigeLevel,
    };
}
/**
 * Vérifie si un level up s'est produit
 */
function checkLevelUp(oldXP, newXP) {
    const oldLevel = getLevelFromXP(oldXP);
    const newLevel = getLevelFromXP(newXP);
    if (newLevel > oldLevel) {
        const oldPhase = getPhaseForLevel(oldLevel).phase;
        const newPhase = getPhaseForLevel(newLevel).phase;
        return {
            leveledUp: true,
            oldLevel,
            newLevel,
            newTitle: getTitleForLevel(newLevel),
            newPhase: newPhase !== oldPhase ? newPhase : undefined,
        };
    }
    return { leveledUp: false, oldLevel, newLevel };
}
function getPhaseDescription(phase) {
    const descriptions = {
        awakening: 'Vous découvrez le pouvoir de la productivité organisée.',
        exploration: 'Vous explorez de nouvelles méthodes et trouvez votre rythme.',
        mastery: 'Vous maîtrisez les outils et développez votre expertise.',
        excellence: 'Vous excellez dans l\'art de la productivité.',
        transcendence: 'Vous transcendez les limites ordinaires.',
        architect: 'Vous êtes un Architecte des Galaxies, créateur de mondes.',
    };
    return descriptions[phase];
}
//# sourceMappingURL=level-phases.js.map