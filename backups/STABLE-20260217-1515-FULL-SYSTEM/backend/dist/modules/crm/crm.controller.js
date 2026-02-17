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
exports.stats = exports.addActivity = exports.activities = exports.convertDealCtrl = exports.moveDeal = exports.deleteDeal = exports.updateDealCtrl = exports.createDeal = exports.getDeal = exports.listDeals = exports.board = exports.updatePipeline = exports.createPipeline = exports.pipelines = void 0;
const svc = __importStar(require("./crm.service.js"));
const pipelines = async (req, res) => {
    try {
        res.json(await svc.getPipelines(req.params.workspaceId));
    }
    catch (e) {
        console.error('CRM pipelines error:', e);
        res.status(500).json({ error: 'Erreur' });
    }
};
exports.pipelines = pipelines;
const createPipeline = async (req, res) => {
    try {
        if (!req.body.name) {
            res.status(400).json({ error: 'name requis' });
            return;
        }
        res.status(201).json(await svc.createPipeline(req.params.workspaceId, req.body));
    }
    catch (e) {
        console.error('CRM create pipeline:', e);
        res.status(500).json({ error: 'Erreur' });
    }
};
exports.createPipeline = createPipeline;
const updatePipeline = async (req, res) => {
    try {
        const r = await svc.updatePipeline(req.params.workspaceId, req.params.id, req.body);
        if (!r) {
            res.status(404).json({ error: 'Pipeline non trouve' });
            return;
        }
        res.json(r);
    }
    catch (e) {
        console.error('CRM update pipeline:', e);
        res.status(500).json({ error: 'Erreur' });
    }
};
exports.updatePipeline = updatePipeline;
const board = async (req, res) => {
    try {
        res.json(await svc.getDealBoard(req.params.workspaceId, req.query.pipeline_id));
    }
    catch (e) {
        console.error('CRM board error:', e);
        res.status(500).json({ error: 'Erreur' });
    }
};
exports.board = board;
const listDeals = async (req, res) => {
    try {
        res.json(await svc.listDeals(req.params.workspaceId, { stage: req.query.stage, contactId: req.query.contact_id, memberId: req.query.member_id, search: req.query.search, page: req.query.page ? parseInt(req.query.page) : 1, limit: req.query.limit ? parseInt(req.query.limit) : 20 }));
    }
    catch (e) {
        console.error('CRM list deals:', e);
        res.status(500).json({ error: 'Erreur' });
    }
};
exports.listDeals = listDeals;
const getDeal = async (req, res) => {
    try {
        const r = await svc.getDeal(req.params.workspaceId, req.params.id);
        if (!r) {
            res.status(404).json({ error: 'Deal non trouve' });
            return;
        }
        res.json(r);
    }
    catch (e) {
        console.error('CRM get deal:', e);
        res.status(500).json({ error: 'Erreur' });
    }
};
exports.getDeal = getDeal;
const createDeal = async (req, res) => {
    try {
        if (!req.body.title) {
            res.status(400).json({ error: 'title requis' });
            return;
        }
        res.status(201).json(await svc.createDeal(req.params.workspaceId, req.body));
    }
    catch (e) {
        console.error('CRM create deal:', e);
        res.status(500).json({ error: 'Erreur' });
    }
};
exports.createDeal = createDeal;
const updateDealCtrl = async (req, res) => {
    try {
        const r = await svc.updateDeal(req.params.workspaceId, req.params.id, req.body);
        if (!r) {
            res.status(404).json({ error: 'Deal non trouve' });
            return;
        }
        res.json(r);
    }
    catch (e) {
        console.error('CRM update deal:', e);
        res.status(500).json({ error: 'Erreur' });
    }
};
exports.updateDealCtrl = updateDealCtrl;
const deleteDeal = async (req, res) => {
    try {
        const ok = await svc.deleteDeal(req.params.workspaceId, req.params.id);
        if (!ok) {
            res.status(404).json({ error: 'Deal non trouve' });
            return;
        }
        res.status(204).send();
    }
    catch (e) {
        console.error('CRM delete deal:', e);
        res.status(500).json({ error: 'Erreur' });
    }
};
exports.deleteDeal = deleteDeal;
const moveDeal = async (req, res) => {
    try {
        if (!req.body.stage) {
            res.status(400).json({ error: 'stage requis' });
            return;
        }
        const r = await svc.moveDeal(req.params.workspaceId, req.params.id, req.body.stage, req.body.probability);
        if (!r) {
            res.status(404).json({ error: 'Deal non trouve' });
            return;
        }
        res.json(r);
    }
    catch (e) {
        console.error('CRM move deal:', e);
        res.status(500).json({ error: 'Erreur' });
    }
};
exports.moveDeal = moveDeal;
const convertDealCtrl = async (req, res) => {
    try {
        const r = await svc.convertDeal(req.params.workspaceId, req.params.id);
        res.json(r);
    }
    catch (e) {
        console.error('CRM convert deal:', e);
        res.status(e.message?.includes('non trouve') ? 404 : 400).json({ error: e.message || 'Erreur' });
    }
};
exports.convertDealCtrl = convertDealCtrl;
const activities = async (req, res) => {
    try {
        res.json(await svc.listActivities(req.params.workspaceId, req.params.dealId));
    }
    catch (e) {
        console.error('CRM activities:', e);
        res.status(500).json({ error: 'Erreur' });
    }
};
exports.activities = activities;
const addActivity = async (req, res) => {
    try {
        if (!req.body.type || !req.body.title) {
            res.status(400).json({ error: 'type et title requis' });
            return;
        }
        res.status(201).json(await svc.addActivity(req.params.workspaceId, req.params.dealId, req.body));
    }
    catch (e) {
        console.error('CRM add activity:', e);
        res.status(e.message?.includes('non trouve') ? 404 : 500).json({ error: e.message || 'Erreur' });
    }
};
exports.addActivity = addActivity;
const stats = async (req, res) => {
    try {
        res.json(await svc.getStats(req.params.workspaceId));
    }
    catch (e) {
        console.error('CRM stats:', e);
        res.status(500).json({ error: 'Erreur' });
    }
};
exports.stats = stats;
//# sourceMappingURL=crm.controller.js.map