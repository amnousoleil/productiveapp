// =============================================
// MAIL PRO V2 - Routes Inbound
// Routes API pour réception et gestion emails
// =============================================

import { Router } from 'express';
import { MailInboundController } from './mail-inbound.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();

// =============================================
// WEBHOOK RESEND (public, vérifié par signature)
// =============================================

/**
 * POST /api/v1/mail/inbound/webhook
 * Webhook Resend pour emails reçus
 * Public endpoint (signature vérifiée dans le controller)
 */
router.post('/inbound/webhook', MailInboundController.handleWebhook);

// =============================================
// INBOX & EMAIL MANAGEMENT (authentifié)
// =============================================

/**
 * GET /api/v1/mail/inbox
 * Récupérer la boîte de réception
 * Query params: limit, offset, is_read, folder
 */
router.get('/inbox', authMiddleware, MailInboundController.getInbox);

/**
 * GET /api/v1/mail/inbox/stats
 * Statistiques boîte de réception (total, non lus, par dossier)
 */
router.get('/inbox/stats', authMiddleware, MailInboundController.getStats);

/**
 * GET /api/v1/mail/inbox/:id
 * Détail d'un email
 */
router.get('/inbox/:id', authMiddleware, MailInboundController.getEmailDetail);

/**
 * PUT /api/v1/mail/inbox/:id/read
 * Marquer comme lu/non lu
 * Body: { is_read: boolean }
 */
router.put('/inbox/:id/read', authMiddleware, MailInboundController.markAsRead);

/**
 * PUT /api/v1/mail/inbox/:id/star
 * Marquer comme favori
 * Body: { is_starred: boolean }
 */
router.put('/inbox/:id/star', authMiddleware, MailInboundController.markAsStarred);

/**
 * PUT /api/v1/mail/inbox/:id/folder
 * Déplacer dans un dossier
 * Body: { folder: string }
 */
router.put('/inbox/:id/folder', authMiddleware, MailInboundController.moveToFolder);

/**
 * DELETE /api/v1/mail/inbox/:id
 * Supprimer un email (soft delete)
 */
router.delete('/inbox/:id', authMiddleware, MailInboundController.deleteEmail);

export default router;
