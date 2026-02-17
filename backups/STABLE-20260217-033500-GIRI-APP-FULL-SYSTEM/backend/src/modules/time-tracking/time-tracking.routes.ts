/**
 * Module Time Tracking - Routes
 */
import { Router } from 'express';
import * as ctrl from './time-tracking.controller.js';

const router = Router({ mergeParams: true });

router.post('/start', ctrl.start);
router.post('/stop', ctrl.stop);
router.get('/running', ctrl.running);
router.get('/entries', ctrl.list);
router.post('/entries', ctrl.create);
router.put('/entries/:id', ctrl.update);
router.delete('/entries/:id', ctrl.remove);
router.get('/report', ctrl.report);
router.get('/rate', ctrl.getRate);
router.post('/rate', ctrl.setRate);
router.get('/unbilled', ctrl.unbilled);
router.post('/link-invoice', ctrl.linkInvoice);

export default router;
