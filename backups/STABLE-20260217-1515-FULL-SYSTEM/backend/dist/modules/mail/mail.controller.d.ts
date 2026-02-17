import type { Response } from 'express';
import type { AuthenticatedRequest } from '../../types/index.js';
export declare const MailController: {
    /**
     * POST /api/v1/mail/config/check
     * Vérifie la configuration Resend
     */
    checkConfig(_req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * POST /api/v1/mail/send
     * Envoie un email
     */
    send(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * GET /api/v1/mail/sent
     * Liste des emails envoyés
     */
    getSentMails(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * GET /api/v1/mail/sent/:id
     * Détails d'un email
     */
    getMailById(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * POST /api/v1/mail/drafts
     * Sauvegarde un brouillon
     */
    saveDraft(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * GET /api/v1/mail/drafts
     * Liste des brouillons
     */
    getDrafts(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * DELETE /api/v1/mail/drafts/:id
     * Supprime un brouillon
     */
    deleteDraft(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * POST /api/v1/mail/templates
     * Crée un template
     */
    createTemplate(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * GET /api/v1/mail/templates
     * Liste des templates
     */
    getTemplates(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * GET /api/v1/mail/templates/:id
     * Détails d'un template
     */
    getTemplateById(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * PUT /api/v1/mail/templates/:id
     * Met à jour un template
     */
    updateTemplate(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * DELETE /api/v1/mail/templates/:id
     * Supprime un template
     */
    deleteTemplate(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    /**
     * GET /api/v1/mail/stats
     * Statistiques d'emailing
     */
    getStats(req: AuthenticatedRequest, res: Response): Promise<Response<any, Record<string, any>>>;
};
export default MailController;
//# sourceMappingURL=mail.controller.d.ts.map