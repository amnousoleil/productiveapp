"use strict";
/**
 * Feedback Generator - Génère le feedback visuel et sonore
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateFeedback = generateFeedback;
exports.generateCongratulationMessage = generateCongratulationMessage;
/**
 * Génère le payload de feedback complet
 */
function generateFeedback(context) {
    const animations = [];
    const sounds = [];
    let celebrationLevel = 'none';
    let primaryAnimation = 'xp_burst';
    // XP gain
    if (context.xpGained > 0) {
        if (context.xpGained >= 500) {
            animations.push('xp_flow');
            sounds.push('xp_gain_big');
            celebrationLevel = upgradeCelebration(celebrationLevel, 'minor');
        }
        else if (context.xpGained >= 100) {
            animations.push('xp_burst');
            sounds.push('xp_gain_big');
        }
        else {
            sounds.push('xp_gain');
        }
    }
    // Level up
    if (context.leveledUp) {
        primaryAnimation = 'level_up';
        animations.push('confetti');
        sounds.push('level_up');
        celebrationLevel = upgradeCelebration(celebrationLevel, 'major');
        // Milestone levels (10, 25, 50, 75, 100)
        if (context.newLevel && [10, 25, 50, 75, 100].includes(context.newLevel)) {
            animations.push('fireworks');
            sounds.push('celebration');
            celebrationLevel = upgradeCelebration(celebrationLevel, 'epic');
        }
    }
    // Achievement
    if (context.achievementUnlocked) {
        primaryAnimation = 'achievement_unlock';
        animations.push('confetti');
        sounds.push('achievement_unlock');
        const rarityLevel = getRarityCelebration(context.achievementRarity);
        celebrationLevel = upgradeCelebration(celebrationLevel, rarityLevel);
        if (context.achievementRarity === 'legendary' || context.achievementRarity === 'mythic') {
            animations.push('fireworks');
        }
    }
    // Streak
    if (context.streakExtended) {
        animations.push('streak_flame');
        sounds.push('streak_extend');
        if (context.streakMilestone) {
            primaryAnimation = 'streak_milestone';
            sounds.push('streak_milestone');
            celebrationLevel = upgradeCelebration(celebrationLevel, 'medium');
        }
    }
    // Combo
    if (context.comboCount && context.comboCount >= 5) {
        animations.push('combo');
        sounds.push('combo');
        if (context.comboCount >= 10) {
            celebrationLevel = upgradeCelebration(celebrationLevel, 'minor');
        }
    }
    // Toast
    const toast = generateToast(context);
    // Haptic
    const hapticFeedback = getHapticFeedback(celebrationLevel);
    return {
        primaryAnimation,
        secondaryAnimations: animations.filter(a => a !== primaryAnimation),
        sounds: [...new Set(sounds)], // Déduplique
        toast,
        celebrationLevel,
        hapticFeedback,
    };
}
/**
 * Génère le toast notification
 */
function generateToast(context) {
    // Priorité: Achievement > Level Up > Streak > XP
    if (context.achievementUnlocked && context.achievementName) {
        return {
            title: 'Achievement débloqué!',
            subtitle: context.achievementName,
            icon: '🏆',
            color: getRarityColor(context.achievementRarity),
            durationMs: 5000,
        };
    }
    if (context.leveledUp && context.newLevel) {
        return {
            title: `Niveau ${context.newLevel}!`,
            subtitle: 'Félicitations, vous avez progressé!',
            icon: '⬆️',
            color: '#FFD700',
            durationMs: 4000,
        };
    }
    if (context.streakMilestone && context.currentStreak) {
        return {
            title: `Streak ${context.currentStreak} jours!`,
            subtitle: 'Milestone atteint!',
            icon: '🔥',
            color: '#FF6B35',
            durationMs: 4000,
        };
    }
    if (context.streakExtended && context.currentStreak) {
        return {
            title: `Streak: ${context.currentStreak}j`,
            subtitle: `+${context.xpGained} XP`,
            icon: '🔥',
            color: '#FF6B35',
            durationMs: 2000,
        };
    }
    return {
        title: `+${context.xpGained} XP`,
        subtitle: context.comboCount && context.comboCount > 1 ? `Combo x${context.comboCount}!` : undefined,
        icon: '✨',
        durationMs: 2000,
    };
}
/**
 * Génère un message de félicitations personnalisé
 */
function generateCongratulationMessage(context) {
    const messages = [];
    if (context.leveledUp && context.newLevel) {
        messages.push(`Niveau ${context.newLevel} atteint! Vous progressez vite.`);
    }
    if (context.achievementUnlocked && context.achievementName) {
        messages.push(`Bravo! Achievement "${context.achievementName}" débloqué!`);
    }
    if (context.streakMilestone && context.currentStreak) {
        messages.push(`Incroyable! ${context.currentStreak} jours de streak!`);
    }
    if (messages.length === 0 && context.xpGained > 200) {
        messages.push('Belle performance! Continuez comme ça!');
    }
    return messages.join(' ');
}
// Helpers
const CELEBRATION_ORDER = ['none', 'subtle', 'minor', 'medium', 'major', 'epic', 'legendary'];
function upgradeCelebration(current, candidate) {
    const currentIdx = CELEBRATION_ORDER.indexOf(current);
    const candidateIdx = CELEBRATION_ORDER.indexOf(candidate);
    return candidateIdx > currentIdx ? candidate : current;
}
function getRarityCelebration(rarity) {
    const map = {
        common: 'minor',
        uncommon: 'minor',
        rare: 'medium',
        epic: 'major',
        legendary: 'epic',
        mythic: 'legendary',
    };
    return map[rarity ?? 'common'] ?? 'minor';
}
function getRarityColor(rarity) {
    const colors = {
        common: '#9CA3AF',
        uncommon: '#22C55E',
        rare: '#3B82F6',
        epic: '#A855F7',
        legendary: '#F59E0B',
        mythic: '#EF4444',
    };
    return colors[rarity ?? 'common'] ?? '#9CA3AF';
}
function getHapticFeedback(level) {
    const map = {
        none: undefined,
        subtle: 'light',
        minor: 'light',
        medium: 'medium',
        major: 'heavy',
        epic: 'success',
        legendary: 'success',
    };
    return map[level];
}
//# sourceMappingURL=feedback-generator.js.map