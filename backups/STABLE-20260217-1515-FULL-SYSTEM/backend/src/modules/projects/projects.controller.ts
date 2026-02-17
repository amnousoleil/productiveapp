import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../../types/index.js';
import { projectsService } from './projects.service.js';
import { successResponse, paginatedResponse, AppError } from '../../utils/helpers.js';
import { createProjectSchema, updateProjectSchema, paginationSchema, uuidSchema } from '../../utils/validation.js';
import { z } from 'zod';

const listProjectsSchema = paginationSchema.extend({
  status: z.enum(['active', 'archived', 'deleted']).optional(),
  parent_id: uuidSchema.nullable().optional(),
});

const addMemberSchema = z.object({
  user_id: uuidSchema,
  role: z.enum(['owner', 'editor', 'viewer']).optional(),
});

const updateMemberRoleSchema = z.object({
  role: z.enum(['editor', 'viewer']),
});

const reorderSchema = z.object({
  project_ids: z.array(uuidSchema).min(1),
});

export class ProjectsController {
  async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.workspace!.id;
      const userId = req.user!.id;
      const input = createProjectSchema.parse(req.body);

      const project = await projectsService.create(workspaceId, userId, input);

      res.status(201).json(successResponse({ project }));
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const projectId = uuidSchema.parse(req.params.projectId);
      const userId = req.user!.id;

      const canAccess = await projectsService.canAccess(projectId, userId);
      if (!canAccess) {
        throw AppError.forbidden('Access denied to this project');
      }

      const project = await projectsService.getByIdWithStats(projectId);

      res.json(successResponse({ project }));
    } catch (error) {
      next(error);
    }
  }

  async list(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.workspace!.id;
      const userId = req.user!.id;
      const params = listProjectsSchema.parse(req.query);

      const { projects, total } = await projectsService.getWorkspaceProjects(workspaceId, userId, params);

      res.json(paginatedResponse(projects, params, total));
    } catch (error) {
      next(error);
    }
  }

  async getMyProjects(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;

      const projects = await projectsService.getUserProjects(userId);

      res.json(successResponse({ projects }));
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const projectId = uuidSchema.parse(req.params.projectId);
      const userId = req.user!.id;
      const input = updateProjectSchema.parse(req.body);

      const canAccess = await projectsService.canAccess(projectId, userId);
      if (!canAccess) {
        throw AppError.forbidden('Access denied to this project');
      }

      const project = await projectsService.update(projectId, input);

      res.json(successResponse({ project }));
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const projectId = uuidSchema.parse(req.params.projectId);
      const userId = req.user!.id;

      const canAccess = await projectsService.canAccess(projectId, userId);
      if (!canAccess) {
        throw AppError.forbidden('Access denied to this project');
      }

      await projectsService.delete(projectId);

      res.json(successResponse({ message: 'Project deleted' }));
    } catch (error) {
      next(error);
    }
  }

  async archive(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const projectId = uuidSchema.parse(req.params.projectId);
      const userId = req.user!.id;

      const canAccess = await projectsService.canAccess(projectId, userId);
      if (!canAccess) {
        throw AppError.forbidden('Access denied to this project');
      }

      const project = await projectsService.archive(projectId);

      res.json(successResponse({ project }));
    } catch (error) {
      next(error);
    }
  }

  async restore(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const projectId = uuidSchema.parse(req.params.projectId);
      const userId = req.user!.id;

      const canAccess = await projectsService.canAccess(projectId, userId);
      if (!canAccess) {
        throw AppError.forbidden('Access denied to this project');
      }

      const project = await projectsService.restore(projectId);

      res.json(successResponse({ project }));
    } catch (error) {
      next(error);
    }
  }

  async getMembers(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const projectId = uuidSchema.parse(req.params.projectId);
      const userId = req.user!.id;

      const canAccess = await projectsService.canAccess(projectId, userId);
      if (!canAccess) {
        throw AppError.forbidden('Access denied to this project');
      }

      const members = await projectsService.getMembers(projectId);

      res.json(successResponse({ members }));
    } catch (error) {
      next(error);
    }
  }

  async addMember(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const projectId = uuidSchema.parse(req.params.projectId);
      const input = addMemberSchema.parse(req.body);

      await projectsService.addMember(projectId, input);

      res.status(201).json(successResponse({ message: 'Member added' }));
    } catch (error) {
      next(error);
    }
  }

  async updateMemberRole(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const projectId = uuidSchema.parse(req.params.projectId);
      const userId = uuidSchema.parse(req.params.userId);
      const { role } = updateMemberRoleSchema.parse(req.body);

      await projectsService.updateMemberRole(projectId, userId, role);

      res.json(successResponse({ message: 'Member role updated' }));
    } catch (error) {
      next(error);
    }
  }

  async removeMember(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const projectId = uuidSchema.parse(req.params.projectId);
      const userId = uuidSchema.parse(req.params.userId);

      await projectsService.removeMember(projectId, userId);

      res.json(successResponse({ message: 'Member removed' }));
    } catch (error) {
      next(error);
    }
  }

  async reorder(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.workspace!.id;
      const userId = req.user!.id;
      const { project_ids } = reorderSchema.parse(req.body);

      await projectsService.reorder(workspaceId, userId, project_ids);

      res.json(successResponse({ message: 'Projects reordered' }));
    } catch (error) {
      next(error);
    }
  }
}

export const projectsController = new ProjectsController();
