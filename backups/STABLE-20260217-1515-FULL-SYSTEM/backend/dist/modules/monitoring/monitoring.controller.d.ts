/**
 * MONITORING CONTROLLER - Simplified
 */
import { Request, Response } from 'express';
export declare class MonitoringController {
    logError(req: Request, res: Response): Promise<void>;
    getErrors(req: Request, res: Response): Promise<void>;
    getErrorById(_req: Request, res: Response): Promise<void>;
    resolveError(req: Request, res: Response): Promise<void>;
    getStats(_req: Request, res: Response): Promise<void>;
    exportCSV(_req: Request, res: Response): Promise<void>;
}
export declare const monitoringController: MonitoringController;
//# sourceMappingURL=monitoring.controller.d.ts.map