"use strict";
// =============================================
// MAIL CONTROLLER
// Handlers pour les requêtes mail
// =============================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailController = void 0;
const mail_service_js_1 = require("./mail.service.js");
const mail_types_js_1 = require("./mail.types.js");
exports.MailController = {
    /**
     * POST /api/v1/mail/config/check
     * Vérifie la configuration Resend
     */
    async checkConfig(_req, res) {
        try {
            const result = await mail_service_js_1.MailService.checkConfig();
            if (!result.ok) {
                return res.status(400).json({
                    success: false,
                    error: result.error
                });
            }
            return res.json({
                success: true,
                message: 'Configuration Resend OK',
                from: process.env.EMAIL_FROM
            });
        }
        catch (error) {
            console.error('[MailController] checkConfig error:', error);
            return res.status(500).json({
                success: false,
                error: 'Erreur lors de la vérification'
            });
        }
    },
    /**
     * POST /api/v1/mail/send
     * Envoie un email
     */
    async send(req, res) {
        try {
            const userId = req.user.id;
            const workspaceId = req.workspace?.id || null;
            // Validation
            const validation = mail_types_js_1.SendMailSchema.safeParse(req.body);
            if (!validation.success) {
                return res.status(400).json({
                    success: false,
                    error: 'Données invalides',
                    details: validation.error.errors
                });
            }
            const result = await mail_service_js_1.MailService.send(userId, workspaceId, validation.data);
            if (!result.success) {
                return res.status(400).json({
                    success: false,
                    error: result.error
                });
            }
            return res.json({
                success: true,
                id: result.id
            });
        }
        catch (error) {
            console.error('[MailController] send error:', error);
            return res.status(500).json({
                success: false,
                error: 'Erreur lors de l\'envoi'
            });
        }
    },
    /**
     * GET /api/v1/mail/sent
     * Liste des emails envoyés
     */
    async getSentMails(req, res) {
        try {
            const userId = req.user.id;
            const workspaceId = req.workspace?.id || null;
            const limit = parseInt(req.query.limit) || 50;
            const offset = parseInt(req.query.offset) || 0;
            const mails = await mail_service_js_1.MailService.getSentMails(userId, workspaceId, limit, offset);
            return res.json({
                success: true,
                mails,
                limit,
                offset
            });
        }
        catch (error) {
            console.error('[MailController] getSentMails error:', error);
            return res.status(500).json({
                success: false,
                error: 'Erreur lors de la récupération'
            });
        }
    },
    /**
     * GET /api/v1/mail/sent/:id
     * Détails d'un email
     */
    async getMailById(req, res) {
        try {
            const userId = req.user.id;
            const mailId = req.params.id;
            const mail = await mail_service_js_1.MailService.getMailById(mailId, userId);
            if (!mail) {
                return res.status(404).json({
                    success: false,
                    error: 'Email non trouvé'
                });
            }
            return res.json({
                success: true,
                mail
            });
        }
        catch (error) {
            console.error('[MailController] getMailById error:', error);
            return res.status(500).json({
                success: false,
                error: 'Erreur lors de la récupération'
            });
        }
    },
    /**
     * POST /api/v1/mail/drafts
     * Sauvegarde un brouillon
     */
    async saveDraft(req, res) {
        try {
            const userId = req.user.id;
            const workspaceId = req.workspace?.id || null;
            const draftId = req.body.id;
            // Validation
            const validation = mail_types_js_1.SaveDraftSchema.safeParse(req.body);
            if (!validation.success) {
                return res.status(400).json({
                    success: false,
                    error: 'Données invalides',
                    details: validation.error.errors
                });
            }
            const draft = await mail_service_js_1.MailService.saveDraft(userId, workspaceId, validation.data, draftId);
            return res.json({
                success: true,
                draft
            });
        }
        catch (error) {
            console.error('[MailController] saveDraft error:', error);
            return res.status(500).json({
                success: false,
                error: 'Erreur lors de la sauvegarde'
            });
        }
    },
    /**
     * GET /api/v1/mail/drafts
     * Liste des brouillons
     */
    async getDrafts(req, res) {
        try {
            const userId = req.user.id;
            const workspaceId = req.workspace?.id || null;
            const drafts = await mail_service_js_1.MailService.getDrafts(userId, workspaceId);
            return res.json({
                success: true,
                drafts
            });
        }
        catch (error) {
            console.error('[MailController] getDrafts error:', error);
            return res.status(500).json({
                success: false,
                error: 'Erreur lors de la récupération'
            });
        }
    },
    /**
     * DELETE /api/v1/mail/drafts/:id
     * Supprime un brouillon
     */
    async deleteDraft(req, res) {
        try {
            const userId = req.user.id;
            const draftId = req.params.id;
            const deleted = await mail_service_js_1.MailService.deleteDraft(draftId, userId);
            if (!deleted) {
                return res.status(404).json({
                    success: false,
                    error: 'Brouillon non trouvé'
                });
            }
            return res.json({
                success: true
            });
        }
        catch (error) {
            console.error('[MailController] deleteDraft error:', error);
            return res.status(500).json({
                success: false,
                error: 'Erreur lors de la suppression'
            });
        }
    },
    /**
     * POST /api/v1/mail/templates
     * Crée un template
     */
    async createTemplate(req, res) {
        try {
            const userId = req.user.id;
            // Validation
            const validation = mail_types_js_1.CreateTemplateSchema.safeParse(req.body);
            if (!validation.success) {
                return res.status(400).json({
                    success: false,
                    error: 'Données invalides',
                    details: validation.error.errors
                });
            }
            const template = await mail_service_js_1.MailService.createTemplate(userId, validation.data);
            return res.json({
                success: true,
                template
            });
        }
        catch (error) {
            console.error('[MailController] createTemplate error:', error);
            return res.status(500).json({
                success: false,
                error: 'Erreur lors de la création'
            });
        }
    },
    /**
     * GET /api/v1/mail/templates
     * Liste des templates
     */
    async getTemplates(req, res) {
        try {
            const userId = req.user.id;
            const templates = await mail_service_js_1.MailService.getTemplates(userId);
            return res.json({
                success: true,
                templates
            });
        }
        catch (error) {
            console.error('[MailController] getTemplates error:', error);
            return res.status(500).json({
                success: false,
                error: 'Erreur lors de la récupération'
            });
        }
    },
    /**
     * GET /api/v1/mail/templates/:id
     * Détails d'un template
     */
    async getTemplateById(req, res) {
        try {
            const userId = req.user.id;
            const templateId = req.params.id;
            const template = await mail_service_js_1.MailService.getTemplateById(templateId, userId);
            if (!template) {
                return res.status(404).json({
                    success: false,
                    error: 'Template non trouvé'
                });
            }
            return res.json({
                success: true,
                template
            });
        }
        catch (error) {
            console.error('[MailController] getTemplateById error:', error);
            return res.status(500).json({
                success: false,
                error: 'Erreur lors de la récupération'
            });
        }
    },
    /**
     * PUT /api/v1/mail/templates/:id
     * Met à jour un template
     */
    async updateTemplate(req, res) {
        try {
            const userId = req.user.id;
            const templateId = req.params.id;
            const template = await mail_service_js_1.MailService.updateTemplate(templateId, userId, req.body);
            if (!template) {
                return res.status(404).json({
                    success: false,
                    error: 'Template non trouvé'
                });
            }
            return res.json({
                success: true,
                template
            });
        }
        catch (error) {
            console.error('[MailController] updateTemplate error:', error);
            return res.status(500).json({
                success: false,
                error: 'Erreur lors de la mise à jour'
            });
        }
    },
    /**
     * DELETE /api/v1/mail/templates/:id
     * Supprime un template
     */
    async deleteTemplate(req, res) {
        try {
            const userId = req.user.id;
            const templateId = req.params.id;
            const deleted = await mail_service_js_1.MailService.deleteTemplate(templateId, userId);
            if (!deleted) {
                return res.status(404).json({
                    success: false,
                    error: 'Template non trouvé'
                });
            }
            return res.json({
                success: true
            });
        }
        catch (error) {
            console.error('[MailController] deleteTemplate error:', error);
            return res.status(500).json({
                success: false,
                error: 'Erreur lors de la suppression'
            });
        }
    },
    /**
     * GET /api/v1/mail/stats
     * Statistiques d'emailing
     */
    async getStats(req, res) {
        try {
            const userId = req.user.id;
            const workspaceId = req.workspace?.id || null;
            const stats = await mail_service_js_1.MailService.getStats(userId, workspaceId);
            return res.json({
                success: true,
                stats
            });
        }
        catch (error) {
            console.error('[MailController] getStats error:', error);
            return res.status(500).json({
                success: false,
                error: 'Erreur lors de la récupération'
            });
        }
    }
};
exports.default = exports.MailController;
//# sourceMappingURL=mail.controller.js.map