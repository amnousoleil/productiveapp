"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tasksController = exports.TasksController = void 0;
const tasks_service_js_1 = require("./tasks.service.js");
const helpers_js_1 = require("../../utils/helpers.js");
const validation_js_1 = require("../../utils/validation.js");
const zod_1 = require("zod");
const signals_service_js_1 = require("../signals/signals.service.js");
const listTasksSchema = validation_js_1.paginationSchema.extend({
    q: zod_1.z.string().optional(),
    project_id: validation_js_1.uuidSchema.nullable().optional(),
    assigned_to: validation_js_1.uuidSchema.nullable().optional(),
    user_id: validation_js_1.uuidSchema.nullable().optional(),
    status: zod_1.z.union([
        zod_1.z.enum(['todo', 'in_progress', 'review', 'done', 'blocked']),
        zod_1.z.array(zod_1.z.enum(['todo', 'in_progress', 'review', 'done', 'blocked'])),
    ]).optional(),
    priority: zod_1.z.union([
        zod_1.z.enum(['low', 'medium', 'high', 'urgent']),
        zod_1.z.array(zod_1.z.enum(['low', 'medium', 'high', 'urgent'])),
    ]).optional(),
    due_date_from: zod_1.z.string().datetime().optional(),
    due_date_to: zod_1.z.string().datetime().optional(),
    tags: zod_1.z.string().optional().transform((val) => val?.split(',').filter(Boolean)),
    parent_id: validation_js_1.uuidSchema.nullable().optional(),
});
const commentSchema = zod_1.z.object({
    content: zod_1.z.string().min(1).max(10000),
});
const reorderSchema = zod_1.z.object({
    task_ids: zod_1.z.array(validation_js_1.uuidSchema).min(1),
    status: zod_1.z.enum(['todo', 'in_progress', 'review', 'done', 'blocked']),
});
class TasksController {
    async create(req, res, next) {
        try {
            const workspaceId = req.workspace.id;
            const userId = req.user.id;
            const input = validation_js_1.createTaskSchema.parse(req.body);
            const task = await tasks_service_js_1.tasksService.create(workspaceId, userId, input);
            // Record behavioral signal
            (0, signals_service_js_1.recordSignalAsync)(userId, workspaceId, 'task_created', 'tasks', task.id, {
                project_id: task.project_id,
                priority: task.priority,
                title_length: task.title?.length || 0
            });
            res.status(201).json((0, helpers_js_1.successResponse)({ task }));
        }
        catch (error) {
            next(error);
        }
    }
    async getById(req, res, next) {
        try {
            const taskId = validation_js_1.uuidSchema.parse(req.params.taskId);
            const task = await tasks_service_js_1.tasksService.getByIdWithRelations(taskId);
            res.json((0, helpers_js_1.successResponse)({ task }));
        }
        catch (error) {
            next(error);
        }
    }
    async list(req, res, next) {
        try {
            const workspaceId = req.workspace.id;
            const userId = req.user.id;
            const params = listTasksSchema.parse(req.query);
            const { tasks, total } = await tasks_service_js_1.tasksService.list(workspaceId, userId, params);
            res.json((0, helpers_js_1.paginatedResponse)(tasks, params, total));
        }
        catch (error) {
            next(error);
        }
    }
    async getMyTasks(req, res, next) {
        try {
            const userId = req.user.id;
            const params = listTasksSchema.parse(req.query);
            const { tasks, total } = await tasks_service_js_1.tasksService.getMyTasks(userId, params);
            res.json((0, helpers_js_1.paginatedResponse)(tasks, params, total));
        }
        catch (error) {
            next(error);
        }
    }
    async update(req, res, next) {
        try {
            const taskId = validation_js_1.uuidSchema.parse(req.params.taskId);
            const userId = req.user.id;
            const input = validation_js_1.updateTaskSchema.parse(req.body);
            const task = await tasks_service_js_1.tasksService.update(taskId, input);
            // Get workspaceId from task (route may not have workspace middleware)
            const workspaceId = task.workspace_id;
            // Record task completion signal if status changed to done
            if (input.status === 'done' && workspaceId) {
                const hoursToComplete = task.created_at
                    ? Math.round((Date.now() - new Date(task.created_at).getTime()) / (1000 * 60 * 60))
                    : null;
                const wasOverdue = task.due_date ? new Date(task.due_date) < new Date() : false;
                (0, signals_service_js_1.recordSignalAsync)(userId, workspaceId, 'task_completed', 'tasks', task.id, {
                    project_id: task.project_id,
                    priority: task.priority,
                    created_to_done_hours: hoursToComplete,
                    was_overdue: wasOverdue
                });
            }
            res.json((0, helpers_js_1.successResponse)({ task }));
        }
        catch (error) {
            next(error);
        }
    }
    async delete(req, res, next) {
        try {
            const taskId = validation_js_1.uuidSchema.parse(req.params.taskId);
            const userId = req.user.id;
            // Get task info before deletion for signal
            const task = await tasks_service_js_1.tasksService.getById(taskId);
            const workspaceId = task?.workspace_id;
            const daysSinceCreated = task?.created_at
                ? Math.round((Date.now() - new Date(task.created_at).getTime()) / (1000 * 60 * 60 * 24))
                : null;
            await tasks_service_js_1.tasksService.delete(taskId);
            // Record task abandoned signal
            if (workspaceId) {
                (0, signals_service_js_1.recordSignalAsync)(userId, workspaceId, 'task_abandoned', 'tasks', taskId, {
                    project_id: task?.project_id,
                    priority: task?.priority,
                    days_since_created: daysSinceCreated
                });
            }
            res.json((0, helpers_js_1.successResponse)({ message: 'Task deleted' }));
        }
        catch (error) {
            next(error);
        }
    }
    async getComments(req, res, next) {
        try {
            const taskId = validation_js_1.uuidSchema.parse(req.params.taskId);
            const params = validation_js_1.paginationSchema.parse(req.query);
            const { comments, total } = await tasks_service_js_1.tasksService.getComments(taskId, params);
            res.json((0, helpers_js_1.paginatedResponse)(comments, params, total));
        }
        catch (error) {
            next(error);
        }
    }
    async addComment(req, res, next) {
        try {
            const taskId = validation_js_1.uuidSchema.parse(req.params.taskId);
            const userId = req.user.id;
            const input = commentSchema.parse(req.body);
            const comment = await tasks_service_js_1.tasksService.addComment(taskId, userId, input);
            res.status(201).json((0, helpers_js_1.successResponse)({ comment }));
        }
        catch (error) {
            next(error);
        }
    }
    async updateComment(req, res, next) {
        try {
            const commentId = validation_js_1.uuidSchema.parse(req.params.commentId);
            const userId = req.user.id;
            const { content } = commentSchema.parse(req.body);
            const comment = await tasks_service_js_1.tasksService.updateComment(commentId, userId, content);
            res.json((0, helpers_js_1.successResponse)({ comment }));
        }
        catch (error) {
            next(error);
        }
    }
    async deleteComment(req, res, next) {
        try {
            const commentId = validation_js_1.uuidSchema.parse(req.params.commentId);
            const userId = req.user.id;
            await tasks_service_js_1.tasksService.deleteComment(commentId, userId);
            res.json((0, helpers_js_1.successResponse)({ message: 'Comment deleted' }));
        }
        catch (error) {
            next(error);
        }
    }
    async reorder(req, res, next) {
        try {
            const workspaceId = req.workspace.id;
            const { task_ids, status } = reorderSchema.parse(req.body);
            await tasks_service_js_1.tasksService.reorder(workspaceId, task_ids, status);
            res.json((0, helpers_js_1.successResponse)({ message: 'Tasks reordered' }));
        }
        catch (error) {
            next(error);
        }
    }
    async getSubtasks(req, res, next) {
        try {
            const taskId = validation_js_1.uuidSchema.parse(req.params.taskId);
            const subtasks = await tasks_service_js_1.tasksService.getSubtasks(taskId);
            res.json((0, helpers_js_1.successResponse)({ subtasks }));
        }
        catch (error) {
            next(error);
        }
    }
    async getDueSoon(req, res, next) {
        try {
            const workspaceId = req.workspace.id;
            const userId = req.user.id;
            const days = parseInt(req.query.days) || 7;
            const tasks = await tasks_service_js_1.tasksService.getDueSoon(workspaceId, userId, days);
            res.json((0, helpers_js_1.successResponse)({ tasks }));
        }
        catch (error) {
            next(error);
        }
    }
    async getOverdue(req, res, next) {
        try {
            const workspaceId = req.workspace.id;
            const userId = req.user.id;
            const tasks = await tasks_service_js_1.tasksService.getOverdue(workspaceId, userId);
            res.json((0, helpers_js_1.successResponse)({ tasks }));
        }
        catch (error) {
            next(error);
        }
    }
    /**
     * Get users with at least one task in_progress (active users)
     * Used for real-time activity visualization / implicit time tracking
     */
    async getActiveUsers(req, res, next) {
        try {
            const workspaceId = req.workspace.id;
            const activeUsers = await tasks_service_js_1.tasksService.getActiveUsers(workspaceId);
            res.json((0, helpers_js_1.successResponse)({ active_users: activeUsers }));
        }
        catch (error) {
            next(error);
        }
    }
}
exports.TasksController = TasksController;
exports.tasksController = new TasksController();
//# sourceMappingURL=tasks.controller.js.map