import { sql } from '../../config/database.js';
import { generateUUID, AppError, calculateOffset } from '../../utils/helpers.js';
import type { UUID, Task, PaginationParams } from '../../types/index.js';
import type {
  CreateTaskInput,
  UpdateTaskInput,
  TaskWithRelations,
  TaskComment,
  TaskSearchParams,
  CreateCommentInput,
} from './tasks.types.js';
import { notifyTaskAssigned } from '../mail/notifications.js';

export class TasksService {
  async create(workspaceId: UUID, userId: UUID, input: CreateTaskInput): Promise<Task> {
    const id = generateUUID();
    const now = new Date();

    // Get max position
    const maxPos = await sql`
      SELECT COALESCE(MAX(position), -1) + 1 as pos
      FROM tasks
      WHERE workspace_id = ${workspaceId}
        AND project_id IS NOT DISTINCT FROM ${input.project_id || null}
        AND parent_id IS NOT DISTINCT FROM ${input.parent_id || null}
        AND status = ${input.status || 'todo'}
    `;

    const tasks = await sql`
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

    const createdTask = tasks[0] as Task;

    // HOOK: Send email notification if task is assigned
    if (input.assigned_to) {
      try {
        // Get assignee user info
        const assigneeData = await sql`
          SELECT id, email, name FROM users WHERE id = ${input.assigned_to}
        `;

        // Get project name
        let projectName = 'Sans projet';
        if (input.project_id) {
          const projectData = await sql`
            SELECT name FROM projects WHERE id = ${input.project_id}
          `;
          if (projectData.length > 0) projectName = projectData[0].name;
        }

        // Get assigner name
        const assignerData = await sql`
          SELECT name FROM users WHERE id = ${userId}
        `;
        const assignedBy = assignerData.length > 0 ? assignerData[0].name : 'Un membre';

        if (assigneeData.length > 0) {
          const assignee = assigneeData[0];

          // Send notification asynchronously (don't wait)
          notifyTaskAssigned({
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
      } catch (err) {
        console.error('[Tasks] Error in email notification hook:', err);
        // Don't fail task creation if email fails
      }
    }

    return createdTask;
  }

  async getById(taskId: UUID): Promise<Task> {
    const tasks = await sql`SELECT * FROM tasks WHERE id = ${taskId}`;

    if (tasks.length === 0) {
      throw AppError.notFound('Task');
    }

    return tasks[0] as Task;
  }

  async getByIdWithRelations(taskId: UUID): Promise<TaskWithRelations> {
    const tasks = await sql`
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
      throw AppError.notFound('Task');
    }

    return tasks[0] as TaskWithRelations;
  }

  async list(
    workspaceId: UUID,
    _userId: UUID,
    params: TaskSearchParams
  ): Promise<{ tasks: TaskWithRelations[]; total: number }> {
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const offset = calculateOffset(page, limit);
    const sortBy = params.sortBy || 'position';
    const sortOrder = params.sortOrder || 'asc';

    let conditions = sql`t.workspace_id = ${workspaceId}`;

    if (params.q) {
      const searchPattern = `%${params.q}%`;
      conditions = sql`${conditions} AND (t.title ILIKE ${searchPattern} OR t.description ILIKE ${searchPattern})`;
    }

    if (params.project_id !== undefined) {
      conditions = sql`${conditions} AND t.project_id IS NOT DISTINCT FROM ${params.project_id}`;
    }

    if (params.assigned_to !== undefined) {
      conditions = sql`${conditions} AND t.assigned_to IS NOT DISTINCT FROM ${params.assigned_to}`;
    }

    if (params.user_id !== undefined && params.user_id !== null) {
      conditions = sql`${conditions} AND (t.user_id = ${params.user_id} OR t.assigned_to = ${params.user_id})`;
    }

    if (params.status) {
      const statuses = Array.isArray(params.status) ? params.status : [params.status];
      conditions = sql`${conditions} AND t.status = ANY(${statuses})`;
    }

    if (params.priority) {
      const priorities = Array.isArray(params.priority) ? params.priority : [params.priority];
      conditions = sql`${conditions} AND t.priority = ANY(${priorities})`;
    }

    if (params.due_date_from) {
      conditions = sql`${conditions} AND t.due_date >= ${params.due_date_from}`;
    }

    if (params.due_date_to) {
      conditions = sql`${conditions} AND t.due_date <= ${params.due_date_to}`;
    }

    if (params.tags && params.tags.length > 0) {
      conditions = sql`${conditions} AND t.tags && ${params.tags}`;
    }

    if (params.parent_id !== undefined) {
      conditions = sql`${conditions} AND t.parent_id IS NOT DISTINCT FROM ${params.parent_id}`;
    }

    const tasks = await sql`
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
      ORDER BY t.status != 'done', ${sql.unsafe(sortBy)} ${sql.unsafe(sortOrder)}
      LIMIT ${limit} OFFSET ${offset}
    `;

    const countResult = await sql`
      SELECT COUNT(*)::int as count
      FROM tasks t
      WHERE ${conditions}
    `;

    return {
      tasks: tasks as unknown as TaskWithRelations[],
      total: countResult[0].count,
    };
  }

  async getMyTasks(
    userId: UUID,
    params: TaskSearchParams
  ): Promise<{ tasks: TaskWithRelations[]; total: number }> {
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const offset = calculateOffset(page, limit);

    let statusCondition = sql`t.status != 'done'`;
    if (params.status) {
      const statuses = Array.isArray(params.status) ? params.status : [params.status];
      statusCondition = sql`t.status = ANY(${statuses})`;
    }

    const tasks = await sql`
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

    const countResult = await sql`
      SELECT COUNT(*)::int as count
      FROM tasks t
      WHERE (t.assigned_to = ${userId} OR t.user_id = ${userId})
        AND ${statusCondition}
    `;

    return {
      tasks: tasks as unknown as TaskWithRelations[],
      total: countResult[0].count,
    };
  }

  async update(taskId: UUID, input: UpdateTaskInput): Promise<Task> {
    const updates: Record<string, unknown> = { updated_at: new Date() };

    if (input.title !== undefined) updates.title = input.title;
    if (input.description !== undefined) updates.description = input.description;
    if (input.project_id !== undefined) updates.project_id = input.project_id;
    if (input.assigned_to !== undefined) updates.assigned_to = input.assigned_to;
    if (input.parent_id !== undefined) updates.parent_id = input.parent_id;
    if (input.status !== undefined) {
      updates.status = input.status;
      if (input.status === 'done') {
        updates.completed_at = new Date();
      } else {
        updates.completed_at = null;
      }
    }
    if (input.priority !== undefined) updates.priority = input.priority;
    if (input.due_date !== undefined) updates.due_date = input.due_date;
    if (input.start_date !== undefined) updates.start_date = input.start_date;
    if (input.estimated_minutes !== undefined) updates.estimated_minutes = input.estimated_minutes;
    if (input.actual_minutes !== undefined) updates.actual_minutes = input.actual_minutes;
    if (input.tags !== undefined) updates.tags = input.tags;
    if (input.checklist !== undefined) updates.checklist = JSON.stringify(input.checklist);
    if (input.position !== undefined) updates.position = input.position;

    const fields = Object.keys(updates);
    const tasks = await sql`
      UPDATE tasks
      SET ${sql(updates, ...fields)}
      WHERE id = ${taskId}
      RETURNING *
    `;

    if (tasks.length === 0) {
      throw AppError.notFound('Task');
    }

    return tasks[0] as Task;
  }

  async delete(taskId: UUID): Promise<void> {
    await sql`DELETE FROM tasks WHERE id = ${taskId}`;
  }

  async getComments(taskId: UUID, params: PaginationParams): Promise<{ comments: TaskComment[]; total: number }> {
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const offset = calculateOffset(page, limit);

    const comments = await sql`
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

    const countResult = await sql`
      SELECT COUNT(*)::int as count FROM task_comments WHERE task_id = ${taskId}
    `;

    return {
      comments: comments as unknown as TaskComment[],
      total: countResult[0].count,
    };
  }

  async addComment(taskId: UUID, userId: UUID, input: CreateCommentInput): Promise<TaskComment> {
    const id = generateUUID();
    const now = new Date();

    await sql`
      INSERT INTO task_comments (id, task_id, user_id, content, created_at, updated_at)
      VALUES (${id}, ${taskId}, ${userId}, ${input.content}, ${now}, ${now})
    `;

    const comments = await sql`
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

    return comments[0] as TaskComment;
  }

  async updateComment(commentId: UUID, userId: UUID, content: string): Promise<TaskComment> {
    const comments = await sql`
      UPDATE task_comments
      SET content = ${content}, updated_at = ${new Date()}
      WHERE id = ${commentId} AND user_id = ${userId}
      RETURNING *
    `;

    if (comments.length === 0) {
      throw AppError.notFound('Comment');
    }

    const result = await sql`
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

    return result[0] as TaskComment;
  }

  async deleteComment(commentId: UUID, userId: UUID): Promise<void> {
    const result = await sql`
      DELETE FROM task_comments
      WHERE id = ${commentId} AND user_id = ${userId}
    `;

    if (result.count === 0) {
      throw AppError.notFound('Comment');
    }
  }

  async reorder(workspaceId: UUID, taskIds: UUID[], status: string): Promise<void> {
    for (let i = 0; i < taskIds.length; i++) {
      await sql`
        UPDATE tasks
        SET position = ${i}, status = ${status}
        WHERE id = ${taskIds[i]} AND workspace_id = ${workspaceId}
      `;
    }
  }

  async getSubtasks(taskId: UUID): Promise<Task[]> {
    const tasks = await sql`
      SELECT * FROM tasks WHERE parent_id = ${taskId}
      ORDER BY position, created_at
    `;

    return tasks as unknown as Task[];
  }

  async getDueSoon(workspaceId: UUID, userId: UUID, days: number = 7): Promise<Task[]> {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + days);

    const tasks = await sql`
      SELECT * FROM tasks
      WHERE workspace_id = ${workspaceId}
        AND (assigned_to = ${userId} OR user_id = ${userId})
        AND status != 'done'
        AND due_date IS NOT NULL
        AND due_date <= ${dueDate}
      ORDER BY due_date
    `;

    return tasks as unknown as Task[];
  }

  async getOverdue(workspaceId: UUID, userId: UUID): Promise<Task[]> {
    const tasks = await sql`
      SELECT * FROM tasks
      WHERE workspace_id = ${workspaceId}
        AND (assigned_to = ${userId} OR user_id = ${userId})
        AND status != 'done'
        AND due_date IS NOT NULL
        AND due_date < NOW()
      ORDER BY due_date
    `;

    return tasks as unknown as Task[];
  }

  /**
   * Reset all in_progress tasks to todo when user logs out
   * This provides implicit time tracking - no in_progress tasks = employee not active
   */
  async resetUserTasksOnLogout(userId: UUID): Promise<number> {
    const result = await sql`
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
  async getActiveUsers(workspaceId: UUID): Promise<{ id: string; name: string; email: string; avatar_url: string | null; active_tasks_count: number }[]> {
    const users = await sql`
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

    return users as unknown as { id: string; name: string; email: string; avatar_url: string | null; active_tasks_count: number }[];
  }
}

export const tasksService = new TasksService();
