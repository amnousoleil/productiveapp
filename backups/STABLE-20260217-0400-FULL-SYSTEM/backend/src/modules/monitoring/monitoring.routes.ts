/**
 * MONITORING ROUTES
 * API routes for frontend error monitoring
 */

import { Router } from 'express';
import { monitoringController } from './monitoring.controller.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Log error (POST)
router.post('/errors/log', (req, res) => monitoringController.logError(req, res));

// Get errors (GET with filters)
router.get('/errors', (req, res) => monitoringController.getErrors(req, res));

// Get stats
router.get('/stats', (req, res) => monitoringController.getStats(req, res));

// Export CSV
router.get('/errors/export/csv', (req, res) => monitoringController.exportCSV(req, res));

// Get single error by ID
router.get('/errors/:id', (req, res) => monitoringController.getErrorById(req, res));

// Resolve error
router.post('/errors/:id/resolve', (req, res) => monitoringController.resolveError(req, res));

export default router;
