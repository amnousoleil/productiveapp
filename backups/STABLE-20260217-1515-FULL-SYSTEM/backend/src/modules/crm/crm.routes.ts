/**
 * Module CRM Pipeline - Routes
 */
import { Router } from 'express';
import * as ctrl from './crm.controller.js';

const router = Router({ mergeParams: true });

router.get('/pipelines', ctrl.pipelines);
router.post('/pipelines', ctrl.createPipeline);
router.put('/pipelines/:id', ctrl.updatePipeline);
router.get('/deals/board', ctrl.board);
router.get('/deals', ctrl.listDeals);
router.post('/deals', ctrl.createDeal);
router.get('/deals/:id', ctrl.getDeal);
router.put('/deals/:id', ctrl.updateDealCtrl);
router.delete('/deals/:id', ctrl.deleteDeal);
router.post('/deals/:id/move', ctrl.moveDeal);
router.post('/deals/:id/convert', ctrl.convertDealCtrl);
router.get('/deals/:dealId/activities', ctrl.activities);
router.post('/deals/:dealId/activities', ctrl.addActivity);
router.get('/stats', ctrl.stats);

export default router;
