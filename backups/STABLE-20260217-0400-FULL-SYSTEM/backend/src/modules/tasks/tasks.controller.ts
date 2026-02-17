import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../../types/index.js';
import { tasksService } from './tasks.service.js';
import { successResponse, paginatedResponse } from '../../utils/helpers.js';
import { createTaskSchema, updateTaskSchema, paginationSchema, uuidSchema } from '../../utils/validation.js';
import { z } from 'zod';
import { recordSignalAsync } from '../signals/signals.service.js';

const listTasksSchema = paginationSchema.extend({
  q: z.string().optional(),
  project_id: uuidSchema.nullable().optional(),
  assigned_to: uuidSchema.nullable().optional(),
  user_id: uuidSchema.nullable().optional(),
  status: z.union([
    z.enum(['todo', 'in_progress', 'review', 'done', 'blocked']),
    z.array(z.enum(['todo', 'in_progress', 'review', 'done', 'blocked'])),
  ]).optional(),
  priority: z.union([
    z.enum(['low', 'medium', 'high', 'urgent']),
    z.array(z.enum(['low', 'medium', 'high', 'urgent'])),
  ]).optional(),
  due_date_from: z.string().datetime().optional(),
  due_date_to: z.string().datetime().optional(),
  tags: z.string().optional().transform((val) => val?.split(',').filter(Boolean)),
  parent_id: uuidSchema.nullable().optional(),
});

const commentSchema = z.object({
  content: z.string().min(1).max(10000),
});

const reorderSchema = z.object({
  task_ids: z.array(uuidSchema).min(1),
  status: z.enum(['todo', 'in_progress', 'review', 'done', 'blocked']),
});

export class TasksController {
  async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.workspace!.id;
      const userId = req.user!.id;
      const input = createTaskSchema.parse(req.body);

      const task = await tasksService.create(workspaceId, userId, input);

      // Record behavioral signal
      recordSignalAsync(userId, workspaceId, 'task_created', 'tasks', task.id, {
        project_id: task.project_id,
        priority: task.priority,
        title_length: task.title?.length || 0
      });

      res.status(201).json(successResponse({ task }));
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const taskId = uuidSchema.parse(req.params.taskId);

      const task = await tasksService.getByIdWithRelations(taskId);

      res.json(successResponse({ task }));
    } catch (error) {
      next(error);
    }
  }

  async list(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.workspace!.id;
      const userId = req.user!.id;
      const params = listTasksSchema.parse(req.query);

      const { tasks, total } = await tasksService.list(workspaceId, userId, params);

      res.json(paginatedResponse(tasks, params, total));
    } catch (error) {
      next(error);
    }
  }

  async getMyTasks(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const params = listTasksSchema.parse(req.query);

      const { tasks, total } = await tasksService.getMyTasks(userId, params);

      res.json(paginatedResponse(tasks, params, total));
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const taskId = uuidSchema.parse(req.params.taskId);
      const userId = req.user!.id;
      const input = updateTaskSchema.parse(req.body);

      const task = await tasksService.update(taskId, input);
      // Get workspaceId from task (route may not have workspace middleware)
      const workspaceId = task.workspace_id;

      // Record task completion signal if status changed to done
      if (input.status === 'done' && workspaceId) {
        const hoursToComplete = task.created_at
          ? Math.round((Date.now() - new Date(task.created_at).getTime()) / (1000 * 60 * 60))
          : null;
        const wasOverdue = task.due_date ? new Date(task.due_date) < new Date() : false;

        recordSignalAsync(userId, workspaceId, 'task_completed', 'tasks', task.id, {
          project_id: task.project_id,
          priority: task.priority,
          created_to_done_hours: hoursToComplete,
          was_overdue: wasOverdue
        });
      }

      res.json(successResponse({ task }));
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const taskId = uuidSchema.parse(req.params.taskId);
      const userId = req.user!.id;

      // Get task info before deletion for signal
      const task = await tasksService.getById(taskId);
      const workspaceId = task?.workspace_id;
      const daysSinceCreated = task?.created_at
        ? Math.round((Date.now() - new Date(task.created_at).getTime()) / (1000 * 60 * 60 * 24))
        : null;

      await tasksService.delete(taskId);

      // Record task abandoned signal
      if (workspaceId) {
        recordSignalAsync(userId, workspaceId, 'task_abandoned', 'tasks', taskId, {
          project_id: task?.project_id,
          priority: task?.priority,
          days_since_created: daysSinceCreated
        });
      }

      res.json(successResponse({ message: 'Task deleted' }));
    } catch (error) {
      next(error);
    }
  }

  async getComments(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const taskId = uuidSchema.parse(req.params.taskId);
      const params = paginationSchema.parse(req.query);

      const { comments, total } = await tasksService.getComments(taskId, params);

      res.json(paginatedResponse(comments, params, total));
    } catch (error) {
      next(error);
    }
  }

  async addComment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const taskId = uuidSchema.parse(req.params.taskId);
      const userId = req.user!.id;
      const input = commentSchema.parse(req.body);

      const comment = await tasksService.addComment(taskId, userId, input);

      res.status(201).json(successResponse({ comment }));
    } catch (error) {
      next(error);
    }
  }

  async updateComment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const commentId = uuidSchema.parse(req.params.commentId);
      const userId = req.user!.id;
      const { content } = commentSchema.parse(req.body);

      const comment = await tasksService.updateComment(commentId, userId, content);

      res.json(successResponse({ comment }));
    } catch (error) {
      next(error);
    }
  }

  async deleteComment(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const commentId = uuidSchema.parse(req.params.commentId);
      const userId = req.user!.id;

      await tasksService.deleteComment(commentId, userId);

      res.json(successResponse({ message: 'Comment deleted' }));
    } catch (error) {
      next(error);
    }
  }

  async reorder(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.workspace!.id;
      const { task_ids, status } = reorderSchema.parse(req.body);

      await tasksService.reorder(workspaceId, task_ids, status);

      res.json(successResponse({ message: 'Tasks reordered' }));
    } catch (error) {
      next(error);
    }
  }

  async getSubtasks(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const taskId = uuidSchema.parse(req.params.taskId);

      const subtasks = await tasksService.getSubtasks(taskId);

      res.json(successResponse({ subtasks }));
    } catch (error) {
      next(error);
    }
  }

  async getDueSoon(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.workspace!.id;
      const userId = req.user!.id;
      const days = parseInt(req.query.days as string) || 7;

      const tasks = await tasksService.getDueSoon(workspaceId, userId, days);

      res.json(successResponse({ tasks }));
    } catch (error) {
      next(error);
    }
  }

  async getOverdue(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.workspace!.id;
      const userId = req.user!.id;

      const tasks = await tasksService.getOverdue(workspaceId, userId);

      res.json(successResponse({ tasks }));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get users with at least one task in_progress (active users)
   * Used for real-time activity visualization / implicit time tracking
   */
  async getActiveUsers(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.workspace!.id;

      const activeUsers = await tasksService.getActiveUsers(workspaceId);

      res.json(successResponse({ active_users: activeUsers }));
    } catch (error) {
      next(error);
    }
  }
}

export const tasksController = new TasksController();
