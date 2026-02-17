/**
 * Module Auto-Relances - Service
 * @description Relances automatiques factures impayees (3 niveaux)
 */
import { Pool } from 'pg';
export declare const initRelancesService: (p: Pool) => void;
export declare const getSettings: (wid: string) => Promise<any>;
export declare const updateSettings: (wid: string, data: Record<string, any>) => Promise<any>;
export declare const scheduleReminders: (wid: string) => Promise<{
    scheduled: number;
    skipped: number;
}>;
export declare const processReminders: () => Promise<{
    sent: number;
    failed: number;
}>;
export declare const listReminders: (wid: string, filters: {
    invoiceId?: string;
    status?: string;
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
export declare const cancelReminder: (wid: string, id: string) => Promise<any>;
export declare const getOverdueReport: (wid: string) => Promise<{
    total_overdue: number;
    total_amount: number;
    invoices: any[];
}>;
//# sourceMappingURL=relances.service.d.ts.map