import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../../types/index.js';
/**
 * Middleware to check if the authenticated user is the super-admin
 */
export declare const requireSuperAdmin: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
//# sourceMappingURL=admin.middleware.d.ts.map