"use strict";
// =============================================
// CAMPAIGNS MODULE - Service Layer
// =============================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.campaignsService = void 0;
const database_js_1 = require("../../config/database.js");
const resend_1 = require("resend");
const helpers_js_1 = require("../../utils/helpers.js");
// Initialize Resend
const resend = new resend_1.Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@example.com';
class CampaignsService {
    // ==================== CONTACTS ====================
    async listContacts(workspaceId, params) {
        const { page = 1, limit = 50, q, tags } = params;
        const offset = (page - 1) * limit;
        let contacts;
        let countResult;
        if (q && tags && tags.length > 0) {
            const searchPattern = `%${q}%`;
            contacts = await (0, database_js_1.sql) `
        SELECT * FROM contacts
        WHERE workspace_id = ${workspaceId}
          AND (email ILIKE ${searchPattern} OR name ILIKE ${searchPattern})
          AND tags && ${tags}
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
            countResult = await (0, database_js_1.sql) `
        SELECT COUNT(*)::text as count FROM contacts
        WHERE workspace_id = ${workspaceId}
          AND (email ILIKE ${searchPattern} OR name ILIKE ${searchPattern})
          AND tags && ${tags}
      `;
        }
        else if (q) {
            const searchPattern = `%${q}%`;
            contacts = await (0, database_js_1.sql) `
        SELECT * FROM contacts
        WHERE workspace_id = ${workspaceId}
          AND (email ILIKE ${searchPattern} OR name ILIKE ${searchPattern})
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
            countResult = await (0, database_js_1.sql) `
        SELECT COUNT(*)::text as count FROM contacts
        WHERE workspace_id = ${workspaceId}
          AND (email ILIKE ${searchPattern} OR name ILIKE ${searchPattern})
      `;
        }
        else if (tags && tags.length > 0) {
            contacts = await (0, database_js_1.sql) `
        SELECT * FROM contacts
        WHERE workspace_id = ${workspaceId}
          AND tags && ${tags}
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
            countResult = await (0, database_js_1.sql) `
        SELECT COUNT(*)::text as count FROM contacts
        WHERE workspace_id = ${workspaceId}
          AND tags && ${tags}
      `;
        }
        else {
            contacts = await (0, database_js_1.sql) `
        SELECT * FROM contacts
        WHERE workspace_id = ${workspaceId}
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
            countResult = await (0, database_js_1.sql) `
        SELECT COUNT(*)::text as count FROM contacts
        WHERE workspace_id = ${workspaceId}
      `;
        }
        return {
            contacts,
            total: parseInt(countResult[0]?.count || '0', 10),
        };
    }
    async getContactById(contactId) {
        const contacts = await (0, database_js_1.sql) `
      SELECT * FROM contacts WHERE id = ${contactId}
    `;
        return contacts[0] || null;
    }
    async createContact(workspaceId, input) {
        const id = (0, helpers_js_1.generateUUID)();
        const { email, name, tags = [], notes } = input;
        const contacts = await (0, database_js_1.sql) `
      INSERT INTO contacts (id, workspace_id, email, name, tags, notes)
      VALUES (${id}, ${workspaceId}, ${email.toLowerCase()}, ${name || null}, ${tags}, ${notes || null})
      RETURNING *
    `;
        return contacts[0];
    }
    async updateContact(contactId, input) {
        // Build dynamic update
        const current = await this.getContactById(contactId);
        if (!current)
            throw new Error('Contact not found');
        const contacts = await (0, database_js_1.sql) `
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
    async deleteContact(contactId) {
        await (0, database_js_1.sql) `DELETE FROM contacts WHERE id = ${contactId}`;
    }
    async importContacts(workspaceId, contacts) {
        let imported = 0;
        let skipped = 0;
        const errors = [];
        for (const contact of contacts) {
            try {
                const id = (0, helpers_js_1.generateUUID)();
                const result = await (0, database_js_1.sql) `
          INSERT INTO contacts (id, workspace_id, email, name, tags)
          VALUES (${id}, ${workspaceId}, ${contact.email.toLowerCase()}, ${contact.name || null}, ${contact.tags || []})
          ON CONFLICT (workspace_id, email) DO NOTHING
          RETURNING id
        `;
                if (result.length > 0) {
                    imported++;
                }
                else {
                    skipped++;
                }
            }
            catch (error) {
                skipped++;
                errors.push(`Failed to import ${contact.email}: ${error}`);
            }
        }
        return { imported, skipped, errors };
    }
    async getAllTags(workspaceId) {
        const result = await (0, database_js_1.sql) `
      SELECT DISTINCT unnest(tags) as tag FROM contacts WHERE workspace_id = ${workspaceId} ORDER BY tag
    `;
        return result.map((r) => r.tag);
    }
    // ==================== TEMPLATES ====================
    async listTemplates(workspaceId) {
        return (0, database_js_1.sql) `
      SELECT * FROM email_templates WHERE workspace_id = ${workspaceId} ORDER BY created_at DESC
    `;
    }
    async getTemplateById(templateId) {
        const templates = await (0, database_js_1.sql) `
      SELECT * FROM email_templates WHERE id = ${templateId}
    `;
        return templates[0] || null;
    }
    async createTemplate(workspaceId, userId, input) {
        const id = (0, helpers_js_1.generateUUID)();
        const { name, subject, html_content } = input;
        const templates = await (0, database_js_1.sql) `
      INSERT INTO email_templates (id, workspace_id, created_by, name, subject, html_content)
      VALUES (${id}, ${workspaceId}, ${userId}, ${name}, ${subject}, ${html_content})
      RETURNING *
    `;
        return templates[0];
    }
    async updateTemplate(templateId, input) {
        const current = await this.getTemplateById(templateId);
        if (!current)
            throw new Error('Template not found');
        const templates = await (0, database_js_1.sql) `
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
    async deleteTemplate(templateId) {
        await (0, database_js_1.sql) `DELETE FROM email_templates WHERE id = ${templateId}`;
    }
    // ==================== CAMPAIGNS ====================
    async listCampaigns(workspaceId, params) {
        const { page = 1, limit = 20, status } = params;
        const offset = (page - 1) * limit;
        let campaigns;
        let countResult;
        if (status) {
            campaigns = await (0, database_js_1.sql) `
        SELECT * FROM campaigns
        WHERE workspace_id = ${workspaceId} AND status = ${status}
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
            countResult = await (0, database_js_1.sql) `
        SELECT COUNT(*)::text as count FROM campaigns
        WHERE workspace_id = ${workspaceId} AND status = ${status}
      `;
        }
        else {
            campaigns = await (0, database_js_1.sql) `
        SELECT * FROM campaigns
        WHERE workspace_id = ${workspaceId}
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
            countResult = await (0, database_js_1.sql) `
        SELECT COUNT(*)::text as count FROM campaigns
        WHERE workspace_id = ${workspaceId}
      `;
        }
        return {
            campaigns,
            total: parseInt(countResult[0]?.count || '0', 10),
        };
    }
    async getCampaignById(campaignId) {
        const campaigns = await (0, database_js_1.sql) `
      SELECT * FROM campaigns WHERE id = ${campaignId}
    `;
        return campaigns[0] || null;
    }
    async getCampaignWithStats(campaignId) {
        const campaign = await this.getCampaignById(campaignId);
        if (!campaign)
            return null;
        const statsResult = await (0, database_js_1.sql) `
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
    async createCampaign(workspaceId, userId, input) {
        const id = (0, helpers_js_1.generateUUID)();
        const { name, subject, html_content, scheduled_at } = input;
        const campaigns = await (0, database_js_1.sql) `
      INSERT INTO campaigns (id, workspace_id, created_by, name, subject, html_content, scheduled_at)
      VALUES (${id}, ${workspaceId}, ${userId}, ${name}, ${subject}, ${html_content}, ${scheduled_at || null})
      RETURNING *
    `;
        return campaigns[0];
    }
    async updateCampaign(campaignId, input) {
        const current = await this.getCampaignById(campaignId);
        if (!current)
            throw new Error('Campaign not found');
        const campaigns = await (0, database_js_1.sql) `
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
    async deleteCampaign(campaignId) {
        await (0, database_js_1.sql) `DELETE FROM campaigns WHERE id = ${campaignId}`;
    }
    async sendCampaign(campaignId, input, userId) {
        const campaign = await this.getCampaignById(campaignId);
        if (!campaign)
            throw new Error('Campaign not found');
        if (campaign.status === 'sent')
            throw new Error('Campaign already sent');
        // Get sender's email for Reply-To (so replies go to the client, not us)
        let replyToEmail = null;
        let senderName = null;
        if (userId) {
            const userResult = await (0, database_js_1.sql) `
        SELECT email, name FROM users WHERE id = ${userId}
      `;
            if (userResult.length > 0) {
                replyToEmail = userResult[0].email;
                senderName = userResult[0].name;
            }
        }
        // Get contacts to send to
        let contacts;
        if (input.send_to_all) {
            contacts = await (0, database_js_1.sql) `
        SELECT * FROM contacts WHERE workspace_id = ${campaign.workspace_id}
      `;
        }
        else if (input.tags && input.tags.length > 0) {
            contacts = await (0, database_js_1.sql) `
        SELECT * FROM contacts WHERE workspace_id = ${campaign.workspace_id} AND tags && ${input.tags}
      `;
        }
        else if (input.contact_ids && input.contact_ids.length > 0) {
            contacts = await (0, database_js_1.sql) `
        SELECT * FROM contacts WHERE id = ANY(${input.contact_ids})
      `;
        }
        else {
            throw new Error('No recipients specified');
        }
        if (contacts.length === 0) {
            throw new Error('No contacts found');
        }
        // Get the from email (custom domain or default)
        const fromEmail = await this.getFromEmail(campaign.workspace_id, senderName || undefined);
        // Update campaign status
        await (0, database_js_1.sql) `
      UPDATE campaigns SET status = 'sending', total_recipients = ${contacts.length}, updated_at = NOW()
      WHERE id = ${campaignId}
    `;
        let sent = 0;
        let failed = 0;
        // Send to each contact
        for (const contact of contacts) {
            try {
                const sendId = (0, helpers_js_1.generateUUID)();
                // Create campaign_send record
                const insertResult = await (0, database_js_1.sql) `
          INSERT INTO campaign_sends (id, campaign_id, contact_id, status)
          VALUES (${sendId}, ${campaignId}, ${contact.id}, 'pending')
          ON CONFLICT (campaign_id, contact_id) DO NOTHING
          RETURNING id
        `;
                if (insertResult.length === 0)
                    continue; // Already sent
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
                await (0, database_js_1.sql) `
          UPDATE campaign_sends
          SET status = 'sent', resend_id = ${result.data?.id || null}, sent_at = NOW()
          WHERE id = ${sendId}
        `;
                sent++;
            }
            catch (error) {
                failed++;
                console.error(`Failed to send to ${contact.email}:`, error);
                await (0, database_js_1.sql) `
          UPDATE campaign_sends
          SET status = 'failed', error_message = ${String(error)}
          WHERE campaign_id = ${campaignId} AND contact_id = ${contact.id}
        `;
            }
        }
        // Update campaign as sent
        await (0, database_js_1.sql) `
      UPDATE campaigns
      SET status = 'sent', sent_count = ${sent}, sent_at = NOW(), updated_at = NOW()
      WHERE id = ${campaignId}
    `;
        return { sent, failed };
    }
    // ==================== WEBHOOK (for tracking) ====================
    async handleResendWebhook(event) {
        const { type, data } = event;
        // Find the campaign_send by resend_id
        const result = await (0, database_js_1.sql) `
      SELECT id, campaign_id FROM campaign_sends WHERE resend_id = ${data.email_id}
    `;
        if (result.length === 0)
            return;
        const sendId = result[0].id;
        const campaignId = result[0].campaign_id;
        if (type === 'email.opened') {
            await (0, database_js_1.sql) `
        UPDATE campaign_sends SET status = 'opened', opened_at = NOW() WHERE id = ${sendId}
      `;
            await (0, database_js_1.sql) `
        UPDATE campaigns SET opened_count = opened_count + 1 WHERE id = ${campaignId}
      `;
        }
        else if (type === 'email.clicked') {
            await (0, database_js_1.sql) `
        UPDATE campaign_sends SET status = 'clicked', clicked_at = NOW() WHERE id = ${sendId}
      `;
            await (0, database_js_1.sql) `
        UPDATE campaigns SET clicked_count = clicked_count + 1 WHERE id = ${campaignId}
      `;
        }
        else if (type === 'email.bounced') {
            await (0, database_js_1.sql) `
        UPDATE campaign_sends SET status = 'bounced', bounced_at = NOW() WHERE id = ${sendId}
      `;
        }
    }
    // ==================== CUSTOM DOMAINS ====================
    async getDomain(workspaceId) {
        const domains = await (0, database_js_1.sql) `
      SELECT * FROM workspace_domains WHERE workspace_id = ${workspaceId}
    `;
        return domains[0] || null;
    }
    async createDomain(workspaceId, input) {
        // Check if domain already exists
        const existing = await this.getDomain(workspaceId);
        if (existing) {
            throw new Error('A domain is already configured for this workspace');
        }
        const id = (0, helpers_js_1.generateUUID)();
        const { domain, from_email, from_name } = input;
        try {
            // Create domain in Resend
            const resendDomain = await resend.domains.create({ name: domain });
            if (!resendDomain.data) {
                throw new Error('Failed to create domain in Resend');
            }
            // Extract DNS records from Resend response
            const dnsRecords = resendDomain.data.records?.map((r) => ({
                type: r.type,
                name: r.name,
                value: r.value,
                priority: r.priority,
                status: r.status,
            })) || [];
            // Save to database
            const domains = await (0, database_js_1.sql) `
        INSERT INTO workspace_domains (id, workspace_id, domain, resend_domain_id, from_email, from_name, status, dns_records)
        VALUES (${id}, ${workspaceId}, ${domain}, ${resendDomain.data.id}, ${from_email || `newsletter@${domain}`}, ${from_name || null}, 'pending', ${JSON.stringify(dnsRecords)})
        RETURNING *
      `;
            return domains[0];
        }
        catch (error) {
            console.error('Failed to create domain:', error);
            throw new Error(`Failed to create domain: ${error}`);
        }
    }
    async verifyDomain(workspaceId) {
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
            const dnsRecords = verification.data.records?.map((r) => ({
                type: r.type,
                name: r.name,
                value: r.value,
                priority: r.priority,
                status: r.status,
            })) || domain.dns_records;
            // Update database
            const domains = await (0, database_js_1.sql) `
        UPDATE workspace_domains SET
          status = ${isVerified ? 'verified' : 'pending'},
          dns_records = ${JSON.stringify(dnsRecords)},
          verified_at = ${isVerified ? new Date() : null},
          updated_at = NOW()
        WHERE workspace_id = ${workspaceId}
        RETURNING *
      `;
            return domains[0];
        }
        catch (error) {
            console.error('Failed to verify domain:', error);
            throw new Error(`Failed to verify domain: ${error}`);
        }
    }
    async deleteDomain(workspaceId) {
        const domain = await this.getDomain(workspaceId);
        if (!domain)
            return;
        // Delete from Resend if we have the ID
        if (domain.resend_domain_id) {
            try {
                await resend.domains.remove(domain.resend_domain_id);
            }
            catch (error) {
                console.error('Failed to delete domain from Resend:', error);
                // Continue anyway - we'll clean up our database
            }
        }
        await (0, database_js_1.sql) `DELETE FROM workspace_domains WHERE workspace_id = ${workspaceId}`;
    }
    // Get the from email for a workspace (custom domain or default)
    async getFromEmail(workspaceId, senderName) {
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
exports.campaignsService = new CampaignsService();
//# sourceMappingURL=campaigns.service.js.map