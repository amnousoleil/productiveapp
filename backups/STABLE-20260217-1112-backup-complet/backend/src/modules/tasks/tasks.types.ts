import type { UUID, Task, TaskStatus, TaskPriority, ChecklistItem } from '../../types/index.js';

export interface CreateTaskInput {
  title: string;
  description?: string | null;
  project_id?: UUID | null;
  assigned_to?: UUID | null;
  parent_id?: UUID | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  due_date?: string | null;
  start_date?: string | null;
  estimated_minutes?: number | null;
  tags?: string[];
  checklist?: ChecklistItem[];
}

export interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  project_id?: UUID | null;
  assigned_to?: UUID | null;
  parent_id?: UUID | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  due_date?: string | null;
  start_date?: string | null;
  estimated_minutes?: number | null;
  actual_minutes?: number | null;
  tags?: string[];
  checklist?: ChecklistItem[];
  position?: number;
}

export interface TaskWithRelations extends Task {
  assignee: {
    id: UUID;
    name: string;
    avatar_url: string | null;
  } | null;
  creator: {
    id: UUID;
    name: string;
    avatar_url: string | null;
  };
  project: {
    id: UUID;
    name: string;
    color: string | null;
  } | null;
  subtasks_count: number;
  subtasks_completed: number;
  comments_count: number;
}

export interface TaskComment {
  id: UUID;
  task_id: UUID;
  user_id: UUID;
  content: string;
  created_at: Date;
  updated_at: Date;
  user: {
    id: UUID;
    name: string;
    avatar_url: string | null;
  };
}

export interface TaskSearchParams {
  q?: string;
  project_id?: UUID | null;
  assigned_to?: UUID | null;
  user_id?: UUID | null;
  status?: TaskStatus | TaskStatus[];
  priority?: TaskPriority | TaskPriority[];
  due_date_from?: string;
  due_date_to?: string;
  tags?: string[];
  parent_id?: UUID | null;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateCommentInput {
  content: string;
}
