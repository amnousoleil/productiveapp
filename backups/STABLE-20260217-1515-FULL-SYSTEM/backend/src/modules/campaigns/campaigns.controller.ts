// =============================================
// CAMPAIGNS MODULE - Controller Layer
// =============================================

import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../../types/index.js';
import { campaignsService } from './campaigns.service.js';
import { successResponse, paginatedResponse } from '../../utils/helpers.js';
import { z } from 'zod';
import { uuidSchema, paginationSchema } from '../../utils/validation.js';
import { createHmac, timingSafeEqual } from 'crypto';

// ==================== Validation Schemas ====================

const createContactSchema = z.object({
  email: z.string().email(),
  name: z.string().max(255).optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

const updateContactSchema = z.object({
  email: z.string().email().optional(),
  name: z.string().max(255).optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

const importContactsSchema = z.object({
  contacts: z.array(z.object({
    email: z.string().email(),
    name: z.string().optional(),
    tags: z.array(z.string()).optional(),
  })),
});

const createTemplateSchema = z.object({
  name: z.string().min(1).max(255),
  subject: z.string().min(1).max(500),
  html_content: z.string().min(1),
});

const updateTemplateSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  subject: z.string().min(1).max(500).optional(),
  html_content: z.string().min(1).optional(),
});

const createCampaignSchema = z.object({
  name: z.string().min(1).max(255),
  subject: z.string().min(1).max(500),
  html_content: z.string().min(1),
  scheduled_at: z.string().datetime().optional(),
});

const updateCampaignSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  subject: z.string().min(1).max(500).optional(),
  html_content: z.string().min(1).optional(),
  scheduled_at: z.string().datetime().optional(),
});

const sendCampaignSchema = z.object({
  contact_ids: z.array(uuidSchema).optional(),
  tags: z.array(z.string()).optional(),
  send_to_all: z.boolean().optional(),
});

const listContactsSchema = paginationSchema.extend({
  q: z.string().optional(),
  tags: z.string().optional(), // comma-separated
});

const listCampaignsSchema = paginationSchema.extend({
  status: z.enum(['draft', 'sending', 'sent', 'scheduled']).optional(),
});

// ==================== Controller Class ====================

export class CampaignsController {
  // ==================== CONTACTS ====================

  async listContacts(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.workspace!.id;
      const params = listContactsSchema.parse(req.query);

      const { contacts, total } = await campaignsService.listContacts(workspaceId, {
        ...params,
        tags: params.tags ? params.tags.split(',') : undefined,
      });

      res.json(paginatedResponse(contacts, params, total));
    } catch (error) {
      next(error);
    }
  }

  async getContact(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const contactId = uuidSchema.parse(req.params.contactId);
      const contact = await campaignsService.getContactById(contactId);

      if (!contact) {
        res.status(404).json({ success: false, error: 'Contact not found' });
        return;
      }

      res.json(successResponse({ contact }));
    } catch (error) {
      next(error);
    }
  }

  async createContact(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.workspace!.id;
      const input = createContactSchema.parse(req.body);

      const contact = await campaignsService.createContact(workspaceId, input);

      res.status(201).json(successResponse({ contact }));
    } catch (error) {
      next(error);
    }
  }

  async updateContact(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const contactId = uuidSchema.parse(req.params.contactId);
      const input = updateContactSchema.parse(req.body);

      const contact = await campaignsService.updateContact(contactId, input);

      res.json(successResponse({ contact }));
    } catch (error) {
      next(error);
    }
  }

  async deleteContact(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const contactId = uuidSchema.parse(req.params.contactId);

      await campaignsService.deleteContact(contactId);

      res.json(successResponse({ message: 'Contact deleted' }));
    } catch (error) {
      next(error);
    }
  }

  async importContacts(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.workspace!.id;
      const { contacts } = importContactsSchema.parse(req.body);

      const result = await campaignsService.importContacts(workspaceId, contacts);

      res.json(successResponse({ result }));
    } catch (error) {
      next(error);
    }
  }

  async getTags(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.workspace!.id;
      const tags = await campaignsService.getAllTags(workspaceId);

      res.json(successResponse({ tags }));
    } catch (error) {
      next(error);
    }
  }

  // ==================== TEMPLATES ====================

  async listTemplates(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.workspace!.id;
      const templates = await campaignsService.listTemplates(workspaceId);

      res.json(successResponse({ templates }));
    } catch (error) {
      next(error);
    }
  }

  async getTemplate(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const templateId = uuidSchema.parse(req.params.templateId);
      const template = await campaignsService.getTemplateById(templateId);

      if (!template) {
        res.status(404).json({ success: false, error: 'Template not found' });
        return;
      }

      res.json(successResponse({ template }));
    } catch (error) {
      next(error);
    }
  }

  async createTemplate(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.workspace!.id;
      const userId = req.user!.id;
      const input = createTemplateSchema.parse(req.body);

      const template = await campaignsService.createTemplate(workspaceId, userId, input);

      res.status(201).json(successResponse({ template }));
    } catch (error) {
      next(error);
    }
  }

  async updateTemplate(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const templateId = uuidSchema.parse(req.params.templateId);
      const input = updateTemplateSchema.parse(req.body);

      const template = await campaignsService.updateTemplate(templateId, input);

      res.json(successResponse({ template }));
    } catch (error) {
      next(error);
    }
  }

  async deleteTemplate(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const templateId = uuidSchema.parse(req.params.templateId);

      await campaignsService.deleteTemplate(templateId);

      res.json(successResponse({ message: 'Template deleted' }));
    } catch (error) {
      next(error);
    }
  }

  // ==================== CAMPAIGNS ====================

  async listCampaigns(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.workspace!.id;
      const params = listCampaignsSchema.parse(req.query);

      const { campaigns, total } = await campaignsService.listCampaigns(workspaceId, params);

      res.json(paginatedResponse(campaigns, params, total));
    } catch (error) {
      next(error);
    }
  }

  async getCampaign(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const campaignId = uuidSchema.parse(req.params.campaignId);
      const campaign = await campaignsService.getCampaignWithStats(campaignId);

      if (!campaign) {
        res.status(404).json({ success: false, error: 'Campaign not found' });
        return;
      }

      res.json(successResponse({ campaign }));
    } catch (error) {
      next(error);
    }
  }

  async createCampaign(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.workspace!.id;
      const userId = req.user!.id;
      const input = createCampaignSchema.parse(req.body);

      const campaign = await campaignsService.createCampaign(workspaceId, userId, {
        ...input,
        scheduled_at: input.scheduled_at ? new Date(input.scheduled_at) : undefined,
      });

      res.status(201).json(successResponse({ campaign }));
    } catch (error) {
      next(error);
    }
  }

  async updateCampaign(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const campaignId = uuidSchema.parse(req.params.campaignId);
      const input = updateCampaignSchema.parse(req.body);

      const campaign = await campaignsService.updateCampaign(campaignId, {
        ...input,
        scheduled_at: input.scheduled_at ? new Date(input.scheduled_at) : undefined,
      });

      res.json(successResponse({ campaign }));
    } catch (error) {
      next(error);
    }
  }

  async deleteCampaign(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const campaignId = uuidSchema.parse(req.params.campaignId);

      await campaignsService.deleteCampaign(campaignId);

      res.json(successResponse({ message: 'Campaign deleted' }));
    } catch (error) {
      next(error);
    }
  }

  async sendCampaign(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const campaignId = uuidSchema.parse(req.params.campaignId);
      const userId = req.user!.id;
      const input = sendCampaignSchema.parse(req.body);

      const result = await campaignsService.sendCampaign(campaignId, input, userId);

      res.json(successResponse({ result }));
    } catch (error) {
      next(error);
    }
  }

  // ==================== WEBHOOK ====================

  async handleWebhook(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      // Verify Resend webhook signature (Svix)
      const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;
      if (webhookSecret) {
        const svixId = req.headers['svix-id'] as string;
        const svixTimestamp = req.headers['svix-timestamp'] as string;
        const svixSignature = req.headers['svix-signature'] as string;

        if (!svixId || !svixTimestamp || !svixSignature) {
          res.status(401).json({ error: 'Missing webhook signature headers' });
          return;
        }

        // Check timestamp freshness (5 min tolerance)
        const ts = parseInt(svixTimestamp, 10);
        const now = Math.floor(Date.now() / 1000);
        if (Math.abs(now - ts) > 300) {
          res.status(401).json({ error: 'Webhook timestamp too old' });
          return;
        }

        // Verify HMAC signature
        const body = JSON.stringify(req.body);
        const signedContent = `${svixId}.${svixTimestamp}.${body}`;
        const secretBytes = Buffer.from(webhookSecret.replace('whsec_', ''), 'base64');
        const expectedSignature = createHmac('sha256', secretBytes)
          .update(signedContent)
          .digest('base64');

        // Svix sends multiple signatures separated by space, check if any match
        const signatures = svixSignature.split(' ').map(s => s.replace(/^v1,/, ''));
        const isValid = signatures.some(sig => {
          try {
            return timingSafeEqual(Buffer.from(sig, 'base64'), Buffer.from(expectedSignature, 'base64'));
          } catch { return false; }
        });

        if (!isValid) {
          res.status(401).json({ error: 'Invalid webhook signature' });
          return;
        }
      }

      await campaignsService.handleResendWebhook(req.body);
      res.json({ received: true });
    } catch (error) {
      next(error);
    }
  }

  // ==================== CUSTOM DOMAINS ====================

  async getDomain(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.workspace!.id;
      const domain = await campaignsService.getDomain(workspaceId);

      res.json(successResponse({ domain }));
    } catch (error) {
      next(error);
    }
  }

  async createDomain(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.workspace!.id;
      const { domain, from_email, from_name } = req.body;

      if (!domain) {
        res.status(400).json({ success: false, error: 'Domain is required' });
        return;
      }

      const result = await campaignsService.createDomain(workspaceId, { domain, from_email, from_name });

      res.status(201).json(successResponse({ domain: result }));
    } catch (error) {
      next(error);
    }
  }

  async verifyDomain(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.workspace!.id;

      const domain = await campaignsService.verifyDomain(workspaceId);

      res.json(successResponse({ domain }));
    } catch (error) {
      next(error);
    }
  }

  async deleteDomain(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const workspaceId = req.workspace!.id;

      await campaignsService.deleteDomain(workspaceId);

      res.json(successResponse({ message: 'Domain deleted' }));
    } catch (error) {
      next(error);
    }
  }
}

export const campaignsController = new CampaignsController();
