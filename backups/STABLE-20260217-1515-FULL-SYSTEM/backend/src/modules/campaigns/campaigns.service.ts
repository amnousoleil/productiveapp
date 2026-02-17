// =============================================
// CAMPAIGNS MODULE - Service Layer
// =============================================

import { sql } from '../../config/database.js';
import { Resend } from 'resend';
import { generateUUID } from '../../utils/helpers.js';
import type {
  Contact,
  CreateContactInput,
  UpdateContactInput,
  EmailTemplate,
  CreateTemplateInput,
  UpdateTemplateInput,
  Campaign,
  CreateCampaignInput,
  UpdateCampaignInput,
  SendCampaignInput,
  CampaignStats,
  ContactListParams,
  CampaignListParams,
  ImportContactsResult,
  WorkspaceDomain,
  DnsRecord,
  CreateDomainInput,
} from './campaigns.types.js';

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@example.com';

class CampaignsService {
  // ==================== CONTACTS ====================

  async listContacts(
    workspaceId: string,
    params: ContactListParams
  ): Promise<{ contacts: Contact[]; total: number }> {
    const { page = 1, limit = 50, q, tags } = params;
    const offset = (page - 1) * limit;

    let contacts: Contact[];
    let countResult: { count: string }[];

    if (q && tags && tags.length > 0) {
      const searchPattern = `%${q}%`;
      contacts = await sql`
        SELECT * FROM contacts
        WHERE workspace_id = ${workspaceId}
          AND (email ILIKE ${searchPattern} OR name ILIKE ${searchPattern})
          AND tags && ${tags}
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      countResult = await sql`
        SELECT COUNT(*)::text as count FROM contacts
        WHERE workspace_id = ${workspaceId}
          AND (email ILIKE ${searchPattern} OR name ILIKE ${searchPattern})
          AND tags && ${tags}
      `;
    } else if (q) {
      const searchPattern = `%${q}%`;
      contacts = await sql`
        SELECT * FROM contacts
        WHERE workspace_id = ${workspaceId}
          AND (email ILIKE ${searchPattern} OR name ILIKE ${searchPattern})
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      countResult = await sql`
        SELECT COUNT(*)::text as count FROM contacts
        WHERE workspace_id = ${workspaceId}
          AND (email ILIKE ${searchPattern} OR name ILIKE ${searchPattern})
      `;
    } else if (tags && tags.length > 0) {
      contacts = await sql`
        SELECT * FROM contacts
        WHERE workspace_id = ${workspaceId}
          AND tags && ${tags}
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      countResult = await sql`
        SELECT COUNT(*)::text as count FROM contacts
        WHERE workspace_id = ${workspaceId}
          AND tags && ${tags}
      `;
    } else {
      contacts = await sql`
        SELECT * FROM contacts
        WHERE workspace_id = ${workspaceId}
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      countResult = await sql`
        SELECT COUNT(*)::text as count FROM contacts
        WHERE workspace_id = ${workspaceId}
      `;
    }

    return {
      contacts,
      total: parseInt(countResult[0]?.count || '0', 10),
    };
  }

  async getContactById(contactId: string): Promise<Contact | null> {
    const contacts = await sql<Contact[]>`
      SELECT * FROM contacts WHERE id = ${contactId}
    `;
    return contacts[0] || null;
  }

  async createContact(workspaceId: string, input: CreateContactInput): Promise<Contact> {
    const id = generateUUID();
    const { email, name, tags = [], notes } = input;

    const contacts = await sql<Contact[]>`
      INSERT INTO contacts (id, workspace_id, email, name, tags, notes)
      VALUES (${id}, ${workspaceId}, ${email.toLowerCase()}, ${name || null}, ${tags}, ${notes || null})
      RETURNING *
    `;
    return contacts[0];
  }

  async updateContact(contactId: string, input: UpdateContactInput): Promise<Contact> {
    // Build dynamic update
    const current = await this.getContactById(contactId);
    if (!current) throw new Error('Contact not found');

    const contacts = await sql<Contact[]>`
      UPDATE contacts SET
        email = ${input.email !== undefined ? input.email.toLowerCase() : current.email},
        name = ${input.name !== undefined ? input.name : current.name},
        tags = ${input.tags !== undefined ? input.tags : current.tags},
        notes = ${input.notes !== undefined ? input.notes : current.notes},
        updated_at = NOW()
      WHERE id = ${contactId}
      RETURNING *
    `;
    return contacts[0];
  }

  async deleteContact(contactId: string): Promise<void> {
    await sql`DELETE FROM contacts WHERE id = ${contactId}`;
  }

  async importContacts(
    workspaceId: string,
    contacts: { email: string; name?: string; tags?: string[] }[]
  ): Promise<ImportContactsResult> {
    let imported = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const contact of contacts) {
      try {
        const id = generateUUID();
        const result = await sql`
          INSERT INTO contacts (id, workspace_id, email, name, tags)
          VALUES (${id}, ${workspaceId}, ${contact.email.toLowerCase()}, ${contact.name || null}, ${contact.tags || []})
          ON CONFLICT (workspace_id, email) DO NOTHING
          RETURNING id
        `;
        if (result.length > 0) {
          imported++;
        } else {
          skipped++;
        }
      } catch (error) {
        skipped++;
        errors.push(`Failed to import ${contact.email}: ${error}`);
      }
    }

    return { imported, skipped, errors };
  }

  async getAllTags(workspaceId: string): Promise<string[]> {
    const result = await sql<{ tag: string }[]>`
      SELECT DISTINCT unnest(tags) as tag FROM contacts WHERE workspace_id = ${workspaceId} ORDER BY tag
    `;
    return result.map((r) => r.tag);
  }

  // ==================== TEMPLATES ====================

  async listTemplates(workspaceId: string): Promise<EmailTemplate[]> {
    return sql<EmailTemplate[]>`
      SELECT * FROM email_templates WHERE workspace_id = ${workspaceId} ORDER BY created_at DESC
    `;
  }

  async getTemplateById(templateId: string): Promise<EmailTemplate | null> {
    const templates = await sql<EmailTemplate[]>`
      SELECT * FROM email_templates WHERE id = ${templateId}
    `;
    return templates[0] || null;
  }

  async createTemplate(
    workspaceId: string,
    userId: string,
    input: CreateTemplateInput
  ): Promise<EmailTemplate> {
    const id = generateUUID();
    const { name, subject, html_content } = input;

    const templates = await sql<EmailTemplate[]>`
      INSERT INTO email_templates (id, workspace_id, created_by, name, subject, html_content)
      VALUES (${id}, ${workspaceId}, ${userId}, ${name}, ${subject}, ${html_content})
      RETURNING *
    `;
    return templates[0];
  }

  async updateTemplate(templateId: string, input: UpdateTemplateInput): Promise<EmailTemplate> {
    const current = await this.getTemplateById(templateId);
    if (!current) throw new Error('Template not found');

    const templates = await sql<EmailTemplate[]>`
      UPDATE email_templates SET
        name = ${input.name !== undefined ? input.name : current.name},
        subject = ${input.subject !== undefined ? input.subject : current.subject},
        html_content = ${input.html_content !== undefined ? input.html_content : current.html_content},
        updated_at = NOW()
      WHERE id = ${templateId}
      RETURNING *
    `;
    return templates[0];
  }

  async deleteTemplate(templateId: string): Promise<void> {
    await sql`DELETE FROM email_templates WHERE id = ${templateId}`;
  }

  // ==================== CAMPAIGNS ====================

  async listCampaigns(
    workspaceId: string,
    params: CampaignListParams
  ): Promise<{ campaigns: Campaign[]; total: number }> {
    const { page = 1, limit = 20, status } = params;
    const offset = (page - 1) * limit;

    let campaigns: Campaign[];
    let countResult: { count: string }[];

    if (status) {
      campaigns = await sql<Campaign[]>`
        SELECT * FROM campaigns
        WHERE workspace_id = ${workspaceId} AND status = ${status}
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      countResult = await sql<{ count: string }[]>`
        SELECT COUNT(*)::text as count FROM campaigns
        WHERE workspace_id = ${workspaceId} AND status = ${status}
      `;
    } else {
      campaigns = await sql<Campaign[]>`
        SELECT * FROM campaigns
        WHERE workspace_id = ${workspaceId}
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      countResult = await sql<{ count: string }[]>`
        SELECT COUNT(*)::text as count FROM campaigns
        WHERE workspace_id = ${workspaceId}
      `;
    }

    return {
      campaigns,
      total: parseInt(countResult[0]?.count || '0', 10),
    };
  }

  async getCampaignById(campaignId: string): Promise<Campaign | null> {
    const campaigns = await sql<Campaign[]>`
      SELECT * FROM campaigns WHERE id = ${campaignId}
    `;
    return campaigns[0] || null;
  }

  async getCampaignWithStats(campaignId: string): Promise<(Campaign & { stats: CampaignStats }) | null> {
    const campaign = await this.getCampaignById(campaignId);
    if (!campaign) return null;

    const statsResult = await sql<{
      total: string;
      sent: string;
      opened: string;
      clicked: string;
      bounced: string;
    }[]>`
      SELECT
        COUNT(*)::text as total,
        COUNT(*) FILTER (WHERE status IN ('sent', 'opened', 'clicked'))::text as sent,
        COUNT(*) FILTER (WHERE status IN ('opened', 'clicked'))::text as opened,
        COUNT(*) FILTER (WHERE status = 'clicked')::text as clicked,
        COUNT(*) FILTER (WHERE status = 'bounced')::text as bounced
      FROM campaign_sends WHERE campaign_id = ${campaignId}
    `;

    const s = statsResult[0];
    const total = parseInt(s?.total || '0', 10);
    const sent = parseInt(s?.sent || '0', 10);
    const opened = parseInt(s?.opened || '0', 10);
    const clicked = parseInt(s?.clicked || '0', 10);
    const bounced = parseInt(s?.bounced || '0', 10);

    return {
      ...campaign,
      stats: {
        total_recipients: total,
        sent_count: sent,
        opened_count: opened,
        clicked_count: clicked,
        bounced_count: bounced,
        open_rate: sent > 0 ? Math.round((opened / sent) * 100) : 0,
        click_rate: sent > 0 ? Math.round((clicked / sent) * 100) : 0,
      },
    };
  }

  async createCampaign(
    workspaceId: string,
    userId: string,
    input: CreateCampaignInput
  ): Promise<Campaign> {
    const id = generateUUID();
    const { name, subject, html_content, scheduled_at } = input;

    const campaigns = await sql<Campaign[]>`
      INSERT INTO campaigns (id, workspace_id, created_by, name, subject, html_content, scheduled_at)
      VALUES (${id}, ${workspaceId}, ${userId}, ${name}, ${subject}, ${html_content}, ${scheduled_at || null})
      RETURNING *
    `;
    return campaigns[0];
  }

  async updateCampaign(campaignId: string, input: UpdateCampaignInput): Promise<Campaign> {
    const current = await this.getCampaignById(campaignId);
    if (!current) throw new Error('Campaign not found');

    const campaigns = await sql<Campaign[]>`
      UPDATE campaigns SET
        name = ${input.name !== undefined ? input.name : current.name},
        subject = ${input.subject !== undefined ? input.subject : current.subject},
        html_content = ${input.html_content !== undefined ? input.html_content : current.html_content},
        scheduled_at = ${input.scheduled_at !== undefined ? input.scheduled_at : current.scheduled_at},
        updated_at = NOW()
      WHERE id = ${campaignId}
      RETURNING *
    `;
    return campaigns[0];
  }

  async deleteCampaign(campaignId: string): Promise<void> {
    await sql`DELETE FROM campaigns WHERE id = ${campaignId}`;
  }

  async sendCampaign(campaignId: string, input: SendCampaignInput, userId?: string): Promise<{ sent: number; failed: number }> {
    const campaign = await this.getCampaignById(campaignId);
    if (!campaign) throw new Error('Campaign not found');
    if (campaign.status === 'sent') throw new Error('Campaign already sent');

    // Get sender's email for Reply-To (so replies go to the client, not us)
    let replyToEmail: string | null = null;
    let senderName: string | null = null;
    if (userId) {
      const userResult = await sql<{ email: string; name: string }[]>`
        SELECT email, name FROM users WHERE id = ${userId}
      `;
      if (userResult.length > 0) {
        replyToEmail = userResult[0].email;
        senderName = userResult[0].name;
      }
    }

    // Get contacts to send to
    let contacts: Contact[];

    if (input.send_to_all) {
      contacts = await sql<Contact[]>`
        SELECT * FROM contacts WHERE workspace_id = ${campaign.workspace_id}
      `;
    } else if (input.tags && input.tags.length > 0) {
      contacts = await sql<Contact[]>`
        SELECT * FROM contacts WHERE workspace_id = ${campaign.workspace_id} AND tags && ${input.tags}
      `;
    } else if (input.contact_ids && input.contact_ids.length > 0) {
      contacts = await sql<Contact[]>`
        SELECT * FROM contacts WHERE id = ANY(${input.contact_ids})
      `;
    } else {
      throw new Error('No recipients specified');
    }

    if (contacts.length === 0) {
      throw new Error('No contacts found');
    }

    // Get the from email (custom domain or default)
    const fromEmail = await this.getFromEmail(campaign.workspace_id, senderName || undefined);

    // Update campaign status
    await sql`
      UPDATE campaigns SET status = 'sending', total_recipients = ${contacts.length}, updated_at = NOW()
      WHERE id = ${campaignId}
    `;

    let sent = 0;
    let failed = 0;

    // Send to each contact
    for (const contact of contacts) {
      try {
        const sendId = generateUUID();
        // Create campaign_send record
        const insertResult = await sql`
          INSERT INTO campaign_sends (id, campaign_id, contact_id, status)
          VALUES (${sendId}, ${campaignId}, ${contact.id}, 'pending')
          ON CONFLICT (campaign_id, contact_id) DO NOTHING
          RETURNING id
        `;

        if (insertResult.length === 0) continue; // Already sent

        // Personalize content
        const personalizedHtml = campaign.html_content
          .replace(/\{\{name\}\}/g, contact.name || 'there')
          .replace(/\{\{email\}\}/g, contact.email);

        // Send via Resend
        // From: custom domain if verified, or default with sender name
        // Reply-To: client's email (so responses go to them if using default domain)
        const result = await resend.emails.send({
          from: fromEmail,
          to: contact.email,
          subject: campaign.subject,
          html: personalizedHtml,
          replyTo: replyToEmail || undefined,
        });

        // Update send record
        await sql`
          UPDATE campaign_sends
          SET status = 'sent', resend_id = ${result.data?.id || null}, sent_at = NOW()
          WHERE id = ${sendId}
        `;

        sent++;
      } catch (error) {
        failed++;
        console.error(`Failed to send to ${contact.email}:`, error);

        await sql`
          UPDATE campaign_sends
          SET status = 'failed', error_message = ${String(error)}
          WHERE campaign_id = ${campaignId} AND contact_id = ${contact.id}
        `;
      }
    }

    // Update campaign as sent
    await sql`
      UPDATE campaigns
      SET status = 'sent', sent_count = ${sent}, sent_at = NOW(), updated_at = NOW()
      WHERE id = ${campaignId}
    `;

    return { sent, failed };
  }

  // ==================== WEBHOOK (for tracking) ====================

  async handleResendWebhook(event: {
    type: string;
    data: { email_id: string; to: string };
  }): Promise<void> {
    const { type, data } = event;

    // Find the campaign_send by resend_id
    const result = await sql<{ id: string; campaign_id: string }[]>`
      SELECT id, campaign_id FROM campaign_sends WHERE resend_id = ${data.email_id}
    `;

    if (result.length === 0) return;

    const sendId = result[0].id;
    const campaignId = result[0].campaign_id;

    if (type === 'email.opened') {
      await sql`
        UPDATE campaign_sends SET status = 'opened', opened_at = NOW() WHERE id = ${sendId}
      `;
      await sql`
        UPDATE campaigns SET opened_count = opened_count + 1 WHERE id = ${campaignId}
      `;
    } else if (type === 'email.clicked') {
      await sql`
        UPDATE campaign_sends SET status = 'clicked', clicked_at = NOW() WHERE id = ${sendId}
      `;
      await sql`
        UPDATE campaigns SET clicked_count = clicked_count + 1 WHERE id = ${campaignId}
      `;
    } else if (type === 'email.bounced') {
      await sql`
        UPDATE campaign_sends SET status = 'bounced', bounced_at = NOW() WHERE id = ${sendId}
      `;
    }
  }

  // ==================== CUSTOM DOMAINS ====================

  async getDomain(workspaceId: string): Promise<WorkspaceDomain | null> {
    const domains = await sql<WorkspaceDomain[]>`
      SELECT * FROM workspace_domains WHERE workspace_id = ${workspaceId}
    `;
    return domains[0] || null;
  }

  async createDomain(workspaceId: string, input: CreateDomainInput): Promise<WorkspaceDomain> {
    // Check if domain already exists
    const existing = await this.getDomain(workspaceId);
    if (existing) {
      throw new Error('A domain is already configured for this workspace');
    }

    const id = generateUUID();
    const { domain, from_email, from_name } = input;

    try {
      // Create domain in Resend
      const resendDomain = await resend.domains.create({ name: domain });

      if (!resendDomain.data) {
        throw new Error('Failed to create domain in Resend');
      }

      // Extract DNS records from Resend response
      const dnsRecords: DnsRecord[] = resendDomain.data.records?.map((r: { type: string; name: string; value: string; priority?: number; status?: string }) => ({
        type: r.type,
        name: r.name,
        value: r.value,
        priority: r.priority,
        status: r.status,
      })) || [];

      // Save to database
      const domains = await sql<WorkspaceDomain[]>`
        INSERT INTO workspace_domains (id, workspace_id, domain, resend_domain_id, from_email, from_name, status, dns_records)
        VALUES (${id}, ${workspaceId}, ${domain}, ${resendDomain.data.id}, ${from_email || `newsletter@${domain}`}, ${from_name || null}, 'pending', ${JSON.stringify(dnsRecords)})
        RETURNING *
      `;

      return domains[0];
    } catch (error) {
      console.error('Failed to create domain:', error);
      throw new Error(`Failed to create domain: ${error}`);
    }
  }

  async verifyDomain(workspaceId: string): Promise<WorkspaceDomain> {
    const domain = await this.getDomain(workspaceId);
    if (!domain) {
      throw new Error('No domain configured for this workspace');
    }

    if (!domain.resend_domain_id) {
      throw new Error('Domain not properly configured in Resend');
    }

    try {
      // Verify domain in Resend
      const verification = await resend.domains.verify(domain.resend_domain_id);

      if (!verification.data) {
        throw new Error('Failed to verify domain');
      }

      // Check verification status
      // @ts-ignore - Resend SDK type mismatch
      const isVerified = verification.data.status === 'verified';

      // Update DNS records status
      // @ts-ignore - Resend SDK type mismatch
      const dnsRecords: DnsRecord[] = verification.data.records?.map((r: { type: string; name: string; value: string; priority?: number; status?: string }) => ({
        type: r.type,
        name: r.name,
        value: r.value,
        priority: r.priority,
        status: r.status,
      })) || domain.dns_records;

      // Update database
      const domains = await sql<WorkspaceDomain[]>`
        UPDATE workspace_domains SET
          status = ${isVerified ? 'verified' : 'pending'},
          dns_records = ${JSON.stringify(dnsRecords)},
          verified_at = ${isVerified ? new Date() : null},
          updated_at = NOW()
        WHERE workspace_id = ${workspaceId}
        RETURNING *
      `;

      return domains[0];
    } catch (error) {
      console.error('Failed to verify domain:', error);
      throw new Error(`Failed to verify domain: ${error}`);
    }
  }

  async deleteDomain(workspaceId: string): Promise<void> {
    const domain = await this.getDomain(workspaceId);
    if (!domain) return;

    // Delete from Resend if we have the ID
    if (domain.resend_domain_id) {
      try {
        await resend.domains.remove(domain.resend_domain_id);
      } catch (error) {
        console.error('Failed to delete domain from Resend:', error);
        // Continue anyway - we'll clean up our database
      }
    }

    await sql`DELETE FROM workspace_domains WHERE workspace_id = ${workspaceId}`;
  }

  // Get the from email for a workspace (custom domain or default)
  async getFromEmail(workspaceId: string, senderName?: string): Promise<string> {
    const domain = await this.getDomain(workspaceId);

    if (domain && domain.status === 'verified' && domain.from_email) {
      const name = domain.from_name || senderName || 'Newsletter';
      return `${name} <${domain.from_email}>`;
    }

    // Fallback to default
    if (senderName) {
      const emailPart = FROM_EMAIL.match(/<(.+)>/)?.[1] || FROM_EMAIL;
      return `${senderName} <${emailPart}>`;
    }

    return FROM_EMAIL;
  }
}

export const campaignsService = new CampaignsService();
