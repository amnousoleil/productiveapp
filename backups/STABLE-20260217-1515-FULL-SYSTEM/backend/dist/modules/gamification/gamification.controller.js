"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gamificationController = exports.GamificationController = void 0;
const gamification_service_js_1 = require("./gamification.service.js");
const helpers_js_1 = require("../../utils/helpers.js");
const zod_1 = require("zod");
const signals_service_js_1 = require("../signals/signals.service.js");
const addXpSchema = zod_1.z.object({
    amount: zod_1.z.number().int().min(1).max(10000),
    reason: zod_1.z.enum([
        'note_created', 'note_updated', 'task_created', 'task_completed', 'task_early',
        'streak_bonus', 'achievement', 'message_sent', 'login_bonus', 'daily_goal',
        'weekly_goal', 'report_generated', 'audit_completed'
    ]),
    entity_type: zod_1.z.enum(['note', 'task', 'message', 'canvas', 'project', 'workspace', 'report', 'audit']).optional(),
    entity_id: zod_1.z.string().uuid().optional(),
    metadata: zod_1.z.record(zod_1.z.unknown()).optional(),
});
const leaderboardSchema = zod_1.z.object({
    period: zod_1.z.enum(['daily', 'weekly', 'monthly', 'alltime']).default('weekly'),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(10),
});
const streakTypeSchema = zod_1.z.object({
    type: zod_1.z.enum(['daily_login', 'daily_note', 'daily_task', 'weekly_goal']),
});
class GamificationController {
    /**
     * GET /gamification/workspace/:workspaceId/profile
     * Profil complet avec stats, badges et streaks
     */
    async getProfile(req, res, next) {
        try {
            const userId = req.user.id;
            const workspaceId = req.workspace.id;
            const [stats, achievements, streaks] = await Promise.all([
                gamification_service_js_1.gamificationService.getUserStats(userId, workspaceId),
                gamification_service_js_1.gamificationService.getAchievements(userId, workspaceId),
                gamification_service_js_1.gamificationService.getStreaks(userId, workspaceId),
            ]);
            const unlockedBadges = achievements.filter(a => a.unlocked);
            const nextBadges = achievements.filter(a => !a.unlocked).slice(0, 3);
            res.json((0, helpers_js_1.successResponse)({
                profile: {
                    ...stats,
                    badges_count: unlockedBadges.length,
                    total_badges: achievements.length,
                    recent_badges: unlockedBadges.slice(0, 5),
                    next_badges: nextBadges,
                    streaks,
                }
            }));
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * GET /gamification/workspace/:workspaceId/badges
     * Liste des badges du user
     */
    async getBadges(req, res, next) {
        try {
            const userId = req.user.id;
            const workspaceId = req.workspace.id;
            const achievements = await gamification_service_js_1.gamificationService.getAchievements(userId, workspaceId);
            const unlocked = achievements.filter(a => a.unlocked);
            const locked = achievements.filter(a => !a.unlocked);
            res.json((0, helpers_js_1.successResponse)({
                badges: {
                    unlocked,
                    locked,
                    total: achievements.length,
                    unlocked_count: unlocked.length,
                }
            }));
        }
        catch (error) {
            next(error);
        }
    }
    async getMyStats(req, res, next) {
        try {
            const userId = req.user.id;
            const workspaceId = req.workspace.id;
            const stats = await gamification_service_js_1.gamificationService.getUserStats(userId, workspaceId);
            res.json((0, helpers_js_1.successResponse)({ stats }));
        }
        catch (error) {
            next(error);
        }
    }
    async addXp(req, res, next) {
        try {
            const userId = req.user.id;
            const workspaceId = req.workspace.id;
            const input = addXpSchema.parse(req.body);
            const result = await gamification_service_js_1.gamificationService.addXp(userId, workspaceId, input);
            // Record behavioral signal
            (0, signals_service_js_1.recordSignalAsync)(userId, workspaceId, 'xp_earned', 'gamification', null, {
                amount: input.amount,
                reason: input.reason,
                leveled_up: result.leveled_up,
                new_level: result.new_level
            });
            res.json((0, helpers_js_1.successResponse)(result));
        }
        catch (error) {
            next(error);
        }
    }
    async getXpHistory(req, res, next) {
        try {
            const userId = req.user.id;
            const workspaceId = req.workspace.id;
            const limit = parseInt(req.query.limit) || 50;
            const events = await gamification_service_js_1.gamificationService.getXpHistory(userId, workspaceId, limit);
            res.json((0, helpers_js_1.successResponse)({ events }));
        }
        catch (error) {
            next(error);
        }
    }
    async getLeaderboard(req, res, next) {
        try {
            const workspaceId = req.workspace.id;
            const { period, limit } = leaderboardSchema.parse(req.query);
            const leaderboard = await gamification_service_js_1.gamificationService.getLeaderboard(workspaceId, period, limit);
            res.json((0, helpers_js_1.successResponse)({ leaderboard }));
        }
        catch (error) {
            next(error);
        }
    }
    async getAchievements(req, res, next) {
        try {
            const userId = req.user.id;
            const workspaceId = req.workspace.id;
            const achievements = await gamification_service_js_1.gamificationService.getAchievements(userId, workspaceId);
            res.json((0, helpers_js_1.successResponse)({ achievements }));
        }
        catch (error) {
            next(error);
        }
    }
    async getStreaks(req, res, next) {
        try {
            const userId = req.user.id;
            const workspaceId = req.workspace.id;
            const streaks = await gamification_service_js_1.gamificationService.getStreaks(userId, workspaceId);
            res.json((0, helpers_js_1.successResponse)({ streaks }));
        }
        catch (error) {
            next(error);
        }
    }
    async updateStreak(req, res, next) {
        try {
            const userId = req.user.id;
            const workspaceId = req.workspace.id;
            const { type } = streakTypeSchema.parse(req.body);
            const streak = await gamification_service_js_1.gamificationService.updateStreak(userId, workspaceId, type);
            res.json((0, helpers_js_1.successResponse)({ streak }));
        }
        catch (error) {
            next(error);
        }
    }
    async checkAchievements(req, res, next) {
        try {
            const userId = req.user.id;
            const workspaceId = req.workspace.id;
            const unlocked = await gamification_service_js_1.gamificationService.checkAchievements(userId, workspaceId);
            res.json((0, helpers_js_1.successResponse)({ unlocked_achievements: unlocked }));
        }
        catch (error) {
            next(error);
        }
    }
}
exports.GamificationController = GamificationController;
exports.gamificationController = new GamificationController();
//# sourceMappingURL=gamification.controller.js.map