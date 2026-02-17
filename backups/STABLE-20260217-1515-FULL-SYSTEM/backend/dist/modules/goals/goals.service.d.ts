/**
 * Module Objectifs Financiers - Service
 * @description Objectifs CA, depenses, epargne avec suivi progression
 */
import { Pool } from 'pg';
export declare const initGoalsService: (p: Pool) => void;
export declare const listGoals: (wid: string, filters: {
    type?: string;
    status?: string;
}) => Promise<any[]>;
export declare const createGoal: (wid: string, mid: string, data: {
    title: string;
    type: string;
    target_amount: number;
    current_amount?: number;
    currency?: string;
    target_date?: string;
    description?: string;
}) => Promise<any>;
export declare const getGoal: (wid: string, id: string) => Promise<any>;
export declare const updateGoal: (wid: string, id: string, data: Record<string, any>) => Promise<any>;
export declare const deleteGoal: (wid: string, id: string) => Promise<boolean>;
export declare const refreshGoalProgress: (wid: string, id: string) => Promise<any>;
export declare const getDashboard: (wid: string) => Promise<{
    total: number;
    active: number;
    completed: number;
    goals: any[];
}>;
//# sourceMappingURL=goals.service.d.ts.map