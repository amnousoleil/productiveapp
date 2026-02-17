import { sql } from '../../config/database.js';
import { hashPassword, verifyPassword } from '../../utils/password.js';
import {
  generateTokens,
  hashToken,
  generateSecureToken,
  getRefreshTokenExpiry,
  verifyRefreshToken,
} from '../../utils/jwt.js';
import { generateUUID, generateUniqueSlug, AppError } from '../../utils/helpers.js';
import { EmailService } from '../../services/email.service.js';
import type { UserPublic, AuthTokens, UUID } from '../../types/index.js';
import type {
  RegisterInput,
  LoginInput,
  AuthResponse,
  UpdatePasswordInput,
  SessionInfo,
} from './auth.types.js';

export class AuthService {
  async register(input: RegisterInput, ip?: string, userAgent?: string): Promise<AuthResponse> {
    const { email, password, name } = input;

    // Check if email exists
    const existing = await sql`
      SELECT id FROM users WHERE email = ${email.toLowerCase()}
    `;

    if (existing.length > 0) {
      throw AppError.conflict('Email already registered');
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const userId = generateUUID();
    const now = new Date();

    const users = await sql`
      INSERT INTO users (id, email, password_hash, name, created_at, updated_at)
      VALUES (${userId}, ${email.toLowerCase()}, ${passwordHash}, ${name}, ${now}, ${now})
      RETURNING id, email, name, avatar_url, status, plan, language, timezone,
                created_at, updated_at, last_login_at, email_verified
    `;

    const user = users[0] as UserPublic;

    // Create default workspace for user
    const workspaceId = generateUUID();
    const workspaceSlug = generateUniqueSlug(name);

    await sql`
      INSERT INTO workspaces (id, owner_id, name, slug, created_at, updated_at)
      VALUES (${workspaceId}, ${userId}, ${`${name}'s Workspace`}, ${workspaceSlug}, ${now}, ${now})
    `;

    // Create session
    const tokens = await this.createSession(userId, ip, userAgent);

    // Update last login
    await sql`UPDATE users SET last_login_at = ${now} WHERE id = ${userId}`;

    // Add user to workspace members
    await sql`
      INSERT INTO workspace_members (workspace_id, user_id, role, joined_at)
      VALUES (${workspaceId}, ${userId}, 'owner', ${now})
    `;

    // Send welcome email (async, don't wait)
    EmailService.sendWelcome(email, name).catch(err => {
      console.error('[AuthService] Failed to send welcome email:', err);
    });

    return { user, tokens };
  }

  async login(input: LoginInput, ip?: string, userAgent?: string): Promise<AuthResponse> {
    const { email, password } = input;

    // Get user with password
    const users = await sql`
      SELECT id, email, password_hash, name, avatar_url, status, plan,
             language, timezone, created_at, updated_at, last_login_at, email_verified
      FROM users
      WHERE email = ${email.toLowerCase()}
    `;

    if (users.length === 0) {
      throw AppError.unauthorized('Invalid email or password');
    }

    const user = users[0];

    // Verify password
    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      throw AppError.unauthorized('Invalid email or password');
    }

    // Create session
    const tokens = await this.createSession(user.id, ip, userAgent);

    // Update last login
    const now = new Date();
    await sql`UPDATE users SET last_login_at = ${now}, status = 'online' WHERE id = ${user.id}`;

    // Return user without password_hash
    const { password_hash: _, ...userPublic } = user;

    return { user: userPublic as UserPublic, tokens };
  }

  async logout(userId: UUID, sessionId: UUID, accessToken: string): Promise<void> {
    // Delete session
    await sql`DELETE FROM sessions WHERE id = ${sessionId} AND user_id = ${userId}`;

    // Blacklist the access token
    const tokenHash = hashToken(accessToken);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await sql`
      INSERT INTO token_blacklist (id, token_hash, user_id, expires_at)
      VALUES (${generateUUID()}, ${tokenHash}, ${userId}, ${expiresAt})
      ON CONFLICT (token_hash) DO NOTHING
    `;

    // Update user status
    await sql`UPDATE users SET status = 'offline' WHERE id = ${userId}`;
  }

  async logoutAll(userId: UUID): Promise<void> {
    // Delete all sessions for user
    await sql`DELETE FROM sessions WHERE user_id = ${userId}`;

    // Update user status
    await sql`UPDATE users SET status = 'offline' WHERE id = ${userId}`;
  }

  async refresh(refreshToken: string, ip?: string, userAgent?: string): Promise<AuthTokens> {
    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken);

    // Check if session exists
    const tokenHash = hashToken(refreshToken);
    const sessions = await sql`
      SELECT id, user_id, expires_at
      FROM sessions
      WHERE id = ${payload.sessionId}
        AND user_id = ${payload.userId}
        AND refresh_token_hash = ${tokenHash}
    `;

    if (sessions.length === 0) {
      throw AppError.unauthorized('Invalid refresh token');
    }

    const session = sessions[0];
    if (new Date(session.expires_at) < new Date()) {
      // Delete expired session
      await sql`DELETE FROM sessions WHERE id = ${session.id}`;
      throw AppError.unauthorized('Session expired');
    }

    // Generate new tokens
    const tokens = generateTokens({
      userId: payload.userId,
      sessionId: payload.sessionId,
    });

    // Update session with new refresh token hash
    const newRefreshTokenHash = hashToken(tokens.refreshToken);
    const newExpiresAt = getRefreshTokenExpiry();

    await sql`
      UPDATE sessions
      SET refresh_token_hash = ${newRefreshTokenHash},
          expires_at = ${newExpiresAt},
          ip_address = ${ip || null},
          user_agent = ${userAgent || null}
      WHERE id = ${session.id}
    `;

    return tokens;
  }

  async getMe(userId: UUID): Promise<UserPublic> {
    const users = await sql`
      SELECT id, email, name, avatar_url, status, plan, language, timezone,
             created_at, updated_at, last_login_at, email_verified
      FROM users
      WHERE id = ${userId}
    `;

    if (users.length === 0) {
      throw AppError.notFound('User');
    }

    return users[0] as UserPublic;
  }

  async updatePassword(userId: UUID, input: UpdatePasswordInput): Promise<void> {
    const { currentPassword, newPassword } = input;

    // Get current password hash
    const users = await sql`
      SELECT password_hash FROM users WHERE id = ${userId}
    `;

    if (users.length === 0) {
      throw AppError.notFound('User');
    }

    // Verify current password
    const isValid = await verifyPassword(currentPassword, users[0].password_hash);
    if (!isValid) {
      throw AppError.badRequest('Current password is incorrect');
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);

    // Update password
    await sql`
      UPDATE users
      SET password_hash = ${newPasswordHash}, updated_at = ${new Date()}
      WHERE id = ${userId}
    `;

    // Optionally: Delete all other sessions (keep current one)
    // This forces re-login on other devices
  }

  async getSessions(userId: UUID, currentSessionId: UUID): Promise<SessionInfo[]> {
    const sessions = await sql`
      SELECT id, ip_address, user_agent, created_at, expires_at
      FROM sessions
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `;

    return sessions.map((s) => ({
      ...s,
      current: s.id === currentSessionId,
    })) as SessionInfo[];
  }

  async deleteSession(userId: UUID, sessionId: UUID): Promise<void> {
    await sql`
      DELETE FROM sessions
      WHERE id = ${sessionId} AND user_id = ${userId}
    `;
  }

  async forgotPassword(email: string): Promise<void> {
    // Check if user exists
    const users = await sql`
      SELECT id FROM users WHERE email = ${email.toLowerCase()}
    `;

    if (users.length === 0) {
      // Don't reveal if email exists
      return;
    }

    const userId = users[0].id;

    // Generate reset token
    const token = generateSecureToken();
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Delete any existing reset tokens
    await sql`DELETE FROM password_reset_tokens WHERE user_id = ${userId}`;

    // Create new reset token
    await sql`
      INSERT INTO password_reset_tokens (id, user_id, token_hash, expires_at)
      VALUES (${generateUUID()}, ${userId}, ${tokenHash}, ${expiresAt})
    `;

    // Send password reset email
    const users2 = await sql`SELECT name FROM users WHERE id = ${userId}`;
    const userName = users2[0]?.name || 'Utilisateur';
    EmailService.sendPasswordReset(email, userName, token).catch(err => {
      console.error('[AuthService] Failed to send password reset email:', err);
    });
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const tokenHash = hashToken(token);

    // Find valid reset token
    const tokens = await sql`
      SELECT id, user_id, expires_at, used_at
      FROM password_reset_tokens
      WHERE token_hash = ${tokenHash}
    `;

    if (tokens.length === 0) {
      throw AppError.badRequest('Invalid or expired reset token');
    }

    const resetToken = tokens[0];

    if (resetToken.used_at) {
      throw AppError.badRequest('Reset token already used');
    }

    if (new Date(resetToken.expires_at) < new Date()) {
      throw AppError.badRequest('Reset token expired');
    }

    // Hash new password
    const passwordHash = await hashPassword(newPassword);

    // Update password and mark token as used
    await sql`
      UPDATE users
      SET password_hash = ${passwordHash}, updated_at = ${new Date()}
      WHERE id = ${resetToken.user_id}
    `;

    await sql`
      UPDATE password_reset_tokens
      SET used_at = ${new Date()}
      WHERE id = ${resetToken.id}
    `;

    // Delete all sessions for user (force re-login)
    await sql`DELETE FROM sessions WHERE user_id = ${resetToken.user_id}`;
  }

  private async createSession(
    userId: UUID,
    ip?: string,
    userAgent?: string
  ): Promise<AuthTokens> {
    const sessionId = generateUUID();
    const tokens = generateTokens({ userId, sessionId });

    const accessTokenHash = hashToken(tokens.accessToken);
    const refreshTokenHash = hashToken(tokens.refreshToken);
    const expiresAt = getRefreshTokenExpiry();

    await sql`
      INSERT INTO sessions (id, user_id, token_hash, refresh_token_hash, ip_address, user_agent, expires_at)
      VALUES (${sessionId}, ${userId}, ${accessTokenHash}, ${refreshTokenHash}, ${ip || null}, ${userAgent || null}, ${expiresAt})
    `;

    return tokens;
  }
}

export const authService = new AuthService();
