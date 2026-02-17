/**
 * Module Time Tracking - Service
 * @description Suivi du temps, chronometre, feuilles de temps, rapports
 */
import { Pool } from 'pg';
export declare const initTimeTrackingService: (p: Pool) => void;
export declare const startTimer: (wid: string, mid: string, data: {
    taskId?: string;
    projectId?: string;
    description?: string;
    isBillable?: boolean;
    hourlyRate?: number;
}) => Promise<any>;
export declare const stopTimer: (wid: string, mid: string) => Promise<any>;
export declare const getRunningTimer: (wid: string, mid: string) => Promise<any>;
export declare const createManualEntry: (wid: string, mid: string, data: {
    taskId?: string;
    projectId?: string;
    description?: string;
    startTime: string;
    endTime: string;
    durationMinutes?: number;
    isBillable?: boolean;
    hourlyRate?: number;
}) => Promise<any>;
export declare const updateEntry: (wid: string, id: string, data: Record<string, any>) => Promise<any>;
export declare const deleteEntry: (wid: string, id: string) => Promise<boolean>;
export declare const listEntries: (wid: string, filters: {
    memberId?: string;
    taskId?: string;
    projectId?: string;
    dateFrom?: string;
    dateTo?: string;
    isBillable?: boolean;
    page?: number;
    limit?: number;
}) => Promise<{
    data: any[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        total_pages: number;
    };
}>;
export declare const getTimeReport: (wid: string, filters: {
    memberId?: string;
    projectId?: string;
    dateFrom?: string;
    dateTo?: string;
    groupBy?: "project" | "member" | "day";
}) => Promise<{
    summary: {
        total_hours: number;
        billable_hours: number;
        total_amount: number;
        entry_count: number;
    };
    breakdown: {
        group_key: any;
        group_name: any;
        total_hours: number;
        billable_hours: number;
        total_amount: number;
        entry_count: number;
    }[];
    group_by: "member" | "project" | "day";
}>;
export declare const getMemberRate: (wid: string, mid: string) => Promise<any>;
export declare const setMemberRate: (wid: string, mid: string, rate: number, currency?: string) => Promise<any>;
export declare const getUnbilledEntries: (wid: string, filters: {
    memberId?: string;
    projectId?: string;
}) => Promise<any[]>;
export declare const linkEntriesToInvoice: (wid: string, entryIds: string[], invoiceId: string) => Promise<number>;
//# sourceMappingURL=time-tracking.service.d.ts.map