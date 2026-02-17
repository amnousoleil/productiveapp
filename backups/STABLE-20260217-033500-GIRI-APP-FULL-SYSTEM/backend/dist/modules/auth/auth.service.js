"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = exports.AuthService = void 0;
const database_js_1 = require("../../config/database.js");
const password_js_1 = require("../../utils/password.js");
const jwt_js_1 = require("../../utils/jwt.js");
const helpers_js_1 = require("../../utils/helpers.js");
const email_service_js_1 = require("../../services/email.service.js");
class AuthService {
    async register(input, ip, userAgent) {
        const { email, password, name } = input;
        // Check if email exists
        const existing = await (0, database_js_1.sql) `
      SELECT id FROM users WHERE email = ${email.toLowerCase()}
    `;
        if (existing.length > 0) {
            throw helpers_js_1.AppError.conflict('Email already registered');
        }
        // Hash password
        const passwordHash = await (0, password_js_1.hashPassword)(password);
        // Create user
        const userId = (0, helpers_js_1.generateUUID)();
        const now = new Date();
        const users = await (0, database_js_1.sql) `
      INSERT INTO users (id, email, password_hash, name, created_at, updated_at)
      VALUES (${userId}, ${email.toLowerCase()}, ${passwordHash}, ${name}, ${now}, ${now})
      RETURNING id, email, name, avatar_url, status, plan, language, timezone,
                created_at, updated_at, last_login_at, email_verified
    `;
        const user = users[0];
        // Create default workspace for user
        const workspaceId = (0, helpers_js_1.generateUUID)();
        const workspaceSlug = (0, helpers_js_1.generateUniqueSlug)(name);
        await (0, database_js_1.sql) `
      INSERT INTO workspaces (id, owner_id, name, slug, created_at, updated_at)
      VALUES (${workspaceId}, ${userId}, ${`${name}'s Workspace`}, ${workspaceSlug}, ${now}, ${now})
    `;
        // Create session
        const tokens = await this.createSession(userId, ip, userAgent);
        // Update last login
        await (0, database_js_1.sql) `UPDATE users SET last_login_at = ${now} WHERE id = ${userId}`;
        // Add user to workspace members
        await (0, database_js_1.sql) `
      INSERT INTO workspace_members (workspace_id, user_id, role, joined_at)
      VALUES (${workspaceId}, ${userId}, 'owner', ${now})
    `;
        // Send welcome email (async, don't wait)
        email_service_js_1.EmailService.sendWelcome(email, name).catch(err => {
            console.error('[AuthService] Failed to send welcome email:', err);
        });
        return { user, tokens };
    }
    async login(input, ip, userAgent) {
        const { email, password } = input;
        // Get user with password
        const users = await (0, database_js_1.sql) `
      SELECT id, email, password_hash, name, avatar_url, status, plan,
             language, timezone, created_at, updated_at, last_login_at, email_verified
      FROM users
      WHERE email = ${email.toLowerCase()}
    `;
        if (users.length === 0) {
            throw helpers_js_1.AppError.unauthorized('Invalid email or password');
        }
        const user = users[0];
        // Verify password
        const isValid = await (0, password_js_1.verifyPassword)(password, user.password_hash);
        if (!isValid) {
            throw helpers_js_1.AppError.unauthorized('Invalid email or password');
        }
        // Create session
        const tokens = await this.createSession(user.id, ip, userAgent);
        // Update last login
        const now = new Date();
        await (0, database_js_1.sql) `UPDATE users SET last_login_at = ${now}, status = 'online' WHERE id = ${user.id}`;
        // Return user without password_hash
        const { password_hash: _, ...userPublic } = user;
        return { user: userPublic, tokens };
    }
    async logout(userId, sessionId, accessToken) {
        // Delete session
        await (0, database_js_1.sql) `DELETE FROM sessions WHERE id = ${sessionId} AND user_id = ${userId}`;
        // Blacklist the access token
        const tokenHash = (0, jwt_js_1.hashToken)(accessToken);
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
        await (0, database_js_1.sql) `
      INSERT INTO token_blacklist (id, token_hash, user_id, expires_at)
      VALUES (${(0, helpers_js_1.generateUUID)()}, ${tokenHash}, ${userId}, ${expiresAt})
      ON CONFLICT (token_hash) DO NOTHING
    `;
        // Update user status
        await (0, database_js_1.sql) `UPDATE users SET status = 'offline' WHERE id = ${userId}`;
    }
    async logoutAll(userId) {
        // Delete all sessions for user
        await (0, database_js_1.sql) `DELETE FROM sessions WHERE user_id = ${userId}`;
        // Update user status
        await (0, database_js_1.sql) `UPDATE users SET status = 'offline' WHERE id = ${userId}`;
    }
    async refresh(refreshToken, ip, userAgent) {
        // Verify refresh token
        const payload = (0, jwt_js_1.verifyRefreshToken)(refreshToken);
        // Check if session exists
        const tokenHash = (0, jwt_js_1.hashToken)(refreshToken);
        const sessions = await (0, database_js_1.sql) `
      SELECT id, user_id, expires_at
      FROM sessions
      WHERE id = ${payload.sessionId}
        AND user_id = ${payload.userId}
        AND refresh_token_hash = ${tokenHash}
    `;
        if (sessions.length === 0) {
            throw helpers_js_1.AppError.unauthorized('Invalid refresh token');
        }
        const session = sessions[0];
        if (new Date(session.expires_at) < new Date()) {
            // Delete expired session
            await (0, database_js_1.sql) `DELETE FROM sessions WHERE id = ${session.id}`;
            throw helpers_js_1.AppError.unauthorized('Session expired');
        }
        // Generate new tokens
        const tokens = (0, jwt_js_1.generateTokens)({
            userId: payload.userId,
            sessionId: payload.sessionId,
        });
        // Update session with new refresh token hash
        const newRefreshTokenHash = (0, jwt_js_1.hashToken)(tokens.refreshToken);
        const newExpiresAt = (0, jwt_js_1.getRefreshTokenExpiry)();
        await (0, database_js_1.sql) `
      UPDATE sessions
      SET refresh_token_hash = ${newRefreshTokenHash},
          expires_at = ${newExpiresAt},
          ip_address = ${ip || null},
          user_agent = ${userAgent || null}
      WHERE id = ${session.id}
    `;
        return tokens;
    }
    async getMe(userId) {
        const users = await (0, database_js_1.sql) `
      SELECT id, email, name, avatar_url, status, plan, language, timezone,
             created_at, updated_at, last_login_at, email_verified
      FROM users
      WHERE id = ${userId}
    `;
        if (users.length === 0) {
            throw helpers_js_1.AppError.notFound('User');
        }
        return users[0];
    }
    async updatePassword(userId, input) {
        const { currentPassword, newPassword } = input;
        // Get current password hash
        const users = await (0, database_js_1.sql) `
      SELECT password_hash FROM users WHERE id = ${userId}
    `;
        if (users.length === 0) {
            throw helpers_js_1.AppError.notFound('User');
        }
        // Verify current password
        const isValid = await (0, password_js_1.verifyPassword)(currentPassword, users[0].password_hash);
        if (!isValid) {
            throw helpers_js_1.AppError.badRequest('Current password is incorrect');
        }
        // Hash new password
        const newPasswordHash = await (0, password_js_1.hashPassword)(newPassword);
        // Update password
        await (0, database_js_1.sql) `
      UPDATE users
      SET password_hash = ${newPasswordHash}, updated_at = ${new Date()}
      WHERE id = ${userId}
    `;
        // Optionally: Delete all other sessions (keep current one)
        // This forces re-login on other devices
    }
    async getSessions(userId, currentSessionId) {
        const sessions = await (0, database_js_1.sql) `
      SELECT id, ip_address, user_agent, created_at, expires_at
      FROM sessions
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `;
        return sessions.map((s) => ({
            ...s,
            current: s.id === currentSessionId,
        }));
    }
    async deleteSession(userId, sessionId) {
        await (0, database_js_1.sql) `
      DELETE FROM sessions
      WHERE id = ${sessionId} AND user_id = ${userId}
    `;
    }
    async forgotPassword(email) {
        // Check if user exists
        const users = await (0, database_js_1.sql) `
      SELECT id FROM users WHERE email = ${email.toLowerCase()}
    `;
        if (users.length === 0) {
            // Don't reveal if email exists
            return;
        }
        const userId = users[0].id;
        // Generate reset token
        const token = (0, jwt_js_1.generateSecureToken)();
        const tokenHash = (0, jwt_js_1.hashToken)(token);
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
        // Delete any existing reset tokens
        await (0, database_js_1.sql) `DELETE FROM password_reset_tokens WHERE user_id = ${userId}`;
        // Create new reset token
        await (0, database_js_1.sql) `
      INSERT INTO password_reset_tokens (id, user_id, token_hash, expires_at)
      VALUES (${(0, helpers_js_1.generateUUID)()}, ${userId}, ${tokenHash}, ${expiresAt})
    `;
        // Send password reset email
        const users2 = await (0, database_js_1.sql) `SELECT name FROM users WHERE id = ${userId}`;
        const userName = users2[0]?.name || 'Utilisateur';
        email_service_js_1.EmailService.sendPasswordReset(email, userName, token).catch(err => {
            console.error('[AuthService] Failed to send password reset email:', err);
        });
    }
    async resetPassword(token, newPassword) {
        const tokenHash = (0, jwt_js_1.hashToken)(token);
        // Find valid reset token
        const tokens = await (0, database_js_1.sql) `
      SELECT id, user_id, expires_at, used_at
      FROM password_reset_tokens
      WHERE token_hash = ${tokenHash}
    `;
        if (tokens.length === 0) {
            throw helpers_js_1.AppError.badRequest('Invalid or expired reset token');
        }
        const resetToken = tokens[0];
        if (resetToken.used_at) {
            throw helpers_js_1.AppError.badRequest('Reset token already used');
        }
        if (new Date(resetToken.expires_at) < new Date()) {
            throw helpers_js_1.AppError.badRequest('Reset token expired');
        }
        // Hash new password
        const passwordHash = await (0, password_js_1.hashPassword)(newPassword);
        // Update password and mark token as used
        await (0, database_js_1.sql) `
      UPDATE users
      SET password_hash = ${passwordHash}, updated_at = ${new Date()}
      WHERE id = ${resetToken.user_id}
    `;
        await (0, database_js_1.sql) `
      UPDATE password_reset_tokens
      SET used_at = ${new Date()}
      WHERE id = ${resetToken.id}
    `;
        // Delete all sessions for user (force re-login)
        await (0, database_js_1.sql) `DELETE FROM sessions WHERE user_id = ${resetToken.user_id}`;
    }
    async createSession(userId, ip, userAgent) {
        const sessionId = (0, helpers_js_1.generateUUID)();
        const tokens = (0, jwt_js_1.generateTokens)({ userId, sessionId });
        const accessTokenHash = (0, jwt_js_1.hashToken)(tokens.accessToken);
        const refreshTokenHash = (0, jwt_js_1.hashToken)(tokens.refreshToken);
        const expiresAt = (0, jwt_js_1.getRefreshTokenExpiry)();
        await (0, database_js_1.sql) `
      INSERT INTO sessions (id, user_id, token_hash, refresh_token_hash, ip_address, user_agent, expires_at)
      VALUES (${sessionId}, ${userId}, ${accessTokenHash}, ${refreshTokenHash}, ${ip || null}, ${userAgent || null}, ${expiresAt})
    `;
        return tokens;
    }
}
exports.AuthService = AuthService;
exports.authService = new AuthService();
//# sourceMappingURL=auth.service.js.map