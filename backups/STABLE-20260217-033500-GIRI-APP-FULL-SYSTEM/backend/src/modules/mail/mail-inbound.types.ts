// =============================================
// MAIL PRO V2 - Types pour emails entrants
// =============================================

export interface ResendWebhookPayload {
  type: 'email.received' | 'email.sent' | 'email.delivered' | 'email.opened' | 'email.clicked' | 'email.bounced';
  created_at: string;
  data: {
    email_id: string;
    from: string;
    to: string[];
    subject: string;
    created_at: string;
    html?: string;
    text?: string;
  };
}

export interface ResendEmailDetails {
  id: string;
  object: string;
  from: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  reply_to?: string;
  subject: string;
  html?: string;
  text?: string;
  created_at: string;
  headers?: Record<string, string>;
}

export interface InboundEmail {
  resend_email_id: string;
  from_address: string;
  from_name?: string;
  to_addresses: string[];
  cc_addresses?: string[];
  bcc_addresses?: string[];
  reply_to?: string;
  subject: string;
  body_text?: string;
  body_html?: string;
  is_html: boolean;
  thread_id?: string;
  in_reply_to?: string;
  message_id?: string;
  email_references?: string;
  has_attachments: boolean;
  attachments_meta?: any[];
  received_at: Date;
}

export interface EmailFilters {
  user_id?: string;
  direction?: 'inbound' | 'outbound';
  folder?: string;
  is_read?: boolean;
  is_starred?: boolean;
  is_deleted?: boolean;
  search?: string;
  label?: string;
  limit?: number;
  offset?: number;
}

export interface EmailStats {
  total_sent: number;
  total_received: number;
  unread_count: number;
  starred_count: number;
  last_email_at?: Date;
}
