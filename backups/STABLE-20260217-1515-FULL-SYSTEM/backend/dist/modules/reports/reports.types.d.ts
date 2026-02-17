import type { UUID } from '../../types/index.js';
export type PeriodType = 'week' | 'month' | 'year';
export interface ReportMetrics {
    tasks: {
        created: number;
        completed: number;
        overdue: number;
        completion_rate: number;
    };
    projects: {
        total: number;
        active: number;
        completed: number;
        avg_progress: number;
    };
    productivity: {
        tasks_per_day: number;
        avg_completion_time_hours: number | null;
        most_productive_day: string | null;
        most_productive_hour: number | null;
    };
    gamification: {
        xp_earned: number;
        current_streak: number;
        achievements_unlocked: number;
        level: number;
    };
    score: number;
}
export interface Report {
    id: UUID;
    workspace_id: UUID;
    user_id: UUID | null;
    period_type: PeriodType;
    period_start: Date;
    period_end: Date;
    metrics: ReportMetrics;
    created_at: Date;
}
export interface ReportSummary {
    tasks_completed: number;
    completion_rate: number;
    score: number;
    streak: number;
    xp_earned: number;
    tasks_per_day: number;
}
export interface GenerateReportInput {
    period_type: PeriodType;
    period_start?: string;
    period_end?: string;
}
export interface ReportListParams {
    page?: number;
    limit?: number;
    period_type?: PeriodType;
    from?: string;
    to?: string;
}
export type AIReportType = 'standard' | 'audit' | 'meta_synthesis';
export interface AIReport {
    id: string;
    workspace_id: string;
    user_id: string;
    report_type: AIReportType;
    title: string;
    period_type: PeriodType | null;
    period_start: Date | null;
    period_end: Date | null;
    metrics: ReportMetrics | null;
    ai_analysis: string;
    ai_recommendations: string[];
    ai_score: number;
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
    pdf_url: string | null;
    pdf_generated_at: Date | null;
    created_at: Date;
    updated_at: Date;
}
export interface GenerateAIReportInput {
    report_type?: AIReportType;
    title?: string;
    period_type?: PeriodType;
    custom_prompt?: string;
}
export interface MetaSynthesisInput {
    report_ids?: string[];
    period_type?: PeriodType;
    focus_areas?: string[];
}
export interface AIReportListParams {
    page?: number;
    limit?: number;
    report_type?: AIReportType;
    from?: string;
    to?: string;
}
export interface ChartData {
    labels: string[];
    datasets: Array<{
        label: string;
        data: number[];
        backgroundColor?: string | string[];
        borderColor?: string | string[];
        borderWidth?: number;
        fill?: boolean;
        tension?: number;
    }>;
}
export interface AIReportVisualization {
    tasksByStatus: ChartData;
    productivityTrend: ChartData;
    projectsProgress: ChartData;
    priorityDistribution: ChartData;
    weeklyComparison: ChartData;
}
//# sourceMappingURL=reports.types.d.ts.map