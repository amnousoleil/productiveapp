import { Request, Response } from 'express';
import * as SignalsService from './signals.service.js';
import { computeProfile } from './signals-profile.service.js';

export async function getSignals(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.params.userId;
    const filters = {
      type: req.query.type as string,
      source: req.query.source as string,
      from: req.query.from ? new Date(req.query.from as string) : undefined,
      to: req.query.to ? new Date(req.query.to as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined
    };
    const signals = await SignalsService.getSignals(userId, filters);
    res.json({ success: true, data: signals });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ success: false, error: { message } });
  }
}

export async function getSignalStats(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.params.userId;
    const stats = await SignalsService.getSignalStats(userId);
    res.json({ success: true, data: stats });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ success: false, error: { message } });
  }
}

export async function createSignal(req: Request, res: Response): Promise<void> {
  try {
    const { user_id, workspace_id, signal_type, source_module, source_id, payload, occurred_at } = req.body;
    if (!user_id || !workspace_id || !signal_type || !source_module) {
      res.status(400).json({ success: false, error: { message: 'Missing required fields' } });
      return;
    }
    const signal = await SignalsService.recordSignal(
      user_id, workspace_id, signal_type, source_module,
      source_id || null, payload || {}, occurred_at ? new Date(occurred_at) : undefined
    );
    res.status(201).json({ success: true, data: signal });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ success: false, error: { message } });
  }
}

export async function getProfile(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.params.userId;
    const profile = await SignalsService.getProfile(userId);
    if (!profile) {
      res.status(404).json({ success: false, error: { message: 'Profile not found' } });
      return;
    }
    res.json({ success: true, data: profile });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ success: false, error: { message } });
  }
}

export async function getBehavioralProfile(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.params.userId;
    const workspaceId = req.query.workspaceId as string || req.params.workspaceId;

    if (!workspaceId) {
      res.status(400).json({ success: false, error: { message: 'workspaceId required' } });
      return;
    }

    const profile = await computeProfile(userId, workspaceId);
    res.json({ success: true, data: profile });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ success: false, error: { message } });
  }
}
