/**
 * Behavioral Profile Computation Service
 * Calculates comprehensive behavioral profile from raw signals
 */
export interface BehavioralProfile {
    user_id: string;
    workspace_id: string;
    peak_activity_hours: number[];
    low_activity_hours: number[];
    completion_rate: number;
    overdue_rate: number;
    night_owl_index: number;
    burst_vs_steady_index: number;
    signals_count_7d: number;
    signals_count_30d: number;
    project_engagement: Record<string, number>;
    updated_at: Date;
}
export declare function computeProfile(userId: string, workspaceId: string): Promise<BehavioralProfile>;
export declare function getStoredProfile(userId: string): Promise<BehavioralProfile | null>;
//# sourceMappingURL=signals-profile.service.d.ts.map