import { Request, Response } from 'express';
export declare class MailInboundController {
    /**
     * POST /api/v1/mail/inbound/webhook
     * Webhook Resend pour emails reçus
     */
    static handleWebhook(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * GET /api/v1/mail/inbox
     * Récupérer la boîte de réception
     */
    static getInbox(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * GET /api/v1/mail/inbox/:id
     * Détail d'un email
     */
    static getEmailDetail(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * PUT /api/v1/mail/:id/read
     * Marquer comme lu/non lu
     */
    static markAsRead(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * PUT /api/v1/mail/:id/star
     * Marquer comme favori
     */
    static markAsStarred(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * PUT /api/v1/mail/:id/folder
     * Déplacer dans un dossier
     */
    static moveToFolder(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * DELETE /api/v1/mail/:id
     * Supprimer un email (soft delete)
     */
    static deleteEmail(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * GET /api/v1/mail/stats
     * Statistiques utilisateur
     */
    static getStats(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=mail-inbound.controller.d.ts.map