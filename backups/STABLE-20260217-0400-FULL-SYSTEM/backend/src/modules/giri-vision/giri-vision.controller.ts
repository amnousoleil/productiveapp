import type { Request, Response } from 'express';
import { giriVisionService } from './giri-vision.service.js';

export const giriVisionController = {
  async createMeeting(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      const userId = user?.id || user?.email;
      const workspaceId = (req as any).workspace?.id;
      if (!userId || !workspaceId) { res.status(401).json({ error: 'Non autorisé' }); return; }
      const meeting = await giriVisionService.createMeeting(userId, workspaceId, req.body);
      res.json({ success: true, meeting });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  async getMeetings(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      const userId = user?.id || user?.email;
      const workspaceId = (req as any).workspace?.id;
      if (!userId || !workspaceId) { res.status(401).json({ error: 'Non autorisé' }); return; }
      const meetings = await giriVisionService.getMeetings(workspaceId);
      const scheduled = await giriVisionService.getScheduled(workspaceId);
      res.json({ success: true, meetings, scheduled });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  async getMeeting(req: Request, res: Response): Promise<void> {
    try {
      const meeting = await giriVisionService.getMeetingByRoomId(req.params.roomId);
      if (!meeting) { res.status(404).json({ error: 'Réunion introuvable' }); return; }
      res.json({ success: true, meeting });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  async joinMeeting(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      const name = req.body.participant_name || user?.name || user?.email || 'Participant';
      const meeting = await giriVisionService.joinMeeting(req.params.roomId, name);
      if (!meeting) { res.status(404).json({ error: 'Réunion introuvable' }); return; }
      res.json({ success: true, meeting });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  async endMeeting(req: Request, res: Response): Promise<void> {
    try {
      const meeting = await giriVisionService.endMeeting(req.params.roomId, req.body.duration_seconds);
      if (!meeting) { res.status(404).json({ error: 'Réunion introuvable' }); return; }
      res.json({ success: true, meeting });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  },

  async deleteMeeting(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      const userId = user?.id || user?.email;
      const ok = await giriVisionService.deleteMeeting(req.params.roomId, userId);
      res.json({ success: ok });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
};
