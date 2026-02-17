import { Router } from 'express';
import { auditController } from './audit.controller.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { workspaceMiddleware } from '../../middleware/workspace.middleware.js';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Human Design (user-level, no workspace needed)
router.get('/human-design', auditController.getHumanDesign.bind(auditController));
router.post('/human-design', auditController.createHumanDesign.bind(auditController));
router.put('/human-design', auditController.updateHumanDesign.bind(auditController));

// Journal entries (require workspace context)
router.get('/workspace/:workspaceId/journal', workspaceMiddleware, auditController.listJournalEntries.bind(auditController));
router.post('/workspace/:workspaceId/journal', workspaceMiddleware, auditController.createJournalEntry.bind(auditController));
router.get('/workspace/:workspaceId/journal/stats', workspaceMiddleware, auditController.getJournalStats.bind(auditController));
router.get('/journal/:entryId', auditController.getJournalEntry.bind(auditController));
router.put('/journal/:entryId', auditController.updateJournalEntry.bind(auditController));
router.delete('/journal/:entryId', auditController.deleteJournalEntry.bind(auditController));

// Reports (require workspace context)
router.get('/workspace/:workspaceId/reports', workspaceMiddleware, auditController.listReports.bind(auditController));
router.post('/workspace/:workspaceId/reports', workspaceMiddleware, auditController.generateReport.bind(auditController));
router.get('/reports/:reportId', auditController.getReport.bind(auditController));
router.delete('/reports/:reportId', auditController.deleteReport.bind(auditController));

// Psycho Audits (require workspace context)
router.get('/workspace/:workspaceId/psycho', workspaceMiddleware, auditController.listPsychoAudits.bind(auditController));
router.post('/workspace/:workspaceId/psycho', workspaceMiddleware, auditController.createPsychoAudit.bind(auditController));

export default router;
