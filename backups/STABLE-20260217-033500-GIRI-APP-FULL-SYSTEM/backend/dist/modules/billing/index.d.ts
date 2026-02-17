/**
 * Billing Module - Export principal
 */
export { billingRoutes } from './billing.routes.js';
export { PLANS, hasFeature, checkLimit, getMinimumPlanForFeature } from './billing.plans.js';
export { requireFeature, requireLimit, attachPlanInfo } from './billing.middleware.js';
export * as billingService from './billing.service.js';
export type { PlanId, PlanFeatures, Plan } from './billing.plans.js';
//# sourceMappingURL=index.d.ts.map