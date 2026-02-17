import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../../types/index.js';
import { usersService } from './users.service.js';
import { successResponse, paginatedResponse } from '../../utils/helpers.js';
import { updateUserSchema, paginationSchema, uuidSchema } from '../../utils/validation.js';
import { z } from 'zod';

const searchParamsSchema = z.object({
  q: z.string().optional(),
  workspace_id: uuidSchema.optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export class UsersController {
  async getMe(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const user = await usersService.getByIdWithWorkspaces(userId);

      res.json(successResponse({ user }));
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = uuidSchema.parse(req.params.id);
      const user = await usersService.getById(userId);

      res.json(successResponse({ user }));
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const input = updateUserSchema.parse(req.body);

      const user = await usersService.update(userId, input);

      res.json(successResponse({ user }));
    } catch (error) {
      next(error);
    }
  }

  async search(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const params = searchParamsSchema.parse(req.query);
      const { users, total } = await usersService.search(params);

      res.json(paginatedResponse(users, params, total));
    } catch (error) {
      next(error);
    }
  }

  async getWorkspaceMembers(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.workspace!.id;
      const params = paginationSchema.parse(req.query);

      const { members, total } = await usersService.getWorkspaceMembers(workspaceId, params);

      res.json(paginatedResponse(members, params, total));
    } catch (error) {
      next(error);
    }
  }

  async deleteAccount(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;

      await usersService.deleteAccount(userId);

      res.json(successResponse({ message: 'Account deleted successfully' }));
    } catch (error) {
      next(error);
    }
  }
}

export const usersController = new UsersController();
