import { Router } from 'express';
import * as ctrl from './calendar-agent.controller.js';

const router = Router({ mergeParams: true });

router.post('/parse', ctrl.parseQuery);
router.post('/create', ctrl.createFromQuery);
router.get('/available-slots', ctrl.availableSlots);
router.get('/suggestions/:eventId', ctrl.suggestions);

export default router;
