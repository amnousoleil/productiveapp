// =============================================
// JOURNAL MODULE - ROUTES
// =============================================

import { Router } from 'express';
import { JournalController } from './journal.controller';
import { JournalService } from './journal.service';
import { Pool } from 'pg';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { workspaceMiddleware } from '../../middleware/workspace.middleware.js';

export function createJournalRouter(pool: Pool): Router {
  const router = Router();
  const journalService = new JournalService(pool);
  const journalController = new JournalController(journalService);

  // All routes require authentication
  router.use(authMiddleware);

  // Workspace-scoped routes (require workspace context)
  router.get('/workspace/:workspaceId', workspaceMiddleware, journalController.getEntries);
  router.post('/workspace/:workspaceId', workspaceMiddleware, journalController.upsertEntry);
  router.get('/workspace/:workspaceId/statistics', workspaceMiddleware, journalController.getStatistics);
  router.get('/workspace/:workspaceId/date/:date', workspaceMiddleware, journalController.getEntryByDate);
  router.get('/workspace/:workspaceId/:id', workspaceMiddleware, journalController.getEntryById);
  router.put('/workspace/:workspaceId/:id', workspaceMiddleware, journalController.updateEntry);
  router.delete('/workspace/:workspaceId/:id', workspaceMiddleware, journalController.deleteEntry);

  return router;
}
