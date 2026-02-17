import type { Request, Response, NextFunction } from 'express';
export declare function inputSanitizer(req: Request, _res: Response, next: NextFunction): void;
/**
 * Block suspicious request patterns
 */
export declare function requestGuard(req: Request, res: Response, next: NextFunction): void;
/**
 * Add security-related response headers not covered by helmet
 */
export declare function additionalSecurityHeaders(_req: Request, res: Response, next: NextFunction): void;
//# sourceMappingURL=security.middleware.d.ts.map