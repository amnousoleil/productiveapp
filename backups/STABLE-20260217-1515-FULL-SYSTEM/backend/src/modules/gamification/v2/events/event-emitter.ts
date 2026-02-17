/**
 * Event Emitter - Système d'événements de gamification
 */

export type GamificationEventType =
  | 'xp_gained'
  | 'level_up'
  | 'achievement_unlocked'
  | 'streak_extended'
  | 'streak_broken'
  | 'streak_milestone'
  | 'combo_achieved'
  | 'prestige_reset'
  | 'daily_reward_claimed';

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
    multipliers: { type: string; value: number }[];
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
class GamificationEventEmitter {
  private handlers: Map<GamificationEventType, Set<EventHandler>> = new Map();
  private globalHandlers: Set<EventHandler> = new Set();
  private eventHistory: GamificationEvent[] = [];
  private maxHistorySize: number = 100;

  /**
   * S'abonne à un type d'événement spécifique
   */
  on<T extends GamificationEvent>(type: T['type'], handler: EventHandler<T>): () => void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    this.handlers.get(type)!.add(handler as EventHandler);

    // Retourne une fonction de désabonnement
    return () => this.off(type, handler as unknown as EventHandler);
  }

  /**
   * S'abonne à tous les événements
   */
  onAll(handler: EventHandler): () => void {
    this.globalHandlers.add(handler);
    return () => this.globalHandlers.delete(handler);
  }

  /**
   * Se désabonne d'un événement
   */
  off(type: GamificationEventType, handler: EventHandler): void {
    this.handlers.get(type)?.delete(handler);
  }

  /**
   * Émet un événement
   */
  async emit<T extends GamificationEvent>(event: T): Promise<void> {
    // Ajouter à l'historique
    this.eventHistory.push(event);
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }

    // Appeler les handlers spécifiques
    const specificHandlers = this.handlers.get(event.type);
    if (specificHandlers) {
      for (const handler of specificHandlers) {
        try {
          await handler(event);
        } catch (error) {
          console.error(`Error in event handler for ${event.type}:`, error);
        }
      }
    }

    // Appeler les handlers globaux
    for (const handler of this.globalHandlers) {
      try {
        await handler(event);
      } catch (error) {
        console.error('Error in global event handler:', error);
      }
    }
  }

  /**
   * Émet un événement XP gagné
   */
  emitXPGained(userId: string, amount: number, reason: string, multipliers: { type: string; value: number }[], totalXP: number, newLevel: number): void {
    this.emit({
      type: 'xp_gained',
      userId,
      timestamp: new Date().toISOString(),
      data: { amount, reason, multipliers, totalXP, newLevel },
    });
  }

  /**
   * Émet un événement level up
   */
  emitLevelUp(userId: string, oldLevel: number, newLevel: number, newTitle: string, newPhase?: string): void {
    this.emit({
      type: 'level_up',
      userId,
      timestamp: new Date().toISOString(),
      data: { oldLevel, newLevel, newTitle, newPhase },
    });
  }

  /**
   * Émet un événement achievement débloqué
   */
  emitAchievementUnlocked(userId: string, achievementId: string, achievementName: string, rarity: string, xpRewarded: number): void {
    this.emit({
      type: 'achievement_unlocked',
      userId,
      timestamp: new Date().toISOString(),
      data: { achievementId, achievementName, rarity, xpRewarded },
    });
  }

  /**
   * Émet un événement streak
   */
  emitStreakEvent(userId: string, type: 'streak_extended' | 'streak_broken' | 'streak_milestone', oldStreak: number, newStreak: number, jokerUsed?: boolean, milestone?: number): void {
    this.emit({
      type,
      userId,
      timestamp: new Date().toISOString(),
      data: { oldStreak, newStreak, jokerUsed, milestone },
    });
  }

  /**
   * Obtient l'historique des événements pour un utilisateur
   */
  getHistoryForUser(userId: string, limit: number = 20): GamificationEvent[] {
    return this.eventHistory
      .filter(e => e.userId === userId)
      .slice(-limit);
  }

  /**
   * Obtient l'historique par type
   */
  getHistoryByType(type: GamificationEventType, limit: number = 20): GamificationEvent[] {
    return this.eventHistory
      .filter(e => e.type === type)
      .slice(-limit);
  }

  /**
   * Efface l'historique
   */
  clearHistory(): void {
    this.eventHistory = [];
  }

  /**
   * Efface tous les handlers
   */
  clearHandlers(): void {
    this.handlers.clear();
    this.globalHandlers.clear();
  }
}

// Singleton
let instance: GamificationEventEmitter | null = null;

export function getEventEmitter(): GamificationEventEmitter {
  if (!instance) {
    instance = new GamificationEventEmitter();
  }
  return instance;
}

export function resetEventEmitter(): void {
  if (instance) {
    instance.clearHandlers();
    instance.clearHistory();
  }
  instance = null;
}
