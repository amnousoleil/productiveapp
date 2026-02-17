"use strict";
/**
 * Event Emitter - Système d'événements de gamification
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEventEmitter = getEventEmitter;
exports.resetEventEmitter = resetEventEmitter;
/**
 * Event Emitter singleton pour la gamification
 */
class GamificationEventEmitter {
    handlers = new Map();
    globalHandlers = new Set();
    eventHistory = [];
    maxHistorySize = 100;
    /**
     * S'abonne à un type d'événement spécifique
     */
    on(type, handler) {
        if (!this.handlers.has(type)) {
            this.handlers.set(type, new Set());
        }
        this.handlers.get(type).add(handler);
        // Retourne une fonction de désabonnement
        return () => this.off(type, handler);
    }
    /**
     * S'abonne à tous les événements
     */
    onAll(handler) {
        this.globalHandlers.add(handler);
        return () => this.globalHandlers.delete(handler);
    }
    /**
     * Se désabonne d'un événement
     */
    off(type, handler) {
        this.handlers.get(type)?.delete(handler);
    }
    /**
     * Émet un événement
     */
    async emit(event) {
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
                }
                catch (error) {
                    console.error(`Error in event handler for ${event.type}:`, error);
                }
            }
        }
        // Appeler les handlers globaux
        for (const handler of this.globalHandlers) {
            try {
                await handler(event);
            }
            catch (error) {
                console.error('Error in global event handler:', error);
            }
        }
    }
    /**
     * Émet un événement XP gagné
     */
    emitXPGained(userId, amount, reason, multipliers, totalXP, newLevel) {
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
    emitLevelUp(userId, oldLevel, newLevel, newTitle, newPhase) {
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
    emitAchievementUnlocked(userId, achievementId, achievementName, rarity, xpRewarded) {
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
    emitStreakEvent(userId, type, oldStreak, newStreak, jokerUsed, milestone) {
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
    getHistoryForUser(userId, limit = 20) {
        return this.eventHistory
            .filter(e => e.userId === userId)
            .slice(-limit);
    }
    /**
     * Obtient l'historique par type
     */
    getHistoryByType(type, limit = 20) {
        return this.eventHistory
            .filter(e => e.type === type)
            .slice(-limit);
    }
    /**
     * Efface l'historique
     */
    clearHistory() {
        this.eventHistory = [];
    }
    /**
     * Efface tous les handlers
     */
    clearHandlers() {
        this.handlers.clear();
        this.globalHandlers.clear();
    }
}
// Singleton
let instance = null;
function getEventEmitter() {
    if (!instance) {
        instance = new GamificationEventEmitter();
    }
    return instance;
}
function resetEventEmitter() {
    if (instance) {
        instance.clearHandlers();
        instance.clearHistory();
    }
    instance = null;
}
//# sourceMappingURL=event-emitter.js.map