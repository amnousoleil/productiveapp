import type { UUID, UserPublic, PaginationParams } from '../../types/index.js';
import type { UpdateUserInput, UserSearchParams, UserWithWorkspaces } from './users.types.js';
export declare class UsersService {
    getById(userId: UUID): Promise<UserPublic>;
    getByIdWithWorkspaces(userId: UUID): Promise<UserWithWorkspaces>;
    update(userId: UUID, input: UpdateUserInput): Promise<UserPublic>;
    search(params: UserSearchParams): Promise<{
        users: UserPublic[];
        total: number;
    }>;
    getWorkspaceMembers(workspaceId: UUID, params: PaginationParams): Promise<{
        members: (UserPublic & {
            role: string;
            joined_at: Date;
        })[];
        total: number;
    }>;
    deleteAccount(userId: UUID): Promise<void>;
}
export declare const usersService: UsersService;
//# sourceMappingURL=users.service.d.ts.map