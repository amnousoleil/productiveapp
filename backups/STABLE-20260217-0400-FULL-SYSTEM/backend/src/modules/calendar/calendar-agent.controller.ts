/**
 * Calendar AI Agent Controller
 */
import { Request, Response } from 'express';
import * as agentSvc from './calendar-agent.service.js';

type Req = Request<{ workspaceId: string; eventId?: string }>;

/**
 * POST /api/v1/calendar/workspace/:workspaceId/agent/parse
 * Parse natural language query
 */
export const parseQuery = async (req: Req, res: Response): Promise<void> => {
  try {
    if (!req.body.query) {
      res.status(400).json({ error: 'query requis' });
      return;
    }
    const parsed = await agentSvc.parseEventQuery(req.body.query);
    res.json(parsed);
  } catch (e) {
    console.error('Calendar agent parse:', e);
    res.status(500).json({ error: 'Erreur lors du parsing' });
  }
};

/**
 * POST /api/v1/calendar/workspace/:workspaceId/agent/create
 * Create event from natural language query
 */
export const createFromQuery = async (req: Req, res: Response): Promise<void> => {
  try {
    if (!req.body.query) {
      res.status(400).json({ error: 'query requis' });
      return;
    }
    const memberId = (req as any).user?.id || req.body.member_id || null;
    const autoSchedule = req.body.auto_schedule === true;

    const result = await agentSvc.createEventFromQuery(
      req.params.workspaceId,
      memberId,
      req.body.query,
      autoSchedule
    );

    res.status(201).json(result);
  } catch (e) {
    console.error('Calendar agent create:', e);
    res.status(500).json({ error: 'Erreur lors de la création' });
  }
};

/**
 * GET /api/v1/calendar/workspace/:workspaceId/agent/available-slots
 * Find available time slots
 */
export const availableSlots = async (req: Req, res: Response): Promise<void> => {
  try {
    if (!req.query.start_date || !req.query.end_date) {
      res.status(400).json({ error: 'start_date et end_date requis' });
      return;
    }

    const memberId = (req as any).user?.id || (req.query.member_id as string) || null;
    const durationMinutes = parseInt(req.query.duration as string) || 60;

    const slots = await agentSvc.findAvailableSlots(
      req.params.workspaceId,
      memberId,
      req.query.start_date as string,
      req.query.end_date as string,
      durationMinutes
    );

    res.json({ slots });
  } catch (e) {
    console.error('Calendar agent available slots:', e);
    res.status(500).json({ error: 'Erreur' });
  }
};

/**
 * GET /api/v1/calendar/workspace/:workspaceId/agent/suggestions/:eventId
 * Get AI suggestions for event optimization
 */
export const suggestions = async (req: Req, res: Response): Promise<void> => {
  try {
    const memberId = (req as any).user?.id || (req.query.member_id as string) || null;
    const result = await agentSvc.getEventSuggestions(
      req.params.workspaceId,
      memberId,
      req.params.eventId!
    );
    res.json(result);
  } catch (e) {
    console.error('Calendar agent suggestions:', e);
    res.status(500).json({ error: 'Erreur' });
  }
};
