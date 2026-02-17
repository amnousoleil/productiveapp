import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../../types/index.js';
import { workspacesService } from './workspaces.service.js';
import { successResponse, paginatedResponse } from '../../utils/helpers.js';
import {
  createWorkspaceSchema,
  updateWorkspaceSchema,
  inviteToWorkspaceSchema,
  paginationSchema,
  uuidSchema,
} from '../../utils/validation.js';
import { z } from 'zod';

const updateMemberRoleSchema = z.object({
  role: z.enum(['admin', 'member', 'guest']),
});

const transferOwnershipSchema = z.object({
  new_owner_id: uuidSchema,
});

const acceptInvitationSchema = z.object({
  token: z.string().min(1),
});

export class WorkspacesController {
  async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const input = createWorkspaceSchema.parse(req.body);

      const workspace = await workspacesService.create(userId, input);

      res.status(201).json(successResponse({ workspace }));
    } catch (error) {
      next(error);
    }
  }

  async getMyWorkspaces(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const workspaces = await workspacesService.getUserWorkspaces(userId);

      res.json(successResponse({ workspaces }));
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = uuidSchema.parse(req.params.id);
      const workspace = await workspacesService.getById(workspaceId);

      res.json(successResponse({ workspace }));
    } catch (error) {
      next(error);
    }
  }

  async getBySlug(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const slug = req.params.slug;
      const workspace = await workspacesService.getBySlug(slug);

      res.json(successResponse({ workspace }));
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.workspace!.id;
      const input = updateWorkspaceSchema.parse(req.body);

      const workspace = await workspacesService.update(workspaceId, input);

      res.json(successResponse({ workspace }));
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.workspace!.id;

      await workspacesService.delete(workspaceId);

      res.json(successResponse({ message: 'Workspace deleted' }));
    } catch (error) {
      next(error);
    }
  }

  async getMembers(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.workspace!.id;
      const params = paginationSchema.parse(req.query);

      const { members, total } = await workspacesService.getMembers(workspaceId, params);

      res.json(paginatedResponse(members, params, total));
    } catch (error) {
      next(error);
    }
  }

  async updateMemberRole(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.workspace!.id;
      const userId = uuidSchema.parse(req.params.userId);
      const { role } = updateMemberRoleSchema.parse(req.body);

      await workspacesService.updateMemberRole(workspaceId, userId, role);

      res.json(successResponse({ message: 'Member role updated' }));
    } catch (error) {
      next(error);
    }
  }

  async removeMember(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.workspace!.id;
      const userId = uuidSchema.parse(req.params.userId);

      await workspacesService.removeMember(workspaceId, userId);

      res.json(successResponse({ message: 'Member removed' }));
    } catch (error) {
      next(error);
    }
  }

  async invite(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.workspace!.id;
      const inviterId = req.user!.id;
      const input = inviteToWorkspaceSchema.parse(req.body);

      const result = await workspacesService.invite(workspaceId, inviterId, input);

      res.status(201).json(successResponse(result));
    } catch (error) {
      next(error);
    }
  }

  async acceptInvitation(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const { token } = acceptInvitationSchema.parse(req.body);

      const workspace = await workspacesService.acceptInvitation(token, userId);

      res.json(successResponse({ workspace }));
    } catch (error) {
      next(error);
    }
  }

  async getInvitations(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.workspace!.id;

      const invitations = await workspacesService.getInvitations(workspaceId);

      res.json(successResponse({ invitations }));
    } catch (error) {
      next(error);
    }
  }

  async cancelInvitation(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.workspace!.id;
      const invitationId = uuidSchema.parse(req.params.invitationId);

      await workspacesService.cancelInvitation(workspaceId, invitationId);

      res.json(successResponse({ message: 'Invitation cancelled' }));
    } catch (error) {
      next(error);
    }
  }

  async leave(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.workspace!.id;
      const userId = req.user!.id;

      await workspacesService.leave(workspaceId, userId);

      res.json(successResponse({ message: 'Left workspace' }));
    } catch (error) {
      next(error);
    }
  }

  async transferOwnership(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.workspace!.id;
      const currentOwnerId = req.user!.id;
      const { new_owner_id } = transferOwnershipSchema.parse(req.body);

      await workspacesService.transferOwnership(workspaceId, currentOwnerId, new_owner_id);

      res.json(successResponse({ message: 'Ownership transferred' }));
    } catch (error) {
      next(error);
    }
  }
}

export const workspacesController = new WorkspacesController();
