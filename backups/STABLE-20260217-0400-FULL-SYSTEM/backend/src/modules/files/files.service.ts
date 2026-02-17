import { sql } from '../../config/database.js';
import { generateUUID, AppError, calculateOffset } from '../../utils/helpers.js';
import type { UUID, File } from '../../types/index.js';
import type { UploadFileInput, FileWithUploader, FileSearchParams } from './files.types.js';

export class FilesService {
  async create(workspaceId: UUID, userId: UUID, input: UploadFileInput): Promise<File> {
    const id = generateUUID();
    const now = new Date();

    const files = await sql`
      INSERT INTO files (
        id, workspace_id, user_id, filename, original_filename, file_url,
        file_size, mime_type, entity_type, entity_id, created_at
      )
      VALUES (
        ${id}, ${workspaceId}, ${userId}, ${input.filename}, ${input.original_filename},
        ${input.file_url}, ${input.file_size}, ${input.mime_type},
        ${input.entity_type || null}, ${input.entity_id || null}, ${now}
      )
      RETURNING *
    `;

    return files[0] as File;
  }

  async getById(fileId: UUID): Promise<File> {
    const files = await sql`SELECT * FROM files WHERE id = ${fileId}`;

    if (files.length === 0) {
      throw AppError.notFound('File');
    }

    return files[0] as File;
  }

  async getByIdWithUploader(fileId: UUID): Promise<FileWithUploader> {
    const files = await sql`
      SELECT f.*,
             json_build_object(
               'id', u.id,
               'name', u.name,
               'avatar_url', u.avatar_url
             ) as uploader
      FROM files f
      INNER JOIN users u ON f.user_id = u.id
      WHERE f.id = ${fileId}
    `;

    if (files.length === 0) {
      throw AppError.notFound('File');
    }

    return files[0] as FileWithUploader;
  }

  async list(
    workspaceId: UUID,
    params: FileSearchParams
  ): Promise<{ files: FileWithUploader[]; total: number }> {
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const offset = calculateOffset(page, limit);

    let conditions = sql`f.workspace_id = ${workspaceId}`;

    if (params.q) {
      const searchPattern = `%${params.q}%`;
      conditions = sql`${conditions} AND (f.filename ILIKE ${searchPattern} OR f.original_filename ILIKE ${searchPattern})`;
    }

    if (params.entity_type) {
      conditions = sql`${conditions} AND f.entity_type = ${params.entity_type}`;
    }

    if (params.entity_id) {
      conditions = sql`${conditions} AND f.entity_id = ${params.entity_id}`;
    }

    if (params.mime_type) {
      const mimePattern = `${params.mime_type}%`;
      conditions = sql`${conditions} AND f.mime_type LIKE ${mimePattern}`;
    }

    const files = await sql`
      SELECT f.*,
             json_build_object(
               'id', u.id,
               'name', u.name,
               'avatar_url', u.avatar_url
             ) as uploader
      FROM files f
      INNER JOIN users u ON f.user_id = u.id
      WHERE ${conditions}
      ORDER BY f.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const countResult = await sql`
      SELECT COUNT(*)::int as count FROM files f
      WHERE ${conditions}
    `;

    return {
      files: files as unknown as FileWithUploader[],
      total: countResult[0].count,
    };
  }

  async getByEntity(entityType: string, entityId: UUID): Promise<File[]> {
    const files = await sql`
      SELECT * FROM files
      WHERE entity_type = ${entityType} AND entity_id = ${entityId}
      ORDER BY created_at DESC
    `;

    return files as unknown as File[];
  }

  async delete(fileId: UUID): Promise<void> {
    // In production, also delete from storage
    await sql`DELETE FROM files WHERE id = ${fileId}`;
  }

  async deleteByEntity(entityType: string, entityId: UUID): Promise<void> {
    // In production, also delete from storage
    await sql`
      DELETE FROM files
      WHERE entity_type = ${entityType} AND entity_id = ${entityId}
    `;
  }

  async getStorageUsage(workspaceId: UUID): Promise<{ total_size: number; file_count: number }> {
    const result = await sql`
      SELECT COALESCE(SUM(file_size), 0)::bigint as total_size,
             COUNT(*)::int as file_count
      FROM files
      WHERE workspace_id = ${workspaceId}
    `;

    return {
      total_size: parseInt(result[0].total_size),
      file_count: result[0].file_count,
    };
  }

  async getUserStorageUsage(userId: UUID): Promise<{ total_size: number; file_count: number }> {
    const result = await sql`
      SELECT COALESCE(SUM(file_size), 0)::bigint as total_size,
             COUNT(*)::int as file_count
      FROM files
      WHERE user_id = ${userId}
    `;

    return {
      total_size: parseInt(result[0].total_size),
      file_count: result[0].file_count,
    };
  }
}

export const filesService = new FilesService();
