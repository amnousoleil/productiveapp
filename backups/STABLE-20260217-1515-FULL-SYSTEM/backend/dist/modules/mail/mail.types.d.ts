import { z } from 'zod';
export declare const SendMailSchema: z.ZodObject<{
    to: z.ZodArray<z.ZodString, "many">;
    cc: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    bcc: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    fromName: z.ZodOptional<z.ZodString>;
    subject: z.ZodString;
    body: z.ZodString;
    isHtml: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    attachments: z.ZodOptional<z.ZodArray<z.ZodObject<{
        filename: z.ZodString;
        content: z.ZodString;
        contentType: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        filename: string;
        content: string;
        contentType: string;
    }, {
        filename: string;
        content: string;
        contentType: string;
    }>, "many">>;
    templateId: z.ZodOptional<z.ZodString>;
    context: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    body: string;
    subject: string;
    to: string[];
    isHtml: boolean;
    attachments?: {
        filename: string;
        content: string;
        contentType: string;
    }[] | undefined;
    bcc?: string[] | undefined;
    cc?: string[] | undefined;
    fromName?: string | undefined;
    templateId?: string | undefined;
    context?: Record<string, any> | undefined;
}, {
    body: string;
    subject: string;
    to: string[];
    attachments?: {
        filename: string;
        content: string;
        contentType: string;
    }[] | undefined;
    bcc?: string[] | undefined;
    cc?: string[] | undefined;
    fromName?: string | undefined;
    isHtml?: boolean | undefined;
    templateId?: string | undefined;
    context?: Record<string, any> | undefined;
}>;
export declare const SaveDraftSchema: z.ZodObject<{
    to: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    cc: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    bcc: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    subject: z.ZodOptional<z.ZodString>;
    body: z.ZodOptional<z.ZodString>;
    isHtml: z.ZodOptional<z.ZodBoolean>;
    attachments: z.ZodOptional<z.ZodArray<z.ZodObject<{
        filename: z.ZodString;
        content: z.ZodString;
        contentType: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        filename: string;
        content: string;
        contentType: string;
    }, {
        filename: string;
        content: string;
        contentType: string;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    body?: string | undefined;
    subject?: string | undefined;
    attachments?: {
        filename: string;
        content: string;
        contentType: string;
    }[] | undefined;
    bcc?: string[] | undefined;
    cc?: string[] | undefined;
    to?: string[] | undefined;
    isHtml?: boolean | undefined;
}, {
    body?: string | undefined;
    subject?: string | undefined;
    attachments?: {
        filename: string;
        content: string;
        contentType: string;
    }[] | undefined;
    bcc?: string[] | undefined;
    cc?: string[] | undefined;
    to?: string[] | undefined;
    isHtml?: boolean | undefined;
}>;
export declare const CreateTemplateSchema: z.ZodObject<{
    name: z.ZodString;
    subject: z.ZodString;
    body: z.ZodString;
    isHtml: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    category: z.ZodOptional<z.ZodString>;
    variables: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    name: string;
    body: string;
    subject: string;
    isHtml: boolean;
    category?: string | undefined;
    variables?: string[] | undefined;
}, {
    name: string;
    body: string;
    subject: string;
    isHtml?: boolean | undefined;
    category?: string | undefined;
    variables?: string[] | undefined;
}>;
export type SendMailInput = z.infer<typeof SendMailSchema>;
export type SaveDraftInput = z.infer<typeof SaveDraftSchema>;
export type CreateTemplateInput = z.infer<typeof CreateTemplateSchema>;
export interface MailAttachment {
    filename: string;
    content: string;
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
//# sourceMappingURL=mail.types.d.ts.map