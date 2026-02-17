import type { UUID, Workspace, WorkspaceRole, PaginationParams } from '../../types/index.js';
import type { CreateWorkspaceInput, UpdateWorkspaceInput, InviteInput, WorkspaceWithMemberCount, WorkspaceMemberWithUser, WorkspaceInvitationWithWorkspace } from './workspaces.types.js';
export declare class WorkspacesService {
    create(userId: UUID, input: CreateWorkspaceInput): Promise<Workspace>;
    getById(workspaceId: UUID): Promise<Workspace>;
    getBySlug(slug: string): Promise<Workspace>;
    getUserWorkspaces(userId: UUID): Promise<WorkspaceWithMemberCount[]>;
    update(workspaceId: UUID, input: UpdateWorkspaceInput): Promise<Workspace>;
    delete(workspaceId: UUID): Promise<void>;
    getMembers(workspaceId: UUID, params: PaginationParams): Promise<{
        members: WorkspaceMemberWithUser[];
        total: number;
    }>;
    getMember(workspaceId: UUID, userId: UUID): Promise<WorkspaceMemberWithUser | null>;
    updateMemberRole(workspaceId: UUID, userId: UUID, role: WorkspaceRole): Promise<void>;
    removeMember(workspaceId: UUID, userId: UUID): Promise<void>;
    invite(workspaceId: UUID, inviterId: UUID, input: InviteInput): Promise<{
        token: string;
        invitation_id: UUID;
    }>;
    acceptInvitation(token: string, userId: UUID): Promise<Workspace>;
    getInvitations(workspaceId: UUID): Promise<WorkspaceInvitationWithWorkspace[]>;
    cancelInvitation(workspaceId: UUID, invitationId: UUID): Promise<void>;
    leave(workspaceId: UUID, userId: UUID): Promise<void>;
    transferOwnership(workspaceId: UUID, currentOwnerId: UUID, newOwnerId: UUID): Promise<void>;
}
export declare const workspacesService: WorkspacesService;
//# sourceMappingURL=workspaces.service.d.ts.map