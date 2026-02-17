"use strict";
// =============================================
// MAIL PRO V2 - Service Inbound
// Traitement des emails entrants
// =============================================
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailInboundService = void 0;
const pool_js_1 = __importDefault(require("./pool.js"));
const crypto_1 = __importDefault(require("crypto"));
class MailInboundService {
    /**
     * Vérifier la signature du webhook Resend pour sécurité
     */
    static verifyWebhookSignature(payload, signature, secret) {
        try {
            const expectedSignature = crypto_1.default
                .createHmac('sha256', secret)
                .update(payload)
                .digest('hex');
            return crypto_1.default.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
        }
        catch (error) {
            console.error('[MailInbound] Signature verification error:', error);
            return false;
        }
    }
    /**
     * Traiter un email reçu depuis le webhook Resend
     */
    static async processInboundEmail(webhookData) {
        console.log('[MailInbound] Processing email:', webhookData.data.email_id);
        // 1. Récupérer les détails complets de l'email depuis l'API Resend
        const emailDetails = await this.fetchEmailDetails(webhookData.data.email_id);
        if (!emailDetails) {
            throw new Error('Could not fetch email details from Resend');
        }
        // 2. Identifier le destinataire (quel utilisateur de l'app?)
        const recipientEmail = webhookData.data.to[0]; // Premier destinataire
        const userId = await this.findUserByEmailAddress(recipientEmail);
        if (!userId) {
            console.warn(`[MailInbound] No user found for email: ${recipientEmail}`);
            // TODO: Créer une boîte "catch-all" ou rejeter l'email
            return;
        }
        // 3. Parser l'email
        const inboundEmail = this.parseInboundEmail(emailDetails);
        // 4. Stocker en DB
        await this.storeInboundEmail(userId, inboundEmail);
        console.log(`[MailInbound] ✅ Email stored for user ${userId}`);
        // TODO: Envoyer notification temps réel au frontend (WebSocket/SSE)
    }
    /**
     * Récupérer les détails complets d'un email depuis l'API Resend
     */
    static async fetchEmailDetails(emailId) {
        try {
            const apiKey = process.env.RESEND_API_KEY;
            if (!apiKey) {
                throw new Error('RESEND_API_KEY not configured');
            }
            const response = await fetch(`https://api.resend.com/emails/${emailId}`, {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                throw new Error(`Resend API error: ${response.status}`);
            }
            return (await response.json());
        }
        catch (error) {
            console.error('[MailInbound] Error fetching email details:', error);
            return null;
        }
    }
    /**
     * Trouver l'utilisateur par son adresse email @giri-app.com
     */
    static async findUserByEmailAddress(emailAddress) {
        const query = `
      SELECT id FROM users
      WHERE email_address = $1
      LIMIT 1
    `;
        const result = await pool_js_1.default.query(query, [emailAddress]);
        if (result.rows.length === 0) {
            return null;
        }
        return result.rows[0].id;
    }
    /**
     * Parser les détails de l'email en format InboundEmail
     */
    static parseInboundEmail(details) {
        // Extraire le nom de l'expéditeur depuis l'adresse
        const fromMatch = details.from.match(/^(.+?)\s*<(.+?)>$/);
        const from_name = fromMatch ? fromMatch[1].trim() : undefined;
        const from_address = fromMatch ? fromMatch[2].trim() : details.from;
        // Générer un thread_id basé sur le sujet (simplifié pour MVP)
        const thread_id = this.generateThreadId(details.subject, details.headers);
        return {
            resend_email_id: details.id,
            from_address,
            from_name,
            to_addresses: details.to,
            cc_addresses: details.cc,
            bcc_addresses: details.bcc,
            reply_to: details.reply_to,
            subject: details.subject,
            body_text: details.text,
            body_html: details.html,
            is_html: !!details.html,
            thread_id,
            in_reply_to: details.headers?.['in-reply-to'],
            message_id: details.headers?.['message-id'],
            email_references: details.headers?.['references'],
            has_attachments: false, // TODO: Gérer les pièces jointes
            attachments_meta: [],
            received_at: new Date(details.created_at)
        };
    }
    /**
     * Générer un thread_id pour regrouper les conversations
     */
    static generateThreadId(subject, headers) {
        // Si l'email a un In-Reply-To, utiliser ce Message-ID comme thread
        if (headers?.['in-reply-to']) {
            return headers['in-reply-to'];
        }
        // Sinon, générer un ID basé sur le sujet (sans Re: Fwd: etc.)
        const cleanSubject = subject
            .replace(/^(Re|Fwd|Fw):\s*/gi, '')
            .toLowerCase()
            .trim();
        return crypto_1.default.createHash('sha256').update(cleanSubject).digest('hex').substring(0, 16);
    }
    /**
     * Stocker l'email en DB
     */
    static async storeInboundEmail(userId, email) {
        const query = `
      INSERT INTO emails (
        user_id,
        resend_email_id,
        direction,
        from_address,
        from_name,
        to_addresses,
        cc_addresses,
        bcc_addresses,
        reply_to,
        subject,
        body_text,
        body_html,
        is_html,
        thread_id,
        in_reply_to,
        message_id,
        email_references,
        status,
        folder,
        is_read,
        has_attachments,
        attachments_meta,
        received_at,
        created_at
      ) VALUES (
        $1, $2, 'inbound', $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
        'received', 'inbox', false, $17, $18, $19, NOW()
      )
    `;
        const values = [
            userId,
            email.resend_email_id,
            email.from_address,
            email.from_name,
            JSON.stringify(email.to_addresses),
            JSON.stringify(email.cc_addresses || []),
            JSON.stringify(email.bcc_addresses || []),
            email.reply_to,
            email.subject,
            email.body_text,
            email.body_html,
            email.is_html,
            email.thread_id,
            email.in_reply_to,
            email.message_id,
            email.email_references,
            email.has_attachments,
            JSON.stringify(email.attachments_meta),
            email.received_at
        ];
        await pool_js_1.default.query(query, values);
    }
    /**
     * Récupérer la boîte de réception d'un utilisateur
     */
    static async getInbox(filters) {
        const { user_id, limit = 50, offset = 0, is_read, folder = 'inbox' } = filters;
        let query = `
      SELECT
        id,
        resend_email_id,
        direction,
        from_address,
        from_name,
        to_addresses,
        cc_addresses,
        subject,
        body_text,
        body_html,
        is_html,
        is_read,
        is_starred,
        folder,
        has_attachments,
        thread_id,
        received_at,
        sent_at,
        created_at
      FROM emails
      WHERE user_id = $1
        AND folder = $2
        AND is_deleted = false
    `;
        const values = [user_id, folder];
        let paramIndex = 3;
        if (is_read !== undefined) {
            query += ` AND is_read = $${paramIndex}`;
            values.push(is_read);
            paramIndex++;
        }
        query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        values.push(limit, offset);
        const result = await pool_js_1.default.query(query, values);
        return result.rows;
    }
    /**
     * Marquer un email comme lu/non lu
     */
    static async markAsRead(emailId, userId, isRead) {
        const query = `
      UPDATE emails
      SET is_read = $1, updated_at = NOW()
      WHERE id = $2 AND user_id = $3
    `;
        await pool_js_1.default.query(query, [isRead, emailId, userId]);
    }
    /**
     * Marquer un email comme favori
     */
    static async markAsStarred(emailId, userId, isStarred) {
        const query = `
      UPDATE emails
      SET is_starred = $1, updated_at = NOW()
      WHERE id = $2 AND user_id = $3
    `;
        await pool_js_1.default.query(query, [isStarred, emailId, userId]);
    }
    /**
     * Déplacer un email dans un dossier
     */
    static async moveToFolder(emailId, userId, folder) {
        const query = `
      UPDATE emails
      SET folder = $1, updated_at = NOW()
      WHERE id = $2 AND user_id = $3
    `;
        await pool_js_1.default.query(query, [folder, emailId, userId]);
    }
    /**
     * Supprimer un email (soft delete)
     */
    static async deleteEmail(emailId, userId) {
        const query = `
      UPDATE emails
      SET is_deleted = true, folder = 'trash', updated_at = NOW()
      WHERE id = $2 AND user_id = $3
    `;
        await pool_js_1.default.query(query, [emailId, userId]);
    }
    /**
     * Récupérer les stats d'un utilisateur
     */
    static async getUserStats(userId) {
        const query = `
      SELECT
        COUNT(CASE WHEN direction = 'outbound' THEN 1 END) as total_sent,
        COUNT(CASE WHEN direction = 'inbound' THEN 1 END) as total_received,
        COUNT(CASE WHEN is_read = false AND direction = 'inbound' AND folder = 'inbox' THEN 1 END) as unread_count,
        COUNT(CASE WHEN is_starred = true THEN 1 END) as starred_count,
        MAX(created_at) as last_email_at
      FROM emails
      WHERE user_id = $1 AND is_deleted = false
    `;
        const result = await pool_js_1.default.query(query, [userId]);
        return result.rows[0];
    }
}
exports.MailInboundService = MailInboundService;
//# sourceMappingURL=mail-inbound.service.js.map