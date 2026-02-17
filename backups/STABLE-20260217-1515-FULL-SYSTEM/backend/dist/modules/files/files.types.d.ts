import type { UUID, File, EntityType } from '../../types/index.js';
export interface UploadFileInput {
    filename: string;
    original_filename: string;
    file_url: string;
    file_size: number;
    mime_type: string;
    entity_type?: EntityType;
    entity_id?: UUID;
}
export interface FileWithUploader extends File {
    uploader: {
        id: UUID;
        name: string;
        avatar_url: string | null;
    };
}
export interface FileSearchParams {
    q?: string;
    entity_type?: EntityType;
    entity_id?: UUID;
    mime_type?: string;
    page?: number;
    limit?: number;
}
//# sourceMappingURL=files.types.d.ts.map