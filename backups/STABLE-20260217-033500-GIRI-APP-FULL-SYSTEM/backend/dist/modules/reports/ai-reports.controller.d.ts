/**
 * AI Reports Controller
 */
import type { Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../../types/index.js';
export declare class AIReportsController {
    /**
     * Generate a new AI report
     */
    generate(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get list of AI reports
     */
    list(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get a single report by ID
     */
    getById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Generate meta-synthesis
     */
    metaSynthesis(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    /**
     * Get visualization data for charts
     */
    visualizations(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
}
export declare const aiReportsController: AIReportsController;
//# sourceMappingURL=ai-reports.controller.d.ts.map