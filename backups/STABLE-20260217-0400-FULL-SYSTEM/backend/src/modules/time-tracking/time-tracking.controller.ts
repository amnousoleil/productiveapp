/**
 * Module Time Tracking - Controller
 */
import { Request, Response } from 'express';
import * as svc from './time-tracking.service.js';

type Req = Request<{ workspaceId: string; id?: string }>;

export const start = async (req: Req, res: Response): Promise<void> => {
  try { const r = await svc.startTimer(req.params.workspaceId, req.body.member_id, { taskId: req.body.task_id, projectId: req.body.project_id, description: req.body.description, isBillable: req.body.is_billable, hourlyRate: req.body.hourly_rate }); res.status(201).json(r); }
  catch (e) { console.error('Time start error:', e); res.status(500).json({ error: 'Erreur demarrage chrono' }); }
};

export const stop = async (req: Req, res: Response): Promise<void> => {
  try { const r = await svc.stopTimer(req.params.workspaceId, req.body.member_id); if (!r) { res.status(404).json({ error: 'Aucun chrono actif' }); return; } res.json(r); }
  catch (e) { console.error('Time stop error:', e); res.status(500).json({ error: 'Erreur arret chrono' }); }
};

export const running = async (req: Req, res: Response): Promise<void> => {
  try { const mid = req.query.member_id as string; const r = await svc.getRunningTimer(req.params.workspaceId, mid); res.json(r || { running: false }); }
  catch (e) { console.error('Time running error:', e); res.status(500).json({ error: 'Erreur' }); }
};

export const create = async (req: Req, res: Response): Promise<void> => {
  try {
    if (!req.body.start_time || !req.body.end_time) { res.status(400).json({ error: 'start_time et end_time requis' }); return; }
    const r = await svc.createManualEntry(req.params.workspaceId, req.body.member_id, { taskId: req.body.task_id, projectId: req.body.project_id, description: req.body.description, startTime: req.body.start_time, endTime: req.body.end_time, durationMinutes: req.body.duration_minutes, isBillable: req.body.is_billable, hourlyRate: req.body.hourly_rate });
    res.status(201).json(r);
  } catch (e) { console.error('Time create error:', e); res.status(500).json({ error: 'Erreur creation entree' }); }
};

export const update = async (req: Req, res: Response): Promise<void> => {
  try { const r = await svc.updateEntry(req.params.workspaceId, req.params.id!, req.body); if (!r) { res.status(404).json({ error: 'Entree non trouvee' }); return; } res.json(r); }
  catch (e) { console.error('Time update error:', e); res.status(500).json({ error: 'Erreur mise a jour' }); }
};

export const remove = async (req: Req, res: Response): Promise<void> => {
  try { const ok = await svc.deleteEntry(req.params.workspaceId, req.params.id!); if (!ok) { res.status(404).json({ error: 'Entree non trouvee' }); return; } res.status(204).send(); }
  catch (e) { console.error('Time delete error:', e); res.status(500).json({ error: 'Erreur suppression' }); }
};

export const list = async (req: Req, res: Response): Promise<void> => {
  try {
    const r = await svc.listEntries(req.params.workspaceId, {
      memberId: req.query.member_id as string, taskId: req.query.task_id as string, projectId: req.query.project_id as string,
      dateFrom: req.query.date_from as string, dateTo: req.query.date_to as string,
      isBillable: req.query.is_billable === 'true' ? true : req.query.is_billable === 'false' ? false : undefined,
      page: req.query.page ? parseInt(req.query.page as string, 10) : 1, limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 20,
    });
    res.json(r);
  } catch (e) { console.error('Time list error:', e); res.status(500).json({ error: 'Erreur liste' }); }
};

export const report = async (req: Req, res: Response): Promise<void> => {
  try {
    const r = await svc.getTimeReport(req.params.workspaceId, {
      memberId: req.query.member_id as string, projectId: req.query.project_id as string,
      dateFrom: req.query.date_from as string, dateTo: req.query.date_to as string,
      groupBy: (req.query.group_by as 'project' | 'member' | 'day') || 'project',
    });
    res.json(r);
  } catch (e) { console.error('Time report error:', e); res.status(500).json({ error: 'Erreur rapport' }); }
};

export const getRate = async (req: Req, res: Response): Promise<void> => {
  try { const mid = req.query.member_id as string; const r = await svc.getMemberRate(req.params.workspaceId, mid); res.json(r || { hourly_rate: 0, currency: 'EUR' }); }
  catch (e) { console.error('Rate get error:', e); res.status(500).json({ error: 'Erreur' }); }
};

export const setRate = async (req: Req, res: Response): Promise<void> => {
  try { if (!req.body.member_id || !req.body.hourly_rate) { res.status(400).json({ error: 'member_id et hourly_rate requis' }); return; } const r = await svc.setMemberRate(req.params.workspaceId, req.body.member_id, req.body.hourly_rate, req.body.currency); res.json(r); }
  catch (e) { console.error('Rate set error:', e); res.status(500).json({ error: 'Erreur' }); }
};

export const unbilled = async (req: Req, res: Response): Promise<void> => {
  try { const r = await svc.getUnbilledEntries(req.params.workspaceId, { memberId: req.query.member_id as string, projectId: req.query.project_id as string }); res.json(r); }
  catch (e) { console.error('Unbilled error:', e); res.status(500).json({ error: 'Erreur' }); }
};

export const linkInvoice = async (req: Req, res: Response): Promise<void> => {
  try { if (!req.body.entry_ids?.length || !req.body.invoice_id) { res.status(400).json({ error: 'entry_ids et invoice_id requis' }); return; } const cnt = await svc.linkEntriesToInvoice(req.params.workspaceId, req.body.entry_ids, req.body.invoice_id); res.json({ linked: cnt }); }
  catch (e) { console.error('Link error:', e); res.status(500).json({ error: 'Erreur' }); }
};
