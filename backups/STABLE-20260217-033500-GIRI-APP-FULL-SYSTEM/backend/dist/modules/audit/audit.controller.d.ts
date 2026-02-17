import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../../types/index.js';
export declare class AuditController {
    createJournalEntry(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getJournalEntry(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    listJournalEntries(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    updateJournalEntry(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    deleteJournalEntry(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getJournalStats(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    createHumanDesign(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getHumanDesign(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    updateHumanDesign(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    generateReport(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    getReport(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    listReports(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    deleteReport(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    listPsychoAudits(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    createPsychoAudit(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
}
export declare const auditController: AuditController;
//# sourceMappingURL=audit.controller.d.ts.map