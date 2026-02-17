/**
 * Presence Service - TeamTalk Pro
 * Manages user online/offline status and custom messages
 */

import pool from '../../config/database';

export interface UserPresence {
    id: string;
    userId: string;
    status: 'available' | 'busy' | 'dnd' | 'away' | 'offline' | 'custom';
    customMessage: string | null;
    lastSeen: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface PresenceUpdate {
    status?: 'available' | 'busy' | 'dnd' | 'away' | 'offline' | 'custom';
    customMessage?: string | null;
}

/**
 * Get user presence by user ID
 */
export async function getUserPresence(userId: string): Promise<UserPresence | null> {
    const result = await pool.query(
        `SELECT
            id,
            user_id as "userId",
            status,
            custom_message as "customMessage",
            last_seen as "lastSeen",
            created_at as "createdAt",
            updated_at as "updatedAt"
        FROM user_presence
        WHERE user_id = $1`,
        [userId]
    );

    if (result.rows.length === 0) {
        return null;
    }

    return result.rows[0];
}

/**
 * Get presence for multiple users
 */
export async function getMultiplePresences(userIds: string[]): Promise<UserPresence[]> {
    if (userIds.length === 0) return [];

    const result = await pool.query(
        `SELECT
            id,
            user_id as "userId",
            status,
            custom_message as "customMessage",
            last_seen as "lastSeen",
            created_at as "createdAt",
            updated_at as "updatedAt"
        FROM user_presence
        WHERE user_id = ANY($1::uuid[])`,
        [userIds]
    );

    return result.rows;
}

/**
 * Get all online users (status != offline)
 */
export async function getOnlineUsers(): Promise<UserPresence[]> {
    const result = await pool.query(
        `SELECT
            id,
            user_id as "userId",
            status,
            custom_message as "customMessage",
            last_seen as "lastSeen",
            created_at as "createdAt",
            updated_at as "updatedAt"
        FROM user_presence
        WHERE status != 'offline'
        ORDER BY last_seen DESC`
    );

    return result.rows;
}

/**
 * Update user presence status
 */
export async function updatePresence(
    userId: string,
    update: PresenceUpdate
): Promise<UserPresence> {
    const fields: string[] = [];
    const values: any[] = [userId];
    let paramIndex = 2;

    if (update.status !== undefined) {
        fields.push(`status = $${paramIndex}`);
        values.push(update.status);
        paramIndex++;
    }

    if (update.customMessage !== undefined) {
        fields.push(`custom_message = $${paramIndex}`);
        values.push(update.customMessage);
        paramIndex++;
    }

    fields.push(`last_seen = NOW()`);
    fields.push(`updated_at = NOW()`);

    const result = await pool.query(
        `INSERT INTO user_presence (user_id, status, custom_message, last_seen)
        VALUES ($1, $2, $3, NOW())
        ON CONFLICT (user_id)
        DO UPDATE SET ${fields.join(', ')}
        RETURNING
            id,
            user_id as "userId",
            status,
            custom_message as "customMessage",
            last_seen as "lastSeen",
            created_at as "createdAt",
            updated_at as "updatedAt"`,
        [userId, update.status || 'available', update.customMessage]
    );

    return result.rows[0];
}

/**
 * Update last seen timestamp (heartbeat)
 */
export async function updateLastSeen(userId: string): Promise<void> {
    await pool.query(
        `UPDATE user_presence
        SET last_seen = NOW(), updated_at = NOW()
        WHERE user_id = $1`,
        [userId]
    );
}

/**
 * Set user offline
 */
export async function setOffline(userId: string): Promise<void> {
    await pool.query(
        `UPDATE user_presence
        SET status = 'offline', last_seen = NOW(), updated_at = NOW()
        WHERE user_id = $1`,
        [userId]
    );
}

/**
 * Set typing indicator
 */
export async function setTyping(conversationId: string, userId: string): Promise<void> {
    await pool.query(
        `INSERT INTO typing_indicators (conversation_id, user_id, started_at)
        VALUES ($1, $2, NOW())
        ON CONFLICT (conversation_id, user_id)
        DO UPDATE SET started_at = NOW()`,
        [conversationId, userId]
    );
}

/**
 * Clear typing indicator
 */
export async function clearTyping(conversationId: string, userId: string): Promise<void> {
    await pool.query(
        `DELETE FROM typing_indicators
        WHERE conversation_id = $1 AND user_id = $2`,
        [conversationId, userId]
    );
}

/**
 * Get typing users in conversation
 */
export async function getTypingUsers(conversationId: string): Promise<string[]> {
    const result = await pool.query(
        `SELECT user_id
        FROM typing_indicators
        WHERE conversation_id = $1
        AND started_at > NOW() - INTERVAL '10 seconds'`,
        [conversationId]
    );

    return result.rows.map((row) => row.user_id);
}

/**
 * Cleanup old typing indicators (run periodically)
 */
export async function cleanupTypingIndicators(): Promise<void> {
    await pool.query(
        `DELETE FROM typing_indicators
        WHERE started_at < NOW() - INTERVAL '30 seconds'`
    );
}

/**
 * Auto-set users offline if no activity for 5 minutes
 */
export async function autoOfflineInactiveUsers(): Promise<void> {
    await pool.query(
        `UPDATE user_presence
        SET status = 'offline', updated_at = NOW()
        WHERE status != 'offline'
        AND last_seen < NOW() - INTERVAL '5 minutes'`
    );
}
