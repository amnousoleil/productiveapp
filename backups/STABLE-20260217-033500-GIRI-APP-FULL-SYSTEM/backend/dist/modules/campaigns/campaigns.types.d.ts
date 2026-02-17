export interface Contact {
    id: string;
    workspace_id: string;
    email: string;
    name: string | null;
    tags: string[];
    notes: string | null;
    created_at: Date;
    updated_at: Date;
}
export interface CreateContactInput {
    email: string;
    name?: string;
    tags?: string[];
    notes?: string;
}
export interface UpdateContactInput {
    email?: string;
    name?: string;
    tags?: string[];
    notes?: string;
}
export interface EmailTemplate {
    id: string;
    workspace_id: string;
    created_by: string;
    name: string;
    subject: string;
    html_content: string;
    created_at: Date;
    updated_at: Date;
}
export interface CreateTemplateInput {
    name: string;
    subject: string;
    html_content: string;
}
export interface UpdateTemplateInput {
    name?: string;
    subject?: string;
    html_content?: string;
}
export interface Campaign {
    id: string;
    workspace_id: string;
    created_by: string;
    name: string;
    subject: string;
    html_content: string;
    status: 'draft' | 'sending' | 'sent' | 'scheduled';
    total_recipients: number;
    sent_count: number;
    opened_count: number;
    clicked_count: number;
    scheduled_at: Date | null;
    sent_at: Date | null;
    created_at: Date;
    updated_at: Date;
}
export interface CreateCampaignInput {
    name: string;
    subject: string;
    html_content: string;
    scheduled_at?: Date;
}
export interface UpdateCampaignInput {
    name?: string;
    subject?: string;
    html_content?: string;
    scheduled_at?: Date;
}
export interface CampaignSend {
    id: string;
    campaign_id: string;
    contact_id: string;
    resend_id: string | null;
    status: 'pending' | 'sent' | 'opened' | 'clicked' | 'bounced' | 'failed';
    sent_at: Date | null;
    opened_at: Date | null;
    clicked_at: Date | null;
    bounced_at: Date | null;
    error_message: string | null;
    created_at: Date;
}
export interface SendCampaignInput {
    contact_ids?: string[];
    tags?: string[];
    send_to_all?: boolean;
}
export interface CampaignStats {
    total_recipients: number;
    sent_count: number;
    opened_count: number;
    clicked_count: number;
    bounced_count: number;
    open_rate: number;
    click_rate: number;
}
export interface ContactListParams {
    page?: number;
    limit?: number;
    q?: string;
    tags?: string[];
}
export interface CampaignListParams {
    page?: number;
    limit?: number;
    status?: string;
}
export interface ImportContactsResult {
    imported: number;
    skipped: number;
    errors: string[];
}
export interface WorkspaceDomain {
    id: string;
    workspace_id: string;
    domain: string;
    resend_domain_id: string | null;
    from_email: string | null;
    from_name: string | null;
    status: 'pending' | 'verified' | 'failed';
    dns_records: DnsRecord[];
    verified_at: Date | null;
    created_at: Date;
    updated_at: Date;
}
export interface DnsRecord {
    type: string;
    name: string;
    value: string;
    priority?: number;
    status?: string;
}
export interface CreateDomainInput {
    domain: string;
    from_email?: string;
    from_name?: string;
}
//# sourceMappingURL=campaigns.types.d.ts.map