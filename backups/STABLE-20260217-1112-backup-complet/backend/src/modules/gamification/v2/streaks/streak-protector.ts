/**
 * Streak Protector - Jokers, Freezes et Recovery
 */

export interface StreakProtectionState {
  userId: string;
  currentStreak: number;
  bestStreak: number;
  lastActiveDate: string; // YYYY-MM-DD
  jokersUsedThisMonth: number;
  freezesUsedThisMonth: number;
  isFrozen: boolean;
  freezeEndDate: string | null;
  lastJokerResetMonth: string; // YYYY-MM
}

export interface ProtectionConfig {
  maxJokersPerMonth: number;
  maxFreezesPerMonth: number;
  freezeDurationHours: number;
  recoveryWindowHours: number;
  recoveryCostXP: number;
}

const DEFAULT_CONFIG: ProtectionConfig = {
  maxJokersPerMonth: 3,
  maxFreezesPerMonth: 2,
  freezeDurationHours: 24,
  recoveryWindowHours: 48,
  recoveryCostXP: 500,
};

export interface StreakCheckResult {
  action: 'continue' | 'auto_joker' | 'broken' | 'frozen' | 'recovered';
  newStreak: number;
  jokerUsed: boolean;
  message: string;
  canRecover: boolean;
  recoveryCost: number;
}

/**
 * Obtient la date du jour au format YYYY-MM-DD
 */
function getToday(timezone: string = 'UTC'): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: timezone });
}

/**
 * Obtient le mois courant au format YYYY-MM
 */
function getCurrentMonth(): string {
  return new Date().toISOString().slice(0, 7);
}

/**
 * Calcule le nombre de jours entre deux dates
 */
function daysBetween(date1: string, date2: string): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return Math.floor((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Reset mensuel des jokers si nécessaire
 */
export function checkMonthlyReset(state: StreakProtectionState): StreakProtectionState {
  const currentMonth = getCurrentMonth();
  if (state.lastJokerResetMonth !== currentMonth) {
    return {
      ...state,
      jokersUsedThisMonth: 0,
      freezesUsedThisMonth: 0,
      lastJokerResetMonth: currentMonth,
    };
  }
  return state;
}

/**
 * Vérifie et met à jour le streak
 */
export function checkStreak(
  state: StreakProtectionState,
  config: ProtectionConfig = DEFAULT_CONFIG,
  timezone: string = 'UTC'
): StreakCheckResult {
  const today = getToday(timezone);
  const daysSinceActive = daysBetween(state.lastActiveDate, today);

  // Même jour - pas de changement
  if (daysSinceActive === 0) {
    return {
      action: 'continue',
      newStreak: state.currentStreak,
      jokerUsed: false,
      message: 'Streak maintenu',
      canRecover: false,
      recoveryCost: 0,
    };
  }

  // Le streak est gelé
  if (state.isFrozen && state.freezeEndDate) {
    const freezeEnd = new Date(state.freezeEndDate);
    if (new Date() < freezeEnd) {
      return {
        action: 'frozen',
        newStreak: state.currentStreak,
        jokerUsed: false,
        message: `Streak gelé jusqu'à ${state.freezeEndDate}`,
        canRecover: false,
        recoveryCost: 0,
      };
    }
  }

  // Jour suivant - streak continue
  if (daysSinceActive === 1) {
    return {
      action: 'continue',
      newStreak: state.currentStreak + 1,
      jokerUsed: false,
      message: `Streak étendu à ${state.currentStreak + 1} jours!`,
      canRecover: false,
      recoveryCost: 0,
    };
  }

  // 2 jours - utiliser un joker automatiquement si disponible
  if (daysSinceActive === 2) {
    const updatedState = checkMonthlyReset(state);
    if (updatedState.jokersUsedThisMonth < config.maxJokersPerMonth) {
      return {
        action: 'auto_joker',
        newStreak: state.currentStreak + 1,
        jokerUsed: true,
        message: `Joker utilisé! Streak sauvé: ${state.currentStreak + 1} jours`,
        canRecover: false,
        recoveryCost: 0,
      };
    }
  }

  // Streak cassé - vérifier si recovery possible
  const hoursInactive = daysSinceActive * 24;
  const canRecover = hoursInactive <= config.recoveryWindowHours;

  return {
    action: 'broken',
    newStreak: 0,
    jokerUsed: false,
    message: `Streak perdu après ${daysSinceActive} jours d'inactivité`,
    canRecover,
    recoveryCost: canRecover ? config.recoveryCostXP : 0,
  };
}

/**
 * Active un freeze manuel
 */
export function activateFreeze(
  state: StreakProtectionState,
  config: ProtectionConfig = DEFAULT_CONFIG
): { success: boolean; state: StreakProtectionState; message: string } {
  const updatedState = checkMonthlyReset(state);

  if (updatedState.isFrozen) {
    return { success: false, state: updatedState, message: 'Un freeze est déjà actif' };
  }

  if (updatedState.freezesUsedThisMonth >= config.maxFreezesPerMonth) {
    return { success: false, state: updatedState, message: 'Plus de freezes disponibles ce mois' };
  }

  const freezeEnd = new Date();
  freezeEnd.setHours(freezeEnd.getHours() + config.freezeDurationHours);

  return {
    success: true,
    state: {
      ...updatedState,
      isFrozen: true,
      freezeEndDate: freezeEnd.toISOString(),
      freezesUsedThisMonth: updatedState.freezesUsedThisMonth + 1,
    },
    message: `Streak gelé pour ${config.freezeDurationHours}h`,
  };
}

/**
 * Tente de récupérer un streak cassé (coûte de l'XP)
 */
export function attemptRecovery(
  state: StreakProtectionState,
  userXP: number,
  config: ProtectionConfig = DEFAULT_CONFIG
): { success: boolean; state: StreakProtectionState; xpCost: number; message: string } {
  const check = checkStreak(state, config);

  if (!check.canRecover) {
    return { success: false, state, xpCost: 0, message: 'Recovery impossible' };
  }

  if (userXP < config.recoveryCostXP) {
    return { success: false, state, xpCost: 0, message: `XP insuffisant (${config.recoveryCostXP} requis)` };
  }

  return {
    success: true,
    state: {
      ...state,
      currentStreak: state.currentStreak, // Restaure le streak
      lastActiveDate: getToday(),
    },
    xpCost: config.recoveryCostXP,
    message: `Streak récupéré! (-${config.recoveryCostXP} XP)`,
  };
}

/**
 * Calcule les protections restantes
 */
export function getRemainingProtections(
  state: StreakProtectionState,
  config: ProtectionConfig = DEFAULT_CONFIG
): { jokersRemaining: number; freezesRemaining: number } {
  const updated = checkMonthlyReset(state);
  return {
    jokersRemaining: config.maxJokersPerMonth - updated.jokersUsedThisMonth,
    freezesRemaining: config.maxFreezesPerMonth - updated.freezesUsedThisMonth,
  };
}
