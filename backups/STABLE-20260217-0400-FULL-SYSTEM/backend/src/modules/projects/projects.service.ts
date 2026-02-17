import { sql } from '../../config/database.js';
import { generateUUID, AppError, calculateOffset } from '../../utils/helpers.js';
import type { UUID, Project, PaginationParams } from '../../types/index.js';
import type {
  CreateProjectInput,
  UpdateProjectInput,
  ProjectWithStats,
  ProjectMemberWithUser,
  AddProjectMemberInput,
} from './projects.types.js';

export class ProjectsService {
  async create(workspaceId: UUID, userId: UUID, input: CreateProjectInput): Promise<Project> {
    const id = generateUUID();
    const now = new Date();

    // Get max position
    const maxPos = await sql`
      SELECT COALESCE(MAX(position), -1) + 1 as pos
      FROM projects
      WHERE workspace_id = ${workspaceId} AND user_id = ${userId} AND parent_id IS NOT DISTINCT FROM ${input.parent_id || null}
    `;

    const projects = await sql`
      INSERT INTO projects (
        id, workspace_id, user_id, parent_id, name, description,
        color, icon, status, is_shared, is_favorite, position, created_at, updated_at
      )
      VALUES (
        ${id}, ${workspaceId}, ${userId}, ${input.parent_id || null},
        ${input.name}, ${input.description || null}, ${input.color || null},
        ${input.icon || null}, 'active', ${input.is_shared ?? false}, false,
        ${maxPos[0].pos}, ${now}, ${now}
      )
      RETURNING *
    `;

    // Add creator as owner
    await sql`
      INSERT INTO project_members (project_id, user_id, role, added_at)
      VALUES (${id}, ${userId}, 'owner', ${now})
    `;

    return projects[0] as Project;
  }

  async getById(projectId: UUID): Promise<Project> {
    const projects = await sql`
      SELECT * FROM projects WHERE id = ${projectId}
    `;

    if (projects.length === 0) {
      throw AppError.notFound('Project');
    }

    return projects[0] as Project;
  }

  async getByIdWithStats(projectId: UUID): Promise<ProjectWithStats> {
    const projects = await sql`
      SELECT p.*,
             COALESCE(n.count, 0)::int as notes_count,
             COALESCE(t.total, 0)::int as tasks_count,
             COALESCE(t.completed, 0)::int as tasks_completed,
             COALESCE(m.count, 0)::int as members_count
      FROM projects p
      LEFT JOIN (
        SELECT project_id, COUNT(*) as count
        FROM notes WHERE deleted_at IS NULL
        GROUP BY project_id
      ) n ON p.id = n.project_id
      LEFT JOIN (
        SELECT project_id, COUNT(*) as total, COUNT(*) FILTER (WHERE status = 'done') as completed
        FROM tasks
        GROUP BY project_id
      ) t ON p.id = t.project_id
      LEFT JOIN (
        SELECT project_id, COUNT(*) as count
        FROM project_members
        GROUP BY project_id
      ) m ON p.id = m.project_id
      WHERE p.id = ${projectId}
    `;

    if (projects.length === 0) {
      throw AppError.notFound('Project');
    }

    return projects[0] as ProjectWithStats;
  }

  async getWorkspaceProjects(
    workspaceId: UUID,
    userId: UUID,
    params: PaginationParams & { status?: string; parent_id?: UUID | null }
  ): Promise<{ projects: ProjectWithStats[]; total: number }> {
    const page = params.page ?? 1;
    const limit = params.limit ?? 50;
    const offset = calculateOffset(page, limit);
    const status = params.status || 'active';

    const projects = await sql`
      SELECT p.*,
             COALESCE(n.count, 0)::int as notes_count,
             COALESCE(t.total, 0)::int as tasks_count,
             COALESCE(t.completed, 0)::int as tasks_completed,
             COALESCE(m.count, 0)::int as members_count
      FROM projects p
      LEFT JOIN (
        SELECT project_id, COUNT(*) as count
        FROM notes WHERE deleted_at IS NULL
        GROUP BY project_id
      ) n ON p.id = n.project_id
      LEFT JOIN (
        SELECT project_id, COUNT(*) as total, COUNT(*) FILTER (WHERE status = 'done') as completed
        FROM tasks
        GROUP BY project_id
      ) t ON p.id = t.project_id
      LEFT JOIN (
        SELECT project_id, COUNT(*) as count
        FROM project_members
        GROUP BY project_id
      ) m ON p.id = m.project_id
      WHERE p.workspace_id = ${workspaceId}
        AND p.status = ${status}
        AND (p.user_id = ${userId} OR p.is_shared = true OR EXISTS (
          SELECT 1 FROM project_members pm WHERE pm.project_id = p.id AND pm.user_id = ${userId}
        ))
        AND p.parent_id IS NOT DISTINCT FROM ${params.parent_id ?? null}
      ORDER BY p.is_favorite DESC, p.position, p.name
      LIMIT ${limit} OFFSET ${offset}
    `;

    const countResult = await sql`
      SELECT COUNT(*)::int as count
      FROM projects p
      WHERE p.workspace_id = ${workspaceId}
        AND p.status = ${status}
        AND (p.user_id = ${userId} OR p.is_shared = true OR EXISTS (
          SELECT 1 FROM project_members pm WHERE pm.project_id = p.id AND pm.user_id = ${userId}
        ))
        AND p.parent_id IS NOT DISTINCT FROM ${params.parent_id ?? null}
    `;

    return {
      projects: projects as unknown as ProjectWithStats[],
      total: countResult[0].count,
    };
  }

  async getUserProjects(userId: UUID): Promise<ProjectWithStats[]> {
    const projects = await sql`
      SELECT DISTINCT p.*,
             COALESCE(n.count, 0)::int as notes_count,
             COALESCE(t.total, 0)::int as tasks_count,
             COALESCE(t.completed, 0)::int as tasks_completed,
             COALESCE(m.count, 0)::int as members_count
      FROM projects p
      LEFT JOIN (
        SELECT project_id, COUNT(*) as count
        FROM notes WHERE deleted_at IS NULL
        GROUP BY project_id
      ) n ON p.id = n.project_id
      LEFT JOIN (
        SELECT project_id, COUNT(*) as total, COUNT(*) FILTER (WHERE status = 'done') as completed
        FROM tasks
        GROUP BY project_id
      ) t ON p.id = t.project_id
      LEFT JOIN (
        SELECT project_id, COUNT(*) as count
        FROM project_members
        GROUP BY project_id
      ) m ON p.id = m.project_id
      LEFT JOIN project_members pm ON p.id = pm.project_id
      WHERE (p.user_id = ${userId} OR pm.user_id = ${userId})
        AND p.status = 'active'
      ORDER BY p.is_favorite DESC, p.position, p.name
    `;

    return projects as unknown as ProjectWithStats[];
  }

  async update(projectId: UUID, input: UpdateProjectInput): Promise<Project> {
    const updates: Record<string, unknown> = { updated_at: new Date() };

    if (input.name !== undefined) updates.name = input.name;
    if (input.description !== undefined) updates.description = input.description;
    if (input.color !== undefined) updates.color = input.color;
    if (input.icon !== undefined) updates.icon = input.icon;
    if (input.status !== undefined) updates.status = input.status;
    if (input.is_shared !== undefined) updates.is_shared = input.is_shared;
    if (input.is_favorite !== undefined) updates.is_favorite = input.is_favorite;
    if (input.position !== undefined) updates.position = input.position;

    const fields = Object.keys(updates);
    const projects = await sql`
      UPDATE projects
      SET ${sql(updates, ...fields)}
      WHERE id = ${projectId}
      RETURNING *
    `;

    if (projects.length === 0) {
      throw AppError.notFound('Project');
    }

    return projects[0] as Project;
  }

  async delete(projectId: UUID): Promise<void> {
    await sql`
      UPDATE projects
      SET status = 'deleted', updated_at = ${new Date()}
      WHERE id = ${projectId}
    `;
  }

  async archive(projectId: UUID): Promise<Project> {
    return this.update(projectId, { status: 'archived' });
  }

  async restore(projectId: UUID): Promise<Project> {
    return this.update(projectId, { status: 'active' });
  }

  async getMembers(projectId: UUID): Promise<ProjectMemberWithUser[]> {
    const members = await sql`
      SELECT pm.*,
             json_build_object(
               'id', u.id,
               'name', u.name,
               'email', u.email,
               'avatar_url', u.avatar_url
             ) as user
      FROM project_members pm
      INNER JOIN users u ON pm.user_id = u.id
      WHERE pm.project_id = ${projectId}
      ORDER BY pm.role, u.name
    `;

    return members as unknown as ProjectMemberWithUser[];
  }

  async addMember(projectId: UUID, input: AddProjectMemberInput): Promise<void> {
    const existing = await sql`
      SELECT user_id FROM project_members
      WHERE project_id = ${projectId} AND user_id = ${input.user_id}
    `;

    if (existing.length > 0) {
      throw AppError.conflict('User is already a member');
    }

    await sql`
      INSERT INTO project_members (project_id, user_id, role, added_at)
      VALUES (${projectId}, ${input.user_id}, ${input.role || 'viewer'}, ${new Date()})
    `;
  }

  async updateMemberRole(projectId: UUID, userId: UUID, role: string): Promise<void> {
    const member = await sql`
      SELECT role FROM project_members
      WHERE project_id = ${projectId} AND user_id = ${userId}
    `;

    if (member.length === 0) {
      throw AppError.notFound('Member');
    }

    if (member[0].role === 'owner') {
      throw AppError.forbidden('Cannot change owner role');
    }

    await sql`
      UPDATE project_members
      SET role = ${role}
      WHERE project_id = ${projectId} AND user_id = ${userId}
    `;
  }

  async removeMember(projectId: UUID, userId: UUID): Promise<void> {
    const member = await sql`
      SELECT role FROM project_members
      WHERE project_id = ${projectId} AND user_id = ${userId}
    `;

    if (member.length === 0) {
      throw AppError.notFound('Member');
    }

    if (member[0].role === 'owner') {
      throw AppError.forbidden('Cannot remove project owner');
    }

    await sql`
      DELETE FROM project_members
      WHERE project_id = ${projectId} AND user_id = ${userId}
    `;
  }

  async canAccess(projectId: UUID, userId: UUID): Promise<boolean> {
    const result = await sql`
      SELECT 1 FROM projects p
      LEFT JOIN project_members pm ON p.id = pm.project_id AND pm.user_id = ${userId}
      WHERE p.id = ${projectId}
        AND (p.user_id = ${userId} OR p.is_shared = true OR pm.user_id IS NOT NULL)
    `;

    return result.length > 0;
  }

  async reorder(workspaceId: UUID, userId: UUID, projectIds: UUID[]): Promise<void> {
    for (let i = 0; i < projectIds.length; i++) {
      await sql`
        UPDATE projects
        SET position = ${i}
        WHERE id = ${projectIds[i]}
          AND workspace_id = ${workspaceId}
          AND (user_id = ${userId} OR EXISTS (
            SELECT 1 FROM project_members WHERE project_id = ${projectIds[i]} AND user_id = ${userId}
          ))
      `;
    }
  }
}

export const projectsService = new ProjectsService();
