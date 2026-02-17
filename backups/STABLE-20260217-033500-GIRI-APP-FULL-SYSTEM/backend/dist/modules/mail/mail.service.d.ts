import type { SendMailInput, SaveDraftInput, CreateTemplateInput, MailStats } from './mail.types.js';
export declare const MailService: {
    /**
     * Vérifie la configuration Resend
     */
    checkConfig(): Promise<{
        ok: boolean;
        error?: string;
    }>;
    /**
     * Envoie un email via Resend
     */
    send(userId: string, workspaceId: string | null, input: SendMailInput): Promise<{
        success: boolean;
        id?: string;
        error?: string;
    }>;
    /**
     * Récupère les emails envoyés
     */
    getSentMails(userId: string, workspaceId: string | null, limit?: number, offset?: number): Promise<any[]>;
    /**
     * Récupère un email par ID
     */
    getMailById(mailId: string, userId: string): Promise<any>;
    /**
     * Sauvegarde un brouillon
     */
    saveDraft(userId: string, workspaceId: string | null, input: SaveDraftInput, draftId?: string): Promise<any>;
    /**
     * Récupère les brouillons
     */
    getDrafts(userId: string, workspaceId: string | null): Promise<any[]>;
    /**
     * Supprime un brouillon
     */
    deleteDraft(draftId: string, userId: string): Promise<boolean>;
    /**
     * Crée un template
     */
    createTemplate(userId: string, input: CreateTemplateInput): Promise<any>;
    /**
     * Récupère les templates
     */
    getTemplates(userId: string): Promise<any[]>;
    /**
     * Récupère un template par ID
     */
    getTemplateById(templateId: string, userId: string): Promise<any>;
    /**
     * Met à jour un template
     */
    updateTemplate(templateId: string, userId: string, input: Partial<CreateTemplateInput>): Promise<any>;
    /**
     * Supprime un template
     */
    deleteTemplate(templateId: string, userId: string): Promise<boolean>;
    /**
     * Incrémente le compteur d'usage d'un template
     */
    incrementTemplateUsage(templateId: string): Promise<void>;
    /**
     * Statistiques d'emailing
     */
    getStats(userId: string, workspaceId: string | null): Promise<MailStats>;
};
export default MailService;
//# sourceMappingURL=mail.service.d.ts.map