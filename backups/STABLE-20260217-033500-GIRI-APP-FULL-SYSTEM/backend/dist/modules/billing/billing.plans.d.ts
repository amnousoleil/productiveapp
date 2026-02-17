/**
 * Billing Plans - Définition des 4 plans de Giri App
 * Plans : Free | Pro | Business | Enterprise
 */
export type PlanId = 'free' | 'pro' | 'business' | 'enterprise';
export type BillingInterval = 'month' | 'year';
export interface PlanFeatures {
    maxNotes: number;
    aiClustering: boolean;
    graph3D: boolean;
    promptsPerDay: number;
    promptLibrary: boolean;
    customDomains: number;
    teamMembers: number;
    storage: string;
    support: 'community' | 'email' | 'priority' | 'dedicated';
    api: boolean;
    analytics: boolean;
    whiteLabel: boolean;
    aiReports: boolean;
    reportsPerMonth: number;
}
export interface Plan {
    id: PlanId;
    name: string;
    description: string;
    price: number | null;
    yearlyPrice: number | null;
    interval: BillingInterval | null;
    stripePriceIdMonthly: string | null;
    stripePriceIdYearly: string | null;
    features: PlanFeatures;
    popular?: boolean;
    highlights: string[];
}
export declare const PLANS: Record<PlanId, Plan>;
/**
 * Vérifie si un plan a accès à une feature
 */
export declare function hasFeature(planId: PlanId, feature: keyof PlanFeatures): boolean;
/**
 * Vérifie une limite avec l'usage actuel
 */
export declare function checkLimit(planId: PlanId, limitKey: keyof PlanFeatures, currentUsage: number): {
    allowed: boolean;
    remaining: number;
    limit: number;
};
/**
 * Trouve le plan minimum requis pour une feature
 */
export declare function getMinimumPlanForFeature(feature: keyof PlanFeatures): PlanId;
/**
 * Trouve un plan à partir d'un price ID Stripe
 */
export declare function getPlanFromPriceId(priceId: string): PlanId;
/**
 * Vérifie si un interval est annuel à partir d'un price ID
 */
export declare function isYearlyPrice(priceId: string): boolean;
//# sourceMappingURL=billing.plans.d.ts.map