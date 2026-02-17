"use strict";
// =============================================
// MAIL SERVICE
// Logique métier pour l'envoi d'emails
// =============================================
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailService = void 0;
const resend_1 = require("resend");
const pool_js_1 = __importDefault(require("./pool.js"));
const resend = new resend_1.Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.EMAIL_FROM || 'ProductiveApp <noreply@giri-app.com>';
exports.MailService = {
    /**
     * Vérifie la configuration Resend
     */
    async checkConfig() {
        try {
            if (!process.env.RESEND_API_KEY) {
                return { ok: false, error: 'RESEND_API_KEY manquante dans .env' };
            }
            // Test simple : essayer d'envoyer un email à nous-même
            const { error } = await resend.emails.send({
                from: FROM_EMAIL,
                to: 'test@resend.dev', // Email de test Resend
                subject: 'Test ProductiveApp',
                html: '<p>Test de configuration</p>'
            });
            if (error) {
                return { ok: false, error: error.message };
            }
            return { ok: true };
        }
        catch (error) {
            return { ok: false, error: error.message || 'Erreur inconnue' };
        }
    },
    /**
     * Envoie un email via Resend
     */
    async send(userId, workspaceId, input) {
        try {
            // Support multi-destinataires
            const recipients = input.to;
            // Envoi via Resend
            const emailPayload = {
                from: input.fromName ? `${input.fromName} <${FROM_EMAIL}>` : FROM_EMAIL,
                to: recipients,
                subject: input.subject
            };
            if (input.cc && input.cc.length > 0)
                emailPayload.cc = input.cc;
            if (input.bcc && input.bcc.length > 0)
                emailPayload.bcc = input.bcc;
            if (input.isHtml) {
                emailPayload.html = input.body;
            }
            else {
                emailPayload.text = input.body;
            }
            if (input.attachments && input.attachments.length > 0) {
                emailPayload.attachments = input.attachments.map(att => ({
                    filename: att.filename,
                    content: Buffer.from(att.content, 'base64')
                }));
            }
            const { data, error } = await resend.emails.send(emailPayload);
            if (error) {
                console.error('[MailService] Resend error:', error);
                // Enregistrer l'échec en DB
                await pool_js_1.default.query(`INSERT INTO sent_mails (user_id, workspace_id, to_addresses, cc_addresses, bcc_addresses, subject, body, is_html, status, error_message)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'failed', $9)`, [userId, workspaceId, recipients, input.cc || [], input.bcc || [], input.subject, input.body, input.isHtml, error.message]);
                return { success: false, error: error.message };
            }
            // Enregistrer le succès en DB
            const result = await pool_js_1.default.query(`INSERT INTO sent_mails (user_id, workspace_id, to_addresses, cc_addresses, bcc_addresses, subject, body, is_html, resend_id, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'sent')
         RETURNING id`, [userId, workspaceId, recipients, input.cc || [], input.bcc || [], input.subject, input.body, input.isHtml, data?.id]);
            console.log('[MailService] Email sent successfully:', data?.id);
            return { success: true, id: result.rows[0].id };
        }
        catch (error) {
            console.error('[MailService] Exception:', error);
            return { success: false, error: error.message || 'Erreur inconnue' };
        }
    },
    /**
     * Récupère les emails envoyés
     */
    async getSentMails(userId, workspaceId, limit = 50, offset = 0) {
        const result = await pool_js_1.default.query(`SELECT * FROM sent_mails
       WHERE user_id = $1 AND (workspace_id = $2 OR workspace_id IS NULL)
       ORDER BY sent_at DESC
       LIMIT $3 OFFSET $4`, [userId, workspaceId, limit, offset]);
        return result.rows;
    },
    /**
     * Récupère un email par ID
     */
    async getMailById(mailId, userId) {
        const result = await pool_js_1.default.query(`SELECT * FROM sent_mails WHERE id = $1 AND user_id = $2`, [mailId, userId]);
        return result.rows[0] || null;
    },
    /**
     * Sauvegarde un brouillon
     */
    async saveDraft(userId, workspaceId, input, draftId) {
        if (draftId) {
            // Mise à jour
            const result = await pool_js_1.default.query(`UPDATE drafts
         SET to_addresses = $3, cc_addresses = $4, bcc_addresses = $5, subject = $6, body = $7, is_html = $8, updated_at = NOW()
         WHERE id = $1 AND user_id = $2
         RETURNING *`, [draftId, userId, input.to || [], input.cc || [], input.bcc || [], input.subject, input.body, input.isHtml || true]);
            return result.rows[0];
        }
        else {
            // Création
            const result = await pool_js_1.default.query(`INSERT INTO drafts (user_id, workspace_id, to_addresses, cc_addresses, bcc_addresses, subject, body, is_html)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`, [userId, workspaceId, input.to || [], input.cc || [], input.bcc || [], input.subject, input.body, input.isHtml || true]);
            return result.rows[0];
        }
    },
    /**
     * Récupère les brouillons
     */
    async getDrafts(userId, workspaceId) {
        const result = await pool_js_1.default.query(`SELECT * FROM drafts
       WHERE user_id = $1 AND (workspace_id = $2 OR workspace_id IS NULL)
       ORDER BY updated_at DESC`, [userId, workspaceId]);
        return result.rows;
    },
    /**
     * Supprime un brouillon
     */
    async deleteDraft(draftId, userId) {
        const result = await pool_js_1.default.query(`DELETE FROM drafts WHERE id = $1 AND user_id = $2`, [draftId, userId]);
        return result.rowCount > 0;
    },
    /**
     * Crée un template
     */
    async createTemplate(userId, input) {
        const result = await pool_js_1.default.query(`INSERT INTO mail_templates (user_id, name, subject, body, is_html, category, variables)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`, [userId, input.name, input.subject, input.body, input.isHtml || true, input.category, input.variables || []]);
        return result.rows[0];
    },
    /**
     * Récupère les templates
     */
    async getTemplates(userId) {
        const result = await pool_js_1.default.query(`SELECT * FROM mail_templates WHERE user_id = $1 ORDER BY usage_count DESC, name ASC`, [userId]);
        return result.rows;
    },
    /**
     * Récupère un template par ID
     */
    async getTemplateById(templateId, userId) {
        const result = await pool_js_1.default.query(`SELECT * FROM mail_templates WHERE id = $1 AND user_id = $2`, [templateId, userId]);
        return result.rows[0] || null;
    },
    /**
     * Met à jour un template
     */
    async updateTemplate(templateId, userId, input) {
        const fields = [];
        const values = [templateId, userId];
        let paramIndex = 3;
        if (input.name !== undefined) {
            fields.push(`name = $${paramIndex++}`);
            values.push(input.name);
        }
        if (input.subject !== undefined) {
            fields.push(`subject = $${paramIndex++}`);
            values.push(input.subject);
        }
        if (input.body !== undefined) {
            fields.push(`body = $${paramIndex++}`);
            values.push(input.body);
        }
        if (input.isHtml !== undefined) {
            fields.push(`is_html = $${paramIndex++}`);
            values.push(input.isHtml);
        }
        if (input.category !== undefined) {
            fields.push(`category = $${paramIndex++}`);
            values.push(input.category);
        }
        if (input.variables !== undefined) {
            fields.push(`variables = $${paramIndex++}`);
            values.push(input.variables);
        }
        fields.push(`updated_at = NOW()`);
        const result = await pool_js_1.default.query(`UPDATE mail_templates SET ${fields.join(', ')} WHERE id = $1 AND user_id = $2 RETURNING *`, values);
        return result.rows[0] || null;
    },
    /**
     * Supprime un template
     */
    async deleteTemplate(templateId, userId) {
        const result = await pool_js_1.default.query(`DELETE FROM mail_templates WHERE id = $1 AND user_id = $2`, [templateId, userId]);
        return result.rowCount > 0;
    },
    /**
     * Incrémente le compteur d'usage d'un template
     */
    async incrementTemplateUsage(templateId) {
        await pool_js_1.default.query(`UPDATE mail_templates SET usage_count = usage_count + 1 WHERE id = $1`, [templateId]);
    },
    /**
     * Statistiques d'emailing
     */
    async getStats(userId, workspaceId) {
        // Total envoyés
        const totalResult = await pool_js_1.default.query(`SELECT COUNT(*) as total FROM sent_mails WHERE user_id = $1 AND (workspace_id = $2 OR workspace_id IS NULL) AND status = 'sent'`, [userId, workspaceId]);
        const total_sent = parseInt(totalResult.rows[0].total);
        // Total ouverts
        const openedResult = await pool_js_1.default.query(`SELECT COUNT(*) as total FROM sent_mails WHERE user_id = $1 AND (workspace_id = $2 OR workspace_id IS NULL) AND opened_at IS NOT NULL`, [userId, workspaceId]);
        const total_opened = parseInt(openedResult.rows[0].total);
        // Total cliqués
        const clickedResult = await pool_js_1.default.query(`SELECT COUNT(*) as total FROM sent_mails WHERE user_id = $1 AND (workspace_id = $2 OR workspace_id IS NULL) AND clicked_at IS NOT NULL`, [userId, workspaceId]);
        const total_clicked = parseInt(clickedResult.rows[0].total);
        // Envoyés aujourd'hui
        const todayResult = await pool_js_1.default.query(`SELECT COUNT(*) as total FROM sent_mails WHERE user_id = $1 AND (workspace_id = $2 OR workspace_id IS NULL) AND sent_at >= CURRENT_DATE`, [userId, workspaceId]);
        const sent_today = parseInt(todayResult.rows[0].total);
        // Envoyés cette semaine
        const weekResult = await pool_js_1.default.query(`SELECT COUNT(*) as total FROM sent_mails WHERE user_id = $1 AND (workspace_id = $2 OR workspace_id IS NULL) AND sent_at >= DATE_TRUNC('week', CURRENT_DATE)`, [userId, workspaceId]);
        const sent_this_week = parseInt(weekResult.rows[0].total);
        // Envoyés ce mois
        const monthResult = await pool_js_1.default.query(`SELECT COUNT(*) as total FROM sent_mails WHERE user_id = $1 AND (workspace_id = $2 OR workspace_id IS NULL) AND sent_at >= DATE_TRUNC('month', CURRENT_DATE)`, [userId, workspaceId]);
        const sent_this_month = parseInt(monthResult.rows[0].total);
        // Activité récente (7 derniers jours)
        const activityResult = await pool_js_1.default.query(`SELECT DATE(sent_at) as date, COUNT(*) as count
       FROM sent_mails
       WHERE user_id = $1 AND (workspace_id = $2 OR workspace_id IS NULL) AND sent_at >= CURRENT_DATE - INTERVAL '7 days'
       GROUP BY DATE(sent_at)
       ORDER BY date DESC`, [userId, workspaceId]);
        return {
            total_sent,
            total_opened,
            total_clicked,
            open_rate: total_sent > 0 ? (total_opened / total_sent) * 100 : 0,
            click_rate: total_sent > 0 ? (total_clicked / total_sent) * 100 : 0,
            sent_today,
            sent_this_week,
            sent_this_month,
            recent_activity: activityResult.rows.map((row) => ({
                date: row.date.toISOString().split('T')[0],
                count: parseInt(row.count)
            }))
        };
    }
};
exports.default = exports.MailService;
//# sourceMappingURL=mail.service.js.map