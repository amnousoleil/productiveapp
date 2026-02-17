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
 * Module Time Tracking - Routes
 */
const express_1 = require("express");
const ctrl = __importStar(require("./time-tracking.controller.js"));
const router = (0, express_1.Router)({ mergeParams: true });
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
exports.default = router;
//# sourceMappingURL=time-tracking.routes.js.map