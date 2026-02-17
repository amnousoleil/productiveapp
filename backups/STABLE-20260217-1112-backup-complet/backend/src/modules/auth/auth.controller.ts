import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../../types/index.js';
import { authService } from './auth.service.js';
import { tasksService } from '../tasks/tasks.service.js';
import { onboardingService } from '../onboarding/onboarding.service.js';
import { successResponse } from '../../utils/helpers.js';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  updatePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../../utils/validation.js';

export class AuthController {
  async register(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = registerSchema.parse(req.body);
      const ip = req.ip;
      const userAgent = req.headers['user-agent'];

      const result = await authService.register(input, ip, userAgent);

      // Setup onboarding data for the new user
      await onboardingService.setupNewUserWorkspace(
        result.user.id,
        result.user.name,
        result.user.email
      );

      res.status(201).json(successResponse(result));
    } catch (error) {
      next(error);
    }
  }

  async login(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = loginSchema.parse(req.body);
      const ip = req.ip;
      const userAgent = req.headers['user-agent'];

      const result = await authService.login(input, ip, userAgent);

      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  }

  async logout(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const sessionId = req.session!.id;
      const token = req.headers.authorization!.substring(7);

      // Reset all in_progress tasks to todo before logout
      // This provides implicit time tracking - no in_progress tasks = employee not active
      const resetCount = await tasksService.resetUserTasksOnLogout(userId);

      await authService.logout(userId, sessionId, token);

      res.json(successResponse({
        message: 'Logged out successfully',
        tasks_reset: resetCount
      }));
    } catch (error) {
      next(error);
    }
  }

  async logoutAll(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;

      await authService.logoutAll(userId);

      res.json(successResponse({ message: 'Logged out from all devices' }));
    } catch (error) {
      next(error);
    }
  }

  async refresh(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = refreshTokenSchema.parse(req.body);
      const ip = req.ip;
      const userAgent = req.headers['user-agent'];

      const tokens = await authService.refresh(refreshToken, ip, userAgent);

      res.json(successResponse({ tokens }));
    } catch (error) {
      next(error);
    }
  }

  async getMe(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const user = await authService.getMe(userId);

      res.json(successResponse({ user }));
    } catch (error) {
      next(error);
    }
  }

  async updatePassword(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const input = updatePasswordSchema.parse(req.body);

      await authService.updatePassword(userId, {
        currentPassword: input.currentPassword,
        newPassword: input.newPassword,
      });

      res.json(successResponse({ message: 'Password updated successfully' }));
    } catch (error) {
      next(error);
    }
  }

  async getSessions(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const currentSessionId = req.session!.id;

      const sessions = await authService.getSessions(userId, currentSessionId);

      res.json(successResponse({ sessions }));
    } catch (error) {
      next(error);
    }
  }

  async deleteSession(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const sessionId = req.params.sessionId;

      await authService.deleteSession(userId, sessionId);

      res.json(successResponse({ message: 'Session deleted' }));
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = forgotPasswordSchema.parse(req.body);

      await authService.forgotPassword(email);

      res.json(
        successResponse({
          message: 'If the email exists, a password reset link has been sent',
        })
      );
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = resetPasswordSchema.parse(req.body);

      await authService.resetPassword(input.token, input.password);

      res.json(successResponse({ message: 'Password reset successfully' }));
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
