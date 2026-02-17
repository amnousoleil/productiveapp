"use strict";
/**
 * XP Calculator v2 - Calcul avancé avec multiplicateurs
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStreakMultiplier = getStreakMultiplier;
exports.calculateXP = calculateXP;
exports.estimateXP = estimateXP;
// XP de base par type d'action
const BASE_XP = {
    note_created: 15,
    note_updated: 5,
    task_created: 10,
    task_completed: 25,
    task_completed_easy: 20,
    task_completed_medium: 50,
    task_completed_hard: 100,
    task_completed_epic: 200,
    streak_bonus: 50,
    achievement: 0, // Géré par l'achievement
    daily_login: 25,
    daily_goal: 100,
    weekly_goal: 500,
};
// Bonus par tag
const TAG_BONUSES = {
    urgent: 1.2,
    important: 1.15,
    creative: 1.1,
    learning: 1.15,
    health: 1.1,
    career: 1.15,
};
/**
 * Calcule le multiplicateur de streak
 * 3+ jours: x1.1, 7+ jours: x1.25, 14+ jours: x1.5, 30+ jours: x1.75, 60+ jours: x2.0, 90+ jours: x2.5
 */
function getStreakMultiplier(streak) {
    if (streak < 3)
        return 1.0;
    if (streak < 7)
        return 1.1;
    if (streak < 14)
        return 1.25;
    if (streak < 30)
        return 1.5;
    if (streak < 60)
        return 1.75;
    if (streak < 90)
        return 2.0;
    return 2.5;
}
/**
 * Calcule l'XP avec tous les multiplicateurs
 */
function calculateXP(options) {
    const { actionType, difficulty = 5, tags = [], currentStreak = 0, isFirstOfDay = false, hourOfDay = new Date().getHours(), comboCount = 0, prestigeLevel = 0, eventMultiplier = 1 } = options;
    // 1. XP de base
    const baseXP = BASE_XP[actionType] ?? 10;
    // 2. Bonus de difficulté (1-10 → x1.0-x2.0)
    const difficultyMult = 1 + (difficulty - 1) * 0.111;
    const difficultyBonus = Math.round(baseXP * (difficultyMult - 1));
    // 3. Bonus de tags
    let tagMult = 1;
    for (const tag of tags) {
        const bonus = TAG_BONUSES[tag.toLowerCase()];
        if (bonus)
            tagMult *= bonus;
    }
    const tagBonus = Math.round(baseXP * (tagMult - 1));
    // 4. Collecte des multiplicateurs
    const multipliers = [];
    // Streak
    const streakMult = getStreakMultiplier(currentStreak);
    if (streakMult > 1) {
        multipliers.push({ type: 'streak', value: streakMult, label: `Streak ${currentStreak}j` });
    }
    // Première action du jour
    if (isFirstOfDay) {
        multipliers.push({ type: 'first_of_day', value: 2.0, label: 'Première action' });
    }
    // Night Owl (22h-5h)
    if (hourOfDay >= 22 || hourOfDay < 5) {
        multipliers.push({ type: 'night_owl', value: 1.3, label: 'Night Owl' });
    }
    // Combo (actions rapides)
    if (comboCount >= 2) {
        const comboMult = 1 + Math.min(comboCount / 20, 1);
        multipliers.push({ type: 'combo', value: comboMult, label: `Combo x${comboCount}` });
    }
    // Prestige (+5% par niveau)
    if (prestigeLevel > 0) {
        const prestigeMult = 1 + prestigeLevel * 0.05;
        multipliers.push({ type: 'prestige', value: prestigeMult, label: `Prestige ${prestigeLevel}` });
    }
    // Event
    if (eventMultiplier > 1) {
        multipliers.push({ type: 'event', value: eventMultiplier, label: 'Événement' });
    }
    // 5. Calcul final
    const totalMultiplier = multipliers.reduce((acc, m) => acc * m.value, 1);
    const subtotal = baseXP + difficultyBonus + tagBonus;
    const finalXP = Math.round(subtotal * totalMultiplier);
    return { baseXP, difficultyBonus, tagBonus, multipliers, totalMultiplier, finalXP };
}
/**
 * Estime l'XP sans calcul complet
 */
function estimateXP(actionType, difficulty = 5) {
    const baseXP = BASE_XP[actionType] ?? 10;
    const difficultyMult = 1 + (difficulty - 1) * 0.111;
    return Math.round(baseXP * difficultyMult);
}
//# sourceMappingURL=xp-calculator.js.map