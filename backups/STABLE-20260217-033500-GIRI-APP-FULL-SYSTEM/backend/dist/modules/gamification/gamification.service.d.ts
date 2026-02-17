import type { UUID, Achievement, XpEvent, LeaderboardPeriod } from '../../types/index.js';
import type { AddXpInput, UserGamificationWithLevel, LeaderboardEntry, AchievementWithStatus, StreakInfo } from './gamification.types.js';
export declare class GamificationService {
    getUserStats(userId: UUID, workspaceId: UUID): Promise<UserGamificationWithLevel>;
    addXp(userId: UUID, workspaceId: UUID, input: AddXpInput): Promise<{
        xp_gained: number;
        leveled_up: boolean;
        new_level?: number;
    }>;
    getXpHistory(userId: UUID, workspaceId: UUID, limit?: number): Promise<XpEvent[]>;
    getLeaderboard(workspaceId: UUID, period: LeaderboardPeriod, limit?: number): Promise<LeaderboardEntry[]>;
    updateLeaderboard(workspaceId: UUID, period: LeaderboardPeriod): Promise<void>;
    getAchievements(userId: UUID, _workspaceId: UUID): Promise<AchievementWithStatus[]>;
    unlockAchievement(userId: UUID, achievementId: UUID): Promise<Achievement | null>;
    checkAchievements(userId: UUID, workspaceId: UUID): Promise<Achievement[]>;
    getStreaks(userId: UUID, workspaceId: UUID): Promise<StreakInfo[]>;
    updateStreak(userId: UUID, workspaceId: UUID, streakType: string): Promise<StreakInfo>;
    private calculateLevel;
    private calculateLevelProgress;
    private getPeriodStart;
    private getPeriodEnd;
}
export declare const gamificationService: GamificationService;
//# sourceMappingURL=gamification.service.d.ts.map