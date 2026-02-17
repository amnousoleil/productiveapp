// =============================================
// MAIL ROUTES
// Routes API pour le module mail
// =============================================

import { Router } from 'express';
import { MailController } from './mail.controller.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';

const router = Router();

// Toutes les routes nécessitent l'authentification
router.use(authMiddleware);

// ===== CONFIGURATION =====
router.post('/config/check', MailController.checkConfig);

// ===== ENVOI =====
router.post('/send', MailController.send);

// ===== HISTORIQUE =====
router.get('/sent', MailController.getSentMails);
router.get('/sent/:id', MailController.getMailById);

// ===== BROUILLONS =====
router.post('/drafts', MailController.saveDraft);
router.get('/drafts', MailController.getDrafts);
router.delete('/drafts/:id', MailController.deleteDraft);

// ===== TEMPLATES =====
router.post('/templates', MailController.createTemplate);
router.get('/templates', MailController.getTemplates);
router.get('/templates/:id', MailController.getTemplateById);
router.put('/templates/:id', MailController.updateTemplate);
router.delete('/templates/:id', MailController.deleteTemplate);

// ===== STATS =====
router.get('/stats', MailController.getStats);

export default router;
