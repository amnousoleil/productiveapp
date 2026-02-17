import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../../types/index.js';
export declare class GamificationController {
    /**
     * GET /gamification/workspace/:workspaceId/profile
     * Profil complet avec stats, badges et streaks
     */
    getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * GET /gamification/workspace/:workspaceId/badges
     * Liste des badges du user
     */
    getBadges(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getMyStats(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    addXp(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getXpHistory(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getLeaderboard(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getAchievements(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getStreaks(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    updateStreak(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    checkAchievements(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
}
export declare const gamificationController: GamificationController;
//# sourceMappingURL=gamification.controller.d.ts.map