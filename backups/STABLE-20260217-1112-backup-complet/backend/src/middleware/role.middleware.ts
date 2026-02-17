import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest, WorkspaceRole } from '../types/index.js';
import { AppError } from '../utils/helpers.js';

const ROLE_HIERARCHY: Record<WorkspaceRole, number> = {
  owner: 4,
  admin: 3,
  member: 2,
  guest: 1,
};

export function hasRole(
  userRole: WorkspaceRole | undefined,
  requiredRole: WorkspaceRole
): boolean {
  if (!userRole) return false;
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

export function roleMiddleware(requiredRole: WorkspaceRole) {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    try {
      if (!req.user) {
        throw AppError.unauthorized();
      }

      if (!req.workspaceMember) {
        throw AppError.forbidden('Workspace membership required');
      }

      if (!hasRole(req.workspaceMember.role, requiredRole)) {
        throw AppError.forbidden(
          `Role '${requiredRole}' or higher is required`
        );
      }

      next();
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          error: {
            code: error.code,
            message: error.message,
          },
        });
        return;
      }
      next(error);
    }
  };
}

export const requireOwner = roleMiddleware('owner');
export const requireAdmin = roleMiddleware('admin');
export const requireMember = roleMiddleware('member');
export const requireGuest = roleMiddleware('guest');

export function hasPermission(
  req: AuthenticatedRequest,
  permission: string
): boolean {
  if (!req.workspaceMember) return false;

  // Owner and admin have all permissions
  if (hasRole(req.workspaceMember.role, 'admin')) return true;

  // Check specific permissions
  const permissions = req.workspaceMember.permissions;
  if (!permissions) return false;

  return permissions[permission] === true;
}

export function permissionMiddleware(permission: string) {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    try {
      if (!req.user) {
        throw AppError.unauthorized();
      }

      if (!hasPermission(req, permission)) {
        throw AppError.forbidden(`Permission '${permission}' is required`);
      }

      next();
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          error: {
            code: error.code,
            message: error.message,
          },
        });
        return;
      }
      next(error);
    }
  };
}

export function requireAny(...roles: WorkspaceRole[]) {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    try {
      if (!req.user) {
        throw AppError.unauthorized();
      }

      if (!req.workspaceMember) {
        throw AppError.forbidden('Workspace membership required');
      }

      const userRole = req.workspaceMember.role;
      if (!roles.includes(userRole)) {
        throw AppError.forbidden(
          `One of the following roles is required: ${roles.join(', ')}`
        );
      }

      next();
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({
          success: false,
          error: {
            code: error.code,
            message: error.message,
          },
        });
        return;
      }
      next(error);
    }
  };
}

// Alias for requireAny that takes an array
export function requireRole(roles: WorkspaceRole[]) {
  return requireAny(...roles);
}
