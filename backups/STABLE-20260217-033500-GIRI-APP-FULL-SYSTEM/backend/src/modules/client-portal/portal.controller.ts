import { Request, Response } from 'express';
import * as svc from './portal.service.js';
type Req = Request<{ workspaceId: string; id?: string; token?: string }>;

// Admin endpoints (workspace-scoped)
export const generateToken = async (req: Req, res: Response): Promise<void> => {
  try { if (!req.body.contact_id) { res.status(400).json({ error: 'contact_id requis' }); return; } res.status(201).json(await svc.generateToken(req.params.workspaceId, req.body.contact_id, req.body.expires_in_days)); } catch (e) { res.status(500).json({ error: 'Erreur' }); }
};
export const listTokens = async (req: Req, res: Response): Promise<void> => { try { res.json(await svc.listPortalTokens(req.params.workspaceId)); } catch (e) { res.status(500).json({ error: 'Erreur' }); } };
export const revokeToken = async (req: Req, res: Response): Promise<void> => {
  try { const r = await svc.revokeToken(req.params.workspaceId, req.params.id!); if (!r) { res.status(404).json({ error: 'Token non trouve' }); return; } res.json(r); } catch (e) { res.status(500).json({ error: 'Erreur' }); }
};

// Public endpoints (token-based, no auth)
export const portalAccess = async (req: Request<{ token: string }>, res: Response): Promise<void> => {
  try {
    const session = await svc.validateToken(req.params.token);
    if (!session) { res.status(401).json({ error: 'Token invalide ou expire' }); return; }
    const dashboard = await svc.getPortalDashboard(session.workspace_id, session.contact_id);
    res.json({ ...dashboard, contact_name: session.contact_name, contact_email: session.contact_email, contact_company: session.contact_company });
  } catch (e) { res.status(500).json({ error: 'Erreur' }); }
};
