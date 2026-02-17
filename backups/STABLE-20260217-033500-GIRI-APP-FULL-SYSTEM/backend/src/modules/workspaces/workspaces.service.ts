import { sql } from '../../config/database.js';
import { generateUUID, generateUniqueSlug, AppError, calculateOffset } from '../../utils/helpers.js';
import { generateSecureToken, hashToken } from '../../utils/jwt.js';
import { EmailService } from '../../services/email.service.js';
import type { UUID, Workspace, WorkspaceRole, PaginationParams } from '../../types/index.js';
import type {
  CreateWorkspaceInput,
  UpdateWorkspaceInput,
  InviteInput,
  WorkspaceWithMemberCount,
  WorkspaceMemberWithUser,
  WorkspaceInvitationWithWorkspace,
} from './workspaces.types.js';

export class WorkspacesService {
  async create(userId: UUID, input: CreateWorkspaceInput): Promise<Workspace> {
    const id = generateUUID();
    const slug = input.slug || generateUniqueSlug(input.name);
    const now = new Date();

    // Check slug uniqueness
    const existing = await sql`SELECT id FROM workspaces WHERE slug = ${slug}`;
    if (existing.length > 0) {
      throw AppError.conflict('Workspace slug already exists');
    }

    const workspaces = await sql`
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
    await sql`
      INSERT INTO workspace_members (workspace_id, user_id, role, joined_at)
      VALUES (${id}, ${userId}, 'owner', ${now})
    `;

    return workspaces[0] as Workspace;
  }

  async getById(workspaceId: UUID): Promise<Workspace> {
    const workspaces = await sql`
      SELECT * FROM workspaces WHERE id = ${workspaceId}
    `;

    if (workspaces.length === 0) {
      throw AppError.notFound('Workspace');
    }

    return workspaces[0] as Workspace;
  }

  async getBySlug(slug: string): Promise<Workspace> {
    const workspaces = await sql`
      SELECT * FROM workspaces WHERE slug = ${slug}
    `;

    if (workspaces.length === 0) {
      throw AppError.notFound('Workspace');
    }

    return workspaces[0] as Workspace;
  }

  async getUserWorkspaces(userId: UUID): Promise<WorkspaceWithMemberCount[]> {
    const workspaces = await sql`
      SELECT w.*, COUNT(wm2.user_id)::int as member_count
      FROM workspaces w
      INNER JOIN workspace_members wm ON w.id = wm.workspace_id
      LEFT JOIN workspace_members wm2 ON w.id = wm2.workspace_id
      WHERE wm.user_id = ${userId}
      GROUP BY w.id
      ORDER BY w.name
    `;

    return workspaces as unknown as WorkspaceWithMemberCount[];
  }

  async update(workspaceId: UUID, input: UpdateWorkspaceInput): Promise<Workspace> {
    if (input.slug) {
      const existing = await sql`
        SELECT id FROM workspaces WHERE slug = ${input.slug} AND id != ${workspaceId}
      `;
      if (existing.length > 0) {
        throw AppError.conflict('Workspace slug already exists');
      }
    }

    const updates: Record<string, unknown> = { updated_at: new Date() };
    if (input.name !== undefined) updates.name = input.name;
    if (input.slug !== undefined) updates.slug = input.slug;
    if (input.icon !== undefined) updates.icon = input.icon;
    if (input.settings !== undefined) updates.settings = JSON.stringify(input.settings);

    const fields = Object.keys(updates);
    const workspaces = await sql`
      UPDATE workspaces
      SET ${sql(updates, ...fields)}
      WHERE id = ${workspaceId}
      RETURNING *
    `;

    if (workspaces.length === 0) {
      throw AppError.notFound('Workspace');
    }

    return workspaces[0] as Workspace;
  }

  async delete(workspaceId: UUID): Promise<void> {
    await sql`DELETE FROM workspaces WHERE id = ${workspaceId}`;
  }

  async getMembers(
    workspaceId: UUID,
    params: PaginationParams
  ): Promise<{ members: WorkspaceMemberWithUser[]; total: number }> {
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const offset = calculateOffset(page, limit);

    const members = await sql`
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

    const countResult = await sql`
      SELECT COUNT(*)::int as count FROM workspace_members WHERE workspace_id = ${workspaceId}
    `;

    return {
      members: members as unknown as WorkspaceMemberWithUser[],
      total: countResult[0].count,
    };
  }

  async getMember(workspaceId: UUID, userId: UUID): Promise<WorkspaceMemberWithUser | null> {
    const members = await sql`
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

    return members.length > 0 ? (members[0] as WorkspaceMemberWithUser) : null;
  }

  async updateMemberRole(workspaceId: UUID, userId: UUID, role: WorkspaceRole): Promise<void> {
    // Cannot change owner role
    const member = await this.getMember(workspaceId, userId);
    if (!member) {
      throw AppError.notFound('Member');
    }
    if (member.role === 'owner') {
      throw AppError.forbidden('Cannot change owner role');
    }

    await sql`
      UPDATE workspace_members
      SET role = ${role}
      WHERE workspace_id = ${workspaceId} AND user_id = ${userId}
    `;
  }

  async removeMember(workspaceId: UUID, userId: UUID): Promise<void> {
    const member = await this.getMember(workspaceId, userId);
    if (!member) {
      throw AppError.notFound('Member');
    }
    if (member.role === 'owner') {
      throw AppError.forbidden('Cannot remove workspace owner');
    }

    await sql`
      DELETE FROM workspace_members
      WHERE workspace_id = ${workspaceId} AND user_id = ${userId}
    `;
  }

  async invite(
    workspaceId: UUID,
    inviterId: UUID,
    input: InviteInput
  ): Promise<{ token: string; invitation_id: UUID }> {
    // Check if user already exists and is a member
    const existingUser = await sql`SELECT id FROM users WHERE email = ${input.email.toLowerCase()}`;
    if (existingUser.length > 0) {
      const existingMember = await sql`
        SELECT user_id FROM workspace_members
        WHERE workspace_id = ${workspaceId} AND user_id = ${existingUser[0].id}
      `;
      if (existingMember.length > 0) {
        throw AppError.conflict('User is already a member of this workspace');
      }
    }

    // Check for existing pending invitation
    const existingInvite = await sql`
      SELECT id FROM workspace_invitations
      WHERE workspace_id = ${workspaceId}
        AND email = ${input.email.toLowerCase()}
        AND accepted_at IS NULL
        AND expires_at > NOW()
    `;
    if (existingInvite.length > 0) {
      throw AppError.conflict('Invitation already sent to this email');
    }

    const id = generateUUID();
    const token = generateSecureToken();
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    const now = new Date();

    await sql`
      INSERT INTO workspace_invitations (id, workspace_id, email, role, token, invited_by, expires_at, created_at)
      VALUES (${id}, ${workspaceId}, ${input.email.toLowerCase()}, ${input.role}, ${tokenHash}, ${inviterId}, ${expiresAt}, ${now})
    `;

    // Send invitation email
    const inviterResult = await sql`SELECT name FROM users WHERE id = ${inviterId}`;
    const workspaceResult = await sql`SELECT name FROM workspaces WHERE id = ${workspaceId}`;
    const inviterName = inviterResult[0]?.name || 'Un membre';
    const workspaceName = workspaceResult[0]?.name || 'Workspace';
    EmailService.sendWorkspaceInvitation(input.email, inviterName, workspaceName, token).catch(err => {
      console.error('[WorkspacesService] Failed to send invitation email:', err);
    });

    return { token, invitation_id: id };
  }

  async acceptInvitation(token: string, userId: UUID): Promise<Workspace> {
    const tokenHash = hashToken(token);

    const invitations = await sql`
      SELECT * FROM workspace_invitations
      WHERE token = ${tokenHash}
        AND accepted_at IS NULL
    `;

    if (invitations.length === 0) {
      throw AppError.badRequest('Invalid or expired invitation');
    }

    const invitation = invitations[0];

    if (new Date(invitation.expires_at) < new Date()) {
      throw AppError.badRequest('Invitation has expired');
    }

    // Check if user is already a member
    const existingMember = await sql`
      SELECT user_id FROM workspace_members
      WHERE workspace_id = ${invitation.workspace_id} AND user_id = ${userId}
    `;
    if (existingMember.length > 0) {
      throw AppError.conflict('Already a member of this workspace');
    }

    const now = new Date();

    // Add user as member
    await sql`
      INSERT INTO workspace_members (workspace_id, user_id, role, invited_by, invited_at, joined_at)
      VALUES (${invitation.workspace_id}, ${userId}, ${invitation.role}, ${invitation.invited_by}, ${invitation.created_at}, ${now})
    `;

    // Mark invitation as accepted
    await sql`
      UPDATE workspace_invitations
      SET accepted_at = ${now}
      WHERE id = ${invitation.id}
    `;

    return this.getById(invitation.workspace_id);
  }

  async getInvitations(workspaceId: UUID): Promise<WorkspaceInvitationWithWorkspace[]> {
    const invitations = await sql`
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

    return invitations as unknown as WorkspaceInvitationWithWorkspace[];
  }

  async cancelInvitation(workspaceId: UUID, invitationId: UUID): Promise<void> {
    const result = await sql`
      DELETE FROM workspace_invitations
      WHERE id = ${invitationId} AND workspace_id = ${workspaceId} AND accepted_at IS NULL
    `;

    if (result.count === 0) {
      throw AppError.notFound('Invitation');
    }
  }

  async leave(workspaceId: UUID, userId: UUID): Promise<void> {
    const member = await this.getMember(workspaceId, userId);
    if (!member) {
      throw AppError.notFound('Member');
    }
    if (member.role === 'owner') {
      throw AppError.forbidden('Owner cannot leave workspace. Transfer ownership first.');
    }

    await sql`
      DELETE FROM workspace_members
      WHERE workspace_id = ${workspaceId} AND user_id = ${userId}
    `;
  }

  async transferOwnership(workspaceId: UUID, currentOwnerId: UUID, newOwnerId: UUID): Promise<void> {
    // Verify current owner
    const currentOwner = await this.getMember(workspaceId, currentOwnerId);
    if (!currentOwner || currentOwner.role !== 'owner') {
      throw AppError.forbidden('Only the owner can transfer ownership');
    }

    // Verify new owner is a member
    const newOwner = await this.getMember(workspaceId, newOwnerId);
    if (!newOwner) {
      throw AppError.notFound('New owner must be a member');
    }

    // Transfer ownership
    await sql`
      UPDATE workspace_members
      SET role = 'admin'
      WHERE workspace_id = ${workspaceId} AND user_id = ${currentOwnerId}
    `;

    await sql`
      UPDATE workspace_members
      SET role = 'owner'
      WHERE workspace_id = ${workspaceId} AND user_id = ${newOwnerId}
    `;

    await sql`
      UPDATE workspaces
      SET owner_id = ${newOwnerId}, updated_at = ${new Date()}
      WHERE id = ${workspaceId}
    `;
  }
}

export const workspacesService = new WorkspacesService();
