"use strict";
/**
 * Presence Service - TeamTalk Pro
 * Manages user online/offline status and custom messages
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserPresence = getUserPresence;
exports.getMultiplePresences = getMultiplePresences;
exports.getOnlineUsers = getOnlineUsers;
exports.updatePresence = updatePresence;
exports.updateLastSeen = updateLastSeen;
exports.setOffline = setOffline;
exports.setTyping = setTyping;
exports.clearTyping = clearTyping;
exports.getTypingUsers = getTypingUsers;
exports.cleanupTypingIndicators = cleanupTypingIndicators;
exports.autoOfflineInactiveUsers = autoOfflineInactiveUsers;
const database_1 = __importDefault(require("../../config/database"));
/**
 * Get user presence by user ID
 */
async function getUserPresence(userId) {
    const result = await database_1.default.query(`SELECT
            id,
            user_id as "userId",
            status,
            custom_message as "customMessage",
            last_seen as "lastSeen",
            created_at as "createdAt",
            updated_at as "updatedAt"
        FROM user_presence
        WHERE user_id = $1`, [userId]);
    if (result.rows.length === 0) {
        return null;
    }
    return result.rows[0];
}
/**
 * Get presence for multiple users
 */
async function getMultiplePresences(userIds) {
    if (userIds.length === 0)
        return [];
    const result = await database_1.default.query(`SELECT
            id,
            user_id as "userId",
            status,
            custom_message as "customMessage",
            last_seen as "lastSeen",
            created_at as "createdAt",
            updated_at as "updatedAt"
        FROM user_presence
        WHERE user_id = ANY($1::uuid[])`, [userIds]);
    return result.rows;
}
/**
 * Get all online users (status != offline)
 */
async function getOnlineUsers() {
    const result = await database_1.default.query(`SELECT
            id,
            user_id as "userId",
            status,
            custom_message as "customMessage",
            last_seen as "lastSeen",
            created_at as "createdAt",
            updated_at as "updatedAt"
        FROM user_presence
        WHERE status != 'offline'
        ORDER BY last_seen DESC`);
    return result.rows;
}
/**
 * Update user presence status
 */
async function updatePresence(userId, update) {
    const fields = [];
    const values = [userId];
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
    const result = await database_1.default.query(`INSERT INTO user_presence (user_id, status, custom_message, last_seen)
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
            updated_at as "updatedAt"`, [userId, update.status || 'available', update.customMessage]);
    return result.rows[0];
}
/**
 * Update last seen timestamp (heartbeat)
 */
async function updateLastSeen(userId) {
    await database_1.default.query(`UPDATE user_presence
        SET last_seen = NOW(), updated_at = NOW()
        WHERE user_id = $1`, [userId]);
}
/**
 * Set user offline
 */
async function setOffline(userId) {
    await database_1.default.query(`UPDATE user_presence
        SET status = 'offline', last_seen = NOW(), updated_at = NOW()
        WHERE user_id = $1`, [userId]);
}
/**
 * Set typing indicator
 */
async function setTyping(conversationId, userId) {
    await database_1.default.query(`INSERT INTO typing_indicators (conversation_id, user_id, started_at)
        VALUES ($1, $2, NOW())
        ON CONFLICT (conversation_id, user_id)
        DO UPDATE SET started_at = NOW()`, [conversationId, userId]);
}
/**
 * Clear typing indicator
 */
async function clearTyping(conversationId, userId) {
    await database_1.default.query(`DELETE FROM typing_indicators
        WHERE conversation_id = $1 AND user_id = $2`, [conversationId, userId]);
}
/**
 * Get typing users in conversation
 */
async function getTypingUsers(conversationId) {
    const result = await database_1.default.query(`SELECT user_id
        FROM typing_indicators
        WHERE conversation_id = $1
        AND started_at > NOW() - INTERVAL '10 seconds'`, [conversationId]);
    return result.rows.map((row) => row.user_id);
}
/**
 * Cleanup old typing indicators (run periodically)
 */
async function cleanupTypingIndicators() {
    await database_1.default.query(`DELETE FROM typing_indicators
        WHERE started_at < NOW() - INTERVAL '30 seconds'`);
}
/**
 * Auto-set users offline if no activity for 5 minutes
 */
async function autoOfflineInactiveUsers() {
    await database_1.default.query(`UPDATE user_presence
        SET status = 'offline', updated_at = NOW()
        WHERE status != 'offline'
        AND last_seen < NOW() - INTERVAL '5 minutes'`);
}
//# sourceMappingURL=presence.service.js.map