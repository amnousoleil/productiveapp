"use strict";
// =============================================
// MAIL PRO V2 - Controller Inbound
// Gestion webhook + routes inbox
// =============================================
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailInboundController = void 0;
const mail_inbound_service_1 = require("./mail-inbound.service");
const pool_js_1 = __importDefault(require("./pool.js"));
class MailInboundController {
    /**
     * POST /api/v1/mail/inbound/webhook
     * Webhook Resend pour emails reçus
     */
    static async handleWebhook(req, res) {
        try {
            // 1. Vérifier la signature du webhook
            const signature = req.headers['resend-signature'];
            const secret = process.env.RESEND_WEBHOOK_SECRET;
            if (!secret) {
                console.error('[Webhook] RESEND_WEBHOOK_SECRET not configured');
                return res.status(500).json({ error: 'Webhook secret not configured' });
            }
            const payload = JSON.stringify(req.body);
            if (!signature || !mail_inbound_service_1.MailInboundService.verifyWebhookSignature(payload, signature, secret)) {
                console.warn('[Webhook] Invalid signature');
                return res.status(401).json({ error: 'Invalid signature' });
            }
            // 2. Parser le payload
            const webhookData = req.body;
            // 3. On ne traite que les emails reçus
            if (webhookData.type !== 'email.received') {
                console.log(`[Webhook] Ignoring event type: ${webhookData.type}`);
                return res.status(200).json({ message: 'Event ignored' });
            }
            // 4. Traiter l'email de manière asynchrone (ne pas bloquer le webhook)
            mail_inbound_service_1.MailInboundService.processInboundEmail(webhookData)
                .catch(error => {
                console.error('[Webhook] Error processing email:', error);
            });
            // 5. Répondre immédiatement à Resend (200 OK)
            return res.status(200).json({ message: 'Webhook received' });
        }
        catch (error) {
            console.error('[Webhook] Error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
    /**
     * GET /api/v1/mail/inbox
     * Récupérer la boîte de réception
     */
    static async getInbox(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const { limit = '50', offset = '0', is_read, folder = 'inbox' } = req.query;
            const filters = {
                user_id: userId,
                limit: parseInt(limit),
                offset: parseInt(offset),
                is_read: is_read === 'true' ? true : is_read === 'false' ? false : undefined,
                folder: folder
            };
            const emails = await mail_inbound_service_1.MailInboundService.getInbox(filters);
            return res.json({
                emails,
                count: emails.length,
                limit: filters.limit,
                offset: filters.offset
            });
        }
        catch (error) {
            console.error('[Inbox] Error:', error);
            return res.status(500).json({ error: 'Failed to fetch inbox' });
        }
    }
    /**
     * GET /api/v1/mail/inbox/:id
     * Détail d'un email
     */
    static async getEmailDetail(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const { id } = req.params;
            const query = `
        SELECT * FROM emails
        WHERE id = $1 AND user_id = $2 AND is_deleted = false
      `;
            const result = await pool_js_1.default.query(query, [id, userId]);
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Email not found' });
            }
            return res.json({ email: result.rows[0] });
        }
        catch (error) {
            console.error('[EmailDetail] Error:', error);
            return res.status(500).json({ error: 'Failed to fetch email' });
        }
    }
    /**
     * PUT /api/v1/mail/:id/read
     * Marquer comme lu/non lu
     */
    static async markAsRead(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const { id } = req.params;
            const { is_read = true } = req.body;
            await mail_inbound_service_1.MailInboundService.markAsRead(id, userId, is_read);
            return res.json({ message: 'Email updated', is_read });
        }
        catch (error) {
            console.error('[MarkAsRead] Error:', error);
            return res.status(500).json({ error: 'Failed to update email' });
        }
    }
    /**
     * PUT /api/v1/mail/:id/star
     * Marquer comme favori
     */
    static async markAsStarred(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const { id } = req.params;
            const { is_starred = true } = req.body;
            await mail_inbound_service_1.MailInboundService.markAsStarred(id, userId, is_starred);
            return res.json({ message: 'Email updated', is_starred });
        }
        catch (error) {
            console.error('[MarkAsStarred] Error:', error);
            return res.status(500).json({ error: 'Failed to update email' });
        }
    }
    /**
     * PUT /api/v1/mail/:id/folder
     * Déplacer dans un dossier
     */
    static async moveToFolder(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const { id } = req.params;
            const { folder } = req.body;
            if (!folder) {
                return res.status(400).json({ error: 'Folder is required' });
            }
            await mail_inbound_service_1.MailInboundService.moveToFolder(id, userId, folder);
            return res.json({ message: 'Email moved', folder });
        }
        catch (error) {
            console.error('[MoveToFolder] Error:', error);
            return res.status(500).json({ error: 'Failed to move email' });
        }
    }
    /**
     * DELETE /api/v1/mail/:id
     * Supprimer un email (soft delete)
     */
    static async deleteEmail(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const { id } = req.params;
            await mail_inbound_service_1.MailInboundService.deleteEmail(id, userId);
            return res.json({ message: 'Email deleted' });
        }
        catch (error) {
            console.error('[DeleteEmail] Error:', error);
            return res.status(500).json({ error: 'Failed to delete email' });
        }
    }
    /**
     * GET /api/v1/mail/stats
     * Statistiques utilisateur
     */
    static async getStats(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const stats = await mail_inbound_service_1.MailInboundService.getUserStats(userId);
            return res.json({ stats });
        }
        catch (error) {
            console.error('[Stats] Error:', error);
            return res.status(500).json({ error: 'Failed to fetch stats' });
        }
    }
}
exports.MailInboundController = MailInboundController;
//# sourceMappingURL=mail-inbound.controller.js.map