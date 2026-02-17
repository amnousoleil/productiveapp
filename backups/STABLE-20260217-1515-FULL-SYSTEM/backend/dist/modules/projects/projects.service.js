"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectsService = exports.ProjectsService = void 0;
const database_js_1 = require("../../config/database.js");
const helpers_js_1 = require("../../utils/helpers.js");
class ProjectsService {
    async create(workspaceId, userId, input) {
        const id = (0, helpers_js_1.generateUUID)();
        const now = new Date();
        // Get max position
        const maxPos = await (0, database_js_1.sql) `
      SELECT COALESCE(MAX(position), -1) + 1 as pos
      FROM projects
      WHERE workspace_id = ${workspaceId} AND user_id = ${userId} AND parent_id IS NOT DISTINCT FROM ${input.parent_id || null}
    `;
        const projects = await (0, database_js_1.sql) `
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
        await (0, database_js_1.sql) `
      INSERT INTO project_members (project_id, user_id, role, added_at)
      VALUES (${id}, ${userId}, 'owner', ${now})
    `;
        return projects[0];
    }
    async getById(projectId) {
        const projects = await (0, database_js_1.sql) `
      SELECT * FROM projects WHERE id = ${projectId}
    `;
        if (projects.length === 0) {
            throw helpers_js_1.AppError.notFound('Project');
        }
        return projects[0];
    }
    async getByIdWithStats(projectId) {
        const projects = await (0, database_js_1.sql) `
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
            throw helpers_js_1.AppError.notFound('Project');
        }
        return projects[0];
    }
    async getWorkspaceProjects(workspaceId, userId, params) {
        const page = params.page ?? 1;
        const limit = params.limit ?? 50;
        const offset = (0, helpers_js_1.calculateOffset)(page, limit);
        const status = params.status || 'active';
        const projects = await (0, database_js_1.sql) `
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
        const countResult = await (0, database_js_1.sql) `
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
            projects: projects,
            total: countResult[0].count,
        };
    }
    async getUserProjects(userId) {
        const projects = await (0, database_js_1.sql) `
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
        return projects;
    }
    async update(projectId, input) {
        const updates = { updated_at: new Date() };
        if (input.name !== undefined)
            updates.name = input.name;
        if (input.description !== undefined)
            updates.description = input.description;
        if (input.color !== undefined)
            updates.color = input.color;
        if (input.icon !== undefined)
            updates.icon = input.icon;
        if (input.status !== undefined)
            updates.status = input.status;
        if (input.is_shared !== undefined)
            updates.is_shared = input.is_shared;
        if (input.is_favorite !== undefined)
            updates.is_favorite = input.is_favorite;
        if (input.position !== undefined)
            updates.position = input.position;
        const fields = Object.keys(updates);
        const projects = await (0, database_js_1.sql) `
      UPDATE projects
      SET ${(0, database_js_1.sql)(updates, ...fields)}
      WHERE id = ${projectId}
      RETURNING *
    `;
        if (projects.length === 0) {
            throw helpers_js_1.AppError.notFound('Project');
        }
        return projects[0];
    }
    async delete(projectId) {
        await (0, database_js_1.sql) `
      UPDATE projects
      SET status = 'deleted', updated_at = ${new Date()}
      WHERE id = ${projectId}
    `;
    }
    async archive(projectId) {
        return this.update(projectId, { status: 'archived' });
    }
    async restore(projectId) {
        return this.update(projectId, { status: 'active' });
    }
    async getMembers(projectId) {
        const members = await (0, database_js_1.sql) `
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
        return members;
    }
    async addMember(projectId, input) {
        const existing = await (0, database_js_1.sql) `
      SELECT user_id FROM project_members
      WHERE project_id = ${projectId} AND user_id = ${input.user_id}
    `;
        if (existing.length > 0) {
            throw helpers_js_1.AppError.conflict('User is already a member');
        }
        await (0, database_js_1.sql) `
      INSERT INTO project_members (project_id, user_id, role, added_at)
      VALUES (${projectId}, ${input.user_id}, ${input.role || 'viewer'}, ${new Date()})
    `;
    }
    async updateMemberRole(projectId, userId, role) {
        const member = await (0, database_js_1.sql) `
      SELECT role FROM project_members
      WHERE project_id = ${projectId} AND user_id = ${userId}
    `;
        if (member.length === 0) {
            throw helpers_js_1.AppError.notFound('Member');
        }
        if (member[0].role === 'owner') {
            throw helpers_js_1.AppError.forbidden('Cannot change owner role');
        }
        await (0, database_js_1.sql) `
      UPDATE project_members
      SET role = ${role}
      WHERE project_id = ${projectId} AND user_id = ${userId}
    `;
    }
    async removeMember(projectId, userId) {
        const member = await (0, database_js_1.sql) `
      SELECT role FROM project_members
      WHERE project_id = ${projectId} AND user_id = ${userId}
    `;
        if (member.length === 0) {
            throw helpers_js_1.AppError.notFound('Member');
        }
        if (member[0].role === 'owner') {
            throw helpers_js_1.AppError.forbidden('Cannot remove project owner');
        }
        await (0, database_js_1.sql) `
      DELETE FROM project_members
      WHERE project_id = ${projectId} AND user_id = ${userId}
    `;
    }
    async canAccess(projectId, userId) {
        const result = await (0, database_js_1.sql) `
      SELECT 1 FROM projects p
      LEFT JOIN project_members pm ON p.id = pm.project_id AND pm.user_id = ${userId}
      WHERE p.id = ${projectId}
        AND (p.user_id = ${userId} OR p.is_shared = true OR pm.user_id IS NOT NULL)
    `;
        return result.length > 0;
    }
    async reorder(workspaceId, userId, projectIds) {
        for (let i = 0; i < projectIds.length; i++) {
            await (0, database_js_1.sql) `
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
exports.ProjectsService = ProjectsService;
exports.projectsService = new ProjectsService();
//# sourceMappingURL=projects.service.js.map