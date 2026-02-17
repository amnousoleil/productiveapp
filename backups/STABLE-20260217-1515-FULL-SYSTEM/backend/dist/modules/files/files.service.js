"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.filesService = exports.FilesService = void 0;
const database_js_1 = require("../../config/database.js");
const helpers_js_1 = require("../../utils/helpers.js");
class FilesService {
    async create(workspaceId, userId, input) {
        const id = (0, helpers_js_1.generateUUID)();
        const now = new Date();
        const files = await (0, database_js_1.sql) `
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
        return files[0];
    }
    async getById(fileId) {
        const files = await (0, database_js_1.sql) `SELECT * FROM files WHERE id = ${fileId}`;
        if (files.length === 0) {
            throw helpers_js_1.AppError.notFound('File');
        }
        return files[0];
    }
    async getByIdWithUploader(fileId) {
        const files = await (0, database_js_1.sql) `
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
            throw helpers_js_1.AppError.notFound('File');
        }
        return files[0];
    }
    async list(workspaceId, params) {
        const page = params.page ?? 1;
        const limit = params.limit ?? 20;
        const offset = (0, helpers_js_1.calculateOffset)(page, limit);
        let conditions = (0, database_js_1.sql) `f.workspace_id = ${workspaceId}`;
        if (params.q) {
            const searchPattern = `%${params.q}%`;
            conditions = (0, database_js_1.sql) `${conditions} AND (f.filename ILIKE ${searchPattern} OR f.original_filename ILIKE ${searchPattern})`;
        }
        if (params.entity_type) {
            conditions = (0, database_js_1.sql) `${conditions} AND f.entity_type = ${params.entity_type}`;
        }
        if (params.entity_id) {
            conditions = (0, database_js_1.sql) `${conditions} AND f.entity_id = ${params.entity_id}`;
        }
        if (params.mime_type) {
            const mimePattern = `${params.mime_type}%`;
            conditions = (0, database_js_1.sql) `${conditions} AND f.mime_type LIKE ${mimePattern}`;
        }
        const files = await (0, database_js_1.sql) `
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
        const countResult = await (0, database_js_1.sql) `
      SELECT COUNT(*)::int as count FROM files f
      WHERE ${conditions}
    `;
        return {
            files: files,
            total: countResult[0].count,
        };
    }
    async getByEntity(entityType, entityId) {
        const files = await (0, database_js_1.sql) `
      SELECT * FROM files
      WHERE entity_type = ${entityType} AND entity_id = ${entityId}
      ORDER BY created_at DESC
    `;
        return files;
    }
    async delete(fileId) {
        // In production, also delete from storage
        await (0, database_js_1.sql) `DELETE FROM files WHERE id = ${fileId}`;
    }
    async deleteByEntity(entityType, entityId) {
        // In production, also delete from storage
        await (0, database_js_1.sql) `
      DELETE FROM files
      WHERE entity_type = ${entityType} AND entity_id = ${entityId}
    `;
    }
    async getStorageUsage(workspaceId) {
        const result = await (0, database_js_1.sql) `
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
    async getUserStorageUsage(userId) {
        const result = await (0, database_js_1.sql) `
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
exports.FilesService = FilesService;
exports.filesService = new FilesService();
//# sourceMappingURL=files.service.js.map