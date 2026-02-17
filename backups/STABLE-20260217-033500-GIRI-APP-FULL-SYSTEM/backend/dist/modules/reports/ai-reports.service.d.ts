/**
 * AI Reports Service
 * Generates intelligent reports with AI analysis
 */
import type { UUID } from '../../types/index.js';
import type { AIReport, GenerateAIReportInput, MetaSynthesisInput, AIReportListParams, AIReportVisualization, PeriodType } from './reports.types.js';
export declare class AIReportsService {
    /**
     * Generate an AI-powered report
     */
    generateReport(workspaceId: UUID, userId: UUID, input: GenerateAIReportInput): Promise<AIReport>;
    /**
     * Get list of AI reports
     */
    getReports(workspaceId: UUID, userId: UUID, params: AIReportListParams): Promise<{
        reports: AIReport[];
        total: number;
    }>;
    /**
     * Get a single report by ID
     */
    getReportById(reportId: UUID, workspaceId: UUID): Promise<AIReport | null>;
    /**
     * Generate meta-synthesis (analysis of multiple reports)
     */
    generateMetaSynthesis(workspaceId: UUID, userId: UUID, input: MetaSynthesisInput): Promise<AIReport>;
    /**
     * Get visualization data for charts
     */
    getVisualizationData(workspaceId: UUID, userId: UUID, periodType: PeriodType): Promise<AIReportVisualization>;
    private calculateMetrics;
    private buildAIContext;
    private buildPrompt;
    private getSystemPrompt;
    private getMetaSynthesisSystemPrompt;
    private buildSynthesisContext;
    private buildMetaSynthesisPrompt;
    private parseAIResponse;
    private calculateAIScore;
    private calculateEvolutionScore;
    private generateTitle;
    private getPeriodDates;
    private formatChartData;
    private formatLineChartData;
}
export declare const aiReportsService: AIReportsService;
//# sourceMappingURL=ai-reports.service.d.ts.map