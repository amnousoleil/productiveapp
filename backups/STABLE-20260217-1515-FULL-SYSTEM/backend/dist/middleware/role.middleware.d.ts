import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest, WorkspaceRole } from '../types/index.js';
export declare function hasRole(userRole: WorkspaceRole | undefined, requiredRole: WorkspaceRole): boolean;
export declare function roleMiddleware(requiredRole: WorkspaceRole): (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const requireOwner: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const requireAdmin: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const requireMember: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const requireGuest: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare function hasPermission(req: AuthenticatedRequest, permission: string): boolean;
export declare function permissionMiddleware(permission: string): (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare function requireAny(...roles: WorkspaceRole[]): (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare function requireRole(roles: WorkspaceRole[]): (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
//# sourceMappingURL=role.middleware.d.ts.map