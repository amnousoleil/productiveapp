import type { Request, Response } from 'express';
export declare const defaultRateLimiter: import("express-rate-limit").RateLimitRequestHandler;
export declare const loginRateLimiter: import("express-rate-limit").RateLimitRequestHandler;
export declare const registerRateLimiter: import("express-rate-limit").RateLimitRequestHandler;
export declare const uploadRateLimiter: import("express-rate-limit").RateLimitRequestHandler;
export declare function customRateLimiter(options: {
    windowMs: number;
    max: number;
    keyPrefix?: string;
}): (req: Request, res: Response, next: () => void) => void;
export { customRateLimiter as createRateLimiter };
//# sourceMappingURL=rateLimit.middleware.d.ts.map