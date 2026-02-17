import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../types/index.js';
export declare function workspaceMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
export declare function requireWorkspaceAccess(req: AuthenticatedRequest): void;
export declare function getWorkspaceId(req: AuthenticatedRequest): string;
export declare function isWorkspaceOwner(req: AuthenticatedRequest): boolean;
export declare function isWorkspaceAdmin(req: AuthenticatedRequest): boolean;
export declare function canManageWorkspace(req: AuthenticatedRequest): boolean;
export declare function canInviteMembers(req: AuthenticatedRequest): boolean;
//# sourceMappingURL=workspace.middleware.d.ts.map