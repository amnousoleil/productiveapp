/**
 * Module Comptabilité - Analytics et Dashboard
 * @description Statistiques, dashboard et résumé TVA
 */
import { Pool } from 'pg';
import { DashboardStats, MonthlyAnalytics, TVAAnalytics } from './accounting.types.js';
export declare const initAnalyticsService: (dbPool: Pool) => void;
export declare const getDashboardStats: (workspaceId: string, year?: number) => Promise<DashboardStats>;
export declare const getMonthlyAnalytics: (workspaceId: string, month: number, year: number) => Promise<MonthlyAnalytics>;
export declare const getTVASummary: (workspaceId: string, year: number, quarter?: number) => Promise<TVAAnalytics[]>;
//# sourceMappingURL=accounting.analytics.d.ts.map