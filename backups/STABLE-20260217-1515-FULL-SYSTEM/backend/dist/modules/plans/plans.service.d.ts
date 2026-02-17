import type { UUID } from '../../types/index.js';
export interface UserPlan {
    id: UUID;
    user_id: UUID;
    plan_tier: 'free' | 'starter' | 'premium' | 'unlimited';
    reports_used_this_month: number;
    reports_limit: number;
    features: PlanFeatures;
    started_at: Date;
    expires_at: Date | null;
    created_at: Date;
    updated_at: Date;
}
export interface PlanFeatures {
    ai_reports: boolean;
    language_analysis: boolean;
    export_pdf: boolean;
    history_days: number;
}
export declare class PlansService {
    getUserPlan(userId: UUID): Promise<UserPlan | null>;
    createFreePlan(userId: UUID): Promise<UserPlan>;
    canUseFeature(userId: UUID, feature: keyof PlanFeatures): Promise<boolean>;
    incrementReportUsage(userId: UUID): Promise<{
        success: boolean;
        remaining: number;
    }>;
    resetMonthlyUsage(): Promise<number>;
    getTierConfigs(): Record<string, {
        reports_limit: number;
        features: PlanFeatures;
    }>;
}
export declare const plansService: PlansService;
//# sourceMappingURL=plans.service.d.ts.map