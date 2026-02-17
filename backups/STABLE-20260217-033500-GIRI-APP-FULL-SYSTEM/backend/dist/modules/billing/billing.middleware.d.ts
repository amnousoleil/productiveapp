/**
 * Billing Middleware - Feature Gating par plan
 * Vérifie si l'utilisateur a accès à une feature selon son plan
 */
import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../../types/index.js';
import { type PlanFeatures } from './billing.plans.js';
type Req = AuthenticatedRequest;
/**
 * Middleware qui vérifie si l'utilisateur a accès à une feature
 *
 * Exemple d'utilisation :
 * router.get('/notes/graph', authMiddleware, requireFeature('graph3D'), handler)
 */
export declare function requireFeature(feature: keyof PlanFeatures): (req: Req, res: Response, next: NextFunction) => void;
/**
 * Middleware qui vérifie une limite d'usage
 *
 * Exemple d'utilisation :
 * router.post('/notes', authMiddleware, requireLimit('maxNotes', getNotesCount), handler)
 */
export declare function requireLimit(limitKey: keyof PlanFeatures, getUsage: (req: Req) => Promise<number>): (req: Req, res: Response, next: NextFunction) => Promise<void>;
/**
 * Middleware qui attache les infos du plan à req.planInfo
 * Utile pour les routes qui ont besoin de connaître le plan sans bloquer
 */
export declare function attachPlanInfo(req: Req, _res: Response, next: NextFunction): void;
export {};
//# sourceMappingURL=billing.middleware.d.ts.map