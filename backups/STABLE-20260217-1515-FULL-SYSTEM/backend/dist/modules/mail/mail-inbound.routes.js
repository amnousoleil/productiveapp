"use strict";
// =============================================
// MAIL PRO V2 - Routes Inbound
// Routes API pour réception et gestion emails
// =============================================
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mail_inbound_controller_1 = require("./mail-inbound.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const router = (0, express_1.Router)();
// =============================================
// WEBHOOK RESEND (public, vérifié par signature)
// =============================================
/**
 * POST /api/v1/mail/inbound/webhook
 * Webhook Resend pour emails reçus
 * Public endpoint (signature vérifiée dans le controller)
 */
router.post('/inbound/webhook', mail_inbound_controller_1.MailInboundController.handleWebhook);
// =============================================
// INBOX & EMAIL MANAGEMENT (authentifié)
// =============================================
/**
 * GET /api/v1/mail/inbox
 * Récupérer la boîte de réception
 * Query params: limit, offset, is_read, folder
 */
router.get('/inbox', auth_middleware_1.authMiddleware, mail_inbound_controller_1.MailInboundController.getInbox);
/**
 * GET /api/v1/mail/inbox/stats
 * Statistiques boîte de réception (total, non lus, par dossier)
 */
router.get('/inbox/stats', auth_middleware_1.authMiddleware, mail_inbound_controller_1.MailInboundController.getStats);
/**
 * GET /api/v1/mail/inbox/:id
 * Détail d'un email
 */
router.get('/inbox/:id', auth_middleware_1.authMiddleware, mail_inbound_controller_1.MailInboundController.getEmailDetail);
/**
 * PUT /api/v1/mail/inbox/:id/read
 * Marquer comme lu/non lu
 * Body: { is_read: boolean }
 */
router.put('/inbox/:id/read', auth_middleware_1.authMiddleware, mail_inbound_controller_1.MailInboundController.markAsRead);
/**
 * PUT /api/v1/mail/inbox/:id/star
 * Marquer comme favori
 * Body: { is_starred: boolean }
 */
router.put('/inbox/:id/star', auth_middleware_1.authMiddleware, mail_inbound_controller_1.MailInboundController.markAsStarred);
/**
 * PUT /api/v1/mail/inbox/:id/folder
 * Déplacer dans un dossier
 * Body: { folder: string }
 */
router.put('/inbox/:id/folder', auth_middleware_1.authMiddleware, mail_inbound_controller_1.MailInboundController.moveToFolder);
/**
 * DELETE /api/v1/mail/inbox/:id
 * Supprimer un email (soft delete)
 */
router.delete('/inbox/:id', auth_middleware_1.authMiddleware, mail_inbound_controller_1.MailInboundController.deleteEmail);
exports.default = router;
//# sourceMappingURL=mail-inbound.routes.js.map