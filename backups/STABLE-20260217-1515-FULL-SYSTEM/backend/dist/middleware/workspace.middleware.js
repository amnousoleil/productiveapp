"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.workspaceMiddleware = workspaceMiddleware;
exports.requireWorkspaceAccess = requireWorkspaceAccess;
exports.getWorkspaceId = getWorkspaceId;
exports.isWorkspaceOwner = isWorkspaceOwner;
exports.isWorkspaceAdmin = isWorkspaceAdmin;
exports.canManageWorkspace = canManageWorkspace;
exports.canInviteMembers = canInviteMembers;
const helpers_js_1 = require("../utils/helpers.js");
const database_js_1 = require("../config/database.js");
async function workspaceMiddleware(req, res, next) {
    try {
        const workspaceId = req.params.workspaceId || req.headers['x-workspace-id'];
        if (!workspaceId) {
            throw helpers_js_1.AppError.badRequest('Workspace ID is required');
        }
        if (!req.user) {
            throw helpers_js_1.AppError.unauthorized();
        }
        // Get workspace and membership
        const result = await (0, database_js_1.sql) `
      SELECT
        w.id, w.owner_id, w.name, w.slug, w.icon, w.settings,
        w.created_at, w.updated_at,
        wm.role, wm.permissions, wm.joined_at
      FROM workspaces w
      LEFT JOIN workspace_members wm ON w.id = wm.workspace_id AND wm.user_id = ${req.user.id}
      WHERE w.id = ${workspaceId}
    `;
        if (result.length === 0) {
            throw helpers_js_1.AppError.notFound('Workspace');
        }
        const row = result[0];
        if (!row.role) {
            throw helpers_js_1.AppError.forbidden('You are not a member of this workspace');
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
            role: row.role,
            permissions: row.permissions,
            invited_by: null,
            invited_at: null,
            joined_at: row.joined_at,
        };
        next();
    }
    catch (error) {
        if (error instanceof helpers_js_1.AppError) {
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
function requireWorkspaceAccess(req) {
    if (!req.workspace || !req.workspaceMember) {
        throw helpers_js_1.AppError.forbidden('Workspace access required');
    }
}
function getWorkspaceId(req) {
    const workspaceId = req.params.workspaceId ||
        req.headers['x-workspace-id'] ||
        req.workspace?.id;
    if (!workspaceId) {
        throw helpers_js_1.AppError.badRequest('Workspace ID is required');
    }
    return workspaceId;
}
function isWorkspaceOwner(req) {
    return req.workspaceMember?.role === 'owner';
}
function isWorkspaceAdmin(req) {
    return (req.workspaceMember?.role === 'owner' ||
        req.workspaceMember?.role === 'admin');
}
function canManageWorkspace(req) {
    return isWorkspaceAdmin(req);
}
function canInviteMembers(req) {
    return isWorkspaceAdmin(req);
}
//# sourceMappingURL=workspace.middleware.js.map