import { Router } from 'express';
import { reportsController } from './reports.controller.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { workspaceMiddleware } from '../../middleware/workspace.middleware.js';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// List reports
router.get(
  '/workspace/:workspaceId',
  workspaceMiddleware,
  reportsController.getReports.bind(reportsController)
);

// Get summary
router.get(
  '/workspace/:workspaceId/summary',
  workspaceMiddleware,
  reportsController.getSummary.bind(reportsController)
);

// Generate report
router.post(
  '/workspace/:workspaceId/generate',
  workspaceMiddleware,
  reportsController.generateReport.bind(reportsController)
);

// Get single report (must be after other routes to avoid conflicts)
router.get(
  '/workspace/:workspaceId/:reportId',
  workspaceMiddleware,
  reportsController.getReportById.bind(reportsController)
);

export default router;
