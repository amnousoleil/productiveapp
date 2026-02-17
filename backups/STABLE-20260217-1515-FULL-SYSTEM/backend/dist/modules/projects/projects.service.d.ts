import type { UUID, Project, PaginationParams } from '../../types/index.js';
import type { CreateProjectInput, UpdateProjectInput, ProjectWithStats, ProjectMemberWithUser, AddProjectMemberInput } from './projects.types.js';
export declare class ProjectsService {
    create(workspaceId: UUID, userId: UUID, input: CreateProjectInput): Promise<Project>;
    getById(projectId: UUID): Promise<Project>;
    getByIdWithStats(projectId: UUID): Promise<ProjectWithStats>;
    getWorkspaceProjects(workspaceId: UUID, userId: UUID, params: PaginationParams & {
        status?: string;
        parent_id?: UUID | null;
    }): Promise<{
        projects: ProjectWithStats[];
        total: number;
    }>;
    getUserProjects(userId: UUID): Promise<ProjectWithStats[]>;
    update(projectId: UUID, input: UpdateProjectInput): Promise<Project>;
    delete(projectId: UUID): Promise<void>;
    archive(projectId: UUID): Promise<Project>;
    restore(projectId: UUID): Promise<Project>;
    getMembers(projectId: UUID): Promise<ProjectMemberWithUser[]>;
    addMember(projectId: UUID, input: AddProjectMemberInput): Promise<void>;
    updateMemberRole(projectId: UUID, userId: UUID, role: string): Promise<void>;
    removeMember(projectId: UUID, userId: UUID): Promise<void>;
    canAccess(projectId: UUID, userId: UUID): Promise<boolean>;
    reorder(workspaceId: UUID, userId: UUID, projectIds: UUID[]): Promise<void>;
}
export declare const projectsService: ProjectsService;
//# sourceMappingURL=projects.service.d.ts.map