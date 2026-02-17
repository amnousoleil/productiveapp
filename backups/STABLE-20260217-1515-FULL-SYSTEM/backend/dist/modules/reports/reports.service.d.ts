import type { UUID } from '../../types/index.js';
import type { Report, ReportSummary, PeriodType, GenerateReportInput, ReportListParams } from './reports.types.js';
export declare class ReportsService {
    /**
     * Get reports list for a workspace
     */
    getReports(workspaceId: UUID, userId: UUID | null, params: ReportListParams): Promise<{
        reports: Report[];
        total: number;
    }>;
    /**
     * Get a single report by ID
     */
    getReportById(reportId: UUID, workspaceId: UUID): Promise<Report | null>;
    /**
     * Get quick summary for current period
     */
    getSummary(workspaceId: UUID, userId: UUID, period: PeriodType): Promise<ReportSummary>;
    /**
     * Generate a new report
     */
    generateReport(workspaceId: UUID, userId: UUID, input: GenerateReportInput): Promise<Report>;
    /**
     * Aggregate all metrics for a period
     */
    private aggregateMetrics;
    /**
     * Calculate productivity score (0-100)
     */
    private calculateScore;
    /**
     * Get start/end dates for a period type
     */
    private getPeriodDates;
}
export declare const reportsService: ReportsService;
//# sourceMappingURL=reports.service.d.ts.map