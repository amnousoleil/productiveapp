"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadRateLimiter = exports.registerRateLimiter = exports.loginRateLimiter = exports.defaultRateLimiter = void 0;
exports.customRateLimiter = customRateLimiter;
exports.createRateLimiter = customRateLimiter;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const env_js_1 = require("../config/env.js");
const constants_js_1 = require("../config/constants.js");
// Store for tracking rate limits (in production, use Redis)
const rateLimitStore = new Map();
function getClientIdentifier(req) {
    // Use user ID if authenticated, otherwise use IP
    const user = req.user;
    if (user?.id) {
        return `user:${user.id}`;
    }
    const forwarded = req.headers['x-forwarded-for'];
    const ip = Array.isArray(forwarded)
        ? forwarded[0]
        : forwarded?.split(',')[0] || req.ip || 'unknown';
    return `ip:${ip}`;
}
exports.defaultRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: env_js_1.env.RATE_LIMIT_WINDOW_MS,
    max: env_js_1.env.RATE_LIMIT_MAX,
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
exports.loginRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: constants_js_1.RATE_LIMITS.LOGIN.windowMs,
    max: constants_js_1.RATE_LIMITS.LOGIN.max,
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
exports.registerRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: constants_js_1.RATE_LIMITS.REGISTER.windowMs,
    max: constants_js_1.RATE_LIMITS.REGISTER.max,
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
exports.uploadRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: constants_js_1.RATE_LIMITS.UPLOAD.windowMs,
    max: constants_js_1.RATE_LIMITS.UPLOAD.max,
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
function customRateLimiter(options) {
    return (req, res, next) => {
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
//# sourceMappingURL=rateLimit.middleware.js.map