/**
 * Billing Middleware - Feature Gating par plan
 * Vérifie si l'utilisateur a accès à une feature selon son plan
 */

import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../../types/index.js';
import { hasFeature, checkLimit, getMinimumPlanForFeature, type PlanFeatures, type PlanId } from './billing.plans.js';

type Req = AuthenticatedRequest;

/**
 * Middleware qui vérifie si l'utilisateur a accès à une feature
 *
 * Exemple d'utilisation :
 * router.get('/notes/graph', authMiddleware, requireFeature('graph3D'), handler)
 */
export function requireFeature(feature: keyof PlanFeatures) {
  return (req: Req, res: Response, next: NextFunction): void => {
    const userPlan = (req.user as any)?.subscription_plan || (req.user as any)?.plan || 'free';

    if (!hasFeature(userPlan as PlanId, feature)) {
      const requiredPlan = getMinimumPlanForFeature(feature);
      res.status(403).json({
        error: 'Feature non disponible avec votre plan actuel',
        code: 'FEATURE_GATE',
        feature,
        currentPlan: userPlan,
        requiredPlan,
        upgradeUrl: '/billing'
      });
      return;
    }

    next();
  };
}

/**
 * Middleware qui vérifie une limite d'usage
 *
 * Exemple d'utilisation :
 * router.post('/notes', authMiddleware, requireLimit('maxNotes', getNotesCount), handler)
 */
export function requireLimit(
  limitKey: keyof PlanFeatures,
  getUsage: (req: Req) => Promise<number>
) {
  return async (req: Req, res: Response, next: NextFunction): Promise<void> => {
    const userPlan = (req.user as any)?.subscription_plan || (req.user as any)?.plan || 'free';
    const currentUsage = await getUsage(req);
    const { allowed, remaining, limit } = checkLimit(userPlan as PlanId, limitKey, currentUsage);

    if (!allowed) {
      const requiredPlan = getMinimumPlanForFeature(limitKey);
      res.status(403).json({
        error: 'Limite du plan atteinte',
        code: 'LIMIT_REACHED',
        limitKey,
        currentUsage,
        limit,
        currentPlan: userPlan,
        requiredPlan,
        upgradeUrl: '/billing'
      });
      return;
    }

    // Attacher les infos de limite à la request
    (req as any).limitInfo = { remaining, limit, currentUsage };
    next();
  };
}

/**
 * Middleware qui attache les infos du plan à req.planInfo
 * Utile pour les routes qui ont besoin de connaître le plan sans bloquer
 */
export function attachPlanInfo(req: Req, _res: Response, next: NextFunction): void {
  const userPlan = (req.user as any)?.subscription_plan || (req.user as any)?.plan || 'free';

  (req as any).planInfo = {
    plan: userPlan,
    hasFeature: (feature: keyof PlanFeatures) => hasFeature(userPlan as PlanId, feature),
    checkLimit: (limitKey: keyof PlanFeatures, usage: number) => checkLimit(userPlan as PlanId, limitKey, usage)
  };

  next();
}
