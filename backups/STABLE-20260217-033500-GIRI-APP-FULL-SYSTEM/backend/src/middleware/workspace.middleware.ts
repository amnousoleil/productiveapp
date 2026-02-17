import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest, WorkspaceRole } from '../types/index.js';
import { AppError } from '../utils/helpers.js';
import { sql } from '../config/database.js';

export async function workspaceMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const workspaceId = req.params.workspaceId || req.headers['x-workspace-id'];

    if (!workspaceId) {
      throw AppError.badRequest('Workspace ID is required');
    }

    if (!req.user) {
      throw AppError.unauthorized();
    }

    // Get workspace and membership
    const result = await sql`
      SELECT
        w.id, w.owner_id, w.name, w.slug, w.icon, w.settings,
        w.created_at, w.updated_at,
        wm.role, wm.permissions, wm.joined_at
      FROM workspaces w
      LEFT JOIN workspace_members wm ON w.id = wm.workspace_id AND wm.user_id = ${req.user.id}
      WHERE w.id = ${workspaceId}
    `;

    if (result.length === 0) {
      throw AppError.notFound('Workspace');
    }

    const row = result[0];

    if (!row.role) {
      throw AppError.forbidden('You are not a member of this workspace');
    }

    // Attach workspace and membership to request
    req.workspace = {
      id: row.id,
      owner_id: row.owner_id,
      name: row.name,
      slug: row.slug,
      icon: row.icon,
      settings: row.settings || {},
      created_at: row.created_at,
      updated_at: row.updated_at,
    };

    req.workspaceMember = {
      workspace_id: row.id,
      user_id: req.user.id,
      role: row.role as WorkspaceRole,
      permissions: row.permissions,
      invited_by: null,
      invited_at: null,
      joined_at: row.joined_at,
    };

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
}

export function requireWorkspaceAccess(req: AuthenticatedRequest): void {
  if (!req.workspace || !req.workspaceMember) {
    throw AppError.forbidden('Workspace access required');
  }
}

export function getWorkspaceId(req: AuthenticatedRequest): string {
  const workspaceId = req.params.workspaceId ||
    req.headers['x-workspace-id'] ||
    req.workspace?.id;

  if (!workspaceId) {
    throw AppError.badRequest('Workspace ID is required');
  }

  return workspaceId as string;
}

export function isWorkspaceOwner(req: AuthenticatedRequest): boolean {
  return req.workspaceMember?.role === 'owner';
}

export function isWorkspaceAdmin(req: AuthenticatedRequest): boolean {
  return (
    req.workspaceMember?.role === 'owner' ||
    req.workspaceMember?.role === 'admin'
  );
}

export function canManageWorkspace(req: AuthenticatedRequest): boolean {
  return isWorkspaceAdmin(req);
}

export function canInviteMembers(req: AuthenticatedRequest): boolean {
  return isWorkspaceAdmin(req);
}
