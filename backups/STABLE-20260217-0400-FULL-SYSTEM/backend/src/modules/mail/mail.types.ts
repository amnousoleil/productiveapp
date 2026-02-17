// =============================================
// MAIL TYPES
// Types et interfaces pour le module mail
// =============================================

import { z } from 'zod';

// ===== SCHEMAS DE VALIDATION =====

export const SendMailSchema = z.object({
  to: z.array(z.string().email()).min(1, 'Au moins un destinataire requis'),
  cc: z.array(z.string().email()).optional(),
  bcc: z.array(z.string().email()).optional(),
  fromName: z.string().max(100).optional(), // Nom d'expéditeur personnalisé
  subject: z.string().min(1, 'Sujet requis').max(200),
  body: z.string().min(1, 'Corps du message requis'),
  isHtml: z.boolean().optional().default(true),
  attachments: z.array(z.object({
    filename: z.string(),
    content: z.string(), // base64
    contentType: z.string()
  })).optional(),
  templateId: z.string().optional(),
  context: z.record(z.any()).optional() // Variables pour template
});

export const SaveDraftSchema = z.object({
  to: z.array(z.string().email()).optional(),
  cc: z.array(z.string().email()).optional(),
  bcc: z.array(z.string().email()).optional(),
  subject: z.string().optional(),
  body: z.string().optional(),
  isHtml: z.boolean().optional(),
  attachments: z.array(z.object({
    filename: z.string(),
    content: z.string(),
    contentType: z.string()
  })).optional()
});

export const CreateTemplateSchema = z.object({
  name: z.string().min(1).max(100),
  subject: z.string().min(1).max(200),
  body: z.string().min(1),
  isHtml: z.boolean().optional().default(true),
  category: z.string().optional(),
  variables: z.array(z.string()).optional() // Liste des variables {{var}}
});

// ===== TYPES TYPESCRIPT =====

export type SendMailInput = z.infer<typeof SendMailSchema>;
export type SaveDraftInput = z.infer<typeof SaveDraftSchema>;
export type CreateTemplateInput = z.infer<typeof CreateTemplateSchema>;

export interface MailAttachment {
  filename: string;
  content: string; // base64
  contentType: string;
}

export interface MailTemplate {
  id: string;
  user_id: string;
  name: string;
  subject: string;
  body: string;
  is_html: boolean;
  category: string | null;
  variables: string[];
  usage_count: number;
  created_at: Date;
  updated_at: Date;
}

export interface SentMail {
  id: string;
  user_id: string;
  workspace_id: string | null;
  to_addresses: string[];
  cc_addresses: string[] | null;
  bcc_addresses: string[] | null;
  subject: string;
  body: string;
  is_html: boolean;
  resend_id: string | null;
  status: 'sent' | 'failed' | 'pending';
  error_message: string | null;
  opened_at: Date | null;
  clicked_at: Date | null;
  sent_at: Date;
}

export interface Draft {
  id: string;
  user_id: string;
  workspace_id: string | null;
  to_addresses: string[] | null;
  cc_addresses: string[] | null;
  bcc_addresses: string[] | null;
  subject: string | null;
  body: string | null;
  is_html: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface MailStats {
  total_sent: number;
  total_opened: number;
  total_clicked: number;
  open_rate: number;
  click_rate: number;
  sent_today: number;
  sent_this_week: number;
  sent_this_month: number;
  recent_activity: Array<{
    date: string;
    count: number;
  }>;
}
