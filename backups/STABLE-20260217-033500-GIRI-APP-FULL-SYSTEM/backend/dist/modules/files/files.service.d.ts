import type { UUID, File } from '../../types/index.js';
import type { UploadFileInput, FileWithUploader, FileSearchParams } from './files.types.js';
export declare class FilesService {
    create(workspaceId: UUID, userId: UUID, input: UploadFileInput): Promise<File>;
    getById(fileId: UUID): Promise<File>;
    getByIdWithUploader(fileId: UUID): Promise<FileWithUploader>;
    list(workspaceId: UUID, params: FileSearchParams): Promise<{
        files: FileWithUploader[];
        total: number;
    }>;
    getByEntity(entityType: string, entityId: UUID): Promise<File[]>;
    delete(fileId: UUID): Promise<void>;
    deleteByEntity(entityType: string, entityId: UUID): Promise<void>;
    getStorageUsage(workspaceId: UUID): Promise<{
        total_size: number;
        file_count: number;
    }>;
    getUserStorageUsage(userId: UUID): Promise<{
        total_size: number;
        file_count: number;
    }>;
}
export declare const filesService: FilesService;
//# sourceMappingURL=files.service.d.ts.map