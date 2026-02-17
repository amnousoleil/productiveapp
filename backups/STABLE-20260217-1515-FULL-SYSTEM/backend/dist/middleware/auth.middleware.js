"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
exports.optionalAuthMiddleware = optionalAuthMiddleware;
const jwt_js_1 = require("../utils/jwt.js");
const helpers_js_1 = require("../utils/helpers.js");
const database_js_1 = require("../config/database.js");
async function authMiddleware(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw helpers_js_1.AppError.unauthorized('No token provided');
        }
        const token = authHeader.substring(7);
        // Verify token
        const payload = (0, jwt_js_1.verifyAccessToken)(token);
        // Check if token is blacklisted
        const tokenHash = (0, jwt_js_1.hashToken)(token);
        const blacklisted = await (0, database_js_1.sql) `
      SELECT id FROM token_blacklist WHERE token_hash = ${tokenHash}
    `;
        if (blacklisted.length > 0) {
            throw helpers_js_1.AppError.unauthorized('Token has been revoked');
        }
        // Get user from database
        const users = await (0, database_js_1.sql) `
      SELECT
        id, email, name, avatar_url, status, plan,
        language, timezone, created_at, updated_at,
        last_login_at, email_verified
      FROM users
      WHERE id = ${payload.userId}
    `;
        if (users.length === 0) {
            throw helpers_js_1.AppError.unauthorized('User not found');
        }
        // Get session
        const sessions = await (0, database_js_1.sql) `
      SELECT id, user_id, expires_at, created_at
      FROM sessions
      WHERE id = ${payload.sessionId} AND user_id = ${payload.userId}
    `;
        if (sessions.length === 0) {
            throw helpers_js_1.AppError.unauthorized('Session not found');
        }
        const session = sessions[0];
        if (new Date(session.expires_at) < new Date()) {
            throw helpers_js_1.AppError.unauthorized('Session expired');
        }
        // Attach user and session to request
        req.user = users[0];
        req.session = session;
        next();
    }
    catch (error) {
        if (error instanceof helpers_js_1.AppError) {
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
            if (error.message === 'Token expired' ||
                error.message === 'Invalid token' ||
                error.message === 'Invalid token type') {
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
async function optionalAuthMiddleware(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            // No token, continue without authentication
            return next();
        }
        // Token present, validate it
        await authMiddleware(req, res, next);
    }
    catch {
        // Ignore auth errors for optional auth
        next();
    }
}
//# sourceMappingURL=auth.middleware.js.map