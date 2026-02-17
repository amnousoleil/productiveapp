import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../../types/index.js';

const ADMIN_EMAIL = 'contact@mahagiri.fr';

/**
 * Middleware to check if the authenticated user is the super-admin
 */
export const requireSuperAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  if (req.user.email !== ADMIN_EMAIL) {
    res.status(403).json({ error: 'Admin access required' });
    return;
  }

  next();
};
