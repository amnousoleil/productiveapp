"use strict";
// =============================================
// MAIL ROUTES
// Routes API pour le module mail
// =============================================
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mail_controller_js_1 = require("./mail.controller.js");
const auth_middleware_js_1 = require("../../middleware/auth.middleware.js");
const router = (0, express_1.Router)();
// Toutes les routes nécessitent l'authentification
router.use(auth_middleware_js_1.authMiddleware);
// ===== CONFIGURATION =====
router.post('/config/check', mail_controller_js_1.MailController.checkConfig);
// ===== ENVOI =====
router.post('/send', mail_controller_js_1.MailController.send);
// ===== HISTORIQUE =====
router.get('/sent', mail_controller_js_1.MailController.getSentMails);
router.get('/sent/:id', mail_controller_js_1.MailController.getMailById);
// ===== BROUILLONS =====
router.post('/drafts', mail_controller_js_1.MailController.saveDraft);
router.get('/drafts', mail_controller_js_1.MailController.getDrafts);
router.delete('/drafts/:id', mail_controller_js_1.MailController.deleteDraft);
// ===== TEMPLATES =====
router.post('/templates', mail_controller_js_1.MailController.createTemplate);
router.get('/templates', mail_controller_js_1.MailController.getTemplates);
router.get('/templates/:id', mail_controller_js_1.MailController.getTemplateById);
router.put('/templates/:id', mail_controller_js_1.MailController.updateTemplate);
router.delete('/templates/:id', mail_controller_js_1.MailController.deleteTemplate);
// ===== STATS =====
router.get('/stats', mail_controller_js_1.MailController.getStats);
exports.default = router;
//# sourceMappingURL=mail.routes.js.map