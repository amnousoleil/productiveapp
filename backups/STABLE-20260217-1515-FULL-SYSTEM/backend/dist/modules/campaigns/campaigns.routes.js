"use strict";
// =============================================
// CAMPAIGNS MODULE - Routes
// =============================================
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const campaigns_controller_js_1 = require("./campaigns.controller.js");
const auth_middleware_js_1 = require("../../middleware/auth.middleware.js");
const workspace_middleware_js_1 = require("../../middleware/workspace.middleware.js");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_middleware_js_1.authMiddleware);
// ==================== CONTACTS ====================
// Workspace-scoped routes
router.get('/workspace/:workspaceId/contacts', workspace_middleware_js_1.workspaceMiddleware, campaigns_controller_js_1.campaignsController.listContacts.bind(campaigns_controller_js_1.campaignsController));
router.post('/workspace/:workspaceId/contacts', workspace_middleware_js_1.workspaceMiddleware, campaigns_controller_js_1.campaignsController.createContact.bind(campaigns_controller_js_1.campaignsController));
router.post('/workspace/:workspaceId/contacts/import', workspace_middleware_js_1.workspaceMiddleware, campaigns_controller_js_1.campaignsController.importContacts.bind(campaigns_controller_js_1.campaignsController));
router.get('/workspace/:workspaceId/tags', workspace_middleware_js_1.workspaceMiddleware, campaigns_controller_js_1.campaignsController.getTags.bind(campaigns_controller_js_1.campaignsController));
// Contact-specific routes
router.get('/contacts/:contactId', campaigns_controller_js_1.campaignsController.getContact.bind(campaigns_controller_js_1.campaignsController));
router.put('/contacts/:contactId', campaigns_controller_js_1.campaignsController.updateContact.bind(campaigns_controller_js_1.campaignsController));
router.delete('/contacts/:contactId', campaigns_controller_js_1.campaignsController.deleteContact.bind(campaigns_controller_js_1.campaignsController));
// ==================== TEMPLATES ====================
router.get('/workspace/:workspaceId/templates', workspace_middleware_js_1.workspaceMiddleware, campaigns_controller_js_1.campaignsController.listTemplates.bind(campaigns_controller_js_1.campaignsController));
router.post('/workspace/:workspaceId/templates', workspace_middleware_js_1.workspaceMiddleware, campaigns_controller_js_1.campaignsController.createTemplate.bind(campaigns_controller_js_1.campaignsController));
router.get('/templates/:templateId', campaigns_controller_js_1.campaignsController.getTemplate.bind(campaigns_controller_js_1.campaignsController));
router.put('/templates/:templateId', campaigns_controller_js_1.campaignsController.updateTemplate.bind(campaigns_controller_js_1.campaignsController));
router.delete('/templates/:templateId', campaigns_controller_js_1.campaignsController.deleteTemplate.bind(campaigns_controller_js_1.campaignsController));
// ==================== CAMPAIGNS ====================
router.get('/workspace/:workspaceId', workspace_middleware_js_1.workspaceMiddleware, campaigns_controller_js_1.campaignsController.listCampaigns.bind(campaigns_controller_js_1.campaignsController));
router.post('/workspace/:workspaceId', workspace_middleware_js_1.workspaceMiddleware, campaigns_controller_js_1.campaignsController.createCampaign.bind(campaigns_controller_js_1.campaignsController));
router.get('/:campaignId', campaigns_controller_js_1.campaignsController.getCampaign.bind(campaigns_controller_js_1.campaignsController));
router.put('/:campaignId', campaigns_controller_js_1.campaignsController.updateCampaign.bind(campaigns_controller_js_1.campaignsController));
router.delete('/:campaignId', campaigns_controller_js_1.campaignsController.deleteCampaign.bind(campaigns_controller_js_1.campaignsController));
router.post('/:campaignId/send', campaigns_controller_js_1.campaignsController.sendCampaign.bind(campaigns_controller_js_1.campaignsController));
// ==================== CUSTOM DOMAINS ====================
router.get('/workspace/:workspaceId/domain', workspace_middleware_js_1.workspaceMiddleware, campaigns_controller_js_1.campaignsController.getDomain.bind(campaigns_controller_js_1.campaignsController));
router.post('/workspace/:workspaceId/domain', workspace_middleware_js_1.workspaceMiddleware, campaigns_controller_js_1.campaignsController.createDomain.bind(campaigns_controller_js_1.campaignsController));
router.post('/workspace/:workspaceId/domain/verify', workspace_middleware_js_1.workspaceMiddleware, campaigns_controller_js_1.campaignsController.verifyDomain.bind(campaigns_controller_js_1.campaignsController));
router.delete('/workspace/:workspaceId/domain', workspace_middleware_js_1.workspaceMiddleware, campaigns_controller_js_1.campaignsController.deleteDomain.bind(campaigns_controller_js_1.campaignsController));
// ==================== WEBHOOK ====================
// Resend webhook (no auth required)
router.post('/webhook/resend', campaigns_controller_js_1.campaignsController.handleWebhook.bind(campaigns_controller_js_1.campaignsController));
exports.default = router;
//# sourceMappingURL=campaigns.routes.js.map