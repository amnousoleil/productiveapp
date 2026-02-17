import type { UUID, Canvas, PaginationParams } from '../../types/index.js';
import type { CreateCanvasInput, UpdateCanvasInput, CanvasWithCollaborators, AddCollaboratorInput } from './canvases.types.js';
export declare class CanvasesService {
    create(workspaceId: UUID, userId: UUID, input: CreateCanvasInput): Promise<Canvas>;
    getById(canvasId: UUID): Promise<Canvas>;
    getByIdWithCollaborators(canvasId: UUID): Promise<CanvasWithCollaborators>;
    list(workspaceId: UUID, userId: UUID, params: PaginationParams & {
        project_id?: UUID | null;
        is_template?: boolean;
    }): Promise<{
        canvases: Canvas[];
        total: number;
    }>;
    update(canvasId: UUID, input: UpdateCanvasInput): Promise<Canvas>;
    delete(canvasId: UUID): Promise<void>;
    addCollaborator(canvasId: UUID, input: AddCollaboratorInput): Promise<void>;
    removeCollaborator(canvasId: UUID, userId: UUID): Promise<void>;
    updateLastAccessed(canvasId: UUID, userId: UUID): Promise<void>;
    canAccess(canvasId: UUID, userId: UUID): Promise<boolean>;
    canEdit(canvasId: UUID, userId: UUID): Promise<boolean>;
    duplicate(canvasId: UUID, userId: UUID, workspaceId: UUID): Promise<Canvas>;
    getTemplates(workspaceId: UUID): Promise<Canvas[]>;
}
export declare const canvasesService: CanvasesService;
//# sourceMappingURL=canvases.service.d.ts.map