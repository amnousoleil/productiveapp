"use strict";
/**
 * Gamification Service V2 - Service enrichi avec les nouvelles fonctionnalités
 *
 * Étend le service existant avec:
 * - Calcul XP avancé avec multiplicateurs
 * - Niveaux avec phases et titres
 * - Protection de streak (jokers/freezes)
 * - Analyse des habitudes
 * - Feedback riche
 * - Contexte IA
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.gamificationServiceV2 = exports.GamificationServiceV2 = void 0;
const database_js_1 = require("../../config/database.js");
const gamification_service_js_1 = require("./gamification.service.js");
const index_js_1 = require("./v2/index.js");
class GamificationServiceV2 {
    emitter = (0, index_js_1.getEventEmitter)();
    /**
     * Ajoute de l'XP avec le système v2 (multiplicateurs, feedback, etc.)
     */
    async addXpV2(userId, workspaceId, input) {
        // 1. Récupérer les stats actuelles
        const stats = await gamification_service_js_1.gamificationService.getUserStats(userId, workspaceId);
        const oldXP = stats.total_xp;
        const oldLevel = stats.level;
        // 2. Vérifier et mettre à jour le streak
        const streakResult = await this.checkAndUpdateStreak(userId, workspaceId);
        // 3. Calculer l'XP avec multiplicateurs
        const isFirstOfDay = await this.isFirstActionOfDay(userId, workspaceId);
        const calculation = (0, index_js_1.calculateXP)({
            actionType: input.actionType,
            difficulty: input.difficulty,
            tags: input.tags,
            currentStreak: stats.current_streak,
            isFirstOfDay,
            prestigeLevel: stats.prestige,
        });
        // 4. Ajouter l'XP via le service existant
        await gamification_service_js_1.gamificationService.addXp(userId, workspaceId, {
            amount: calculation.finalXP,
            reason: this.mapActionToReason(input.actionType),
            entity_type: input.entityType,
            entity_id: input.entityId,
            metadata: {
                ...input.metadata,
                v2: true,
                multipliers: calculation.multipliers,
                baseXP: calculation.baseXP,
            },
        });
        // 5. Vérifier le level up
        const newXP = oldXP + calculation.finalXP;
        const levelUpResult = (0, index_js_1.checkLevelUp)(oldXP, newXP);
        // 6. Vérifier les achievements
        const achievements = await gamification_service_js_1.gamificationService.checkAchievements(userId, workspaceId);
        // 7. Générer le feedback
        const feedback = (0, index_js_1.generateFeedback)({
            xpGained: calculation.finalXP,
            leveledUp: levelUpResult.leveledUp,
            newLevel: levelUpResult.newLevel,
            achievementUnlocked: achievements.length > 0,
            achievementName: achievements[0]?.name,
            achievementRarity: achievements[0]?.rarity,
            streakExtended: streakResult?.action === 'continue' || streakResult?.action === 'auto_joker',
            currentStreak: streakResult?.newStreak,
            streakMilestone: this.isStreakMilestone(streakResult?.newStreak),
        });
        // 8. Émettre les événements
        this.emitter.emitXPGained(userId, calculation.finalXP, input.actionType, calculation.multipliers, newXP, levelUpResult.newLevel);
        if (levelUpResult.leveledUp) {
            this.emitter.emitLevelUp(userId, oldLevel, levelUpResult.newLevel, levelUpResult.newTitle, levelUpResult.newPhase);
        }
        for (const ach of achievements) {
            this.emitter.emitAchievementUnlocked(userId, ach.id, ach.name, ach.rarity, ach.xp_reward);
        }
        return {
            xpGained: calculation.finalXP,
            baseXP: calculation.baseXP,
            multipliers: calculation.multipliers,
            totalMultiplier: calculation.totalMultiplier,
            leveledUp: levelUpResult.leveledUp,
            newLevel: levelUpResult.leveledUp ? levelUpResult.newLevel : undefined,
            newTitle: levelUpResult.newTitle,
            newPhase: levelUpResult.newPhase,
            feedback,
            streakResult: streakResult ?? undefined,
            achievementsUnlocked: achievements.map(a => ({ id: a.id, name: a.name, rarity: a.rarity })),
        };
    }
    /**
     * Obtient le statut de niveau enrichi
     */
    async getLevelStatusV2(userId, workspaceId) {
        const stats = await gamification_service_js_1.gamificationService.getUserStats(userId, workspaceId);
        return (0, index_js_1.getLevelStatus)(stats.total_xp, stats.prestige);
    }
    /**
     * Analyse les habitudes de l'utilisateur
     */
    async analyzeUserHabits(userId, workspaceId, days = 30) {
        const since = new Date();
        since.setDate(since.getDate() - days);
        const events = await (0, database_js_1.sql) `
      SELECT DATE(created_at) as date,
             EXTRACT(HOUR FROM created_at)::int as hour,
             reason as action_type,
             amount as xp_gained
      FROM xp_events
      WHERE user_id = ${userId} AND workspace_id = ${workspaceId}
        AND created_at >= ${since}
      ORDER BY created_at
    `;
        return (0, index_js_1.analyzeHabits)(events.map(e => ({
            date: e.date.toISOString().slice(0, 10),
            hour: e.hour,
            actionType: e.action_type,
            xpGained: e.xp_gained,
        })));
    }
    /**
     * Génère le contexte IA pour l'utilisateur
     */
    async getAIContext(userId, workspaceId) {
        const stats = await gamification_service_js_1.gamificationService.getUserStats(userId, workspaceId);
        const levelStatus = (0, index_js_1.getLevelStatus)(stats.total_xp, stats.prestige);
        const habitPattern = await this.analyzeUserHabits(userId, workspaceId);
        // Récupérer les stats quotidiennes
        const since = new Date();
        since.setDate(since.getDate() - 30);
        const dailyStats = await (0, database_js_1.sql) `
      SELECT DATE(created_at) as date,
             COUNT(*)::int as action_count,
             SUM(amount)::int as xp_gained
      FROM xp_events
      WHERE user_id = ${userId} AND workspace_id = ${workspaceId}
        AND created_at >= ${since}
      GROUP BY DATE(created_at)
      ORDER BY date
    `;
        // Récupérer les achievements récents
        const recentAchievements = await (0, database_js_1.sql) `
      SELECT a.name FROM achievements_unlocked au
      JOIN achievements a ON a.id = au.achievement_id
      WHERE au.user_id = ${userId}
      ORDER BY au.unlocked_at DESC
      LIMIT 5
    `;
        return (0, index_js_1.generateAIContext)({
            userId,
            levelStatus,
            currentStreak: stats.current_streak,
            bestStreak: stats.best_streak,
            habitPattern,
            recentDailyStats: dailyStats.map(d => ({
                date: d.date.toISOString().slice(0, 10),
                actionCount: d.action_count,
                xpGained: d.xp_gained,
                peakHour: 12,
                isActive: d.action_count > 0,
            })),
            recentAchievements: recentAchievements.map(a => a.name),
        });
    }
    // Helpers
    async checkAndUpdateStreak(userId, workspaceId) {
        try {
            const streaks = await gamification_service_js_1.gamificationService.getStreaks(userId, workspaceId);
            if (streaks.length === 0)
                return null;
            const streak = streaks[0];
            const state = {
                userId,
                currentStreak: streak.current_count,
                bestStreak: streak.best_count,
                lastActiveDate: streak.last_activity_date.toISOString().slice(0, 10),
                jokersUsedThisMonth: 0,
                freezesUsedThisMonth: 0,
                isFrozen: false,
                freezeEndDate: null,
                lastJokerResetMonth: new Date().toISOString().slice(0, 7),
            };
            return (0, index_js_1.checkStreak)(state);
        }
        catch {
            return null;
        }
    }
    async isFirstActionOfDay(userId, workspaceId) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const result = await (0, database_js_1.sql) `
      SELECT COUNT(*) as count FROM xp_events
      WHERE user_id = ${userId} AND workspace_id = ${workspaceId}
        AND created_at >= ${today}
    `;
        return result[0].count === 0;
    }
    mapActionToReason(actionType) {
        const map = {
            note_created: 'note_created',
            note_updated: 'note_updated',
            task_created: 'task_created',
            task_completed: 'task_completed',
            task_completed_easy: 'task_completed',
            task_completed_medium: 'task_completed',
            task_completed_hard: 'task_completed',
            task_completed_epic: 'task_completed',
            daily_login: 'login_bonus',
            daily_goal: 'daily_goal',
            weekly_goal: 'weekly_goal',
        };
        return map[actionType] ?? 'task_completed';
    }
    isStreakMilestone(streak) {
        if (!streak)
            return false;
        return [7, 14, 30, 60, 90, 180, 365].includes(streak);
    }
}
exports.GamificationServiceV2 = GamificationServiceV2;
exports.gamificationServiceV2 = new GamificationServiceV2();
//# sourceMappingURL=gamification-v2.service.js.map