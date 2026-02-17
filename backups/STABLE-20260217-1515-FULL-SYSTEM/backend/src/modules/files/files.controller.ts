import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../../types/index.js';
import { filesService } from './files.service.js';
import { successResponse, paginatedResponse } from '../../utils/helpers.js';
import { paginationSchema, uuidSchema } from '../../utils/validation.js';
import { z } from 'zod';

const uploadFileSchema = z.object({
  filename: z.string().min(1).max(255),
  original_filename: z.string().min(1).max(255),
  file_url: z.string().url(),
  file_size: z.number().int().min(0),
  mime_type: z.string().min(1).max(100),
  entity_type: z.enum(['note', 'task', 'message', 'canvas', 'project', 'workspace']).optional(),
  entity_id: uuidSchema.optional(),
});

const listFilesSchema = paginationSchema.extend({
  q: z.string().optional(),
  entity_type: z.enum(['note', 'task', 'message', 'canvas', 'project', 'workspace']).optional(),
  entity_id: uuidSchema.optional(),
  mime_type: z.string().optional(),
});

export class FilesController {
  async upload(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.workspace!.id;
      const userId = req.user!.id;
      const input = uploadFileSchema.parse(req.body);

      const file = await filesService.create(workspaceId, userId, input);

      res.status(201).json(successResponse({ file }));
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const fileId = uuidSchema.parse(req.params.fileId);

      const file = await filesService.getByIdWithUploader(fileId);

      res.json(successResponse({ file }));
    } catch (error) {
      next(error);
    }
  }

  async list(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.workspace!.id;
      const params = listFilesSchema.parse(req.query);

      const { files, total } = await filesService.list(workspaceId, params);

      res.json(paginatedResponse(files, params, total));
    } catch (error) {
      next(error);
    }
  }

  async getByEntity(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const entityType = req.params.entityType;
      const entityId = uuidSchema.parse(req.params.entityId);

      const files = await filesService.getByEntity(entityType, entityId);

      res.json(successResponse({ files }));
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const fileId = uuidSchema.parse(req.params.fileId);

      await filesService.delete(fileId);

      res.json(successResponse({ message: 'File deleted' }));
    } catch (error) {
      next(error);
    }
  }

  async getStorageUsage(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.workspace!.id;

      const usage = await filesService.getStorageUsage(workspaceId);

      res.json(successResponse({ usage }));
    } catch (error) {
      next(error);
    }
  }

  async getMyStorageUsage(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;

      const usage = await filesService.getUserStorageUsage(userId);

      res.json(successResponse({ usage }));
    } catch (error) {
      next(error);
    }
  }
}

export const filesController = new FilesController();
