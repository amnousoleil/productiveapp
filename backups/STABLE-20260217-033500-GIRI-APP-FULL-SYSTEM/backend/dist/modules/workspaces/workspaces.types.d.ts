import type { UUID, Workspace, WorkspaceMember, WorkspaceRole, WorkspaceSettings } from '../../types/index.js';
export interface CreateWorkspaceInput {
    name: string;
    slug?: string;
    icon?: string | null;
    settings?: WorkspaceSettings;
}
export interface UpdateWorkspaceInput {
    name?: string;
    slug?: string;
    icon?: string | null;
    settings?: WorkspaceSettings;
}
export interface InviteInput {
    email: string;
    role: WorkspaceRole;
}
export interface WorkspaceWithMemberCount extends Workspace {
    member_count: number;
}
export interface WorkspaceMemberWithUser extends WorkspaceMember {
    user: {
        id: UUID;
        name: string;
        email: string;
        avatar_url: string | null;
        status: string;
    };
}
export interface WorkspaceInvitationWithWorkspace {
    id: UUID;
    workspace_id: UUID;
    workspace_name: string;
    email: string;
    role: WorkspaceRole;
    invited_by: UUID;
    inviter_name: string;
    expires_at: Date;
    created_at: Date;
}
//# sourceMappingURL=workspaces.types.d.ts.map