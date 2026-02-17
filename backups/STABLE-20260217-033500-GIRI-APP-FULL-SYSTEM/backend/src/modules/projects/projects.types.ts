import type { UUID, Project, ProjectStatus, ProjectRole } from '../../types/index.js';

export interface CreateProjectInput {
  name: string;
  description?: string | null;
  color?: string | null;
  icon?: string | null;
  parent_id?: UUID | null;
  is_shared?: boolean;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string | null;
  color?: string | null;
  icon?: string | null;
  status?: ProjectStatus;
  is_shared?: boolean;
  is_favorite?: boolean;
  position?: number;
}

export interface ProjectWithStats extends Project {
  notes_count: number;
  tasks_count: number;
  tasks_completed: number;
  members_count: number;
}

export interface ProjectMemberWithUser {
  project_id: UUID;
  user_id: UUID;
  role: ProjectRole;
  added_at: Date;
  user: {
    id: UUID;
    name: string;
    email: string;
    avatar_url: string | null;
  };
}

export interface AddProjectMemberInput {
  user_id: UUID;
  role?: ProjectRole;
}
