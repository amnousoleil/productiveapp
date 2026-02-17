/**
 * MONITORING CONTROLLER - Simplified
 */

import { Request, Response } from 'express';
import { monitoringService } from './monitoring.service.js';

export class MonitoringController {
  async logError(req: Request, res: Response) {
    try {
      const result = await monitoringService.logError({
        ...req.body,
        userId: (req as any).user?.id,
        workspaceId: (req as any).user?.workspace_id,
      });
      res.json({ success: true, errorId: result.id });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getErrors(req: Request, res: Response) {
    try {
      const errors = await monitoringService.getErrors(req.query);
      res.json({ success: true, data: errors });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getErrorById(_req: Request, res: Response) {
    try {
      res.json({ success: true, data: {} });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async resolveError(req: Request, res: Response) {
    try {
      await monitoringService.resolveError(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async getStats(_req: Request, res: Response) {
    try {
      const stats = await monitoringService.getStats();
      res.json({ success: true, data: stats });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  async exportCSV(_req: Request, res: Response) {
    try {
      const csv = await monitoringService.exportCSV();
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=errors.csv');
      res.send(csv);
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

export const monitoringController = new MonitoringController();
