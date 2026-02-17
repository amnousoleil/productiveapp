import type { ResendWebhookPayload, EmailFilters, EmailStats } from './mail-inbound.types';
export declare class MailInboundService {
    /**
     * Vérifier la signature du webhook Resend pour sécurité
     */
    static verifyWebhookSignature(payload: string, signature: string, secret: string): boolean;
    /**
     * Traiter un email reçu depuis le webhook Resend
     */
    static processInboundEmail(webhookData: ResendWebhookPayload): Promise<void>;
    /**
     * Récupérer les détails complets d'un email depuis l'API Resend
     */
    private static fetchEmailDetails;
    /**
     * Trouver l'utilisateur par son adresse email @giri-app.com
     */
    private static findUserByEmailAddress;
    /**
     * Parser les détails de l'email en format InboundEmail
     */
    private static parseInboundEmail;
    /**
     * Générer un thread_id pour regrouper les conversations
     */
    private static generateThreadId;
    /**
     * Stocker l'email en DB
     */
    private static storeInboundEmail;
    /**
     * Récupérer la boîte de réception d'un utilisateur
     */
    static getInbox(filters: EmailFilters): Promise<any[]>;
    /**
     * Marquer un email comme lu/non lu
     */
    static markAsRead(emailId: string, userId: string, isRead: boolean): Promise<void>;
    /**
     * Marquer un email comme favori
     */
    static markAsStarred(emailId: string, userId: string, isStarred: boolean): Promise<void>;
    /**
     * Déplacer un email dans un dossier
     */
    static moveToFolder(emailId: string, userId: string, folder: string): Promise<void>;
    /**
     * Supprimer un email (soft delete)
     */
    static deleteEmail(emailId: string, userId: string): Promise<void>;
    /**
     * Récupérer les stats d'un utilisateur
     */
    static getUserStats(userId: string): Promise<EmailStats>;
}
//# sourceMappingURL=mail-inbound.service.d.ts.map