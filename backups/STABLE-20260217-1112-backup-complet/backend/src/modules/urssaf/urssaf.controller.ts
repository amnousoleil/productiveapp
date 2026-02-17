import { Request, Response } from 'express';
import * as svc from './urssaf.service.js';
type Req = Request<{ workspaceId: string; id?: string }>;

export const simulate = async (req: Req, res: Response): Promise<void> => {
  try { if (!req.body.ca || !req.body.activity_type) { res.status(400).json({ error: 'ca et activity_type requis' }); return; } res.json(await svc.simulateCotisations(req.params.workspaceId, req.body)); } catch (e) { res.status(500).json({ error: 'Erreur' }); }
};
export const listDeclarations = async (req: Req, res: Response): Promise<void> => { try { res.json(await svc.getDeclarations(req.params.workspaceId)); } catch (e) { res.status(500).json({ error: 'Erreur' }); } };
export const createDeclaration = async (req: Req, res: Response): Promise<void> => {
  try { if (!req.body.quarter || !req.body.year || !req.body.activity_type || req.body.chiffre_affaires === undefined) { res.status(400).json({ error: 'quarter, year, activity_type et chiffre_affaires requis' }); return; } res.status(201).json(await svc.createDeclaration(req.params.workspaceId, req.body.member_id || '', req.body)); } catch (e) { console.error('URSSAF create:', e); res.status(500).json({ error: 'Erreur' }); }
};
export const updateDeclaration = async (req: Req, res: Response): Promise<void> => { try { const r = await svc.updateDeclaration(req.params.workspaceId, req.params.id!, req.body); if (!r) { res.status(404).json({ error: 'Declaration non trouvee' }); return; } res.json(r); } catch (e) { res.status(500).json({ error: 'Erreur' }); } };
export const annualSummary = async (req: Req, res: Response): Promise<void> => { try { const year = parseInt(req.query.year as string) || new Date().getFullYear(); res.json(await svc.getAnnualSummary(req.params.workspaceId, year)); } catch (e) { res.status(500).json({ error: 'Erreur' }); } };
export const autoCalc = async (req: Req, res: Response): Promise<void> => {
  try { if (!req.body.quarter || !req.body.year) { res.status(400).json({ error: 'quarter et year requis' }); return; } res.json(await svc.autoCalculateFromInvoices(req.params.workspaceId, req.body.quarter, req.body.year)); } catch (e) { res.status(500).json({ error: 'Erreur' }); }
};
