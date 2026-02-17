"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.workspacesService = exports.WorkspacesService = void 0;
const database_js_1 = require("../../config/database.js");
const helpers_js_1 = require("../../utils/helpers.js");
const jwt_js_1 = require("../../utils/jwt.js");
const email_service_js_1 = require("../../services/email.service.js");
class WorkspacesService {
    async create(userId, input) {
        const id = (0, helpers_js_1.generateUUID)();
        const slug = input.slug || (0, helpers_js_1.generateUniqueSlug)(input.name);
        const now = new Date();
        // Check slug uniqueness
        const existing = await (0, database_js_1.sql) `SELECT id FROM workspaces WHERE slug = ${slug}`;
        if (existing.length > 0) {
            throw helpers_js_1.AppError.conflict('Workspace slug already exists');
        }
        const workspaces = await (0, database_js_1.sql) `
      INSERT INTO workspaces (id, owner_id, name, slug, icon, settings, created_at, updated_at)
      VALUES (
        ${id},
        ${userId},
        ${input.name},
        ${slug},
        ${input.icon || null},
        ${JSON.stringify(input.settings || {})},
        ${now},
        ${now}
      )
      RETURNING *
    `;
        // Add owner as member
        await (0, database_js_1.sql) `
      INSERT INTO workspace_members (workspace_id, user_id, role, joined_at)
      VALUES (${id}, ${userId}, 'owner', ${now})
    `;
        return workspaces[0];
    }
    async getById(workspaceId) {
        const workspaces = await (0, database_js_1.sql) `
      SELECT * FROM workspaces WHERE id = ${workspaceId}
    `;
        if (workspaces.length === 0) {
            throw helpers_js_1.AppError.notFound('Workspace');
        }
        return workspaces[0];
    }
    async getBySlug(slug) {
        const workspaces = await (0, database_js_1.sql) `
      SELECT * FROM workspaces WHERE slug = ${slug}
    `;
        if (workspaces.length === 0) {
            throw helpers_js_1.AppError.notFound('Workspace');
        }
        return workspaces[0];
    }
    async getUserWorkspaces(userId) {
        const workspaces = await (0, database_js_1.sql) `
      SELECT w.*, COUNT(wm2.user_id)::int as member_count
      FROM workspaces w
      INNER JOIN workspace_members wm ON w.id = wm.workspace_id
      LEFT JOIN workspace_members wm2 ON w.id = wm2.workspace_id
      WHERE wm.user_id = ${userId}
      GROUP BY w.id
      ORDER BY w.name
    `;
        return workspaces;
    }
    async update(workspaceId, input) {
        if (input.slug) {
            const existing = await (0, database_js_1.sql) `
        SELECT id FROM workspaces WHERE slug = ${input.slug} AND id != ${workspaceId}
      `;
            if (existing.length > 0) {
                throw helpers_js_1.AppError.conflict('Workspace slug already exists');
            }
        }
        const updates = { updated_at: new Date() };
        if (input.name !== undefined)
            updates.name = input.name;
        if (input.slug !== undefined)
            updates.slug = input.slug;
        if (input.icon !== undefined)
            updates.icon = input.icon;
        if (input.settings !== undefined)
            updates.settings = JSON.stringify(input.settings);
        const fields = Object.keys(updates);
        const workspaces = await (0, database_js_1.sql) `
      UPDATE workspaces
      SET ${(0, database_js_1.sql)(updates, ...fields)}
      WHERE id = ${workspaceId}
      RETURNING *
    `;
        if (workspaces.length === 0) {
            throw helpers_js_1.AppError.notFound('Workspace');
        }
        return workspaces[0];
    }
    async delete(workspaceId) {
        await (0, database_js_1.sql) `DELETE FROM workspaces WHERE id = ${workspaceId}`;
    }
    async getMembers(workspaceId, params) {
        const page = params.page ?? 1;
        const limit = params.limit ?? 20;
        const offset = (0, helpers_js_1.calculateOffset)(page, limit);
        const members = await (0, database_js_1.sql) `
      SELECT wm.*,
             json_build_object(
               'id', u.id,
               'name', u.name,
               'email', u.email,
               'avatar_url', u.avatar_url,
               'status', u.status
             ) as user
      FROM workspace_members wm
      INNER JOIN users u ON wm.user_id = u.id
      WHERE wm.workspace_id = ${workspaceId}
      ORDER BY wm.role, u.name
      LIMIT ${limit} OFFSET ${offset}
    `;
        const countResult = await (0, database_js_1.sql) `
      SELECT COUNT(*)::int as count FROM workspace_members WHERE workspace_id = ${workspaceId}
    `;
        return {
            members: members,
            total: countResult[0].count,
        };
    }
    async getMember(workspaceId, userId) {
        const members = await (0, database_js_1.sql) `
      SELECT wm.*,
             json_build_object(
               'id', u.id,
               'name', u.name,
               'email', u.email,
               'avatar_url', u.avatar_url,
               'status', u.status
             ) as user
      FROM workspace_members wm
      INNER JOIN users u ON wm.user_id = u.id
      WHERE wm.workspace_id = ${workspaceId} AND wm.user_id = ${userId}
    `;
        return members.length > 0 ? members[0] : null;
    }
    async updateMemberRole(workspaceId, userId, role) {
        // Cannot change owner role
        const member = await this.getMember(workspaceId, userId);
        if (!member) {
            throw helpers_js_1.AppError.notFound('Member');
        }
        if (member.role === 'owner') {
            throw helpers_js_1.AppError.forbidden('Cannot change owner role');
        }
        await (0, database_js_1.sql) `
      UPDATE workspace_members
      SET role = ${role}
      WHERE workspace_id = ${workspaceId} AND user_id = ${userId}
    `;
    }
    async removeMember(workspaceId, userId) {
        const member = await this.getMember(workspaceId, userId);
        if (!member) {
            throw helpers_js_1.AppError.notFound('Member');
        }
        if (member.role === 'owner') {
            throw helpers_js_1.AppError.forbidden('Cannot remove workspace owner');
        }
        await (0, database_js_1.sql) `
      DELETE FROM workspace_members
      WHERE workspace_id = ${workspaceId} AND user_id = ${userId}
    `;
    }
    async invite(workspaceId, inviterId, input) {
        // Check if user already exists and is a member
        const existingUser = await (0, database_js_1.sql) `SELECT id FROM users WHERE email = ${input.email.toLowerCase()}`;
        if (existingUser.length > 0) {
            const existingMember = await (0, database_js_1.sql) `
        SELECT user_id FROM workspace_members
        WHERE workspace_id = ${workspaceId} AND user_id = ${existingUser[0].id}
      `;
            if (existingMember.length > 0) {
                throw helpers_js_1.AppError.conflict('User is already a member of this workspace');
            }
        }
        // Check for existing pending invitation
        const existingInvite = await (0, database_js_1.sql) `
      SELECT id FROM workspace_invitations
      WHERE workspace_id = ${workspaceId}
        AND email = ${input.email.toLowerCase()}
        AND accepted_at IS NULL
        AND expires_at > NOW()
    `;
        if (existingInvite.length > 0) {
            throw helpers_js_1.AppError.conflict('Invitation already sent to this email');
        }
        const id = (0, helpers_js_1.generateUUID)();
        const token = (0, jwt_js_1.generateSecureToken)();
        const tokenHash = (0, jwt_js_1.hashToken)(token);
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
        const now = new Date();
        await (0, database_js_1.sql) `
      INSERT INTO workspace_invitations (id, workspace_id, email, role, token, invited_by, expires_at, created_at)
      VALUES (${id}, ${workspaceId}, ${input.email.toLowerCase()}, ${input.role}, ${tokenHash}, ${inviterId}, ${expiresAt}, ${now})
    `;
        // Send invitation email
        const inviterResult = await (0, database_js_1.sql) `SELECT name FROM users WHERE id = ${inviterId}`;
        const workspaceResult = await (0, database_js_1.sql) `SELECT name FROM workspaces WHERE id = ${workspaceId}`;
        const inviterName = inviterResult[0]?.name || 'Un membre';
        const workspaceName = workspaceResult[0]?.name || 'Workspace';
        email_service_js_1.EmailService.sendWorkspaceInvitation(input.email, inviterName, workspaceName, token).catch(err => {
            console.error('[WorkspacesService] Failed to send invitation email:', err);
        });
        return { token, invitation_id: id };
    }
    async acceptInvitation(token, userId) {
        const tokenHash = (0, jwt_js_1.hashToken)(token);
        const invitations = await (0, database_js_1.sql) `
      SELECT * FROM workspace_invitations
      WHERE token = ${tokenHash}
        AND accepted_at IS NULL
    `;
        if (invitations.length === 0) {
            throw helpers_js_1.AppError.badRequest('Invalid or expired invitation');
        }
        const invitation = invitations[0];
        if (new Date(invitation.expires_at) < new Date()) {
            throw helpers_js_1.AppError.badRequest('Invitation has expired');
        }
        // Check if user is already a member
        const existingMember = await (0, database_js_1.sql) `
      SELECT user_id FROM workspace_members
      WHERE workspace_id = ${invitation.workspace_id} AND user_id = ${userId}
    `;
        if (existingMember.length > 0) {
            throw helpers_js_1.AppError.conflict('Already a member of this workspace');
        }
        const now = new Date();
        // Add user as member
        await (0, database_js_1.sql) `
      INSERT INTO workspace_members (workspace_id, user_id, role, invited_by, invited_at, joined_at)
      VALUES (${invitation.workspace_id}, ${userId}, ${invitation.role}, ${invitation.invited_by}, ${invitation.created_at}, ${now})
    `;
        // Mark invitation as accepted
        await (0, database_js_1.sql) `
      UPDATE workspace_invitations
      SET accepted_at = ${now}
      WHERE id = ${invitation.id}
    `;
        return this.getById(invitation.workspace_id);
    }
    async getInvitations(workspaceId) {
        const invitations = await (0, database_js_1.sql) `
      SELECT wi.id, wi.workspace_id, w.name as workspace_name, wi.email, wi.role,
             wi.invited_by, u.name as inviter_name, wi.expires_at, wi.created_at
      FROM workspace_invitations wi
      INNER JOIN workspaces w ON wi.workspace_id = w.id
      INNER JOIN users u ON wi.invited_by = u.id
      WHERE wi.workspace_id = ${workspaceId}
        AND wi.accepted_at IS NULL
        AND wi.expires_at > NOW()
      ORDER BY wi.created_at DESC
    `;
        return invitations;
    }
    async cancelInvitation(workspaceId, invitationId) {
        const result = await (0, database_js_1.sql) `
      DELETE FROM workspace_invitations
      WHERE id = ${invitationId} AND workspace_id = ${workspaceId} AND accepted_at IS NULL
    `;
        if (result.count === 0) {
            throw helpers_js_1.AppError.notFound('Invitation');
        }
    }
    async leave(workspaceId, userId) {
        const member = await this.getMember(workspaceId, userId);
        if (!member) {
            throw helpers_js_1.AppError.notFound('Member');
        }
        if (member.role === 'owner') {
            throw helpers_js_1.AppError.forbidden('Owner cannot leave workspace. Transfer ownership first.');
        }
        await (0, database_js_1.sql) `
      DELETE FROM workspace_members
      WHERE workspace_id = ${workspaceId} AND user_id = ${userId}
    `;
    }
    async transferOwnership(workspaceId, currentOwnerId, newOwnerId) {
        // Verify current owner
        const currentOwner = await this.getMember(workspaceId, currentOwnerId);
        if (!currentOwner || currentOwner.role !== 'owner') {
            throw helpers_js_1.AppError.forbidden('Only the owner can transfer ownership');
        }
        // Verify new owner is a member
        const newOwner = await this.getMember(workspaceId, newOwnerId);
        if (!newOwner) {
            throw helpers_js_1.AppError.notFound('New owner must be a member');
        }
        // Transfer ownership
        await (0, database_js_1.sql) `
      UPDATE workspace_members
      SET role = 'admin'
      WHERE workspace_id = ${workspaceId} AND user_id = ${currentOwnerId}
    `;
        await (0, database_js_1.sql) `
      UPDATE workspace_members
      SET role = 'owner'
      WHERE workspace_id = ${workspaceId} AND user_id = ${newOwnerId}
    `;
        await (0, database_js_1.sql) `
      UPDATE workspaces
      SET owner_id = ${newOwnerId}, updated_at = ${new Date()}
      WHERE id = ${workspaceId}
    `;
    }
}
exports.WorkspacesService = WorkspacesService;
exports.workspacesService = new WorkspacesService();
//# sourceMappingURL=workspaces.service.js.map