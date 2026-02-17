import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../../types/index.js';
import { messagingService } from './messaging.service.js';
import { successResponse, paginatedResponse, AppError } from '../../utils/helpers.js';
import { createConversationSchema, createMessageSchema, paginationSchema, uuidSchema } from '../../utils/validation.js';
import { z } from 'zod';
import { recordSignalAsync } from '../signals/signals.service.js';

const updateConversationSchema = z.object({
  name: z.string().max(255).nullable().optional(),
  description: z.string().max(1000).nullable().optional(),
});

const updateMessageSchema = z.object({
  content: z.string().min(1).max(10000),
});

const addParticipantSchema = z.object({
  user_id: uuidSchema,
  role: z.enum(['admin', 'member']).optional(),
});

const reactionSchema = z.object({
  emoji: z.string().min(1).max(10),
});

const markReadSchema = z.object({
  message_id: uuidSchema.optional(),
});

const messagesQuerySchema = paginationSchema.extend({
  before: uuidSchema.optional(),
});

const searchSchema = z.object({
  q: z.string().min(1).max(500),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export class MessagingController {
  async createConversation(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.workspace!.id;
      const userId = req.user!.id;
      const input = createConversationSchema.parse(req.body);

      const conversation = await messagingService.createConversation(workspaceId, userId, input);

      res.status(201).json(successResponse({ conversation }));
    } catch (error) {
      next(error);
    }
  }

  async getConversation(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const conversationId = uuidSchema.parse(req.params.conversationId);
      const userId = req.user!.id;

      const isParticipant = await messagingService.isParticipant(conversationId, userId);
      if (!isParticipant) {
        throw AppError.forbidden('Not a participant of this conversation');
      }

      const conversation = await messagingService.getByIdWithDetails(conversationId, userId);

      res.json(successResponse({ conversation }));
    } catch (error) {
      next(error);
    }
  }

  async listConversations(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.workspace!.id;
      const userId = req.user!.id;
      const params = paginationSchema.parse(req.query);

      const { conversations, total } = await messagingService.getUserConversations(workspaceId, userId, params);

      res.json(paginatedResponse(conversations, params, total));
    } catch (error) {
      next(error);
    }
  }

  async updateConversation(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const conversationId = uuidSchema.parse(req.params.conversationId);
      const userId = req.user!.id;
      const input = updateConversationSchema.parse(req.body);

      const isParticipant = await messagingService.isParticipant(conversationId, userId);
      if (!isParticipant) {
        throw AppError.forbidden('Not a participant of this conversation');
      }

      const conversation = await messagingService.updateConversation(conversationId, input);

      res.json(successResponse({ conversation }));
    } catch (error) {
      next(error);
    }
  }

  async deleteConversation(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const conversationId = uuidSchema.parse(req.params.conversationId);

      await messagingService.deleteConversation(conversationId);

      res.json(successResponse({ message: 'Conversation deleted' }));
    } catch (error) {
      next(error);
    }
  }

  async addParticipant(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const conversationId = uuidSchema.parse(req.params.conversationId);
      const input = addParticipantSchema.parse(req.body);

      await messagingService.addParticipant(conversationId, input);

      res.status(201).json(successResponse({ message: 'Participant added' }));
    } catch (error) {
      next(error);
    }
  }

  async removeParticipant(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const conversationId = uuidSchema.parse(req.params.conversationId);
      const userId = uuidSchema.parse(req.params.userId);

      await messagingService.removeParticipant(conversationId, userId);

      res.json(successResponse({ message: 'Participant removed' }));
    } catch (error) {
      next(error);
    }
  }

  async leaveConversation(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const conversationId = uuidSchema.parse(req.params.conversationId);
      const userId = req.user!.id;

      await messagingService.leaveConversation(conversationId, userId);

      res.json(successResponse({ message: 'Left conversation' }));
    } catch (error) {
      next(error);
    }
  }

  async sendMessage(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const conversationId = uuidSchema.parse(req.params.conversationId);
      const userId = req.user!.id;
      const input = createMessageSchema.parse(req.body);

      const isParticipant = await messagingService.isParticipant(conversationId, userId);
      if (!isParticipant) {
        throw AppError.forbidden('Not a participant of this conversation');
      }

      const message = await messagingService.sendMessage(conversationId, userId, input);

      // Record behavioral signal (get workspaceId from conversation)
      const conversation = await messagingService.getById(conversationId);
      const workspaceId = conversation?.workspace_id;
      if (workspaceId) {
        const wordCount = input.content?.split(/\s+/).filter(Boolean).length || 0;
        recordSignalAsync(userId, workspaceId, 'message_sent', 'messaging', message.id, {
          conversation_id: conversationId,
          word_count: wordCount,
          hour: new Date().getHours()
        });
      }

      res.status(201).json(successResponse({ message }));
    } catch (error) {
      next(error);
    }
  }

  async getMessages(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const conversationId = uuidSchema.parse(req.params.conversationId);
      const userId = req.user!.id;
      const params = messagesQuerySchema.parse(req.query);

      const isParticipant = await messagingService.isParticipant(conversationId, userId);
      if (!isParticipant) {
        throw AppError.forbidden('Not a participant of this conversation');
      }

      const { messages, total } = await messagingService.getMessages(conversationId, params);

      res.json(paginatedResponse(messages, params, total));
    } catch (error) {
      next(error);
    }
  }

  async updateMessage(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const messageId = uuidSchema.parse(req.params.messageId);
      const userId = req.user!.id;
      const input = updateMessageSchema.parse(req.body);

      const message = await messagingService.updateMessage(messageId, userId, input);

      res.json(successResponse({ message }));
    } catch (error) {
      next(error);
    }
  }

  async deleteMessage(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const messageId = uuidSchema.parse(req.params.messageId);
      const userId = req.user!.id;

      await messagingService.deleteMessage(messageId, userId);

      res.json(successResponse({ message: 'Message deleted' }));
    } catch (error) {
      next(error);
    }
  }

  async addReaction(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const messageId = uuidSchema.parse(req.params.messageId);
      const userId = req.user!.id;
      const { emoji } = reactionSchema.parse(req.body);

      await messagingService.addReaction(messageId, userId, emoji);

      res.status(201).json(successResponse({ message: 'Reaction added' }));
    } catch (error) {
      next(error);
    }
  }

  async removeReaction(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const messageId = uuidSchema.parse(req.params.messageId);
      const userId = req.user!.id;
      const emoji = decodeURIComponent(req.params.emoji);

      await messagingService.removeReaction(messageId, userId, emoji);

      res.json(successResponse({ message: 'Reaction removed' }));
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const conversationId = uuidSchema.parse(req.params.conversationId);
      const userId = req.user!.id;
      const { message_id } = markReadSchema.parse(req.body);

      await messagingService.markAsRead(conversationId, userId, message_id);

      res.json(successResponse({ message: 'Marked as read' }));
    } catch (error) {
      next(error);
    }
  }

  async pinMessage(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const messageId = uuidSchema.parse(req.params.messageId);

      await messagingService.pinMessage(messageId);

      res.json(successResponse({ message: 'Message pinned' }));
    } catch (error) {
      next(error);
    }
  }

  async unpinMessage(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const messageId = uuidSchema.parse(req.params.messageId);

      await messagingService.unpinMessage(messageId);

      res.json(successResponse({ message: 'Message unpinned' }));
    } catch (error) {
      next(error);
    }
  }

  async getPinnedMessages(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const conversationId = uuidSchema.parse(req.params.conversationId);
      const userId = req.user!.id;

      const isParticipant = await messagingService.isParticipant(conversationId, userId);
      if (!isParticipant) {
        throw AppError.forbidden('Not a participant of this conversation');
      }

      const messages = await messagingService.getPinnedMessages(conversationId);

      res.json(successResponse({ messages }));
    } catch (error) {
      next(error);
    }
  }

  async searchMessages(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.workspace!.id;
      const userId = req.user!.id;
      const params = searchSchema.parse(req.query);

      const { messages, total } = await messagingService.searchMessages(workspaceId, userId, params.q, params);

      res.json(paginatedResponse(messages, params, total));
    } catch (error) {
      next(error);
    }
  }
}

export const messagingController = new MessagingController();
