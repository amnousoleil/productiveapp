/**
 * Gamification Engine v2 - Module amélioré
 *
 * Apporte les fonctionnalités avancées au module existant:
 * - Calcul XP avec multiplicateurs (streak, combo, night owl, etc.)
 * - Système de niveaux enrichi avec phases et titres
 * - Protection de streak (jokers, freezes, recovery)
 * - Analyse des habitudes et patterns
 * - Génération de feedback visuel/sonore
 * - Contexte IA-ready
 * - Système d'événements
 */

// Core
export {
  calculateXP,
  estimateXP,
  getStreakMultiplier,
  type ActionType,
  type XPMultiplier,
  type XPCalculation,
  type CalculateOptions,
} from './core/xp-calculator.js';

export {
  getLevelFromXP,
  getXPForLevel,
  getTotalXPForLevel,
  getLevelInfo,
  getLevelStatus,
  checkLevelUp,
  getPhaseForLevel,
  getTitleForLevel,
  type LevelPhase,
  type LevelInfo,
  type LevelStatus,
} from './core/level-phases.js';

// Streaks
export {
  checkStreak,
  activateFreeze,
  attemptRecovery,
  getRemainingProtections,
  checkMonthlyReset,
  type StreakProtectionState,
  type ProtectionConfig,
  type StreakCheckResult,
} from './streaks/streak-protector.js';

export {
  analyzeHabits,
  aggregateByDay,
  generateWeeklyHeatmap,
  predictBestTime,
  generateInsights,
  type ActivityRecord,
  type HabitPattern,
  type DailyStats,
} from './streaks/habit-analyzer.js';

// Feedback
export {
  generateFeedback,
  generateCongratulationMessage,
  type AnimationType,
  type SoundType,
  type CelebrationLevel,
  type ToastNotification,
  type FeedbackPayload,
  type FeedbackContext,
} from './feedback/feedback-generator.js';

// AI
export {
  generateAIContext,
  type AIContext,
  type AIContextInput,
  type BehaviorPattern,
  type Prediction,
} from './ai/ai-context.js';

// Events
export {
  getEventEmitter,
  resetEventEmitter,
  type GamificationEventType,
  type GamificationEvent,
  type XPGainedEvent,
  type LevelUpEvent,
  type AchievementUnlockedEvent,
  type StreakEvent,
} from './events/event-emitter.js';
