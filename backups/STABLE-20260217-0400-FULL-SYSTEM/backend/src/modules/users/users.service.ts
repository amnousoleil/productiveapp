import { sql } from '../../config/database.js';
import { AppError, calculateOffset } from '../../utils/helpers.js';
import type { UUID, UserPublic, PaginationParams } from '../../types/index.js';
import type { UpdateUserInput, UserSearchParams, UserWithWorkspaces } from './users.types.js';

export class UsersService {
  async getById(userId: UUID): Promise<UserPublic> {
    const users = await sql`
      SELECT id, email, name, avatar_url, status, plan, language, timezone,
             created_at, updated_at, last_login_at, email_verified
      FROM users
      WHERE id = ${userId}
    `;

    if (users.length === 0) {
      throw AppError.notFound('User');
    }

    return users[0] as UserPublic;
  }

  async getByIdWithWorkspaces(userId: UUID): Promise<UserWithWorkspaces> {
    const user = await this.getById(userId);

    const workspaces = await sql`
      SELECT w.id, w.name, w.slug, wm.role
      FROM workspaces w
      INNER JOIN workspace_members wm ON w.id = wm.workspace_id
      WHERE wm.user_id = ${userId}
      ORDER BY w.name
    `;

    return {
      ...user,
      workspaces: workspaces as unknown as UserWithWorkspaces['workspaces'],
    };
  }

  async update(userId: UUID, input: UpdateUserInput): Promise<UserPublic> {
    const updates: string[] = [];
    const values: unknown[] = [];

    if (input.name !== undefined) {
      updates.push('name');
      values.push(input.name);
    }
    if (input.avatar_url !== undefined) {
      updates.push('avatar_url');
      values.push(input.avatar_url);
    }
    if (input.language !== undefined) {
      updates.push('language');
      values.push(input.language);
    }
    if (input.timezone !== undefined) {
      updates.push('timezone');
      values.push(input.timezone);
    }
    if (input.status !== undefined) {
      updates.push('status');
      values.push(input.status);
    }

    if (updates.length === 0) {
      return this.getById(userId);
    }

    const now = new Date();

    const users = await sql`
      UPDATE users
      SET ${sql(input as Record<string, unknown>, ...updates)},
          updated_at = ${now}
      WHERE id = ${userId}
      RETURNING id, email, name, avatar_url, status, plan, language, timezone,
                created_at, updated_at, last_login_at, email_verified
    `;

    if (users.length === 0) {
      throw AppError.notFound('User');
    }

    return users[0] as UserPublic;
  }

  async search(params: UserSearchParams): Promise<{ users: UserPublic[]; total: number }> {
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const offset = calculateOffset(page, limit);

    let users: UserPublic[];
    let total: number;

    if (params.workspace_id) {
      // Search users within a workspace
      if (params.q) {
        const searchPattern = `%${params.q}%`;
        users = await sql`
          SELECT u.id, u.email, u.name, u.avatar_url, u.status, u.plan,
                 u.language, u.timezone, u.created_at, u.updated_at,
                 u.last_login_at, u.email_verified
          FROM users u
          INNER JOIN workspace_members wm ON u.id = wm.user_id
          WHERE wm.workspace_id = ${params.workspace_id}
            AND (u.name ILIKE ${searchPattern} OR u.email ILIKE ${searchPattern})
          ORDER BY u.name
          LIMIT ${limit} OFFSET ${offset}
        ` as UserPublic[];

        const countResult = await sql`
          SELECT COUNT(*)::int as count
          FROM users u
          INNER JOIN workspace_members wm ON u.id = wm.user_id
          WHERE wm.workspace_id = ${params.workspace_id}
            AND (u.name ILIKE ${searchPattern} OR u.email ILIKE ${searchPattern})
        `;
        total = countResult[0].count;
      } else {
        users = await sql`
          SELECT u.id, u.email, u.name, u.avatar_url, u.status, u.plan,
                 u.language, u.timezone, u.created_at, u.updated_at,
                 u.last_login_at, u.email_verified
          FROM users u
          INNER JOIN workspace_members wm ON u.id = wm.user_id
          WHERE wm.workspace_id = ${params.workspace_id}
          ORDER BY u.name
          LIMIT ${limit} OFFSET ${offset}
        ` as UserPublic[];

        const countResult = await sql`
          SELECT COUNT(*)::int as count
          FROM users u
          INNER JOIN workspace_members wm ON u.id = wm.user_id
          WHERE wm.workspace_id = ${params.workspace_id}
        `;
        total = countResult[0].count;
      }
    } else if (params.q) {
      // Global search
      const searchPattern = `%${params.q}%`;
      users = await sql`
        SELECT id, email, name, avatar_url, status, plan, language, timezone,
               created_at, updated_at, last_login_at, email_verified
        FROM users
        WHERE name ILIKE ${searchPattern} OR email ILIKE ${searchPattern}
        ORDER BY name
        LIMIT ${limit} OFFSET ${offset}
      ` as UserPublic[];

      const countResult = await sql`
        SELECT COUNT(*)::int as count
        FROM users
        WHERE name ILIKE ${searchPattern} OR email ILIKE ${searchPattern}
      `;
      total = countResult[0].count;
    } else {
      throw AppError.badRequest('Search query or workspace_id is required');
    }

    return { users, total };
  }

  async getWorkspaceMembers(
    workspaceId: UUID,
    params: PaginationParams
  ): Promise<{ members: (UserPublic & { role: string; joined_at: Date })[]; total: number }> {
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const offset = calculateOffset(page, limit);

    const members = await sql`
      SELECT u.id, u.email, u.name, u.avatar_url, u.status, u.plan,
             u.language, u.timezone, u.created_at, u.updated_at,
             u.last_login_at, u.email_verified, wm.role, wm.joined_at
      FROM users u
      INNER JOIN workspace_members wm ON u.id = wm.user_id
      WHERE wm.workspace_id = ${workspaceId}
      ORDER BY wm.role, u.name
      LIMIT ${limit} OFFSET ${offset}
    `;

    const countResult = await sql`
      SELECT COUNT(*)::int as count
      FROM workspace_members
      WHERE workspace_id = ${workspaceId}
    `;

    return {
      members: members as unknown as (UserPublic & { role: string; joined_at: Date })[],
      total: countResult[0].count,
    };
  }

  async deleteAccount(userId: UUID): Promise<void> {
    // Soft delete - anonymize user data
    const now = new Date();
    const anonymizedEmail = `deleted_${userId}@deleted.local`;

    await sql`
      UPDATE users
      SET email = ${anonymizedEmail},
          name = 'Deleted User',
          avatar_url = NULL,
          status = 'offline',
          password_hash = '',
          updated_at = ${now}
      WHERE id = ${userId}
    `;

    // Delete all sessions
    await sql`DELETE FROM sessions WHERE user_id = ${userId}`;
  }
}

export const usersService = new UsersService();
