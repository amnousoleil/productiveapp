"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = notFoundHandler;
exports.errorHandler = errorHandler;
exports.asyncHandler = asyncHandler;
exports.validateBody = validateBody;
exports.validateQuery = validateQuery;
exports.validateParams = validateParams;
const zod_1 = require("zod");
const helpers_js_1 = require("../utils/helpers.js");
const env_js_1 = require("../config/env.js");
const error_log_service_js_1 = require("../modules/admin/services/error-log.service.js");
const pool_js_1 = __importDefault(require("../modules/accounting/pool.js"));
// Instance globale du service error log
const errorLogService = new error_log_service_js_1.ErrorLogService(pool_js_1.default);
function notFoundHandler(req, res, _next) {
    res.status(404).json((0, helpers_js_1.errorResponse)('NOT_FOUND', `Route ${req.method} ${req.path} not found`));
}
function errorHandler(err, req, res, _next) {
    console.error('Error:', err);
    // Log error to database (async, don't block response)
    errorLogService.createLog({
        message: err.message || 'Unknown error',
        stack: err.stack,
        errorType: err.name || 'Error',
        severity: res.statusCode >= 500 ? 'error' : 'warning',
        url: req.originalUrl,
        userAgent: req.headers['user-agent'],
        memberId: req.user?.id,
        ipAddress: req.ip,
        httpMethod: req.method,
        requestPath: req.path,
    }).catch((logErr) => {
        console.error('[ErrorHandler] Failed to log error to database:', logErr);
    });
    // Handle AppError
    if (err instanceof helpers_js_1.AppError) {
        res.status(err.statusCode).json((0, helpers_js_1.errorResponse)(err.code, err.message, err.details));
        return;
    }
    // Handle Zod validation errors
    if (err instanceof zod_1.ZodError) {
        const errors = err.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
        }));
        res.status(400).json((0, helpers_js_1.errorResponse)('VALIDATION_ERROR', 'Validation failed', errors));
        return;
    }
    // Handle PostgreSQL errors
    if ('code' in err && typeof err.code === 'string') {
        const pgError = err;
        switch (pgError.code) {
            case '23505': // unique_violation
                res.status(409).json((0, helpers_js_1.errorResponse)('CONFLICT', 'A record with this value already exists', env_js_1.isDev ? pgError.detail : undefined));
                return;
            case '23503': // foreign_key_violation
                res.status(400).json((0, helpers_js_1.errorResponse)('BAD_REQUEST', 'Referenced record not found', env_js_1.isDev ? pgError.detail : undefined));
                return;
            case '23502': // not_null_violation
                res.status(400).json((0, helpers_js_1.errorResponse)('BAD_REQUEST', 'Missing required field', env_js_1.isDev ? pgError.detail : undefined));
                return;
            case '22P02': // invalid_text_representation (invalid UUID)
                res.status(400).json((0, helpers_js_1.errorResponse)('BAD_REQUEST', 'Invalid ID format'));
                return;
        }
    }
    // Handle JWT errors
    if (err.name === 'JsonWebTokenError') {
        res.status(401).json((0, helpers_js_1.errorResponse)('UNAUTHORIZED', 'Invalid token'));
        return;
    }
    if (err.name === 'TokenExpiredError') {
        res.status(401).json((0, helpers_js_1.errorResponse)('UNAUTHORIZED', 'Token expired'));
        return;
    }
    // Handle syntax errors (malformed JSON)
    if (err instanceof SyntaxError && 'body' in err) {
        res.status(400).json((0, helpers_js_1.errorResponse)('BAD_REQUEST', 'Invalid JSON in request body'));
        return;
    }
    // Generic error handler - NEVER leak internals in production
    const statusCode = 'statusCode' in err ? err.statusCode : 500;
    res.status(statusCode).json((0, helpers_js_1.errorResponse)('INTERNAL_ERROR', 'Internal server error'));
    // Log the full error server-side only
    if (!env_js_1.isDev) {
        console.error('Unhandled error:', err.message, err.stack);
    }
}
function asyncHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}
function validateBody(schema) {
    return (req, _res, next) => {
        try {
            req.body = schema.parse(req.body);
            next();
        }
        catch (error) {
            next(error);
        }
    };
}
function validateQuery(schema) {
    return (req, _res, next) => {
        try {
            req.query = schema.parse(req.query);
            next();
        }
        catch (error) {
            next(error);
        }
    };
}
function validateParams(schema) {
    return (req, _res, next) => {
        try {
            req.params = schema.parse(req.params);
            next();
        }
        catch (error) {
            next(error);
        }
    };
}
//# sourceMappingURL=error.middleware.js.map