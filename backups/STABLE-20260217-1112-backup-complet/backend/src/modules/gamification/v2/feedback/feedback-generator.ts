/**
 * Feedback Generator - Génère le feedback visuel et sonore
 */

export type AnimationType =
  | 'xp_burst' | 'xp_flow' | 'level_up' | 'achievement_unlock'
  | 'streak_flame' | 'streak_milestone' | 'combo' | 'confetti' | 'fireworks';

export type SoundType =
  | 'xp_gain' | 'xp_gain_big' | 'level_up' | 'achievement_unlock'
  | 'streak_extend' | 'streak_milestone' | 'combo' | 'celebration';

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
export function generateFeedback(context: FeedbackContext): FeedbackPayload {
  const animations: AnimationType[] = [];
  const sounds: SoundType[] = [];
  let celebrationLevel: CelebrationLevel = 'none';
  let primaryAnimation: AnimationType = 'xp_burst';

  // XP gain
  if (context.xpGained > 0) {
    if (context.xpGained >= 500) {
      animations.push('xp_flow');
      sounds.push('xp_gain_big');
      celebrationLevel = upgradeCelebration(celebrationLevel, 'minor');
    } else if (context.xpGained >= 100) {
      animations.push('xp_burst');
      sounds.push('xp_gain_big');
    } else {
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
function generateToast(context: FeedbackContext): ToastNotification {
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
export function generateCongratulationMessage(context: FeedbackContext): string {
  const messages: string[] = [];

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
const CELEBRATION_ORDER: CelebrationLevel[] = ['none', 'subtle', 'minor', 'medium', 'major', 'epic', 'legendary'];

function upgradeCelebration(current: CelebrationLevel, candidate: CelebrationLevel): CelebrationLevel {
  const currentIdx = CELEBRATION_ORDER.indexOf(current);
  const candidateIdx = CELEBRATION_ORDER.indexOf(candidate);
  return candidateIdx > currentIdx ? candidate : current;
}

function getRarityCelebration(rarity?: string): CelebrationLevel {
  const map: Record<string, CelebrationLevel> = {
    common: 'minor',
    uncommon: 'minor',
    rare: 'medium',
    epic: 'major',
    legendary: 'epic',
    mythic: 'legendary',
  };
  return map[rarity ?? 'common'] ?? 'minor';
}

function getRarityColor(rarity?: string): string {
  const colors: Record<string, string> = {
    common: '#9CA3AF',
    uncommon: '#22C55E',
    rare: '#3B82F6',
    epic: '#A855F7',
    legendary: '#F59E0B',
    mythic: '#EF4444',
  };
  return colors[rarity ?? 'common'] ?? '#9CA3AF';
}

function getHapticFeedback(level: CelebrationLevel): FeedbackPayload['hapticFeedback'] {
  const map: Record<CelebrationLevel, FeedbackPayload['hapticFeedback']> = {
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
