import { Router } from 'express';
import * as ctrl from './portal.controller.js';

// Admin routes (mounted under /api/v1/portal/workspace/:workspaceId)
const adminRouter = Router({ mergeParams: true });
adminRouter.post('/tokens', ctrl.generateToken);
adminRouter.get('/tokens', ctrl.listTokens);
adminRouter.post('/tokens/:id/revoke', ctrl.revokeToken);

// Public routes (mounted under /api/v1/portal/client/:token)
const publicRouter = Router({ mergeParams: true });
publicRouter.get('/', ctrl.portalAccess);

export { adminRouter, publicRouter };
export default adminRouter;
