import { sql } from '../../config/database.js';
import { generateUUID, AppError, calculateOffset } from '../../utils/helpers.js';
import type { UUID, Canvas, PaginationParams } from '../../types/index.js';
import type {
  CreateCanvasInput,
  UpdateCanvasInput,
  CanvasWithCollaborators,
  AddCollaboratorInput,
} from './canvases.types.js';

export class CanvasesService {
  async create(workspaceId: UUID, userId: UUID, input: CreateCanvasInput): Promise<Canvas> {
    const id = generateUUID();
    const now = new Date();

    const canvases = await sql`
      INSERT INTO canvases (
        id, workspace_id, user_id, project_id, name, elements, app_state,
        is_template, is_public, created_at, updated_at
      )
      VALUES (
        ${id}, ${workspaceId}, ${userId}, ${input.project_id || null},
        ${input.name}, ${JSON.stringify(input.elements || {})},
        ${JSON.stringify(input.app_state || {})}, ${input.is_template ?? false},
        ${input.is_public ?? false}, ${now}, ${now}
      )
      RETURNING *
    `;

    return canvases[0] as Canvas;
  }

  async getById(canvasId: UUID): Promise<Canvas> {
    const canvases = await sql`SELECT * FROM canvases WHERE id = ${canvasId}`;

    if (canvases.length === 0) {
      throw AppError.notFound('Canvas');
    }

    return canvases[0] as Canvas;
  }

  async getByIdWithCollaborators(canvasId: UUID): Promise<CanvasWithCollaborators> {
    const canvases = await sql`
      SELECT c.*,
             json_build_object(
               'id', u.id,
               'name', u.name,
               'avatar_url', u.avatar_url
             ) as creator,
             COALESCE(
               (
                 SELECT json_agg(json_build_object(
                   'user_id', cc.user_id,
                   'permission', cc.permission,
                   'user', json_build_object(
                     'id', cu.id,
                     'name', cu.name,
                     'avatar_url', cu.avatar_url
                   )
                 ))
                 FROM canvas_collaborators cc
                 INNER JOIN users cu ON cc.user_id = cu.id
                 WHERE cc.canvas_id = c.id
               ),
               '[]'
             ) as collaborators
      FROM canvases c
      INNER JOIN users u ON c.user_id = u.id
      WHERE c.id = ${canvasId}
    `;

    if (canvases.length === 0) {
      throw AppError.notFound('Canvas');
    }

    return canvases[0] as CanvasWithCollaborators;
  }

  async list(
    workspaceId: UUID,
    userId: UUID,
    params: PaginationParams & { project_id?: UUID | null; is_template?: boolean }
  ): Promise<{ canvases: Canvas[]; total: number }> {
    const page = params.page ?? 1;
    const limit = params.limit ?? 20;
    const offset = calculateOffset(page, limit);

    let conditions = sql`c.workspace_id = ${workspaceId} AND (c.user_id = ${userId} OR c.is_public = true OR EXISTS (
      SELECT 1 FROM canvas_collaborators cc WHERE cc.canvas_id = c.id AND cc.user_id = ${userId}
    ))`;

    if (params.project_id !== undefined) {
      conditions = sql`${conditions} AND c.project_id IS NOT DISTINCT FROM ${params.project_id}`;
    }

    if (params.is_template !== undefined) {
      conditions = sql`${conditions} AND c.is_template = ${params.is_template}`;
    }

    const canvases = await sql`
      SELECT c.* FROM canvases c
      WHERE ${conditions}
      ORDER BY c.updated_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const countResult = await sql`
      SELECT COUNT(*)::int as count FROM canvases c
      WHERE ${conditions}
    `;

    return {
      canvases: canvases as unknown as Canvas[],
      total: countResult[0].count,
    };
  }

  async update(canvasId: UUID, input: UpdateCanvasInput): Promise<Canvas> {
    const updates: Record<string, unknown> = { updated_at: new Date() };

    if (input.name !== undefined) updates.name = input.name;
    if (input.project_id !== undefined) updates.project_id = input.project_id;
    if (input.elements !== undefined) updates.elements = JSON.stringify(input.elements);
    if (input.app_state !== undefined) updates.app_state = JSON.stringify(input.app_state);
    if (input.thumbnail_url !== undefined) updates.thumbnail_url = input.thumbnail_url;
    if (input.is_template !== undefined) updates.is_template = input.is_template;
    if (input.is_public !== undefined) updates.is_public = input.is_public;

    const fields = Object.keys(updates);
    const canvases = await sql`
      UPDATE canvases
      SET ${sql(updates, ...fields)}
      WHERE id = ${canvasId}
      RETURNING *
    `;

    if (canvases.length === 0) {
      throw AppError.notFound('Canvas');
    }

    return canvases[0] as Canvas;
  }

  async delete(canvasId: UUID): Promise<void> {
    await sql`DELETE FROM canvases WHERE id = ${canvasId}`;
  }

  async addCollaborator(canvasId: UUID, input: AddCollaboratorInput): Promise<void> {
    const existing = await sql`
      SELECT user_id FROM canvas_collaborators
      WHERE canvas_id = ${canvasId} AND user_id = ${input.user_id}
    `;

    if (existing.length > 0) {
      // Update permission
      await sql`
        UPDATE canvas_collaborators
        SET permission = ${input.permission}
        WHERE canvas_id = ${canvasId} AND user_id = ${input.user_id}
      `;
    } else {
      await sql`
        INSERT INTO canvas_collaborators (canvas_id, user_id, permission)
        VALUES (${canvasId}, ${input.user_id}, ${input.permission})
      `;
    }
  }

  async removeCollaborator(canvasId: UUID, userId: UUID): Promise<void> {
    await sql`
      DELETE FROM canvas_collaborators
      WHERE canvas_id = ${canvasId} AND user_id = ${userId}
    `;
  }

  async updateLastAccessed(canvasId: UUID, userId: UUID): Promise<void> {
    await sql`
      UPDATE canvas_collaborators
      SET last_accessed_at = ${new Date()}
      WHERE canvas_id = ${canvasId} AND user_id = ${userId}
    `;
  }

  async canAccess(canvasId: UUID, userId: UUID): Promise<boolean> {
    const result = await sql`
      SELECT 1 FROM canvases c
      LEFT JOIN canvas_collaborators cc ON c.id = cc.canvas_id AND cc.user_id = ${userId}
      WHERE c.id = ${canvasId}
        AND (c.user_id = ${userId} OR c.is_public = true OR cc.user_id IS NOT NULL)
    `;

    return result.length > 0;
  }

  async canEdit(canvasId: UUID, userId: UUID): Promise<boolean> {
    const result = await sql`
      SELECT 1 FROM canvases c
      LEFT JOIN canvas_collaborators cc ON c.id = cc.canvas_id AND cc.user_id = ${userId}
      WHERE c.id = ${canvasId}
        AND (c.user_id = ${userId} OR cc.permission = 'edit')
    `;

    return result.length > 0;
  }

  async duplicate(canvasId: UUID, userId: UUID, workspaceId: UUID): Promise<Canvas> {
    const original = await this.getById(canvasId);

    return this.create(workspaceId, userId, {
      name: `${original.name} (copy)`,
      project_id: original.project_id,
      elements: original.elements as Record<string, unknown>,
      app_state: original.app_state as Record<string, unknown>,
      is_template: false,
    });
  }

  async getTemplates(workspaceId: UUID): Promise<Canvas[]> {
    const canvases = await sql`
      SELECT * FROM canvases
      WHERE workspace_id = ${workspaceId} AND is_template = true
      ORDER BY name
    `;

    return canvases as unknown as Canvas[];
  }
}

export const canvasesService = new CanvasesService();
