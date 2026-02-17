import rateLimit from 'express-rate-limit';
import type { Request, Response } from 'express';
import { env } from '../config/env.js';
import { RATE_LIMITS } from '../config/constants.js';

// Store for tracking rate limits (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function getClientIdentifier(req: Request): string {
  // Use user ID if authenticated, otherwise use IP
  const user = (req as { user?: { id: string } }).user;
  if (user?.id) {
    return `user:${user.id}`;
  }

  const forwarded = req.headers['x-forwarded-for'];
  const ip = Array.isArray(forwarded)
    ? forwarded[0]
    : forwarded?.split(',')[0] || req.ip || 'unknown';

  return `ip:${ip}`;
}

export const defaultRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many requests, please try again later.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: getClientIdentifier,
});

export const loginRateLimiter = rateLimit({
  windowMs: RATE_LIMITS.LOGIN.windowMs,
  max: RATE_LIMITS.LOGIN.max,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many login attempts, please try again later.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: getClientIdentifier,
  skipSuccessfulRequests: false,
});

export const registerRateLimiter = rateLimit({
  windowMs: RATE_LIMITS.REGISTER.windowMs,
  max: RATE_LIMITS.REGISTER.max,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many registration attempts, please try again later.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: getClientIdentifier,
});

export const uploadRateLimiter = rateLimit({
  windowMs: RATE_LIMITS.UPLOAD.windowMs,
  max: RATE_LIMITS.UPLOAD.max,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many uploads, please try again later.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: getClientIdentifier,
});

// Custom rate limiter with sliding window (for more precise control)
export function customRateLimiter(
  options: {
    windowMs: number;
    max: number;
    keyPrefix?: string;
  }
) {
  return (req: Request, res: Response, next: () => void): void => {
    const key = `${options.keyPrefix || 'custom'}:${getClientIdentifier(req)}`;
    const now = Date.now();
    const entry = rateLimitStore.get(key);

    if (!entry || now > entry.resetAt) {
      rateLimitStore.set(key, { count: 1, resetAt: now + options.windowMs });
      return next();
    }

    if (entry.count >= options.max) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
      res.set('Retry-After', String(retryAfter));
      res.status(429).json({
        success: false,
        error: {
          code: 'TOO_MANY_REQUESTS',
          message: 'Rate limit exceeded, please try again later.',
        },
      });
      return;
    }

    entry.count++;
    next();
  };
}

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetAt) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Clean up every minute

// Alias for backward compatibility
export { customRateLimiter as createRateLimiter };
