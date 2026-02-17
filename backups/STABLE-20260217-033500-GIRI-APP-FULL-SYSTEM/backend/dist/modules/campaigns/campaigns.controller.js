"use strict";
// =============================================
// CAMPAIGNS MODULE - Controller Layer
// =============================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.campaignsController = exports.CampaignsController = void 0;
const campaigns_service_js_1 = require("./campaigns.service.js");
const helpers_js_1 = require("../../utils/helpers.js");
const zod_1 = require("zod");
const validation_js_1 = require("../../utils/validation.js");
const crypto_1 = require("crypto");
// ==================== Validation Schemas ====================
const createContactSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    name: zod_1.z.string().max(255).optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
    notes: zod_1.z.string().optional(),
});
const updateContactSchema = zod_1.z.object({
    email: zod_1.z.string().email().optional(),
    name: zod_1.z.string().max(255).optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
    notes: zod_1.z.string().optional(),
});
const importContactsSchema = zod_1.z.object({
    contacts: zod_1.z.array(zod_1.z.object({
        email: zod_1.z.string().email(),
        name: zod_1.z.string().optional(),
        tags: zod_1.z.array(zod_1.z.string()).optional(),
    })),
});
const createTemplateSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(255),
    subject: zod_1.z.string().min(1).max(500),
    html_content: zod_1.z.string().min(1),
});
const updateTemplateSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(255).optional(),
    subject: zod_1.z.string().min(1).max(500).optional(),
    html_content: zod_1.z.string().min(1).optional(),
});
const createCampaignSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(255),
    subject: zod_1.z.string().min(1).max(500),
    html_content: zod_1.z.string().min(1),
    scheduled_at: zod_1.z.string().datetime().optional(),
});
const updateCampaignSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(255).optional(),
    subject: zod_1.z.string().min(1).max(500).optional(),
    html_content: zod_1.z.string().min(1).optional(),
    scheduled_at: zod_1.z.string().datetime().optional(),
});
const sendCampaignSchema = zod_1.z.object({
    contact_ids: zod_1.z.array(validation_js_1.uuidSchema).optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
    send_to_all: zod_1.z.boolean().optional(),
});
const listContactsSchema = validation_js_1.paginationSchema.extend({
    q: zod_1.z.string().optional(),
    tags: zod_1.z.string().optional(), // comma-separated
});
const listCampaignsSchema = validation_js_1.paginationSchema.extend({
    status: zod_1.z.enum(['draft', 'sending', 'sent', 'scheduled']).optional(),
});
// ==================== Controller Class ====================
class CampaignsController {
    // ==================== CONTACTS ====================
    async listContacts(req, res, next) {
        try {
            const workspaceId = req.workspace.id;
            const params = listContactsSchema.parse(req.query);
            const { contacts, total } = await campaigns_service_js_1.campaignsService.listContacts(workspaceId, {
                ...params,
                tags: params.tags ? params.tags.split(',') : undefined,
            });
            res.json((0, helpers_js_1.paginatedResponse)(contacts, params, total));
        }
        catch (error) {
            next(error);
        }
    }
    async getContact(req, res, next) {
        try {
            const contactId = validation_js_1.uuidSchema.parse(req.params.contactId);
            const contact = await campaigns_service_js_1.campaignsService.getContactById(contactId);
            if (!contact) {
                res.status(404).json({ success: false, error: 'Contact not found' });
                return;
            }
            res.json((0, helpers_js_1.successResponse)({ contact }));
        }
        catch (error) {
            next(error);
        }
    }
    async createContact(req, res, next) {
        try {
            const workspaceId = req.workspace.id;
            const input = createContactSchema.parse(req.body);
            const contact = await campaigns_service_js_1.campaignsService.createContact(workspaceId, input);
            res.status(201).json((0, helpers_js_1.successResponse)({ contact }));
        }
        catch (error) {
            next(error);
        }
    }
    async updateContact(req, res, next) {
        try {
            const contactId = validation_js_1.uuidSchema.parse(req.params.contactId);
            const input = updateContactSchema.parse(req.body);
            const contact = await campaigns_service_js_1.campaignsService.updateContact(contactId, input);
            res.json((0, helpers_js_1.successResponse)({ contact }));
        }
        catch (error) {
            next(error);
        }
    }
    async deleteContact(req, res, next) {
        try {
            const contactId = validation_js_1.uuidSchema.parse(req.params.contactId);
            await campaigns_service_js_1.campaignsService.deleteContact(contactId);
            res.json((0, helpers_js_1.successResponse)({ message: 'Contact deleted' }));
        }
        catch (error) {
            next(error);
        }
    }
    async importContacts(req, res, next) {
        try {
            const workspaceId = req.workspace.id;
            const { contacts } = importContactsSchema.parse(req.body);
            const result = await campaigns_service_js_1.campaignsService.importContacts(workspaceId, contacts);
            res.json((0, helpers_js_1.successResponse)({ result }));
        }
        catch (error) {
            next(error);
        }
    }
    async getTags(req, res, next) {
        try {
            const workspaceId = req.workspace.id;
            const tags = await campaigns_service_js_1.campaignsService.getAllTags(workspaceId);
            res.json((0, helpers_js_1.successResponse)({ tags }));
        }
        catch (error) {
            next(error);
        }
    }
    // ==================== TEMPLATES ====================
    async listTemplates(req, res, next) {
        try {
            const workspaceId = req.workspace.id;
            const templates = await campaigns_service_js_1.campaignsService.listTemplates(workspaceId);
            res.json((0, helpers_js_1.successResponse)({ templates }));
        }
        catch (error) {
            next(error);
        }
    }
    async getTemplate(req, res, next) {
        try {
            const templateId = validation_js_1.uuidSchema.parse(req.params.templateId);
            const template = await campaigns_service_js_1.campaignsService.getTemplateById(templateId);
            if (!template) {
                res.status(404).json({ success: false, error: 'Template not found' });
                return;
            }
            res.json((0, helpers_js_1.successResponse)({ template }));
        }
        catch (error) {
            next(error);
        }
    }
    async createTemplate(req, res, next) {
        try {
            const workspaceId = req.workspace.id;
            const userId = req.user.id;
            const input = createTemplateSchema.parse(req.body);
            const template = await campaigns_service_js_1.campaignsService.createTemplate(workspaceId, userId, input);
            res.status(201).json((0, helpers_js_1.successResponse)({ template }));
        }
        catch (error) {
            next(error);
        }
    }
    async updateTemplate(req, res, next) {
        try {
            const templateId = validation_js_1.uuidSchema.parse(req.params.templateId);
            const input = updateTemplateSchema.parse(req.body);
            const template = await campaigns_service_js_1.campaignsService.updateTemplate(templateId, input);
            res.json((0, helpers_js_1.successResponse)({ template }));
        }
        catch (error) {
            next(error);
        }
    }
    async deleteTemplate(req, res, next) {
        try {
            const templateId = validation_js_1.uuidSchema.parse(req.params.templateId);
            await campaigns_service_js_1.campaignsService.deleteTemplate(templateId);
            res.json((0, helpers_js_1.successResponse)({ message: 'Template deleted' }));
        }
        catch (error) {
            next(error);
        }
    }
    // ==================== CAMPAIGNS ====================
    async listCampaigns(req, res, next) {
        try {
            const workspaceId = req.workspace.id;
            const params = listCampaignsSchema.parse(req.query);
            const { campaigns, total } = await campaigns_service_js_1.campaignsService.listCampaigns(workspaceId, params);
            res.json((0, helpers_js_1.paginatedResponse)(campaigns, params, total));
        }
        catch (error) {
            next(error);
        }
    }
    async getCampaign(req, res, next) {
        try {
            const campaignId = validation_js_1.uuidSchema.parse(req.params.campaignId);
            const campaign = await campaigns_service_js_1.campaignsService.getCampaignWithStats(campaignId);
            if (!campaign) {
                res.status(404).json({ success: false, error: 'Campaign not found' });
                return;
            }
            res.json((0, helpers_js_1.successResponse)({ campaign }));
        }
        catch (error) {
            next(error);
        }
    }
    async createCampaign(req, res, next) {
        try {
            const workspaceId = req.workspace.id;
            const userId = req.user.id;
            const input = createCampaignSchema.parse(req.body);
            const campaign = await campaigns_service_js_1.campaignsService.createCampaign(workspaceId, userId, {
                ...input,
                scheduled_at: input.scheduled_at ? new Date(input.scheduled_at) : undefined,
            });
            res.status(201).json((0, helpers_js_1.successResponse)({ campaign }));
        }
        catch (error) {
            next(error);
        }
    }
    async updateCampaign(req, res, next) {
        try {
            const campaignId = validation_js_1.uuidSchema.parse(req.params.campaignId);
            const input = updateCampaignSchema.parse(req.body);
            const campaign = await campaigns_service_js_1.campaignsService.updateCampaign(campaignId, {
                ...input,
                scheduled_at: input.scheduled_at ? new Date(input.scheduled_at) : undefined,
            });
            res.json((0, helpers_js_1.successResponse)({ campaign }));
        }
        catch (error) {
            next(error);
        }
    }
    async deleteCampaign(req, res, next) {
        try {
            const campaignId = validation_js_1.uuidSchema.parse(req.params.campaignId);
            await campaigns_service_js_1.campaignsService.deleteCampaign(campaignId);
            res.json((0, helpers_js_1.successResponse)({ message: 'Campaign deleted' }));
        }
        catch (error) {
            next(error);
        }
    }
    async sendCampaign(req, res, next) {
        try {
            const campaignId = validation_js_1.uuidSchema.parse(req.params.campaignId);
            const userId = req.user.id;
            const input = sendCampaignSchema.parse(req.body);
            const result = await campaigns_service_js_1.campaignsService.sendCampaign(campaignId, input, userId);
            res.json((0, helpers_js_1.successResponse)({ result }));
        }
        catch (error) {
            next(error);
        }
    }
    // ==================== WEBHOOK ====================
    async handleWebhook(req, res, next) {
        try {
            // Verify Resend webhook signature (Svix)
            const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;
            if (webhookSecret) {
                const svixId = req.headers['svix-id'];
                const svixTimestamp = req.headers['svix-timestamp'];
                const svixSignature = req.headers['svix-signature'];
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
                const expectedSignature = (0, crypto_1.createHmac)('sha256', secretBytes)
                    .update(signedContent)
                    .digest('base64');
                // Svix sends multiple signatures separated by space, check if any match
                const signatures = svixSignature.split(' ').map(s => s.replace(/^v1,/, ''));
                const isValid = signatures.some(sig => {
                    try {
                        return (0, crypto_1.timingSafeEqual)(Buffer.from(sig, 'base64'), Buffer.from(expectedSignature, 'base64'));
                    }
                    catch {
                        return false;
                    }
                });
                if (!isValid) {
                    res.status(401).json({ error: 'Invalid webhook signature' });
                    return;
                }
            }
            await campaigns_service_js_1.campaignsService.handleResendWebhook(req.body);
            res.json({ received: true });
        }
        catch (error) {
            next(error);
        }
    }
    // ==================== CUSTOM DOMAINS ====================
    async getDomain(req, res, next) {
        try {
            const workspaceId = req.workspace.id;
            const domain = await campaigns_service_js_1.campaignsService.getDomain(workspaceId);
            res.json((0, helpers_js_1.successResponse)({ domain }));
        }
        catch (error) {
            next(error);
        }
    }
    async createDomain(req, res, next) {
        try {
            const workspaceId = req.workspace.id;
            const { domain, from_email, from_name } = req.body;
            if (!domain) {
                res.status(400).json({ success: false, error: 'Domain is required' });
                return;
            }
            const result = await campaigns_service_js_1.campaignsService.createDomain(workspaceId, { domain, from_email, from_name });
            res.status(201).json((0, helpers_js_1.successResponse)({ domain: result }));
        }
        catch (error) {
            next(error);
        }
    }
    async verifyDomain(req, res, next) {
        try {
            const workspaceId = req.workspace.id;
            const domain = await campaigns_service_js_1.campaignsService.verifyDomain(workspaceId);
            res.json((0, helpers_js_1.successResponse)({ domain }));
        }
        catch (error) {
            next(error);
        }
    }
    async deleteDomain(req, res, next) {
        try {
            const workspaceId = req.workspace.id;
            await campaigns_service_js_1.campaignsService.deleteDomain(workspaceId);
            res.json((0, helpers_js_1.successResponse)({ message: 'Domain deleted' }));
        }
        catch (error) {
            next(error);
        }
    }
}
exports.CampaignsController = CampaignsController;
exports.campaignsController = new CampaignsController();
//# sourceMappingURL=campaigns.controller.js.map