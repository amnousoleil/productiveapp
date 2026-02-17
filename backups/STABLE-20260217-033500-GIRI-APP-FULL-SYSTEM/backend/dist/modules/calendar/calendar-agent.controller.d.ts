/**
 * Calendar AI Agent Controller
 */
import { Request, Response } from 'express';
type Req = Request<{
    workspaceId: string;
    eventId?: string;
}>;
/**
 * POST /api/v1/calendar/workspace/:workspaceId/agent/parse
 * Parse natural language query
 */
export declare const parseQuery: (req: Req, res: Response) => Promise<void>;
/**
 * POST /api/v1/calendar/workspace/:workspaceId/agent/create
 * Create event from natural language query
 */
export declare const createFromQuery: (req: Req, res: Response) => Promise<void>;
/**
 * GET /api/v1/calendar/workspace/:workspaceId/agent/available-slots
 * Find available time slots
 */
export declare const availableSlots: (req: Req, res: Response) => Promise<void>;
/**
 * GET /api/v1/calendar/workspace/:workspaceId/agent/suggestions/:eventId
 * Get AI suggestions for event optimization
 */
export declare const suggestions: (req: Req, res: Response) => Promise<void>;
export {};
//# sourceMappingURL=calendar-agent.controller.d.ts.map