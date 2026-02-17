import type { UUID, Task, PaginationParams } from '../../types/index.js';
import type { CreateTaskInput, UpdateTaskInput, TaskWithRelations, TaskComment, TaskSearchParams, CreateCommentInput } from './tasks.types.js';
export declare class TasksService {
    create(workspaceId: UUID, userId: UUID, input: CreateTaskInput): Promise<Task>;
    getById(taskId: UUID): Promise<Task>;
    getByIdWithRelations(taskId: UUID): Promise<TaskWithRelations>;
    list(workspaceId: UUID, _userId: UUID, params: TaskSearchParams): Promise<{
        tasks: TaskWithRelations[];
        total: number;
    }>;
    getMyTasks(userId: UUID, params: TaskSearchParams): Promise<{
        tasks: TaskWithRelations[];
        total: number;
    }>;
    update(taskId: UUID, input: UpdateTaskInput): Promise<Task>;
    delete(taskId: UUID): Promise<void>;
    getComments(taskId: UUID, params: PaginationParams): Promise<{
        comments: TaskComment[];
        total: number;
    }>;
    addComment(taskId: UUID, userId: UUID, input: CreateCommentInput): Promise<TaskComment>;
    updateComment(commentId: UUID, userId: UUID, content: string): Promise<TaskComment>;
    deleteComment(commentId: UUID, userId: UUID): Promise<void>;
    reorder(workspaceId: UUID, taskIds: UUID[], status: string): Promise<void>;
    getSubtasks(taskId: UUID): Promise<Task[]>;
    getDueSoon(workspaceId: UUID, userId: UUID, days?: number): Promise<Task[]>;
    getOverdue(workspaceId: UUID, userId: UUID): Promise<Task[]>;
    /**
     * Reset all in_progress tasks to todo when user logs out
     * This provides implicit time tracking - no in_progress tasks = employee not active
     */
    resetUserTasksOnLogout(userId: UUID): Promise<number>;
    /**
     * Get users who have at least one task in_progress (active users)
     * Used for real-time activity visualization
     */
    getActiveUsers(workspaceId: UUID): Promise<{
        id: string;
        name: string;
        email: string;
        avatar_url: string | null;
        active_tasks_count: number;
    }[]>;
}
export declare const tasksService: TasksService;
//# sourceMappingURL=tasks.service.d.ts.map