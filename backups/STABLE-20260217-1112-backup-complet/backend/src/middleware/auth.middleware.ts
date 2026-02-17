import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../types/index.js';
import { verifyAccessToken, hashToken } from '../utils/jwt.js';
import { AppError } from '../utils/helpers.js';
import { sql } from '../config/database.js';

export async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw AppError.unauthorized('No token provided');
    }

    const token = authHeader.substring(7);

    // Verify token
    const payload = verifyAccessToken(token);

    // Check if token is blacklisted
    const tokenHash = hashToken(token);
    const blacklisted = await sql`
      SELECT id FROM token_blacklist WHERE token_hash = ${tokenHash}
    `;

    if (blacklisted.length > 0) {
      throw AppError.unauthorized('Token has been revoked');
    }

    // Get user from database
    const users = await sql`
      SELECT
        id, email, name, avatar_url, status, plan,
        language, timezone, created_at, updated_at,
        last_login_at, email_verified
      FROM users
      WHERE id = ${payload.userId}
    `;

    if (users.length === 0) {
      throw AppError.unauthorized('User not found');
    }

    // Get session
    const sessions = await sql`
      SELECT id, user_id, expires_at, created_at
      FROM sessions
      WHERE id = ${payload.sessionId} AND user_id = ${payload.userId}
    `;

    if (sessions.length === 0) {
      throw AppError.unauthorized('Session not found');
    }

    const session = sessions[0];
    if (new Date(session.expires_at) < new Date()) {
      throw AppError.unauthorized('Session expired');
    }

    // Attach user and session to request
    req.user = users[0] as AuthenticatedRequest['user'];
    req.session = session as AuthenticatedRequest['session'];

    next();
  } catch (error) {
    if (error instanceof AppError) {
      res.status(error.statusCode).json({
        success: false,
        error: {
          code: error.code,
          message: error.message,
        },
      });
      return;
    }

    if (error instanceof Error) {
      if (
        error.message === 'Token expired' ||
        error.message === 'Invalid token' ||
        error.message === 'Invalid token type'
      ) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: error.message,
          },
        });
        return;
      }
    }

    next(error);
  }
}

export async function optionalAuthMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token, continue without authentication
      return next();
    }

    // Token present, validate it
    await authMiddleware(req, res, next);
  } catch {
    // Ignore auth errors for optional auth
    next();
  }
}
