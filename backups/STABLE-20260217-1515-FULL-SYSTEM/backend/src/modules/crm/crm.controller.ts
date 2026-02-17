/**
 * Module CRM Pipeline - Controller
 */
import { Request, Response } from 'express';
import * as svc from './crm.service.js';

type Req = Request<{ workspaceId: string; id?: string; dealId?: string }>;

export const pipelines = async (req: Req, res: Response): Promise<void> => {
  try { res.json(await svc.getPipelines(req.params.workspaceId)); } catch (e) { console.error('CRM pipelines error:', e); res.status(500).json({ error: 'Erreur' }); }
};
export const createPipeline = async (req: Req, res: Response): Promise<void> => {
  try { if (!req.body.name) { res.status(400).json({ error: 'name requis' }); return; } res.status(201).json(await svc.createPipeline(req.params.workspaceId, req.body)); } catch (e) { console.error('CRM create pipeline:', e); res.status(500).json({ error: 'Erreur' }); }
};
export const updatePipeline = async (req: Req, res: Response): Promise<void> => {
  try { const r = await svc.updatePipeline(req.params.workspaceId, req.params.id!, req.body); if (!r) { res.status(404).json({ error: 'Pipeline non trouve' }); return; } res.json(r); } catch (e) { console.error('CRM update pipeline:', e); res.status(500).json({ error: 'Erreur' }); }
};
export const board = async (req: Req, res: Response): Promise<void> => {
  try { res.json(await svc.getDealBoard(req.params.workspaceId, req.query.pipeline_id as string)); } catch (e) { console.error('CRM board error:', e); res.status(500).json({ error: 'Erreur' }); }
};
export const listDeals = async (req: Req, res: Response): Promise<void> => {
  try { res.json(await svc.listDeals(req.params.workspaceId, { stage: req.query.stage as string, contactId: req.query.contact_id as string, memberId: req.query.member_id as string, search: req.query.search as string, page: req.query.page ? parseInt(req.query.page as string) : 1, limit: req.query.limit ? parseInt(req.query.limit as string) : 20 })); } catch (e) { console.error('CRM list deals:', e); res.status(500).json({ error: 'Erreur' }); }
};
export const getDeal = async (req: Req, res: Response): Promise<void> => {
  try { const r = await svc.getDeal(req.params.workspaceId, req.params.id!); if (!r) { res.status(404).json({ error: 'Deal non trouve' }); return; } res.json(r); } catch (e) { console.error('CRM get deal:', e); res.status(500).json({ error: 'Erreur' }); }
};
export const createDeal = async (req: Req, res: Response): Promise<void> => {
  try { if (!req.body.title) { res.status(400).json({ error: 'title requis' }); return; } res.status(201).json(await svc.createDeal(req.params.workspaceId, req.body)); } catch (e) { console.error('CRM create deal:', e); res.status(500).json({ error: 'Erreur' }); }
};
export const updateDealCtrl = async (req: Req, res: Response): Promise<void> => {
  try { const r = await svc.updateDeal(req.params.workspaceId, req.params.id!, req.body); if (!r) { res.status(404).json({ error: 'Deal non trouve' }); return; } res.json(r); } catch (e) { console.error('CRM update deal:', e); res.status(500).json({ error: 'Erreur' }); }
};
export const deleteDeal = async (req: Req, res: Response): Promise<void> => {
  try { const ok = await svc.deleteDeal(req.params.workspaceId, req.params.id!); if (!ok) { res.status(404).json({ error: 'Deal non trouve' }); return; } res.status(204).send(); } catch (e) { console.error('CRM delete deal:', e); res.status(500).json({ error: 'Erreur' }); }
};
export const moveDeal = async (req: Req, res: Response): Promise<void> => {
  try { if (!req.body.stage) { res.status(400).json({ error: 'stage requis' }); return; } const r = await svc.moveDeal(req.params.workspaceId, req.params.id!, req.body.stage, req.body.probability); if (!r) { res.status(404).json({ error: 'Deal non trouve' }); return; } res.json(r); } catch (e) { console.error('CRM move deal:', e); res.status(500).json({ error: 'Erreur' }); }
};
export const convertDealCtrl = async (req: Req, res: Response): Promise<void> => {
  try { const r = await svc.convertDeal(req.params.workspaceId, req.params.id!); res.json(r); } catch (e: any) { console.error('CRM convert deal:', e); res.status(e.message?.includes('non trouve') ? 404 : 400).json({ error: e.message || 'Erreur' }); }
};
export const activities = async (req: Req, res: Response): Promise<void> => {
  try { res.json(await svc.listActivities(req.params.workspaceId, req.params.dealId!)); } catch (e) { console.error('CRM activities:', e); res.status(500).json({ error: 'Erreur' }); }
};
export const addActivity = async (req: Req, res: Response): Promise<void> => {
  try { if (!req.body.type || !req.body.title) { res.status(400).json({ error: 'type et title requis' }); return; } res.status(201).json(await svc.addActivity(req.params.workspaceId, req.params.dealId!, req.body)); } catch (e: any) { console.error('CRM add activity:', e); res.status(e.message?.includes('non trouve') ? 404 : 500).json({ error: e.message || 'Erreur' }); }
};
export const stats = async (req: Req, res: Response): Promise<void> => {
  try { res.json(await svc.getStats(req.params.workspaceId)); } catch (e) { console.error('CRM stats:', e); res.status(500).json({ error: 'Erreur' }); }
};
