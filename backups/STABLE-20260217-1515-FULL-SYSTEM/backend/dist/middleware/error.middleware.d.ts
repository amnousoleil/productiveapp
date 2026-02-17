import type { Request, Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../types/index.js';
export declare function notFoundHandler(req: Request, res: Response, _next: NextFunction): void;
export declare function errorHandler(err: Error, req: Request | AuthenticatedRequest, res: Response, _next: NextFunction): void;
export declare function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<void>): (req: Request, res: Response, next: NextFunction) => void;
export declare function validateBody<T>(schema: {
    parse: (data: unknown) => T;
}): (req: Request, _res: Response, next: NextFunction) => void;
export declare function validateQuery<T>(schema: {
    parse: (data: unknown) => T;
}): (req: Request, _res: Response, next: NextFunction) => void;
export declare function validateParams<T>(schema: {
    parse: (data: unknown) => T;
}): (req: Request, _res: Response, next: NextFunction) => void;
//# sourceMappingURL=error.middleware.d.ts.map