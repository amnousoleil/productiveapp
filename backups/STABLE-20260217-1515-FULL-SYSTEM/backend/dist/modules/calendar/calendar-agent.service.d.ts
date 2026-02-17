/**
 * Calendar AI Agent Service
 * @description Agent IA pour prise de RDV automatique en langage naturel
 */
import { Pool } from 'pg';
export declare const initCalendarAgentService: (p: Pool) => void;
interface ParsedEvent {
    title: string;
    description?: string;
    start_date: string;
    end_date?: string;
    attendees?: string[];
    location?: string;
    event_type?: string;
}
/**
 * Parse natural language query to extract event details
 * @param query - Natural language query (e.g., "Prends RDV avec Brice demain à 14h pour révision projet")
 */
export declare const parseEventQuery: (query: string) => Promise<ParsedEvent>;
/**
 * Find available time slots in a given date range
 * @param wid - Workspace ID
 * @param mid - Member ID
 * @param startDate - Start date to search from
 * @param endDate - End date to search until
 * @param durationMinutes - Desired duration in minutes (default: 60)
 */
export declare const findAvailableSlots: (wid: string, mid: string, startDate: string, endDate: string, durationMinutes?: number) => Promise<Array<{
    start: string;
    end: string;
    score: number;
}>>;
/**
 * Create event from natural language query
 */
export declare const createEventFromQuery: (wid: string, mid: string, query: string, autoSchedule?: boolean) => Promise<{
    event: any;
    suggestions?: any[];
}>;
/**
 * Get AI suggestions for event optimization
 */
export declare const getEventSuggestions: (wid: string, mid: string, eventId: string) => Promise<{
    betterTimes: any[];
    conflictingEvents: any[];
    recommendations: string[];
}>;
export {};
//# sourceMappingURL=calendar-agent.service.d.ts.map