import type { Contact, CreateContactInput, UpdateContactInput, EmailTemplate, CreateTemplateInput, UpdateTemplateInput, Campaign, CreateCampaignInput, UpdateCampaignInput, SendCampaignInput, CampaignStats, ContactListParams, CampaignListParams, ImportContactsResult, WorkspaceDomain, CreateDomainInput } from './campaigns.types.js';
declare class CampaignsService {
    listContacts(workspaceId: string, params: ContactListParams): Promise<{
        contacts: Contact[];
        total: number;
    }>;
    getContactById(contactId: string): Promise<Contact | null>;
    createContact(workspaceId: string, input: CreateContactInput): Promise<Contact>;
    updateContact(contactId: string, input: UpdateContactInput): Promise<Contact>;
    deleteContact(contactId: string): Promise<void>;
    importContacts(workspaceId: string, contacts: {
        email: string;
        name?: string;
        tags?: string[];
    }[]): Promise<ImportContactsResult>;
    getAllTags(workspaceId: string): Promise<string[]>;
    listTemplates(workspaceId: string): Promise<EmailTemplate[]>;
    getTemplateById(templateId: string): Promise<EmailTemplate | null>;
    createTemplate(workspaceId: string, userId: string, input: CreateTemplateInput): Promise<EmailTemplate>;
    updateTemplate(templateId: string, input: UpdateTemplateInput): Promise<EmailTemplate>;
    deleteTemplate(templateId: string): Promise<void>;
    listCampaigns(workspaceId: string, params: CampaignListParams): Promise<{
        campaigns: Campaign[];
        total: number;
    }>;
    getCampaignById(campaignId: string): Promise<Campaign | null>;
    getCampaignWithStats(campaignId: string): Promise<(Campaign & {
        stats: CampaignStats;
    }) | null>;
    createCampaign(workspaceId: string, userId: string, input: CreateCampaignInput): Promise<Campaign>;
    updateCampaign(campaignId: string, input: UpdateCampaignInput): Promise<Campaign>;
    deleteCampaign(campaignId: string): Promise<void>;
    sendCampaign(campaignId: string, input: SendCampaignInput, userId?: string): Promise<{
        sent: number;
        failed: number;
    }>;
    handleResendWebhook(event: {
        type: string;
        data: {
            email_id: string;
            to: string;
        };
    }): Promise<void>;
    getDomain(workspaceId: string): Promise<WorkspaceDomain | null>;
    createDomain(workspaceId: string, input: CreateDomainInput): Promise<WorkspaceDomain>;
    verifyDomain(workspaceId: string): Promise<WorkspaceDomain>;
    deleteDomain(workspaceId: string): Promise<void>;
    getFromEmail(workspaceId: string, senderName?: string): Promise<string>;
}
export declare const campaignsService: CampaignsService;
export {};
//# sourceMappingURL=campaigns.service.d.ts.map