"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Module CRM Pipeline - Routes
 */
const express_1 = require("express");
const ctrl = __importStar(require("./crm.controller.js"));
const router = (0, express_1.Router)({ mergeParams: true });
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
exports.default = router;
//# sourceMappingURL=crm.routes.js.map