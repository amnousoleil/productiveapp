import type { Request, Response, NextFunction } from 'express';

/**
 * Sanitize input to prevent NoSQL/SQL injection and XSS
 * Strips dangerous characters and patterns from request body, query, and params
 */
function sanitizeValue(value: unknown): unknown {
  if (typeof value === 'string') {
    // Remove null bytes
    let clean = value.replace(/\0/g, '');
    // Strip script tags
    clean = clean.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    // Strip event handlers
    clean = clean.replace(/\bon\w+\s*=\s*["'][^"']*["']/gi, '');
    // Strip javascript: protocol
    clean = clean.replace(/javascript\s*:/gi, '');
    // Strip data: protocol for non-image usage
    clean = clean.replace(/data\s*:\s*(?!image\/(png|jpeg|jpg|gif|webp|svg))[^;,]*/gi, '');
    return clean;
  }
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }
  if (value !== null && typeof value === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      // Block keys starting with $ (NoSQL injection)
      if (key.startsWith('$')) continue;
      sanitized[key] = sanitizeValue(val);
    }
    return sanitized;
  }
  return value;
}

export function inputSanitizer(req: Request, _res: Response, next: NextFunction): void {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeValue(req.body);
  }
  if (req.query && typeof req.query === 'object') {
    for (const key of Object.keys(req.query)) {
      if (typeof req.query[key] === 'string') {
        req.query[key] = sanitizeValue(req.query[key]) as string;
      }
    }
  }
  next();
}

/**
 * Block suspicious request patterns
 */
export function requestGuard(req: Request, res: Response, next: NextFunction): void {
  // Block path traversal attempts
  if (req.path.includes('..') || req.path.includes('%2e%2e')) {
    res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'Invalid path' } });
    return;
  }

  // Block overly long URLs (potential buffer overflow)
  if (req.originalUrl.length > 2048) {
    res.status(414).json({ success: false, error: { code: 'URI_TOO_LONG', message: 'Request URI too long' } });
    return;
  }

  // Block requests with suspicious user agents
  const ua = req.headers['user-agent'] || '';
  const blockedAgents = ['sqlmap', 'nikto', 'nmap', 'masscan', 'zgrab', 'dirbuster', 'gobuster'];
  if (blockedAgents.some(agent => ua.toLowerCase().includes(agent))) {
    res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Access denied' } });
    return;
  }

  next();
}

/**
 * Add security-related response headers not covered by helmet
 */
export function additionalSecurityHeaders(_req: Request, res: Response, next: NextFunction): void {
  // Prevent caching of API responses
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');

  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Prevent information leakage
  res.removeHeader('X-Powered-By');

  next();
}
