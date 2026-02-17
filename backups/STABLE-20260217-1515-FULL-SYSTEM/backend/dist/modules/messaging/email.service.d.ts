/**
 * Email Service - TeamTalk Pro
 * Handles conversation exports via email
 */
export interface EmailExportOptions {
    conversationId: string;
    recipientEmail: string;
    exportedBy: string;
    messageCount?: number;
    exportType: 'summary' | 'full' | 'pdf';
}
/**
 * Export conversation summary via email (last 10 messages)
 */
export declare function emailConversationSummary(conversationId: string, recipientEmail: string, exportedBy: string): Promise<void>;
/**
 * Email full conversation (all messages)
 */
export declare function emailFullConversation(conversationId: string, recipientEmail: string, exportedBy: string): Promise<void>;
/**
 * Get export history for conversation
 */
export declare function getExportHistory(conversationId: string): Promise<any[]>;
//# sourceMappingURL=email.service.d.ts.map