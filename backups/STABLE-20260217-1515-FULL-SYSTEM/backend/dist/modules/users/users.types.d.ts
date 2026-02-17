import type { UUID, UserPublic, UserStatus } from '../../types/index.js';
export interface UpdateUserInput {
    name?: string;
    avatar_url?: string | null;
    language?: string;
    timezone?: string | null;
    status?: UserStatus;
}
export interface UserSearchParams {
    q?: string;
    workspace_id?: UUID;
    page?: number;
    limit?: number;
}
export interface UserWithWorkspaces extends UserPublic {
    workspaces: {
        id: UUID;
        name: string;
        slug: string;
        role: string;
    }[];
}
//# sourceMappingURL=users.types.d.ts.map