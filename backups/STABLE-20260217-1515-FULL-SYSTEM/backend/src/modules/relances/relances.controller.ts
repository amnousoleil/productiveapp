import { Request, Response } from 'express';
import * as svc from './relances.service.js';
type Req = Request<{ workspaceId: string; id?: string }>;

export const getSettings = async (req: Req, res: Response): Promise<void> => { try { res.json(await svc.getSettings(req.params.workspaceId)); } catch (e) { res.status(500).json({ error: 'Erreur' }); } };
export const updateSettings = async (req: Req, res: Response): Promise<void> => { try { res.json(await svc.updateSettings(req.params.workspaceId, req.body)); } catch (e) { res.status(500).json({ error: 'Erreur' }); } };
export const schedule = async (req: Req, res: Response): Promise<void> => { try { res.json(await svc.scheduleReminders(req.params.workspaceId)); } catch (e) { console.error('Relances schedule:', e); res.status(500).json({ error: 'Erreur' }); } };
export const process = async (_req: Req, res: Response): Promise<void> => { try { res.json(await svc.processReminders()); } catch (e) { console.error('Relances process:', e); res.status(500).json({ error: 'Erreur' }); } };
export const list = async (req: Req, res: Response): Promise<void> => { try { res.json(await svc.listReminders(req.params.workspaceId, { invoiceId: req.query.invoice_id as string, status: req.query.status as string, page: req.query.page ? parseInt(req.query.page as string) : 1, limit: req.query.limit ? parseInt(req.query.limit as string) : 20 })); } catch (e) { res.status(500).json({ error: 'Erreur' }); } };
export const cancel = async (req: Req, res: Response): Promise<void> => { try { const r = await svc.cancelReminder(req.params.workspaceId, req.params.id!); if (!r) { res.status(404).json({ error: 'Relance non trouvee ou deja envoyee' }); return; } res.json(r); } catch (e) { res.status(500).json({ error: 'Erreur' }); } };
export const overdueReport = async (req: Req, res: Response): Promise<void> => { try { res.json(await svc.getOverdueReport(req.params.workspaceId)); } catch (e) { res.status(500).json({ error: 'Erreur' }); } };
