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
exports.linkInvoice = exports.unbilled = exports.setRate = exports.getRate = exports.report = exports.list = exports.remove = exports.update = exports.create = exports.running = exports.stop = exports.start = void 0;
const svc = __importStar(require("./time-tracking.service.js"));
const start = async (req, res) => {
    try {
        const r = await svc.startTimer(req.params.workspaceId, req.body.member_id, { taskId: req.body.task_id, projectId: req.body.project_id, description: req.body.description, isBillable: req.body.is_billable, hourlyRate: req.body.hourly_rate });
        res.status(201).json(r);
    }
    catch (e) {
        console.error('Time start error:', e);
        res.status(500).json({ error: 'Erreur demarrage chrono' });
    }
};
exports.start = start;
const stop = async (req, res) => {
    try {
        const r = await svc.stopTimer(req.params.workspaceId, req.body.member_id);
        if (!r) {
            res.status(404).json({ error: 'Aucun chrono actif' });
            return;
        }
        res.json(r);
    }
    catch (e) {
        console.error('Time stop error:', e);
        res.status(500).json({ error: 'Erreur arret chrono' });
    }
};
exports.stop = stop;
const running = async (req, res) => {
    try {
        const mid = req.query.member_id;
        const r = await svc.getRunningTimer(req.params.workspaceId, mid);
        res.json(r || { running: false });
    }
    catch (e) {
        console.error('Time running error:', e);
        res.status(500).json({ error: 'Erreur' });
    }
};
exports.running = running;
const create = async (req, res) => {
    try {
        if (!req.body.start_time || !req.body.end_time) {
            res.status(400).json({ error: 'start_time et end_time requis' });
            return;
        }
        const r = await svc.createManualEntry(req.params.workspaceId, req.body.member_id, { taskId: req.body.task_id, projectId: req.body.project_id, description: req.body.description, startTime: req.body.start_time, endTime: req.body.end_time, durationMinutes: req.body.duration_minutes, isBillable: req.body.is_billable, hourlyRate: req.body.hourly_rate });
        res.status(201).json(r);
    }
    catch (e) {
        console.error('Time create error:', e);
        res.status(500).json({ error: 'Erreur creation entree' });
    }
};
exports.create = create;
const update = async (req, res) => {
    try {
        const r = await svc.updateEntry(req.params.workspaceId, req.params.id, req.body);
        if (!r) {
            res.status(404).json({ error: 'Entree non trouvee' });
            return;
        }
        res.json(r);
    }
    catch (e) {
        console.error('Time update error:', e);
        res.status(500).json({ error: 'Erreur mise a jour' });
    }
};
exports.update = update;
const remove = async (req, res) => {
    try {
        const ok = await svc.deleteEntry(req.params.workspaceId, req.params.id);
        if (!ok) {
            res.status(404).json({ error: 'Entree non trouvee' });
            return;
        }
        res.status(204).send();
    }
    catch (e) {
        console.error('Time delete error:', e);
        res.status(500).json({ error: 'Erreur suppression' });
    }
};
exports.remove = remove;
const list = async (req, res) => {
    try {
        const r = await svc.listEntries(req.params.workspaceId, {
            memberId: req.query.member_id, taskId: req.query.task_id, projectId: req.query.project_id,
            dateFrom: req.query.date_from, dateTo: req.query.date_to,
            isBillable: req.query.is_billable === 'true' ? true : req.query.is_billable === 'false' ? false : undefined,
            page: req.query.page ? parseInt(req.query.page, 10) : 1, limit: req.query.limit ? parseInt(req.query.limit, 10) : 20,
        });
        res.json(r);
    }
    catch (e) {
        console.error('Time list error:', e);
        res.status(500).json({ error: 'Erreur liste' });
    }
};
exports.list = list;
const report = async (req, res) => {
    try {
        const r = await svc.getTimeReport(req.params.workspaceId, {
            memberId: req.query.member_id, projectId: req.query.project_id,
            dateFrom: req.query.date_from, dateTo: req.query.date_to,
            groupBy: req.query.group_by || 'project',
        });
        res.json(r);
    }
    catch (e) {
        console.error('Time report error:', e);
        res.status(500).json({ error: 'Erreur rapport' });
    }
};
exports.report = report;
const getRate = async (req, res) => {
    try {
        const mid = req.query.member_id;
        const r = await svc.getMemberRate(req.params.workspaceId, mid);
        res.json(r || { hourly_rate: 0, currency: 'EUR' });
    }
    catch (e) {
        console.error('Rate get error:', e);
        res.status(500).json({ error: 'Erreur' });
    }
};
exports.getRate = getRate;
const setRate = async (req, res) => {
    try {
        if (!req.body.member_id || !req.body.hourly_rate) {
            res.status(400).json({ error: 'member_id et hourly_rate requis' });
            return;
        }
        const r = await svc.setMemberRate(req.params.workspaceId, req.body.member_id, req.body.hourly_rate, req.body.currency);
        res.json(r);
    }
    catch (e) {
        console.error('Rate set error:', e);
        res.status(500).json({ error: 'Erreur' });
    }
};
exports.setRate = setRate;
const unbilled = async (req, res) => {
    try {
        const r = await svc.getUnbilledEntries(req.params.workspaceId, { memberId: req.query.member_id, projectId: req.query.project_id });
        res.json(r);
    }
    catch (e) {
        console.error('Unbilled error:', e);
        res.status(500).json({ error: 'Erreur' });
    }
};
exports.unbilled = unbilled;
const linkInvoice = async (req, res) => {
    try {
        if (!req.body.entry_ids?.length || !req.body.invoice_id) {
            res.status(400).json({ error: 'entry_ids et invoice_id requis' });
            return;
        }
        const cnt = await svc.linkEntriesToInvoice(req.params.workspaceId, req.body.entry_ids, req.body.invoice_id);
        res.json({ linked: cnt });
    }
    catch (e) {
        console.error('Link error:', e);
        res.status(500).json({ error: 'Erreur' });
    }
};
exports.linkInvoice = linkInvoice;
//# sourceMappingURL=time-tracking.controller.js.map