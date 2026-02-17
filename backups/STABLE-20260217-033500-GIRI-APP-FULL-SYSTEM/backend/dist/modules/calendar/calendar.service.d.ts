/**
 * Module Calendrier - Service
 * @description Evenements, synchro taches/factures
 */
import { Pool } from 'pg';
export declare const initCalendarService: (p: Pool) => void;
export declare const createEvent: (wid: string, mid: string, data: {
    title: string;
    description?: string;
    event_type?: string;
    start_date: string;
    end_date?: string;
    all_day?: boolean;
    location?: string;
    color?: string;
    is_private?: boolean;
    recurrence_rule?: string;
    task_id?: string;
    project_id?: string;
    reminder_minutes?: number;
    attendees?: any[];
}) => Promise<any>;
export declare const updateEvent: (wid: string, id: string, data: Record<string, any>) => Promise<any>;
export declare const deleteEvent: (wid: string, id: string) => Promise<boolean>;
export declare const getEvent: (wid: string, id: string) => Promise<any>;
export declare const listEvents: (wid: string, filters: {
    memberId?: string;
    startDate: string;
    endDate: string;
    eventType?: string;
}) => Promise<any[]>;
export declare const getUpcoming: (wid: string, mid: string, days?: number) => Promise<any[]>;
export declare const syncTaskDeadlines: (wid: string) => Promise<{
    created: number;
    updated: number;
    removed: number;
}>;
export declare const syncInvoiceDueDates: (wid: string) => Promise<{
    created: number;
    updated: number;
    removed: number;
}>;
//# sourceMappingURL=calendar.service.d.ts.map