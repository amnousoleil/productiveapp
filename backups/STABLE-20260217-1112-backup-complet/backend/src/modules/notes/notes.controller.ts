import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../../types/index.js';
import { notesService } from './notes.service.js';
import { successResponse, paginatedResponse, AppError } from '../../utils/helpers.js';
import { createNoteSchema, updateNoteSchema, paginationSchema, uuidSchema } from '../../utils/validation.js';
import { z } from 'zod';
import { recordSignalAsync } from '../signals/signals.service.js';

const listNotesSchema = paginationSchema.extend({
  q: z.string().optional(),
  project_id: uuidSchema.nullable().optional(),
  tags: z.string().optional().transform((val) => val?.split(',').filter(Boolean)),
  is_pinned: z.coerce.boolean().optional(),
  is_template: z.coerce.boolean().optional(),
  member_id: z.string().max(100).optional(),
});

const linkSchema = z.object({
  target_note_id: uuidSchema,
});

const memberIdSchema = z.object({
  member_id: z.string().max(100).optional(),
});

export class NotesController {
  async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.workspace!.id;
      const userId = req.user!.id;
      const input = createNoteSchema.parse(req.body);

      const note = await notesService.create(workspaceId, userId, input);

      // Record behavioral signal
      recordSignalAsync(userId, workspaceId, 'note_created', 'notes', note.id, {
        title_length: note.title?.length || 0,
        content_length: note.content?.length || 0,
        hour: new Date().getHours()
      });

      res.status(201).json(successResponse({ note }));
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const noteId = uuidSchema.parse(req.params.noteId);
      const userId = req.user!.id;
      const { member_id } = memberIdSchema.parse(req.query);

      const canAccess = await notesService.canAccess(noteId, userId, member_id);
      if (!canAccess) {
        throw AppError.forbidden('Access denied to this note');
      }

      const note = await notesService.getByIdWithAuthor(noteId);

      res.json(successResponse({ note }));
    } catch (error) {
      next(error);
    }
  }

  async list(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.workspace!.id;
      const userId = req.user!.id;
      const params = listNotesSchema.parse(req.query);

      const { notes, total } = await notesService.list(workspaceId, userId, params);

      res.json(paginatedResponse(notes, params, total));
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const noteId = uuidSchema.parse(req.params.noteId);
      const userId = req.user!.id;
      const workspaceId = req.workspace?.id || req.params.workspaceId;
      const input = updateNoteSchema.parse(req.body);

      const memberId = input.member_id;
      const canAccess = await notesService.canAccess(noteId, userId, memberId);
      if (!canAccess) {
        throw AppError.forbidden('Access denied to this note');
      }

      // Get old content length for delta calculation
      const oldNote = await notesService.getById(noteId);
      const oldLength = oldNote?.content?.length || 0;

      const note = await notesService.update(noteId, userId, input);

      // Record behavioral signal
      const newLength = note.content?.length || 0;
      if (workspaceId) {
        recordSignalAsync(userId, workspaceId, 'note_edited', 'notes', note.id, {
          content_length_delta: newLength - oldLength
        });
      }

      res.json(successResponse({ note }));
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const noteId = uuidSchema.parse(req.params.noteId);
      const userId = req.user!.id;
      const { member_id } = memberIdSchema.parse(req.query);

      const canAccess = await notesService.canAccess(noteId, userId, member_id);
      if (!canAccess) {
        throw AppError.forbidden('Access denied to this note');
      }

      await notesService.delete(noteId);

      res.json(successResponse({ message: 'Note deleted' }));
    } catch (error) {
      next(error);
    }
  }

  async restore(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const noteId = uuidSchema.parse(req.params.noteId);

      const note = await notesService.restore(noteId);

      res.json(successResponse({ note }));
    } catch (error) {
      next(error);
    }
  }

  async permanentDelete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const noteId = uuidSchema.parse(req.params.noteId);

      await notesService.permanentDelete(noteId);

      res.json(successResponse({ message: 'Note permanently deleted' }));
    } catch (error) {
      next(error);
    }
  }

  async getDeleted(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.workspace!.id;
      const userId = req.user!.id;
      const params = paginationSchema.parse(req.query);

      const { notes, total } = await notesService.getDeleted(workspaceId, userId, params);

      res.json(paginatedResponse(notes, params, total));
    } catch (error) {
      next(error);
    }
  }

  async getVersions(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const noteId = uuidSchema.parse(req.params.noteId);
      const userId = req.user!.id;
      const { member_id } = memberIdSchema.parse(req.query);

      const canAccess = await notesService.canAccess(noteId, userId, member_id);
      if (!canAccess) {
        throw AppError.forbidden('Access denied to this note');
      }

      const versions = await notesService.getVersions(noteId);

      res.json(successResponse({ versions }));
    } catch (error) {
      next(error);
    }
  }

  async restoreVersion(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const noteId = uuidSchema.parse(req.params.noteId);
      const versionId = uuidSchema.parse(req.params.versionId);
      const userId = req.user!.id;

      const note = await notesService.restoreVersion(noteId, versionId, userId);

      res.json(successResponse({ note }));
    } catch (error) {
      next(error);
    }
  }

  async getLinks(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const noteId = uuidSchema.parse(req.params.noteId);

      const links = await notesService.getLinks(noteId);

      res.json(successResponse({ links }));
    } catch (error) {
      next(error);
    }
  }

  async addLink(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const noteId = uuidSchema.parse(req.params.noteId);
      const { target_note_id } = linkSchema.parse(req.body);

      await notesService.addLink(noteId, target_note_id);

      res.status(201).json(successResponse({ message: 'Link added' }));
    } catch (error) {
      next(error);
    }
  }

  async removeLink(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const noteId = uuidSchema.parse(req.params.noteId);
      const targetNoteId = uuidSchema.parse(req.params.targetNoteId);

      await notesService.removeLink(noteId, targetNoteId);

      res.json(successResponse({ message: 'Link removed' }));
    } catch (error) {
      next(error);
    }
  }

  async duplicate(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const noteId = uuidSchema.parse(req.params.noteId);
      const userId = req.user!.id;
      const workspaceId = req.workspace!.id;

      const note = await notesService.duplicate(noteId, userId, workspaceId);

      res.status(201).json(successResponse({ note }));
    } catch (error) {
      next(error);
    }
  }

  async getTemplates(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.workspace!.id;

      const templates = await notesService.getTemplates(workspaceId);

      res.json(successResponse({ templates }));
    } catch (error) {
      next(error);
    }
  }
}

export const notesController = new NotesController();
