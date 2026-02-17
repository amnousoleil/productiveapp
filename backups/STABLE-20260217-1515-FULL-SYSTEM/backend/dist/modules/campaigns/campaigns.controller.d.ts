import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../../types/index.js';
export declare class CampaignsController {
    listContacts(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getContact(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    createContact(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    updateContact(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    deleteContact(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    importContacts(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getTags(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    listTemplates(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getTemplate(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    createTemplate(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    updateTemplate(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    deleteTemplate(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    listCampaigns(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getCampaign(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    createCampaign(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    updateCampaign(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    deleteCampaign(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    sendCampaign(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    handleWebhook(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getDomain(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    createDomain(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    verifyDomain(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    deleteDomain(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
}
export declare const campaignsController: CampaignsController;
//# sourceMappingURL=campaigns.controller.d.ts.map