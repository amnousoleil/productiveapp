"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messagingService = exports.MessagingService = void 0;
const database_js_1 = require("../../config/database.js");
const helpers_js_1 = require("../../utils/helpers.js");
class MessagingService {
    async createConversation(workspaceId, userId, input) {
        const id = (0, helpers_js_1.generateUUID)();
        const now = new Date();
        // For direct messages, check if conversation already exists
        if (input.type === 'direct' && input.participant_ids.length === 1) {
            const otherUserId = input.participant_ids[0];
            const existing = await (0, database_js_1.sql) `
        SELECT c.id
        FROM conversations c
        INNER JOIN conversation_participants cp1 ON c.id = cp1.conversation_id AND cp1.user_id = ${userId}
        INNER JOIN conversation_participants cp2 ON c.id = cp2.conversation_id AND cp2.user_id = ${otherUserId}
        WHERE c.workspace_id = ${workspaceId} AND c.type = 'direct'
      `;
            if (existing.length > 0) {
                return this.getById(existing[0].id);
            }
        }
        const conversations = await (0, database_js_1.sql) `
      INSERT INTO conversations (id, workspace_id, type, name, description, is_private, created_by, created_at, updated_at)
      VALUES (
        ${id}, ${workspaceId}, ${input.type}, ${input.name || null},
        ${input.description || null}, ${input.is_private ?? true},
        ${userId}, ${now}, ${now}
      )
      RETURNING *
    `;
        // Add creator as admin
        await (0, database_js_1.sql) `
      INSERT INTO conversation_participants (conversation_id, user_id, role, joined_at)
      VALUES (${id}, ${userId}, 'admin', ${now})
    `;
        // Add other participants
        for (const participantId of input.participant_ids) {
            if (participantId !== userId) {
                await (0, database_js_1.sql) `
          INSERT INTO conversation_participants (conversation_id, user_id, role, joined_at)
          VALUES (${id}, ${participantId}, 'member', ${now})
        `;
            }
        }
        return conversations[0];
    }
    async getById(conversationId) {
        const conversations = await (0, database_js_1.sql) `
      SELECT * FROM conversations WHERE id = ${conversationId}
    `;
        if (conversations.length === 0) {
            throw helpers_js_1.AppError.notFound('Conversation');
        }
        return conversations[0];
    }
    async getByIdWithDetails(conversationId, userId) {
        const conversations = await (0, database_js_1.sql) `
      SELECT c.*,
             (
               SELECT json_agg(json_build_object(
                 'user_id', cp.user_id,
                 'role', cp.role,
                 'user', json_build_object(
                   'id', u.id,
                   'name', u.name,
                   'avatar_url', u.avatar_url,
                   'status', u.status
                 )
               ))
               FROM conversation_participants cp
               INNER JOIN users u ON cp.user_id = u.id
               WHERE cp.conversation_id = c.id
             ) as participants,
             (
               SELECT json_build_object(
                 'id', m.id,
                 'content', m.content,
                 'sender_id', m.sender_id,
                 'sender_name', u.name,
                 'created_at', m.created_at
               )
               FROM messages m
               INNER JOIN users u ON m.sender_id = u.id
               WHERE m.conversation_id = c.id AND m.deleted_at IS NULL
               ORDER BY m.created_at DESC
               LIMIT 1
             ) as last_message,
             (
               SELECT COUNT(*)::int
               FROM messages m
               LEFT JOIN conversation_participants cp ON cp.conversation_id = c.id AND cp.user_id = ${userId}
               WHERE m.conversation_id = c.id
                 AND m.deleted_at IS NULL
                 AND m.created_at > COALESCE(cp.last_read_at, '1970-01-01')
                 AND m.sender_id != ${userId}
             ) as unread_count
      FROM conversations c
      WHERE c.id = ${conversationId}
    `;
        if (conversations.length === 0) {
            throw helpers_js_1.AppError.notFound('Conversation');
        }
        return conversations[0];
    }
    async getUserConversations(workspaceId, userId, params) {
        const page = params.page ?? 1;
        const limit = params.limit ?? 20;
        const offset = (0, helpers_js_1.calculateOffset)(page, limit);
        const conversations = await (0, database_js_1.sql) `
      SELECT c.*,
             (
               SELECT json_agg(json_build_object(
                 'user_id', cp2.user_id,
                 'role', cp2.role,
                 'user', json_build_object(
                   'id', u.id,
                   'name', u.name,
                   'avatar_url', u.avatar_url,
                   'status', u.status
                 )
               ))
               FROM conversation_participants cp2
               INNER JOIN users u ON cp2.user_id = u.id
               WHERE cp2.conversation_id = c.id
             ) as participants,
             (
               SELECT json_build_object(
                 'id', m.id,
                 'content', m.content,
                 'sender_id', m.sender_id,
                 'sender_name', u.name,
                 'created_at', m.created_at
               )
               FROM messages m
               INNER JOIN users u ON m.sender_id = u.id
               WHERE m.conversation_id = c.id AND m.deleted_at IS NULL
               ORDER BY m.created_at DESC
               LIMIT 1
             ) as last_message,
             (
               SELECT COUNT(*)::int
               FROM messages m
               WHERE m.conversation_id = c.id
                 AND m.deleted_at IS NULL
                 AND m.created_at > COALESCE(cp.last_read_at, '1970-01-01')
                 AND m.sender_id != ${userId}
             ) as unread_count
      FROM conversations c
      INNER JOIN conversation_participants cp ON c.id = cp.conversation_id AND cp.user_id = ${userId}
      WHERE c.workspace_id = ${workspaceId}
      ORDER BY c.updated_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
        const countResult = await (0, database_js_1.sql) `
      SELECT COUNT(*)::int as count
      FROM conversations c
      INNER JOIN conversation_participants cp ON c.id = cp.conversation_id AND cp.user_id = ${userId}
      WHERE c.workspace_id = ${workspaceId}
    `;
        return {
            conversations: conversations,
            total: countResult[0].count,
        };
    }
    async updateConversation(conversationId, input) {
        const updates = { updated_at: new Date() };
        if (input.name !== undefined)
            updates.name = input.name;
        if (input.description !== undefined)
            updates.description = input.description;
        const fields = Object.keys(updates);
        const conversations = await (0, database_js_1.sql) `
      UPDATE conversations
      SET ${(0, database_js_1.sql)(updates, ...fields)}
      WHERE id = ${conversationId}
      RETURNING *
    `;
        if (conversations.length === 0) {
            throw helpers_js_1.AppError.notFound('Conversation');
        }
        return conversations[0];
    }
    async deleteConversation(conversationId) {
        await (0, database_js_1.sql) `DELETE FROM conversations WHERE id = ${conversationId}`;
    }
    async addParticipant(conversationId, input) {
        const existing = await (0, database_js_1.sql) `
      SELECT user_id FROM conversation_participants
      WHERE conversation_id = ${conversationId} AND user_id = ${input.user_id}
    `;
        if (existing.length > 0) {
            throw helpers_js_1.AppError.conflict('User is already a participant');
        }
        await (0, database_js_1.sql) `
      INSERT INTO conversation_participants (conversation_id, user_id, role, joined_at)
      VALUES (${conversationId}, ${input.user_id}, ${input.role || 'member'}, ${new Date()})
    `;
    }
    async removeParticipant(conversationId, userId) {
        await (0, database_js_1.sql) `
      DELETE FROM conversation_participants
      WHERE conversation_id = ${conversationId} AND user_id = ${userId}
    `;
    }
    async leaveConversation(conversationId, userId) {
        await this.removeParticipant(conversationId, userId);
    }
    async sendMessage(conversationId, senderId, input) {
        const id = (0, helpers_js_1.generateUUID)();
        const now = new Date();
        // Extract mentions from content
        const mentions = input.mentions || (0, helpers_js_1.extractMentions)(input.content);
        const messages = await (0, database_js_1.sql) `
      INSERT INTO messages (
        id, conversation_id, sender_id, reply_to_id, content,
        message_type, attachments, mentions, created_at
      )
      VALUES (
        ${id}, ${conversationId}, ${senderId}, ${input.reply_to_id || null},
        ${input.content}, ${input.message_type || 'text'},
        ${JSON.stringify(input.attachments || [])}, ${mentions}, ${now}
      )
      RETURNING *
    `;
        // Update conversation updated_at
        await (0, database_js_1.sql) `UPDATE conversations SET updated_at = ${now} WHERE id = ${conversationId}`;
        // Update sender's last_read_at
        await (0, database_js_1.sql) `
      UPDATE conversation_participants
      SET last_read_at = ${now}, last_read_message_id = ${id}
      WHERE conversation_id = ${conversationId} AND user_id = ${senderId}
    `;
        return messages[0];
    }
    async getMessages(conversationId, params) {
        const limit = params.limit ?? 50;
        let condition = (0, database_js_1.sql) `m.conversation_id = ${conversationId} AND m.deleted_at IS NULL`;
        if (params.before) {
            const beforeMessage = await (0, database_js_1.sql) `SELECT created_at FROM messages WHERE id = ${params.before}`;
            if (beforeMessage.length > 0) {
                condition = (0, database_js_1.sql) `${condition} AND m.created_at < ${beforeMessage[0].created_at}`;
            }
        }
        const messages = await (0, database_js_1.sql) `
      SELECT m.*,
             json_build_object(
               'id', u.id,
               'name', u.name,
               'avatar_url', u.avatar_url
             ) as sender,
             COALESCE(
               (
                 SELECT json_agg(json_build_object(
                   'emoji', emoji,
                   'count', count,
                   'users', users
                 ))
                 FROM (
                   SELECT emoji, COUNT(*)::int as count, array_agg(user_id) as users
                   FROM message_reactions
                   WHERE message_id = m.id
                   GROUP BY emoji
                 ) r
               ),
               '[]'
             ) as reactions,
             CASE WHEN m.reply_to_id IS NOT NULL THEN
               (
                 SELECT json_build_object(
                   'id', rm.id,
                   'content', rm.content,
                   'sender_name', ru.name
                 )
                 FROM messages rm
                 INNER JOIN users ru ON rm.sender_id = ru.id
                 WHERE rm.id = m.reply_to_id
               )
             ELSE NULL END as reply_to
      FROM messages m
      INNER JOIN users u ON m.sender_id = u.id
      WHERE ${condition}
      ORDER BY m.created_at DESC
      LIMIT ${limit}
    `;
        const countResult = await (0, database_js_1.sql) `
      SELECT COUNT(*)::int as count
      FROM messages m
      WHERE m.conversation_id = ${conversationId} AND m.deleted_at IS NULL
    `;
        // Reverse to get chronological order
        return {
            messages: messages.reverse(),
            total: countResult[0].count,
        };
    }
    async updateMessage(messageId, senderId, input) {
        const messages = await (0, database_js_1.sql) `
      UPDATE messages
      SET content = ${input.content}, is_edited = true, edited_at = ${new Date()}
      WHERE id = ${messageId} AND sender_id = ${senderId} AND deleted_at IS NULL
      RETURNING *
    `;
        if (messages.length === 0) {
            throw helpers_js_1.AppError.notFound('Message');
        }
        return messages[0];
    }
    async deleteMessage(messageId, senderId) {
        const result = await (0, database_js_1.sql) `
      UPDATE messages
      SET deleted_at = ${new Date()}
      WHERE id = ${messageId} AND sender_id = ${senderId}
    `;
        if (result.count === 0) {
            throw helpers_js_1.AppError.notFound('Message');
        }
    }
    async addReaction(messageId, userId, emoji) {
        await (0, database_js_1.sql) `
      INSERT INTO message_reactions (message_id, user_id, emoji, created_at)
      VALUES (${messageId}, ${userId}, ${emoji}, ${new Date()})
      ON CONFLICT (message_id, user_id, emoji) DO NOTHING
    `;
    }
    async removeReaction(messageId, userId, emoji) {
        await (0, database_js_1.sql) `
      DELETE FROM message_reactions
      WHERE message_id = ${messageId} AND user_id = ${userId} AND emoji = ${emoji}
    `;
    }
    async markAsRead(conversationId, userId, messageId) {
        const now = new Date();
        if (messageId) {
            await (0, database_js_1.sql) `
        UPDATE conversation_participants
        SET last_read_at = ${now}, last_read_message_id = ${messageId}
        WHERE conversation_id = ${conversationId} AND user_id = ${userId}
      `;
        }
        else {
            // Mark all as read
            const lastMessage = await (0, database_js_1.sql) `
        SELECT id FROM messages
        WHERE conversation_id = ${conversationId} AND deleted_at IS NULL
        ORDER BY created_at DESC
        LIMIT 1
      `;
            await (0, database_js_1.sql) `
        UPDATE conversation_participants
        SET last_read_at = ${now}, last_read_message_id = ${lastMessage[0]?.id || null}
        WHERE conversation_id = ${conversationId} AND user_id = ${userId}
      `;
        }
    }
    async pinMessage(messageId) {
        await (0, database_js_1.sql) `UPDATE messages SET is_pinned = true WHERE id = ${messageId}`;
    }
    async unpinMessage(messageId) {
        await (0, database_js_1.sql) `UPDATE messages SET is_pinned = false WHERE id = ${messageId}`;
    }
    async getPinnedMessages(conversationId) {
        const messages = await (0, database_js_1.sql) `
      SELECT m.*,
             json_build_object(
               'id', u.id,
               'name', u.name,
               'avatar_url', u.avatar_url
             ) as sender,
             '[]'::json as reactions,
             NULL as reply_to
      FROM messages m
      INNER JOIN users u ON m.sender_id = u.id
      WHERE m.conversation_id = ${conversationId}
        AND m.is_pinned = true
        AND m.deleted_at IS NULL
      ORDER BY m.created_at DESC
    `;
        return messages;
    }
    async isParticipant(conversationId, userId) {
        const result = await (0, database_js_1.sql) `
      SELECT 1 FROM conversation_participants
      WHERE conversation_id = ${conversationId} AND user_id = ${userId}
    `;
        return result.length > 0;
    }
    async searchMessages(workspaceId, userId, query, params) {
        const page = params.page ?? 1;
        const limit = params.limit ?? 20;
        const offset = (0, helpers_js_1.calculateOffset)(page, limit);
        const searchPattern = `%${query}%`;
        const messages = await (0, database_js_1.sql) `
      SELECT m.*,
             json_build_object(
               'id', u.id,
               'name', u.name,
               'avatar_url', u.avatar_url
             ) as sender,
             '[]'::json as reactions,
             NULL as reply_to
      FROM messages m
      INNER JOIN users u ON m.sender_id = u.id
      INNER JOIN conversations c ON m.conversation_id = c.id
      INNER JOIN conversation_participants cp ON c.id = cp.conversation_id AND cp.user_id = ${userId}
      WHERE c.workspace_id = ${workspaceId}
        AND m.content ILIKE ${searchPattern}
        AND m.deleted_at IS NULL
      ORDER BY m.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
        const countResult = await (0, database_js_1.sql) `
      SELECT COUNT(*)::int as count
      FROM messages m
      INNER JOIN conversations c ON m.conversation_id = c.id
      INNER JOIN conversation_participants cp ON c.id = cp.conversation_id AND cp.user_id = ${userId}
      WHERE c.workspace_id = ${workspaceId}
        AND m.content ILIKE ${searchPattern}
        AND m.deleted_at IS NULL
    `;
        return {
            messages: messages,
            total: countResult[0].count,
        };
    }
}
exports.MessagingService = MessagingService;
exports.messagingService = new MessagingService();
//# sourceMappingURL=messaging.service.js.map