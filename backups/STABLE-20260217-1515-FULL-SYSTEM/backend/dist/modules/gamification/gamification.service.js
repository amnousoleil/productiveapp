"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gamificationService = exports.GamificationService = void 0;
const database_js_1 = require("../../config/database.js");
const helpers_js_1 = require("../../utils/helpers.js");
const constants_js_1 = require("../../config/constants.js");
class GamificationService {
    async getUserStats(userId, workspaceId) {
        let stats = await (0, database_js_1.sql) `
      SELECT * FROM user_gamification
      WHERE user_id = ${userId} AND workspace_id = ${workspaceId}
    `;
        if (stats.length === 0) {
            // Initialize gamification stats for user
            await (0, database_js_1.sql) `
        INSERT INTO user_gamification (user_id, workspace_id, total_xp, level, prestige, coins, current_streak, best_streak, updated_at)
        VALUES (${userId}, ${workspaceId}, 0, 1, 0, 0, 0, 0, ${new Date()})
      `;
            stats = await (0, database_js_1.sql) `
        SELECT * FROM user_gamification
        WHERE user_id = ${userId} AND workspace_id = ${workspaceId}
      `;
        }
        const userStats = stats[0];
        const { level_progress, xp_to_next_level } = this.calculateLevelProgress(userStats.total_xp, userStats.level);
        return {
            ...userStats,
            level_progress,
            xp_to_next_level,
        };
    }
    async addXp(userId, workspaceId, input) {
        const id = (0, helpers_js_1.generateUUID)();
        const now = new Date();
        // Record XP event
        await (0, database_js_1.sql) `
      INSERT INTO xp_events (id, user_id, workspace_id, amount, reason, entity_type, entity_id, metadata, created_at)
      VALUES (${id}, ${userId}, ${workspaceId}, ${input.amount}, ${input.reason}, ${input.entity_type || null}, ${input.entity_id || null}, ${JSON.stringify(input.metadata || {})}, ${now})
    `;
        // Update user stats
        const stats = await this.getUserStats(userId, workspaceId);
        const newTotalXp = stats.total_xp + input.amount;
        const newLevel = this.calculateLevel(newTotalXp);
        const leveledUp = newLevel > stats.level;
        await (0, database_js_1.sql) `
      UPDATE user_gamification
      SET total_xp = ${newTotalXp},
          level = ${newLevel},
          last_activity_at = ${now},
          updated_at = ${now}
      WHERE user_id = ${userId} AND workspace_id = ${workspaceId}
    `;
        // Check for achievements
        await this.checkAchievements(userId, workspaceId);
        return {
            xp_gained: input.amount,
            leveled_up: leveledUp,
            new_level: leveledUp ? newLevel : undefined,
        };
    }
    async getXpHistory(userId, workspaceId, limit = 50) {
        const events = await (0, database_js_1.sql) `
      SELECT * FROM xp_events
      WHERE user_id = ${userId} AND workspace_id = ${workspaceId}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;
        return events;
    }
    async getLeaderboard(workspaceId, period, limit = 10) {
        const periodStart = this.getPeriodStart(period);
        const entries = await (0, database_js_1.sql) `
      SELECT l.*,
             json_build_object(
               'id', u.id,
               'name', u.name,
               'avatar_url', u.avatar_url
             ) as user
      FROM leaderboards l
      INNER JOIN users u ON l.user_id = u.id
      WHERE l.workspace_id = ${workspaceId}
        AND l.period = ${period}
        AND l.period_start = ${periodStart}
      ORDER BY l.rank
      LIMIT ${limit}
    `;
        return entries;
    }
    async updateLeaderboard(workspaceId, period) {
        const periodStart = this.getPeriodStart(period);
        const periodEnd = this.getPeriodEnd(period);
        const now = new Date();
        // Calculate XP earned in period for each user
        const rankings = await (0, database_js_1.sql) `
      SELECT user_id, SUM(amount)::int as xp_earned
      FROM xp_events
      WHERE workspace_id = ${workspaceId}
        AND created_at >= ${periodStart}
        AND created_at < ${periodEnd}
      GROUP BY user_id
      ORDER BY xp_earned DESC
    `;
        // Update leaderboard
        for (let i = 0; i < rankings.length; i++) {
            const entry = rankings[i];
            await (0, database_js_1.sql) `
        INSERT INTO leaderboards (workspace_id, user_id, period, period_start, xp_earned, rank, updated_at)
        VALUES (${workspaceId}, ${entry.user_id}, ${period}, ${periodStart}, ${entry.xp_earned}, ${i + 1}, ${now})
        ON CONFLICT (workspace_id, user_id, period, period_start)
        DO UPDATE SET xp_earned = ${entry.xp_earned}, rank = ${i + 1}, updated_at = ${now}
      `;
        }
    }
    async getAchievements(userId, _workspaceId) {
        const achievements = await (0, database_js_1.sql) `
      SELECT a.*,
             CASE WHEN au.user_id IS NOT NULL THEN true ELSE false END as unlocked,
             au.unlocked_at
      FROM achievements a
      LEFT JOIN achievements_unlocked au ON a.id = au.achievement_id AND au.user_id = ${userId}
      ORDER BY a.rarity DESC, a.name
    `;
        return achievements;
    }
    async unlockAchievement(userId, achievementId) {
        // Check if already unlocked
        const existing = await (0, database_js_1.sql) `
      SELECT 1 FROM achievements_unlocked
      WHERE user_id = ${userId} AND achievement_id = ${achievementId}
    `;
        if (existing.length > 0) {
            return null;
        }
        const now = new Date();
        await (0, database_js_1.sql) `
      INSERT INTO achievements_unlocked (user_id, achievement_id, unlocked_at)
      VALUES (${userId}, ${achievementId}, ${now})
    `;
        const achievements = await (0, database_js_1.sql) `SELECT * FROM achievements WHERE id = ${achievementId}`;
        return achievements.length > 0 ? achievements[0] : null;
    }
    async checkAchievements(userId, workspaceId) {
        const unlockedAchievements = [];
        // Get all achievements not yet unlocked by user
        const pendingAchievements = await (0, database_js_1.sql) `
      SELECT a.* FROM achievements a
      WHERE NOT EXISTS (
        SELECT 1 FROM achievements_unlocked au
        WHERE au.achievement_id = a.id AND au.user_id = ${userId}
      )
    `;
        for (const achievement of pendingAchievements) {
            const condition = achievement.condition;
            let conditionMet = false;
            switch (condition.type) {
                case 'notes_created': {
                    const count = await (0, database_js_1.sql) `
            SELECT COUNT(*)::int as count FROM notes
            WHERE user_id = ${userId} AND workspace_id = ${workspaceId} AND deleted_at IS NULL
          `;
                    conditionMet = count[0].count >= condition.threshold;
                    break;
                }
                case 'tasks_completed': {
                    const count = await (0, database_js_1.sql) `
            SELECT COUNT(*)::int as count FROM tasks
            WHERE user_id = ${userId} AND workspace_id = ${workspaceId} AND status = 'done'
          `;
                    conditionMet = count[0].count >= condition.threshold;
                    break;
                }
                case 'tasks_completed_daily': {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const tomorrow = new Date(today);
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    const count = await (0, database_js_1.sql) `
            SELECT COUNT(*)::int as count FROM tasks
            WHERE user_id = ${userId} AND workspace_id = ${workspaceId}
              AND status = 'done' AND completed_at >= ${today} AND completed_at < ${tomorrow}
          `;
                    conditionMet = count[0].count >= condition.threshold;
                    break;
                }
                case 'reports_generated': {
                    const count = await (0, database_js_1.sql) `
            SELECT COUNT(*)::int as count FROM aggregated_reports
            WHERE user_id = ${userId} AND workspace_id = ${workspaceId}
          `;
                    conditionMet = count[0].count >= condition.threshold;
                    break;
                }
                case 'audit_score': {
                    const audit = await (0, database_js_1.sql) `
            SELECT MAX((metrics->>'wellbeing_score')::int) as max_score FROM audit_reports
            WHERE user_id = ${userId} AND workspace_id = ${workspaceId}
          `;
                    conditionMet = (audit[0]?.max_score || 0) >= condition.threshold;
                    break;
                }
                case 'streak_days': {
                    const stats = await this.getUserStats(userId, workspaceId);
                    conditionMet = stats.best_streak >= condition.threshold;
                    break;
                }
                case 'level_reached': {
                    const stats = await this.getUserStats(userId, workspaceId);
                    conditionMet = stats.level >= condition.threshold;
                    break;
                }
                case 'xp_earned': {
                    const stats = await this.getUserStats(userId, workspaceId);
                    conditionMet = stats.total_xp >= condition.threshold;
                    break;
                }
            }
            if (conditionMet) {
                const unlocked = await this.unlockAchievement(userId, achievement.id);
                if (unlocked) {
                    unlockedAchievements.push(unlocked);
                    // Award XP and coins for achievement
                    if (achievement.xp_reward > 0) {
                        await this.addXp(userId, workspaceId, {
                            amount: achievement.xp_reward,
                            reason: 'achievement',
                            metadata: { achievement_id: achievement.id },
                        });
                    }
                    if (achievement.coin_reward > 0) {
                        await (0, database_js_1.sql) `
              UPDATE user_gamification
              SET coins = coins + ${achievement.coin_reward}
              WHERE user_id = ${userId} AND workspace_id = ${workspaceId}
            `;
                    }
                }
            }
        }
        return unlockedAchievements;
    }
    async getStreaks(userId, workspaceId) {
        const streaks = await (0, database_js_1.sql) `
      SELECT * FROM streaks
      WHERE user_id = ${userId} AND workspace_id = ${workspaceId}
    `;
        const now = new Date();
        return streaks.map((streak) => {
            const lastActivity = new Date(streak.last_activity_date);
            const daysSinceActivity = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
            const isActive = daysSinceActivity <= 1;
            return {
                ...streak,
                is_active: isActive,
                days_until_freeze_expires: streak.freeze_available ? 1 - daysSinceActivity : null,
            };
        });
    }
    async updateStreak(userId, workspaceId, streakType) {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        let streak = await (0, database_js_1.sql) `
      SELECT * FROM streaks
      WHERE user_id = ${userId} AND workspace_id = ${workspaceId} AND streak_type = ${streakType}
    `;
        if (streak.length === 0) {
            // Create new streak
            await (0, database_js_1.sql) `
        INSERT INTO streaks (user_id, workspace_id, streak_type, current_count, best_count, last_activity_date, freeze_available, updated_at)
        VALUES (${userId}, ${workspaceId}, ${streakType}, 1, 1, ${today}, true, ${now})
      `;
            streak = await (0, database_js_1.sql) `
        SELECT * FROM streaks
        WHERE user_id = ${userId} AND workspace_id = ${workspaceId} AND streak_type = ${streakType}
      `;
        }
        else {
            const lastActivity = new Date(streak[0].last_activity_date);
            const daysSinceActivity = Math.floor((today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
            if (daysSinceActivity === 0) {
                // Already updated today, no change
            }
            else if (daysSinceActivity === 1) {
                // Continuing streak
                const newCount = streak[0].current_count + 1;
                const newBest = Math.max(newCount, streak[0].best_count);
                await (0, database_js_1.sql) `
          UPDATE streaks
          SET current_count = ${newCount},
              best_count = ${newBest},
              last_activity_date = ${today},
              updated_at = ${now}
          WHERE user_id = ${userId} AND workspace_id = ${workspaceId} AND streak_type = ${streakType}
        `;
                // Update gamification stats
                await (0, database_js_1.sql) `
          UPDATE user_gamification
          SET current_streak = ${newCount},
              best_streak = GREATEST(best_streak, ${newCount}),
              updated_at = ${now}
          WHERE user_id = ${userId} AND workspace_id = ${workspaceId}
        `;
            }
            else if (daysSinceActivity === 2 && streak[0].freeze_available) {
                // Use streak freeze
                await (0, database_js_1.sql) `
          UPDATE streaks
          SET last_activity_date = ${today},
              freeze_available = false,
              updated_at = ${now}
          WHERE user_id = ${userId} AND workspace_id = ${workspaceId} AND streak_type = ${streakType}
        `;
            }
            else {
                // Streak broken, reset
                await (0, database_js_1.sql) `
          UPDATE streaks
          SET current_count = 1,
              last_activity_date = ${today},
              freeze_available = true,
              updated_at = ${now}
          WHERE user_id = ${userId} AND workspace_id = ${workspaceId} AND streak_type = ${streakType}
        `;
                await (0, database_js_1.sql) `
          UPDATE user_gamification
          SET current_streak = 1, updated_at = ${now}
          WHERE user_id = ${userId} AND workspace_id = ${workspaceId}
        `;
            }
            streak = await (0, database_js_1.sql) `
        SELECT * FROM streaks
        WHERE user_id = ${userId} AND workspace_id = ${workspaceId} AND streak_type = ${streakType}
      `;
        }
        return {
            ...streak[0],
            is_active: true,
            days_until_freeze_expires: null,
        };
    }
    calculateLevel(totalXp) {
        let level = 1;
        let xpNeeded = constants_js_1.XP_PER_LEVEL;
        while (totalXp >= xpNeeded) {
            totalXp -= xpNeeded;
            level++;
            xpNeeded = Math.floor(constants_js_1.XP_PER_LEVEL * Math.pow(constants_js_1.LEVEL_MULTIPLIER, level - 1));
        }
        return level;
    }
    calculateLevelProgress(totalXp, currentLevel) {
        let xpForCurrentLevel = 0;
        for (let i = 1; i < currentLevel; i++) {
            xpForCurrentLevel += Math.floor(constants_js_1.XP_PER_LEVEL * Math.pow(constants_js_1.LEVEL_MULTIPLIER, i - 1));
        }
        const xpInCurrentLevel = totalXp - xpForCurrentLevel;
        const xpNeededForNextLevel = Math.floor(constants_js_1.XP_PER_LEVEL * Math.pow(constants_js_1.LEVEL_MULTIPLIER, currentLevel - 1));
        const progress = Math.min(100, Math.floor((xpInCurrentLevel / xpNeededForNextLevel) * 100));
        return {
            level_progress: progress,
            xp_to_next_level: xpNeededForNextLevel - xpInCurrentLevel,
        };
    }
    getPeriodStart(period) {
        const now = new Date();
        switch (period) {
            case 'daily':
                return new Date(now.getFullYear(), now.getMonth(), now.getDate());
            case 'weekly':
                const day = now.getDay();
                const diff = now.getDate() - day + (day === 0 ? -6 : 1);
                return new Date(now.getFullYear(), now.getMonth(), diff);
            case 'monthly':
                return new Date(now.getFullYear(), now.getMonth(), 1);
            case 'alltime':
                return new Date(0);
        }
    }
    getPeriodEnd(period) {
        const start = this.getPeriodStart(period);
        switch (period) {
            case 'daily':
                return new Date(start.getTime() + 24 * 60 * 60 * 1000);
            case 'weekly':
                return new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
            case 'monthly':
                return new Date(start.getFullYear(), start.getMonth() + 1, 1);
            case 'alltime':
                return new Date(9999, 11, 31);
        }
    }
}
exports.GamificationService = GamificationService;
exports.gamificationService = new GamificationService();
//# sourceMappingURL=gamification.service.js.map