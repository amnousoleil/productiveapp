// =============================================
// CAMPAIGNS MODULE - Routes
// =============================================

import { Router } from 'express';
import { campaignsController } from './campaigns.controller.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { workspaceMiddleware } from '../../middleware/workspace.middleware.js';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// ==================== CONTACTS ====================

// Workspace-scoped routes
router.get(
  '/workspace/:workspaceId/contacts',
  workspaceMiddleware,
  campaignsController.listContacts.bind(campaignsController)
);

router.post(
  '/workspace/:workspaceId/contacts',
  workspaceMiddleware,
  campaignsController.createContact.bind(campaignsController)
);

router.post(
  '/workspace/:workspaceId/contacts/import',
  workspaceMiddleware,
  campaignsController.importContacts.bind(campaignsController)
);

router.get(
  '/workspace/:workspaceId/tags',
  workspaceMiddleware,
  campaignsController.getTags.bind(campaignsController)
);

// Contact-specific routes
router.get('/contacts/:contactId', campaignsController.getContact.bind(campaignsController));
router.put('/contacts/:contactId', campaignsController.updateContact.bind(campaignsController));
router.delete('/contacts/:contactId', campaignsController.deleteContact.bind(campaignsController));

// ==================== TEMPLATES ====================

router.get(
  '/workspace/:workspaceId/templates',
  workspaceMiddleware,
  campaignsController.listTemplates.bind(campaignsController)
);

router.post(
  '/workspace/:workspaceId/templates',
  workspaceMiddleware,
  campaignsController.createTemplate.bind(campaignsController)
);

router.get('/templates/:templateId', campaignsController.getTemplate.bind(campaignsController));
router.put('/templates/:templateId', campaignsController.updateTemplate.bind(campaignsController));
router.delete('/templates/:templateId', campaignsController.deleteTemplate.bind(campaignsController));

// ==================== CAMPAIGNS ====================

router.get(
  '/workspace/:workspaceId',
  workspaceMiddleware,
  campaignsController.listCampaigns.bind(campaignsController)
);

router.post(
  '/workspace/:workspaceId',
  workspaceMiddleware,
  campaignsController.createCampaign.bind(campaignsController)
);

router.get('/:campaignId', campaignsController.getCampaign.bind(campaignsController));
router.put('/:campaignId', campaignsController.updateCampaign.bind(campaignsController));
router.delete('/:campaignId', campaignsController.deleteCampaign.bind(campaignsController));
router.post('/:campaignId/send', campaignsController.sendCampaign.bind(campaignsController));

// ==================== CUSTOM DOMAINS ====================

router.get(
  '/workspace/:workspaceId/domain',
  workspaceMiddleware,
  campaignsController.getDomain.bind(campaignsController)
);

router.post(
  '/workspace/:workspaceId/domain',
  workspaceMiddleware,
  campaignsController.createDomain.bind(campaignsController)
);

router.post(
  '/workspace/:workspaceId/domain/verify',
  workspaceMiddleware,
  campaignsController.verifyDomain.bind(campaignsController)
);

router.delete(
  '/workspace/:workspaceId/domain',
  workspaceMiddleware,
  campaignsController.deleteDomain.bind(campaignsController)
);

// ==================== WEBHOOK ====================

// Resend webhook (no auth required)
router.post('/webhook/resend', campaignsController.handleWebhook.bind(campaignsController));

export default router;
