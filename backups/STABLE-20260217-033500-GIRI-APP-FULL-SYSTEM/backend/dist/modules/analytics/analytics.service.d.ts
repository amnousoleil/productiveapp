import type { UUID, ActivityLog, DailyStats, WorkspaceStats, PaginationParams } from '../../types/index.js';
import type { LogActivityInput, DailyStatsResponse, WorkspaceStatsResponse, ActivitySummary, UserProductivityStats, DateRangeParams } from './analytics.types.js';
export declare class AnalyticsService {
    logActivity(userId: UUID, workspaceId: UUID, input: LogActivityInput, ip?: string, userAgent?: string): Promise<ActivityLog>;
    getActivityLogs(workspaceId: UUID, params: PaginationParams & {
        user_id?: UUID;
        action?: string;
        entity_type?: string;
    }): Promise<{
        activities: ActivityLog[];
        total: number;
    }>;
    getActivitySummary(userId: UUID, workspaceId: UUID, dateRange: DateRangeParams): Promise<ActivitySummary>;
    getDailyStats(userId: UUID, workspaceId: UUID, dateRange: DateRangeParams): Promise<DailyStatsResponse[]>;
    updateDailyStats(userId: UUID, workspaceId: UUID): Promise<DailyStats>;
    getWorkspaceStats(workspaceId: UUID, dateRange: DateRangeParams): Promise<WorkspaceStatsResponse[]>;
    updateWorkspaceStats(workspaceId: UUID): Promise<WorkspaceStats>;
    getUserProductivityStats(userId: UUID, workspaceId: UUID): Promise<UserProductivityStats>;
}
export declare const analyticsService: AnalyticsService;
//# sourceMappingURL=analytics.service.d.ts.map