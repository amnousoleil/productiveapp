/**
 * Behavioral Signals Service
 * Records user behavioral signals for analytics
 * ProductiveApp v4.0
 */
export interface Signal {
    id: string;
    user_id: string;
    workspace_id: string;
    signal_type: string;
    source_module: string;
    source_id?: string;
    payload: Record<string, unknown>;
    created_at: Date;
}
export interface SignalFilters {
    type?: string;
    source?: string;
    from?: Date;
    to?: Date;
    limit?: number;
}
export declare function recordSignal(userId: string, workspaceId: string, signalType: string, sourceModule: string, sourceId: string | null, payload?: Record<string, unknown>, occurredAt?: Date): Promise<Signal>;
/**
 * Fire-and-forget signal recording - never blocks main flow
 */
export declare function recordSignalAsync(userId: string, workspaceId: string, signalType: string, sourceModule: string, sourceId: string | null, payload?: Record<string, unknown>): void;
export declare function getSignals(userId: string, filters?: SignalFilters): Promise<Signal[]>;
export declare function deleteSignal(signalId: string, userId: string): Promise<boolean>;
export interface SignalStats {
    total_signals: number;
    signals_by_type: Record<string, number>;
    signals_by_source: Record<string, number>;
    recent_activity: {
        date: string;
        count: number;
    }[];
}
export declare function getSignalStats(userId: string): Promise<SignalStats>;
export interface UserProfile {
    user_id: string;
    total_signals: number;
    first_signal_at: Date | null;
    last_signal_at: Date | null;
    most_active_module: string | null;
    most_common_signal: string | null;
}
export declare function getProfile(userId: string): Promise<UserProfile | null>;
//# sourceMappingURL=signals.service.d.ts.map