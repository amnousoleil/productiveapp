import type { UUID, UserGamification, Achievement, Streak, Leaderboard, XpReason, EntityType } from '../../types/index.js';
export interface AddXpInput {
    amount: number;
    reason: XpReason;
    entity_type?: EntityType;
    entity_id?: UUID;
    metadata?: Record<string, unknown>;
}
export interface UserGamificationWithLevel extends UserGamification {
    level_progress: number;
    xp_to_next_level: number;
}
export interface LeaderboardEntry extends Leaderboard {
    user: {
        id: UUID;
        name: string;
        avatar_url: string | null;
    };
}
export interface AchievementWithStatus extends Achievement {
    unlocked: boolean;
    unlocked_at: Date | null;
}
export interface StreakInfo extends Streak {
    is_active: boolean;
    days_until_freeze_expires: number | null;
}
//# sourceMappingURL=gamification.types.d.ts.map