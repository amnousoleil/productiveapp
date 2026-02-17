import type { UUID, Canvas, CanvasPermission } from '../../types/index.js';
export interface CreateCanvasInput {
    name: string;
    project_id?: UUID | null;
    elements?: Record<string, unknown>;
    app_state?: Record<string, unknown>;
    is_template?: boolean;
    is_public?: boolean;
}
export interface UpdateCanvasInput {
    name?: string;
    project_id?: UUID | null;
    elements?: Record<string, unknown>;
    app_state?: Record<string, unknown>;
    thumbnail_url?: string | null;
    is_template?: boolean;
    is_public?: boolean;
}
export interface CanvasWithCollaborators extends Canvas {
    collaborators: {
        user_id: UUID;
        permission: CanvasPermission;
        user: {
            id: UUID;
            name: string;
            avatar_url: string | null;
        };
    }[];
    creator: {
        id: UUID;
        name: string;
        avatar_url: string | null;
    };
}
export interface AddCollaboratorInput {
    user_id: UUID;
    permission: CanvasPermission;
}
//# sourceMappingURL=canvases.types.d.ts.map