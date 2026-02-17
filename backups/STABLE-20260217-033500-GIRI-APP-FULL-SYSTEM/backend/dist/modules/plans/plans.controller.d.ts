import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../../types/index.js';
export declare class PlansController {
    getUserPlan(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getMyPlan(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getFeaturesByTier(_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    checkFeature(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
}
export declare const plansController: PlansController;
//# sourceMappingURL=plans.controller.d.ts.map