"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notesService = exports.NotesService = void 0;
const database_js_1 = require("../../config/database.js");
const helpers_js_1 = require("../../utils/helpers.js");
class NotesService {
    async create(workspaceId, userId, input) {
        const id = (0, helpers_js_1.generateUUID)();
        const now = new Date();
        const wordCount = input.content ? (0, helpers_js_1.calculateWordCount)(input.content) : 0;
        const memberId = input.member_id || null;
        // Get max position
        const maxPos = await (0, database_js_1.sql) `
      SELECT COALESCE(MAX(position), -1) + 1 as pos
      FROM notes
      WHERE workspace_id = ${workspaceId}
        AND user_id = ${userId}
        AND project_id IS NOT DISTINCT FROM ${input.project_id || null}
        AND parent_id IS NOT DISTINCT FROM ${input.parent_id || null}
    `;
        const notes = await (0, database_js_1.sql) `
      INSERT INTO notes (
        id, workspace_id, user_id, project_id, parent_id, title, content,
        tags, is_pinned, is_public, is_template, position, word_count,
        member_id, created_at, updated_at
      )
      VALUES (
        ${id}, ${workspaceId}, ${userId}, ${input.project_id || null},
        ${input.parent_id || null}, ${input.title || 'Untitled'},
        ${input.content || ''}, ${input.tags || []}, ${input.is_pinned ?? false},
        ${input.is_public ?? false}, ${input.is_template ?? false},
        ${maxPos[0].pos}, ${wordCount}, ${memberId}, ${now}, ${now}
      )
      RETURNING *
    `;
        return notes[0];
    }
    async getById(noteId) {
        const notes = await (0, database_js_1.sql) `
      SELECT * FROM notes WHERE id = ${noteId} AND deleted_at IS NULL
    `;
        if (notes.length === 0) {
            throw helpers_js_1.AppError.notFound('Note');
        }
        return notes[0];
    }
    async getByIdWithAuthor(noteId) {
        const notes = await (0, database_js_1.sql) `
      SELECT n.*,
             json_build_object(
               'id', u.id,
               'name', u.name,
               'avatar_url', u.avatar_url
             ) as author
      FROM notes n
      INNER JOIN users u ON n.user_id = u.id
      WHERE n.id = ${noteId} AND n.deleted_at IS NULL
    `;
        if (notes.length === 0) {
            throw helpers_js_1.AppError.notFound('Note');
        }
        return notes[0];
    }
    async list(workspaceId, userId, params) {
        const page = params.page ?? 1;
        const limit = params.limit ?? 20;
        const offset = (0, helpers_js_1.calculateOffset)(page, limit);
        const sortBy = params.sortBy || 'updated_at';
        const sortOrder = params.sortOrder || 'desc';
        let conditions = (0, database_js_1.sql) `n.workspace_id = ${workspaceId} AND n.deleted_at IS NULL`;
        // Filter by member_id if provided, otherwise fall back to user_id
        if (params.member_id) {
            conditions = (0, database_js_1.sql) `${conditions} AND (n.member_id = ${params.member_id} OR n.is_public = true)`;
        }
        else {
            conditions = (0, database_js_1.sql) `${conditions} AND (n.user_id = ${userId} OR n.is_public = true)`;
        }
        if (params.q) {
            const searchPattern = `%${params.q}%`;
            conditions = (0, database_js_1.sql) `${conditions} AND (n.title ILIKE ${searchPattern} OR n.content ILIKE ${searchPattern})`;
        }
        if (params.project_id !== undefined) {
            conditions = (0, database_js_1.sql) `${conditions} AND n.project_id IS NOT DISTINCT FROM ${params.project_id}`;
        }
        if (params.tags && params.tags.length > 0) {
            conditions = (0, database_js_1.sql) `${conditions} AND n.tags && ${params.tags}`;
        }
        if (params.is_pinned !== undefined) {
            conditions = (0, database_js_1.sql) `${conditions} AND n.is_pinned = ${params.is_pinned}`;
        }
        if (params.is_template !== undefined) {
            conditions = (0, database_js_1.sql) `${conditions} AND n.is_template = ${params.is_template}`;
        }
        const notes = await (0, database_js_1.sql) `
      SELECT n.*,
             json_build_object(
               'id', u.id,
               'name', u.name,
               'avatar_url', u.avatar_url
             ) as author
      FROM notes n
      INNER JOIN users u ON n.user_id = u.id
      WHERE ${conditions}
      ORDER BY n.is_pinned DESC, ${database_js_1.sql.unsafe(sortBy)} ${database_js_1.sql.unsafe(sortOrder)}
      LIMIT ${limit} OFFSET ${offset}
    `;
        const countResult = await (0, database_js_1.sql) `
      SELECT COUNT(*)::int as count
      FROM notes n
      WHERE ${conditions}
    `;
        return {
            notes: notes,
            total: countResult[0].count,
        };
    }
    async update(noteId, userId, input) {
        // Save version if content changed
        if (input.content !== undefined) {
            const currentNote = await this.getById(noteId);
            if (currentNote.content !== input.content) {
                await this.saveVersion(noteId, userId, currentNote.content);
            }
        }
        const updates = { updated_at: new Date() };
        if (input.title !== undefined)
            updates.title = input.title;
        if (input.content !== undefined) {
            updates.content = input.content;
            updates.word_count = (0, helpers_js_1.calculateWordCount)(input.content);
        }
        if (input.project_id !== undefined)
            updates.project_id = input.project_id;
        if (input.parent_id !== undefined)
            updates.parent_id = input.parent_id;
        if (input.tags !== undefined)
            updates.tags = input.tags;
        if (input.is_pinned !== undefined)
            updates.is_pinned = input.is_pinned;
        if (input.is_public !== undefined)
            updates.is_public = input.is_public;
        if (input.is_template !== undefined)
            updates.is_template = input.is_template;
        if (input.position !== undefined)
            updates.position = input.position;
        if (input.member_id !== undefined)
            updates.member_id = input.member_id;
        const fields = Object.keys(updates);
        const notes = await (0, database_js_1.sql) `
      UPDATE notes
      SET ${(0, database_js_1.sql)(updates, ...fields)}
      WHERE id = ${noteId} AND deleted_at IS NULL
      RETURNING *
    `;
        if (notes.length === 0) {
            throw helpers_js_1.AppError.notFound('Note');
        }
        return notes[0];
    }
    async delete(noteId) {
        // Soft delete
        await (0, database_js_1.sql) `
      UPDATE notes
      SET deleted_at = ${new Date()}
      WHERE id = ${noteId}
    `;
    }
    async restore(noteId) {
        const notes = await (0, database_js_1.sql) `
      UPDATE notes
      SET deleted_at = NULL, updated_at = ${new Date()}
      WHERE id = ${noteId}
      RETURNING *
    `;
        if (notes.length === 0) {
            throw helpers_js_1.AppError.notFound('Note');
        }
        return notes[0];
    }
    async permanentDelete(noteId) {
        await (0, database_js_1.sql) `DELETE FROM notes WHERE id = ${noteId}`;
    }
    async getDeleted(workspaceId, userId, params) {
        const page = params.page ?? 1;
        const limit = params.limit ?? 20;
        const offset = (0, helpers_js_1.calculateOffset)(page, limit);
        const notes = await (0, database_js_1.sql) `
      SELECT * FROM notes
      WHERE workspace_id = ${workspaceId}
        AND user_id = ${userId}
        AND deleted_at IS NOT NULL
      ORDER BY deleted_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
        const countResult = await (0, database_js_1.sql) `
      SELECT COUNT(*)::int as count
      FROM notes
      WHERE workspace_id = ${workspaceId}
        AND user_id = ${userId}
        AND deleted_at IS NOT NULL
    `;
        return {
            notes: notes,
            total: countResult[0].count,
        };
    }
    async saveVersion(noteId, userId, content) {
        const id = (0, helpers_js_1.generateUUID)();
        await (0, database_js_1.sql) `
      INSERT INTO note_versions (id, note_id, user_id, content, created_at)
      VALUES (${id}, ${noteId}, ${userId}, ${content}, ${new Date()})
    `;
    }
    async getVersions(noteId) {
        const versions = await (0, database_js_1.sql) `
      SELECT nv.*, u.name as user_name
      FROM note_versions nv
      INNER JOIN users u ON nv.user_id = u.id
      WHERE nv.note_id = ${noteId}
      ORDER BY nv.created_at DESC
      LIMIT 50
    `;
        return versions;
    }
    async restoreVersion(noteId, versionId, userId) {
        const versions = await (0, database_js_1.sql) `
      SELECT content FROM note_versions WHERE id = ${versionId} AND note_id = ${noteId}
    `;
        if (versions.length === 0) {
            throw helpers_js_1.AppError.notFound('Version');
        }
        return this.update(noteId, userId, { content: versions[0].content });
    }
    async addLink(sourceNoteId, targetNoteId) {
        await (0, database_js_1.sql) `
      INSERT INTO note_links (source_note_id, target_note_id, created_at)
      VALUES (${sourceNoteId}, ${targetNoteId}, ${new Date()})
      ON CONFLICT DO NOTHING
    `;
    }
    async removeLink(sourceNoteId, targetNoteId) {
        await (0, database_js_1.sql) `
      DELETE FROM note_links
      WHERE source_note_id = ${sourceNoteId} AND target_note_id = ${targetNoteId}
    `;
    }
    async getLinks(noteId) {
        const outgoing = await (0, database_js_1.sql) `
      SELECT n.id, n.title, 'outgoing' as direction
      FROM note_links nl
      INNER JOIN notes n ON nl.target_note_id = n.id
      WHERE nl.source_note_id = ${noteId} AND n.deleted_at IS NULL
    `;
        const incoming = await (0, database_js_1.sql) `
      SELECT n.id, n.title, 'incoming' as direction
      FROM note_links nl
      INNER JOIN notes n ON nl.source_note_id = n.id
      WHERE nl.target_note_id = ${noteId} AND n.deleted_at IS NULL
    `;
        return [...outgoing, ...incoming];
    }
    async duplicate(noteId, userId, workspaceId) {
        const original = await this.getById(noteId);
        return this.create(workspaceId, userId, {
            title: `${original.title} (copy)`,
            content: original.content,
            project_id: original.project_id,
            tags: original.tags,
            is_template: original.is_template,
        });
    }
    async canAccess(noteId, userId, memberId) {
        if (memberId) {
            const result = await (0, database_js_1.sql) `
        SELECT 1 FROM notes
        WHERE id = ${noteId}
          AND deleted_at IS NULL
          AND (member_id = ${memberId} OR is_public = true)
      `;
            return result.length > 0;
        }
        const result = await (0, database_js_1.sql) `
      SELECT 1 FROM notes
      WHERE id = ${noteId}
        AND deleted_at IS NULL
        AND (user_id = ${userId} OR is_public = true)
    `;
        return result.length > 0;
    }
    async getTemplates(workspaceId) {
        const notes = await (0, database_js_1.sql) `
      SELECT * FROM notes
      WHERE workspace_id = ${workspaceId}
        AND is_template = true
        AND deleted_at IS NULL
      ORDER BY title
    `;
        return notes;
    }
}
exports.NotesService = NotesService;
exports.notesService = new NotesService();
//# sourceMappingURL=notes.service.js.map