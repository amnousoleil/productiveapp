/**
 * Email Service - TeamTalk Pro
 * Handles conversation exports via email
 */

import pool from '../../config/database';
import { sendEmail } from '../mail/mail.service';

export interface EmailExportOptions {
    conversationId: string;
    recipientEmail: string;
    exportedBy: string;
    messageCount?: number;
    exportType: 'summary' | 'full' | 'pdf';
}

/**
 * Export conversation summary via email (last 10 messages)
 */
export async function emailConversationSummary(
    conversationId: string,
    recipientEmail: string,
    exportedBy: string
): Promise<void> {
    // Get conversation details
    const convResult = await pool.query(
        `SELECT name, description, type
        FROM conversations
        WHERE id = $1`,
        [conversationId]
    );

    if (convResult.rows.length === 0) {
        throw new Error('Conversation not found');
    }

    const conversation = convResult.rows[0];

    // Get last 10 messages
    const messagesResult = await pool.query(
        `SELECT
            m.id,
            m.content,
            m.created_at,
            u.email as sender_email,
            u.id as sender_id
        FROM messages m
        LEFT JOIN users u ON m.sender_id = u.id
        WHERE m.conversation_id = $1
        ORDER BY m.created_at DESC
        LIMIT 10`,
        [conversationId]
    );

    const messages = messagesResult.rows.reverse();

    // Build HTML email
    const messagesHtml = messages
        .map(
            (msg) => `
        <div style="margin-bottom: 16px; padding: 12px; background: #f8f9fa; border-radius: 8px;">
            <div style="font-weight: 600; color: #495057; margin-bottom: 4px;">
                ${escapeHtml(msg.sender_email || 'Utilisateur')}
            </div>
            <div style="font-size: 0.85rem; color: #6c757d; margin-bottom: 8px;">
                ${formatDate(msg.created_at)}
            </div>
            <div style="color: #212529;">
                ${escapeHtml(msg.content)}
            </div>
        </div>
    `
        )
        .join('');

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 24px; border-radius: 12px; margin-bottom: 24px;">
        <h1 style="margin: 0; font-size: 24px;">📧 Résumé de Conversation</h1>
        <p style="margin: 8px 0 0 0; opacity: 0.9;">ProductiveApp - TeamTalk</p>
    </div>

    <div style="background: #ffffff; border: 1px solid #e9ecef; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
        <h2 style="margin-top: 0; color: #495057; font-size: 18px;">
            ${escapeHtml(conversation.name || 'Conversation')}
        </h2>
        ${conversation.description ? `<p style="color: #6c757d;">${escapeHtml(conversation.description)}</p>` : ''}
        <p style="color: #6c757d; font-size: 0.9rem;">
            📊 <strong>${messages.length}</strong> messages récents
        </p>
    </div>

    <div style="margin-bottom: 24px;">
        <h3 style="color: #495057; font-size: 16px; margin-bottom: 16px;">💬 Messages</h3>
        ${messagesHtml}
    </div>

    <div style="background: #f8f9fa; padding: 16px; border-radius: 8px; text-align: center; font-size: 0.85rem; color: #6c757d;">
        <p style="margin: 0;">Cet email a été généré automatiquement depuis ProductiveApp</p>
        <p style="margin: 8px 0 0 0;">
            <a href="${process.env.APP_URL || 'https://giri-app.com'}" style="color: #667eea; text-decoration: none;">
                Retourner à l'application →
            </a>
        </p>
    </div>
</body>
</html>
    `;

    // Send email
    await sendEmail({
        to: recipientEmail,
        subject: `TeamTalk - Résumé: ${conversation.name || 'Conversation'}`,
        html,
    });

    // Log export
    await pool.query(
        `INSERT INTO conversation_email_exports
        (conversation_id, exported_by, recipient_email, message_count, export_type)
        VALUES ($1, $2, $3, $4, 'summary')`,
        [conversationId, exportedBy, recipientEmail, messages.length]
    );
}

/**
 * Email full conversation (all messages)
 */
export async function emailFullConversation(
    conversationId: string,
    recipientEmail: string,
    exportedBy: string
): Promise<void> {
    // Get conversation details
    const convResult = await pool.query(
        `SELECT name, description, type, created_at
        FROM conversations
        WHERE id = $1`,
        [conversationId]
    );

    if (convResult.rows.length === 0) {
        throw new Error('Conversation not found');
    }

    const conversation = convResult.rows[0];

    // Get ALL messages
    const messagesResult = await pool.query(
        `SELECT
            m.id,
            m.content,
            m.created_at,
            u.email as sender_email,
            u.id as sender_id
        FROM messages m
        LEFT JOIN users u ON m.sender_id = u.id
        WHERE m.conversation_id = $1
        ORDER BY m.created_at ASC`,
        [conversationId]
    );

    const messages = messagesResult.rows;

    // Build HTML (similar to summary but with all messages)
    const messagesHtml = messages
        .map(
            (msg) => `
        <div style="margin-bottom: 12px; padding: 10px; background: #f8f9fa; border-radius: 6px;">
            <div style="font-weight: 600; color: #495057; font-size: 0.9rem;">
                ${escapeHtml(msg.sender_email || 'Utilisateur')}
                <span style="color: #adb5bd; font-weight: 400; margin-left: 8px;">${formatDate(msg.created_at)}</span>
            </div>
            <div style="color: #212529; margin-top: 6px;">
                ${escapeHtml(msg.content)}
            </div>
        </div>
    `
        )
        .join('');

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 24px; border-radius: 12px; margin-bottom: 24px;">
        <h1 style="margin: 0; font-size: 24px;">📧 Export Complet de Conversation</h1>
        <p style="margin: 8px 0 0 0; opacity: 0.9;">ProductiveApp - TeamTalk</p>
    </div>

    <div style="background: #ffffff; border: 1px solid #e9ecef; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
        <h2 style="margin-top: 0; color: #495057; font-size: 20px;">
            ${escapeHtml(conversation.name || 'Conversation')}
        </h2>
        ${conversation.description ? `<p style="color: #6c757d;">${escapeHtml(conversation.description)}</p>` : ''}
        <p style="color: #6c757d; font-size: 0.9rem;">
            📊 <strong>${messages.length}</strong> messages au total • Créée le ${formatDate(conversation.created_at)}
        </p>
    </div>

    <div style="margin-bottom: 24px;">
        ${messagesHtml}
    </div>

    <div style="background: #f8f9fa; padding: 16px; border-radius: 8px; text-align: center; font-size: 0.85rem; color: #6c757d;">
        <p style="margin: 0;">Cet export contient l'intégralité de la conversation</p>
        <p style="margin: 8px 0 0 0;">
            <a href="${process.env.APP_URL || 'https://giri-app.com'}" style="color: #667eea; text-decoration: none;">
                Retourner à l'application →
            </a>
        </p>
    </div>
</body>
</html>
    `;

    // Send email
    await sendEmail({
        to: recipientEmail,
        subject: `TeamTalk - Export: ${conversation.name || 'Conversation'} (${messages.length} messages)`,
        html,
    });

    // Log export
    await pool.query(
        `INSERT INTO conversation_email_exports
        (conversation_id, exported_by, recipient_email, message_count, export_type)
        VALUES ($1, $2, $3, $4, 'full')`,
        [conversationId, exportedBy, recipientEmail, messages.length]
    );
}

/**
 * Get export history for conversation
 */
export async function getExportHistory(conversationId: string): Promise<any[]> {
    const result = await pool.query(
        `SELECT
            id,
            exported_by as "exportedBy",
            recipient_email as "recipientEmail",
            message_count as "messageCount",
            export_type as "exportType",
            created_at as "createdAt"
        FROM conversation_email_exports
        WHERE conversation_id = $1
        ORDER BY created_at DESC
        LIMIT 20`,
        [conversationId]
    );

    return result.rows;
}

// ========== Helpers ==========

function escapeHtml(text: string): string {
    if (!text) return '';
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
        .replace(/\n/g, '<br>');
}

function formatDate(dateStr: string | Date): string {
    const date = new Date(dateStr);
    return date.toLocaleString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}
