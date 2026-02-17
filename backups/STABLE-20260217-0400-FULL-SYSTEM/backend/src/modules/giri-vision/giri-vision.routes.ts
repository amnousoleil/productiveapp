import { Router } from 'express';
import { giriVisionController } from './giri-vision.controller.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { workspaceMiddleware } from '../../middleware/workspace.middleware.js';

const router = Router();
router.use(authMiddleware);

// POST /api/giri-vision/meetings
router.post('/meetings', workspaceMiddleware, giriVisionController.createMeeting);

// GET /api/giri-vision/meetings
router.get('/meetings', workspaceMiddleware, giriVisionController.getMeetings);

// GET /api/giri-vision/meetings/:roomId
router.get('/meetings/:roomId', giriVisionController.getMeeting);

// POST /api/giri-vision/meetings/:roomId/join
router.post('/meetings/:roomId/join', giriVisionController.joinMeeting);

// POST /api/giri-vision/meetings/:roomId/end
router.post('/meetings/:roomId/end', giriVisionController.endMeeting);

// DELETE /api/giri-vision/meetings/:roomId
router.delete('/meetings/:roomId', giriVisionController.deleteMeeting);

export default router;
