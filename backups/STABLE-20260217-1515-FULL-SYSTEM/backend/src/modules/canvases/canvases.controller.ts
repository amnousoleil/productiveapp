import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../../types/index.js';
import { canvasesService } from './canvases.service.js';
import { successResponse, paginatedResponse, AppError } from '../../utils/helpers.js';
import { paginationSchema, uuidSchema } from '../../utils/validation.js';
import { z } from 'zod';

const createCanvasSchema = z.object({
  name: z.string().min(1).max(255),
  project_id: uuidSchema.nullable().optional(),
  elements: z.record(z.unknown()).optional(),
  app_state: z.record(z.unknown()).optional(),
  is_template: z.boolean().optional(),
  is_public: z.boolean().optional(),
});

const updateCanvasSchema = createCanvasSchema.partial().extend({
  thumbnail_url: z.string().url().nullable().optional(),
});

const listCanvasesSchema = paginationSchema.extend({
  project_id: uuidSchema.nullable().optional(),
  is_template: z.coerce.boolean().optional(),
});

const addCollaboratorSchema = z.object({
  user_id: uuidSchema,
  permission: z.enum(['view', 'edit']),
});

export class CanvasesController {
  async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.workspace!.id;
      const userId = req.user!.id;
      const input = createCanvasSchema.parse(req.body);

      const canvas = await canvasesService.create(workspaceId, userId, input);

      res.status(201).json(successResponse({ canvas }));
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const canvasId = uuidSchema.parse(req.params.canvasId);
      const userId = req.user!.id;

      const canAccess = await canvasesService.canAccess(canvasId, userId);
      if (!canAccess) {
        throw AppError.forbidden('Access denied to this canvas');
      }

      const canvas = await canvasesService.getByIdWithCollaborators(canvasId);

      // Update last accessed
      await canvasesService.updateLastAccessed(canvasId, userId);

      res.json(successResponse({ canvas }));
    } catch (error) {
      next(error);
    }
  }

  async list(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.workspace!.id;
      const userId = req.user!.id;
      const params = listCanvasesSchema.parse(req.query);

      const { canvases, total } = await canvasesService.list(workspaceId, userId, params);

      res.json(paginatedResponse(canvases, params, total));
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const canvasId = uuidSchema.parse(req.params.canvasId);
      const userId = req.user!.id;
      const input = updateCanvasSchema.parse(req.body);

      const canEdit = await canvasesService.canEdit(canvasId, userId);
      if (!canEdit) {
        throw AppError.forbidden('No edit permission for this canvas');
      }

      const canvas = await canvasesService.update(canvasId, input);

      res.json(successResponse({ canvas }));
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const canvasId = uuidSchema.parse(req.params.canvasId);

      await canvasesService.delete(canvasId);

      res.json(successResponse({ message: 'Canvas deleted' }));
    } catch (error) {
      next(error);
    }
  }

  async addCollaborator(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const canvasId = uuidSchema.parse(req.params.canvasId);
      const input = addCollaboratorSchema.parse(req.body);

      await canvasesService.addCollaborator(canvasId, input);

      res.status(201).json(successResponse({ message: 'Collaborator added' }));
    } catch (error) {
      next(error);
    }
  }

  async removeCollaborator(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const canvasId = uuidSchema.parse(req.params.canvasId);
      const userId = uuidSchema.parse(req.params.userId);

      await canvasesService.removeCollaborator(canvasId, userId);

      res.json(successResponse({ message: 'Collaborator removed' }));
    } catch (error) {
      next(error);
    }
  }

  async duplicate(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const canvasId = uuidSchema.parse(req.params.canvasId);
      const userId = req.user!.id;
      const workspaceId = req.workspace!.id;

      const canvas = await canvasesService.duplicate(canvasId, userId, workspaceId);

      res.status(201).json(successResponse({ canvas }));
    } catch (error) {
      next(error);
    }
  }

  async getTemplates(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.workspace!.id;

      const templates = await canvasesService.getTemplates(workspaceId);

      res.json(successResponse({ templates }));
    } catch (error) {
      next(error);
    }
  }
}

export const canvasesController = new CanvasesController();
