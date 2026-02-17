"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tasksService = exports.TasksService = void 0;
const database_js_1 = require("../../config/database.js");
const helpers_js_1 = require("../../utils/helpers.js");
const notifications_js_1 = require("../mail/notifications.js");
class TasksService {
    async create(workspaceId, userId, input) {
        const id = (0, helpers_js_1.generateUUID)();
        const now = new Date();
        // Get max position
        const maxPos = await (0, database_js_1.sql) `
      SELECT COALESCE(MAX(position), -1) + 1 as pos
      FROM tasks
      WHERE workspace_id = ${workspaceId}
        AND project_id IS NOT DISTINCT FROM ${input.project_id || null}
        AND parent_id IS NOT DISTINCT FROM ${input.parent_id || null}
        AND status = ${input.status || 'todo'}
    `;
        const tasks = await (0, database_js_1.sql) `
      INSERT INTO tasks (
        id, workspace_id, user_id, project_id, assigned_to, parent_id,
        title, description, status, priority, due_date, start_date,
        estimated_minutes, tags, checklist, position, created_at, updated_at
      )
      VALUES (
        ${id}, ${workspaceId}, ${userId}, ${input.project_id || null},
        ${input.assigned_to || null}, ${input.parent_id || null},
        ${input.title}, ${input.description || null}, ${input.status || 'todo'},
        ${input.priority || 'medium'}, ${input.due_date || null},
        ${input.start_date || null}, ${input.estimated_minutes || null},
        ${input.tags || []}, ${JSON.stringify(input.checklist || [])},
        ${maxPos[0].pos}, ${now}, ${now}
      )
      RETURNING *
    `;
        const createdTask = tasks[0];
        // HOOK: Send email notification if task is assigned
        if (input.assigned_to) {
            try {
                // Get assignee user info
                const assigneeData = await (0, database_js_1.sql) `
          SELECT id, email, name FROM users WHERE id = ${input.assigned_to}
        `;
                // Get project name
                let projectName = 'Sans projet';
                if (input.project_id) {
                    const projectData = await (0, database_js_1.sql) `
            SELECT name FROM projects WHERE id = ${input.project_id}
          `;
                    if (projectData.length > 0)
                        projectName = projectData[0].name;
                }
                // Get assigner name
                const assignerData = await (0, database_js_1.sql) `
          SELECT name FROM users WHERE id = ${userId}
        `;
                const assignedBy = assignerData.length > 0 ? assignerData[0].name : 'Un membre';
                if (assigneeData.length > 0) {
                    const assignee = assigneeData[0];
                    // Send notification asynchronously (don't wait)
                    (0, notifications_js_1.notifyTaskAssigned)({
                        userId: assignee.id,
                        workspaceId,
                        userEmail: assignee.email,
                        userName: assignee.name,
                        taskTitle: input.title,
                        taskDescription: input.description || '',
                        deadline: input.due_date || 'Aucune',
                        priority: input.priority || 'medium',
                        projectName,
                        assignedBy,
                        taskUrl: `${process.env.APP_URL || 'https://giri-app.com'}/tasks?id=${createdTask.id}`
                    }).catch(err => {
                        console.error('[Tasks] Failed to send assignment email:', err);
                    });
                }
            }
            catch (err) {
                console.error('[Tasks] Error in email notification hook:', err);
                // Don't fail task creation if email fails
            }
        }
        return createdTask;
    }
    async getById(taskId) {
        const tasks = await (0, database_js_1.sql) `SELECT * FROM tasks WHERE id = ${taskId}`;
        if (tasks.length === 0) {
            throw helpers_js_1.AppError.notFound('Task');
        }
        return tasks[0];
    }
    async getByIdWithRelations(taskId) {
        const tasks = await (0, database_js_1.sql) `
      SELECT t.*,
             CASE WHEN t.assigned_to IS NOT NULL THEN
               json_build_object(
                 'id', a.id,
                 'name', a.name,
                 'avatar_url', a.avatar_url
               )
             ELSE NULL END as assignee,
             json_build_object(
               'id', c.id,
               'name', c.name,
               'avatar_url', c.avatar_url
             ) as creator,
             CASE WHEN t.project_id IS NOT NULL THEN
               json_build_object(
                 'id', p.id,
                 'name', p.name,
                 'color', p.color
               )
             ELSE NULL END as project,
             COALESCE(st.total, 0)::int as subtasks_count,
             COALESCE(st.completed, 0)::int as subtasks_completed,
             COALESCE(cm.count, 0)::int as comments_count
      FROM tasks t
      LEFT JOIN users a ON t.assigned_to = a.id
      INNER JOIN users c ON t.user_id = c.id
      LEFT JOIN projects p ON t.project_id = p.id
      LEFT JOIN (
        SELECT parent_id, COUNT(*) as total, COUNT(*) FILTER (WHERE status = 'done') as completed
        FROM tasks
        WHERE parent_id IS NOT NULL
        GROUP BY parent_id
      ) st ON t.id = st.parent_id
      LEFT JOIN (
        SELECT task_id, COUNT(*) as count
        FROM task_comments
        GROUP BY task_id
      ) cm ON t.id = cm.task_id
      WHERE t.id = ${taskId}
    `;
        if (tasks.length === 0) {
            throw helpers_js_1.AppError.notFound('Task');
        }
        return tasks[0];
    }
    async list(workspaceId, _userId, params) {
        const page = params.page ?? 1;
        const limit = params.limit ?? 20;
        const offset = (0, helpers_js_1.calculateOffset)(page, limit);
        const sortBy = params.sortBy || 'position';
        const sortOrder = params.sortOrder || 'asc';
        let conditions = (0, database_js_1.sql) `t.workspace_id = ${workspaceId}`;
        if (params.q) {
            const searchPattern = `%${params.q}%`;
            conditions = (0, database_js_1.sql) `${conditions} AND (t.title ILIKE ${searchPattern} OR t.description ILIKE ${searchPattern})`;
        }
        if (params.project_id !== undefined) {
            conditions = (0, database_js_1.sql) `${conditions} AND t.project_id IS NOT DISTINCT FROM ${params.project_id}`;
        }
        if (params.assigned_to !== undefined) {
            conditions = (0, database_js_1.sql) `${conditions} AND t.assigned_to IS NOT DISTINCT FROM ${params.assigned_to}`;
        }
        if (params.user_id !== undefined && params.user_id !== null) {
            conditions = (0, database_js_1.sql) `${conditions} AND (t.user_id = ${params.user_id} OR t.assigned_to = ${params.user_id})`;
        }
        if (params.status) {
            const statuses = Array.isArray(params.status) ? params.status : [params.status];
            conditions = (0, database_js_1.sql) `${conditions} AND t.status = ANY(${statuses})`;
        }
        if (params.priority) {
            const priorities = Array.isArray(params.priority) ? params.priority : [params.priority];
            conditions = (0, database_js_1.sql) `${conditions} AND t.priority = ANY(${priorities})`;
        }
        if (params.due_date_from) {
            conditions = (0, database_js_1.sql) `${conditions} AND t.due_date >= ${params.due_date_from}`;
        }
        if (params.due_date_to) {
            conditions = (0, database_js_1.sql) `${conditions} AND t.due_date <= ${params.due_date_to}`;
        }
        if (params.tags && params.tags.length > 0) {
            conditions = (0, database_js_1.sql) `${conditions} AND t.tags && ${params.tags}`;
        }
        if (params.parent_id !== undefined) {
            conditions = (0, database_js_1.sql) `${conditions} AND t.parent_id IS NOT DISTINCT FROM ${params.parent_id}`;
        }
        const tasks = await (0, database_js_1.sql) `
      SELECT t.*,
             CASE WHEN t.assigned_to IS NOT NULL THEN
               json_build_object(
                 'id', a.id,
                 'name', a.name,
                 'avatar_url', a.avatar_url
               )
             ELSE NULL END as assignee,
             json_build_object(
               'id', c.id,
               'name', c.name,
               'avatar_url', c.avatar_url
             ) as creator,
             CASE WHEN t.project_id IS NOT NULL THEN
               json_build_object(
                 'id', p.id,
                 'name', p.name,
                 'color', p.color
               )
             ELSE NULL END as project,
             COALESCE(st.total, 0)::int as subtasks_count,
             COALESCE(st.completed, 0)::int as subtasks_completed,
             COALESCE(cm.count, 0)::int as comments_count
      FROM tasks t
      LEFT JOIN users a ON t.assigned_to = a.id
      INNER JOIN users c ON t.user_id = c.id
      LEFT JOIN projects p ON t.project_id = p.id
      LEFT JOIN (
        SELECT parent_id, COUNT(*) as total, COUNT(*) FILTER (WHERE status = 'done') as completed
        FROM tasks
        WHERE parent_id IS NOT NULL
        GROUP BY parent_id
      ) st ON t.id = st.parent_id
      LEFT JOIN (
        SELECT task_id, COUNT(*) as count
        FROM task_comments
        GROUP BY task_id
      ) cm ON t.id = cm.task_id
      WHERE ${conditions}
      ORDER BY t.status != 'done', ${database_js_1.sql.unsafe(sortBy)} ${database_js_1.sql.unsafe(sortOrder)}
      LIMIT ${limit} OFFSET ${offset}
    `;
        const countResult = await (0, database_js_1.sql) `
      SELECT COUNT(*)::int as count
      FROM tasks t
      WHERE ${conditions}
    `;
        return {
            tasks: tasks,
            total: countResult[0].count,
        };
    }
    async getMyTasks(userId, params) {
        const page = params.page ?? 1;
        const limit = params.limit ?? 20;
        const offset = (0, helpers_js_1.calculateOffset)(page, limit);
        let statusCondition = (0, database_js_1.sql) `t.status != 'done'`;
        if (params.status) {
            const statuses = Array.isArray(params.status) ? params.status : [params.status];
            statusCondition = (0, database_js_1.sql) `t.status = ANY(${statuses})`;
        }
        const tasks = await (0, database_js_1.sql) `
      SELECT t.*,
             CASE WHEN t.assigned_to IS NOT NULL THEN
               json_build_object(
                 'id', a.id,
                 'name', a.name,
                 'avatar_url', a.avatar_url
               )
             ELSE NULL END as assignee,
             json_build_object(
               'id', c.id,
               'name', c.name,
               'avatar_url', c.avatar_url
             ) as creator,
             CASE WHEN t.project_id IS NOT NULL THEN
               json_build_object(
                 'id', p.id,
                 'name', p.name,
                 'color', p.color
               )
             ELSE NULL END as project,
             0 as subtasks_count,
             0 as subtasks_completed,
             0 as comments_count
      FROM tasks t
      LEFT JOIN users a ON t.assigned_to = a.id
      INNER JOIN users c ON t.user_id = c.id
      LEFT JOIN projects p ON t.project_id = p.id
      WHERE (t.assigned_to = ${userId} OR t.user_id = ${userId})
        AND ${statusCondition}
      ORDER BY t.due_date NULLS LAST, t.priority DESC, t.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
        const countResult = await (0, database_js_1.sql) `
      SELECT COUNT(*)::int as count
      FROM tasks t
      WHERE (t.assigned_to = ${userId} OR t.user_id = ${userId})
        AND ${statusCondition}
    `;
        return {
            tasks: tasks,
            total: countResult[0].count,
        };
    }
    async update(taskId, input) {
        const updates = { updated_at: new Date() };
        if (input.title !== undefined)
            updates.title = input.title;
        if (input.description !== undefined)
            updates.description = input.description;
        if (input.project_id !== undefined)
            updates.project_id = input.project_id;
        if (input.assigned_to !== undefined)
            updates.assigned_to = input.assigned_to;
        if (input.parent_id !== undefined)
            updates.parent_id = input.parent_id;
        if (input.status !== undefined) {
            updates.status = input.status;
            if (input.status === 'done') {
                updates.completed_at = new Date();
            }
            else {
                updates.completed_at = null;
            }
        }
        if (input.priority !== undefined)
            updates.priority = input.priority;
        if (input.due_date !== undefined)
            updates.due_date = input.due_date;
        if (input.start_date !== undefined)
            updates.start_date = input.start_date;
        if (input.estimated_minutes !== undefined)
            updates.estimated_minutes = input.estimated_minutes;
        if (input.actual_minutes !== undefined)
            updates.actual_minutes = input.actual_minutes;
        if (input.tags !== undefined)
            updates.tags = input.tags;
        if (input.checklist !== undefined)
            updates.checklist = JSON.stringify(input.checklist);
        if (input.position !== undefined)
            updates.position = input.position;
        const fields = Object.keys(updates);
        const tasks = await (0, database_js_1.sql) `
      UPDATE tasks
      SET ${(0, database_js_1.sql)(updates, ...fields)}
      WHERE id = ${taskId}
      RETURNING *
    `;
        if (tasks.length === 0) {
            throw helpers_js_1.AppError.notFound('Task');
        }
        return tasks[0];
    }
    async delete(taskId) {
        await (0, database_js_1.sql) `DELETE FROM tasks WHERE id = ${taskId}`;
    }
    async getComments(taskId, params) {
        const page = params.page ?? 1;
        const limit = params.limit ?? 20;
        const offset = (0, helpers_js_1.calculateOffset)(page, limit);
        const comments = await (0, database_js_1.sql) `
      SELECT tc.*,
             json_build_object(
               'id', u.id,
               'name', u.name,
               'avatar_url', u.avatar_url
             ) as user
      FROM task_comments tc
      INNER JOIN users u ON tc.user_id = u.id
      WHERE tc.task_id = ${taskId}
      ORDER BY tc.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
        const countResult = await (0, database_js_1.sql) `
      SELECT COUNT(*)::int as count FROM task_comments WHERE task_id = ${taskId}
    `;
        return {
            comments: comments,
            total: countResult[0].count,
        };
    }
    async addComment(taskId, userId, input) {
        const id = (0, helpers_js_1.generateUUID)();
        const now = new Date();
        await (0, database_js_1.sql) `
      INSERT INTO task_comments (id, task_id, user_id, content, created_at, updated_at)
      VALUES (${id}, ${taskId}, ${userId}, ${input.content}, ${now}, ${now})
    `;
        const comments = await (0, database_js_1.sql) `
      SELECT tc.*,
             json_build_object(
               'id', u.id,
               'name', u.name,
               'avatar_url', u.avatar_url
             ) as user
      FROM task_comments tc
      INNER JOIN users u ON tc.user_id = u.id
      WHERE tc.id = ${id}
    `;
        return comments[0];
    }
    async updateComment(commentId, userId, content) {
        const comments = await (0, database_js_1.sql) `
      UPDATE task_comments
      SET content = ${content}, updated_at = ${new Date()}
      WHERE id = ${commentId} AND user_id = ${userId}
      RETURNING *
    `;
        if (comments.length === 0) {
            throw helpers_js_1.AppError.notFound('Comment');
        }
        const result = await (0, database_js_1.sql) `
      SELECT tc.*,
             json_build_object(
               'id', u.id,
               'name', u.name,
               'avatar_url', u.avatar_url
             ) as user
      FROM task_comments tc
      INNER JOIN users u ON tc.user_id = u.id
      WHERE tc.id = ${commentId}
    `;
        return result[0];
    }
    async deleteComment(commentId, userId) {
        const result = await (0, database_js_1.sql) `
      DELETE FROM task_comments
      WHERE id = ${commentId} AND user_id = ${userId}
    `;
        if (result.count === 0) {
            throw helpers_js_1.AppError.notFound('Comment');
        }
    }
    async reorder(workspaceId, taskIds, status) {
        for (let i = 0; i < taskIds.length; i++) {
            await (0, database_js_1.sql) `
        UPDATE tasks
        SET position = ${i}, status = ${status}
        WHERE id = ${taskIds[i]} AND workspace_id = ${workspaceId}
      `;
        }
    }
    async getSubtasks(taskId) {
        const tasks = await (0, database_js_1.sql) `
      SELECT * FROM tasks WHERE parent_id = ${taskId}
      ORDER BY position, created_at
    `;
        return tasks;
    }
    async getDueSoon(workspaceId, userId, days = 7) {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + days);
        const tasks = await (0, database_js_1.sql) `
      SELECT * FROM tasks
      WHERE workspace_id = ${workspaceId}
        AND (assigned_to = ${userId} OR user_id = ${userId})
        AND status != 'done'
        AND due_date IS NOT NULL
        AND due_date <= ${dueDate}
      ORDER BY due_date
    `;
        return tasks;
    }
    async getOverdue(workspaceId, userId) {
        const tasks = await (0, database_js_1.sql) `
      SELECT * FROM tasks
      WHERE workspace_id = ${workspaceId}
        AND (assigned_to = ${userId} OR user_id = ${userId})
        AND status != 'done'
        AND due_date IS NOT NULL
        AND due_date < NOW()
      ORDER BY due_date
    `;
        return tasks;
    }
    /**
     * Reset all in_progress tasks to todo when user logs out
     * This provides implicit time tracking - no in_progress tasks = employee not active
     */
    async resetUserTasksOnLogout(userId) {
        const result = await (0, database_js_1.sql) `
      UPDATE tasks
      SET status = 'todo', updated_at = NOW()
      WHERE assigned_to = ${userId}
        AND status = 'in_progress'
      RETURNING id
    `;
        return result.length;
    }
    /**
     * Get users who have at least one task in_progress (active users)
     * Used for real-time activity visualization
     */
    async getActiveUsers(workspaceId) {
        const users = await (0, database_js_1.sql) `
      SELECT
        u.id,
        u.name,
        u.email,
        u.avatar_url,
        COUNT(t.id)::int as active_tasks_count
      FROM users u
      INNER JOIN tasks t ON t.assigned_to = u.id
      WHERE t.workspace_id = ${workspaceId}
        AND t.status = 'in_progress'
      GROUP BY u.id, u.name, u.email, u.avatar_url
      ORDER BY active_tasks_count DESC
    `;
        return users;
    }
}
exports.TasksService = TasksService;
exports.tasksService = new TasksService();
//# sourceMappingURL=tasks.service.js.map