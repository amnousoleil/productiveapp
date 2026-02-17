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
exports.getSignals = getSignals;
exports.getSignalStats = getSignalStats;
exports.createSignal = createSignal;
exports.getProfile = getProfile;
exports.getBehavioralProfile = getBehavioralProfile;
const SignalsService = __importStar(require("./signals.service.js"));
const signals_profile_service_js_1 = require("./signals-profile.service.js");
async function getSignals(req, res) {
    try {
        const userId = req.params.userId;
        const filters = {
            type: req.query.type,
            source: req.query.source,
            from: req.query.from ? new Date(req.query.from) : undefined,
            to: req.query.to ? new Date(req.query.to) : undefined,
            limit: req.query.limit ? parseInt(req.query.limit) : undefined
        };
        const signals = await SignalsService.getSignals(userId, filters);
        res.json({ success: true, data: signals });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ success: false, error: { message } });
    }
}
async function getSignalStats(req, res) {
    try {
        const userId = req.params.userId;
        const stats = await SignalsService.getSignalStats(userId);
        res.json({ success: true, data: stats });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ success: false, error: { message } });
    }
}
async function createSignal(req, res) {
    try {
        const { user_id, workspace_id, signal_type, source_module, source_id, payload, occurred_at } = req.body;
        if (!user_id || !workspace_id || !signal_type || !source_module) {
            res.status(400).json({ success: false, error: { message: 'Missing required fields' } });
            return;
        }
        const signal = await SignalsService.recordSignal(user_id, workspace_id, signal_type, source_module, source_id || null, payload || {}, occurred_at ? new Date(occurred_at) : undefined);
        res.status(201).json({ success: true, data: signal });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ success: false, error: { message } });
    }
}
async function getProfile(req, res) {
    try {
        const userId = req.params.userId;
        const profile = await SignalsService.getProfile(userId);
        if (!profile) {
            res.status(404).json({ success: false, error: { message: 'Profile not found' } });
            return;
        }
        res.json({ success: true, data: profile });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ success: false, error: { message } });
    }
}
async function getBehavioralProfile(req, res) {
    try {
        const userId = req.params.userId;
        const workspaceId = req.query.workspaceId || req.params.workspaceId;
        if (!workspaceId) {
            res.status(400).json({ success: false, error: { message: 'workspaceId required' } });
            return;
        }
        const profile = await (0, signals_profile_service_js_1.computeProfile)(userId, workspaceId);
        res.json({ success: true, data: profile });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ success: false, error: { message } });
    }
}
//# sourceMappingURL=signals.controller.js.map