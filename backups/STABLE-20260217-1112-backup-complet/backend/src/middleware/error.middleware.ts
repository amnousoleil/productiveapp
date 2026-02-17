import type { Request, Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../types/index.js';
import { ZodError } from 'zod';
import { AppError, errorResponse } from '../utils/helpers.js';
import { isDev } from '../config/env.js';
import { ErrorLogService } from '../modules/admin/services/error-log.service.js';
import pool from '../modules/accounting/pool.js';

// Instance globale du service error log
const errorLogService = new ErrorLogService(pool);

export function notFoundHandler(
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  res.status(404).json(
    errorResponse('NOT_FOUND', `Route ${req.method} ${req.path} not found`)
  );
}

export function errorHandler(
  err: Error,
  req: Request | AuthenticatedRequest,
  res: Response,
  _next: NextFunction
): void {
  console.error('Error:', err);

  // Log error to database (async, don't block response)
  errorLogService.createLog({
    message: err.message || 'Unknown error',
    stack: err.stack,
    errorType: err.name || 'Error',
    severity: res.statusCode >= 500 ? 'error' : 'warning',
    url: req.originalUrl,
    userAgent: req.headers['user-agent'],
    memberId: (req as AuthenticatedRequest).user?.id,
    ipAddress: req.ip,
    httpMethod: req.method,
    requestPath: req.path,
  }).catch((logErr) => {
    console.error('[ErrorHandler] Failed to log error to database:', logErr);
  });

  // Handle AppError
  if (err instanceof AppError) {
    res.status(err.statusCode).json(
      errorResponse(err.code, err.message, err.details)
    );
    return;
  }

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const errors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));

    res.status(400).json(
      errorResponse('VALIDATION_ERROR', 'Validation failed', errors)
    );
    return;
  }

  // Handle PostgreSQL errors
  if ('code' in err && typeof (err as { code: string }).code === 'string') {
    const pgError = err as { code: string; detail?: string; constraint?: string };

    switch (pgError.code) {
      case '23505': // unique_violation
        res.status(409).json(
          errorResponse(
            'CONFLICT',
            'A record with this value already exists',
            isDev ? pgError.detail : undefined
          )
        );
        return;

      case '23503': // foreign_key_violation
        res.status(400).json(
          errorResponse(
            'BAD_REQUEST',
            'Referenced record not found',
            isDev ? pgError.detail : undefined
          )
        );
        return;

      case '23502': // not_null_violation
        res.status(400).json(
          errorResponse(
            'BAD_REQUEST',
            'Missing required field',
            isDev ? pgError.detail : undefined
          )
        );
        return;

      case '22P02': // invalid_text_representation (invalid UUID)
        res.status(400).json(
          errorResponse('BAD_REQUEST', 'Invalid ID format')
        );
        return;
    }
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    res.status(401).json(
      errorResponse('UNAUTHORIZED', 'Invalid token')
    );
    return;
  }

  if (err.name === 'TokenExpiredError') {
    res.status(401).json(
      errorResponse('UNAUTHORIZED', 'Token expired')
    );
    return;
  }

  // Handle syntax errors (malformed JSON)
  if (err instanceof SyntaxError && 'body' in err) {
    res.status(400).json(
      errorResponse('BAD_REQUEST', 'Invalid JSON in request body')
    );
    return;
  }

  // Generic error handler - NEVER leak internals in production
  const statusCode = 'statusCode' in err ? (err as { statusCode: number }).statusCode : 500;

  res.status(statusCode).json(
    errorResponse(
      'INTERNAL_ERROR',
      'Internal server error'
    )
  );

  // Log the full error server-side only
  if (!isDev) {
    console.error('Unhandled error:', err.message, err.stack);
  }
}

export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export function validateBody<T>(
  schema: { parse: (data: unknown) => T }
) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      next(error);
    }
  };
}

export function validateQuery<T>(
  schema: { parse: (data: unknown) => T }
) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      req.query = schema.parse(req.query) as typeof req.query;
      next();
    } catch (error) {
      next(error);
    }
  };
}

export function validateParams<T>(
  schema: { parse: (data: unknown) => T }
) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      req.params = schema.parse(req.params) as typeof req.params;
      next();
    } catch (error) {
      next(error);
    }
  };
}
