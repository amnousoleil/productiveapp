/**
 * AI Controller
 * ProductiveApp v4.0
 */

import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../../types/index.js';
import { aiService } from './ai.service.js';
import { successResponse } from '../../utils/helpers.js';
import { z } from 'zod';

const generateSchema = z.object({
  prompt: z.string().min(1).max(50000),
  max_tokens: z.number().int().min(100).max(4000).optional(),
  system: z.string().max(10000).optional()
});

const chatSchema = z.object({
  message: z.string().min(1).max(10000),
  context: z.object({
    tasks: z.array(z.object({
      id: z.string(),
      title: z.string(),
      status: z.string(),
      priority: z.number(),
      project: z.string().optional()
    })).optional(),
    projects: z.array(z.object({
      id: z.string(),
      name: z.string()
    })).optional(),
    currentUser: z.string().optional(),
    currentView: z.string().optional()
  }).optional(),
  history: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string()
  })).optional()
});

const correctSchema = z.object({
  text: z.string().min(1).max(5000),
  mode: z.enum(['ortho', 'all']).optional()
});

export class AiController {
  async generate(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = generateSchema.parse(req.body);

      console.log(`🤖 AI Generate request from user ${req.user?.id}, prompt length: ${input.prompt.length}`);

      const result = await aiService.generate(input);

      res.json(successResponse({ content: result.content }));
    } catch (error) {
      next(error);
    }
  }

  async chat(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = chatSchema.parse(req.body);

      console.log(`💬 AI Chat request from user ${req.user?.id}: "${input.message.substring(0, 50)}..."`);

      const result = await aiService.chat(input);

      res.json(successResponse({
        content: result.content,
        model: result.model,
        tokens: result.tokens,
        cost: result.cost,
        actions: result.actions
      }));
    } catch (error) {
      next(error);
    }
  }

  async correct(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = correctSchema.parse(req.body);

      console.log(`✏️ AI Correct request from user ${req.user?.id}, text length: ${input.text.length}`);

      const corrected = await aiService.correctText(input.text, input.mode);

      res.json(successResponse({ corrected }));
    } catch (error) {
      next(error);
    }
  }
}

export const aiController = new AiController();
