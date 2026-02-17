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
exports.syncInvoices = exports.syncTasks = exports.upcoming = exports.remove = exports.update = exports.create = exports.get = exports.list = void 0;
const svc = __importStar(require("./calendar.service.js"));
const list = async (req, res) => {
    try {
        if (!req.query.start_date || !req.query.end_date) {
            res.status(400).json({ error: 'start_date et end_date requis' });
            return;
        }
        res.json(await svc.listEvents(req.params.workspaceId, { memberId: req.query.member_id, startDate: req.query.start_date, endDate: req.query.end_date, eventType: req.query.event_type }));
    }
    catch (e) {
        console.error('Calendar list:', e);
        res.status(500).json({ error: 'Erreur' });
    }
};
exports.list = list;
const get = async (req, res) => {
    try {
        const r = await svc.getEvent(req.params.workspaceId, req.params.id);
        if (!r) {
            res.status(404).json({ error: 'Evenement non trouve' });
            return;
        }
        res.json(r);
    }
    catch (e) {
        res.status(500).json({ error: 'Erreur' });
    }
};
exports.get = get;
const create = async (req, res) => {
    try {
        if (!req.body.title || !req.body.start_date) {
            res.status(400).json({ error: 'title et start_date requis' });
            return;
        }
        // FIX: Récupérer member_id de manière flexible (req.user > req.body > null)
        // Ne PAS retourner 401 si manquant, laisser le service gérer avec NULL
        const memberId = req.user?.id || req.body.member_id || null;
        res.status(201).json(await svc.createEvent(req.params.workspaceId, memberId, req.body));
    }
    catch (e) {
        console.error('Calendar create:', e);
        res.status(500).json({ error: 'Erreur' });
    }
};
exports.create = create;
const update = async (req, res) => {
    try {
        const r = await svc.updateEvent(req.params.workspaceId, req.params.id, req.body);
        if (!r) {
            res.status(404).json({ error: 'Evenement non trouve' });
            return;
        }
        res.json(r);
    }
    catch (e) {
        res.status(500).json({ error: 'Erreur' });
    }
};
exports.update = update;
const remove = async (req, res) => {
    try {
        const ok = await svc.deleteEvent(req.params.workspaceId, req.params.id);
        if (!ok) {
            res.status(404).json({ error: 'Evenement non trouve' });
            return;
        }
        res.status(204).send();
    }
    catch (e) {
        res.status(500).json({ error: 'Erreur' });
    }
};
exports.remove = remove;
const upcoming = async (req, res) => {
    try {
        res.json(await svc.getUpcoming(req.params.workspaceId, req.query.member_id || '', parseInt(req.query.days) || 7));
    }
    catch (e) {
        res.status(500).json({ error: 'Erreur' });
    }
};
exports.upcoming = upcoming;
const syncTasks = async (req, res) => {
    try {
        res.json(await svc.syncTaskDeadlines(req.params.workspaceId));
    }
    catch (e) {
        console.error('Calendar sync tasks:', e);
        res.status(500).json({ error: 'Erreur' });
    }
};
exports.syncTasks = syncTasks;
const syncInvoices = async (req, res) => {
    try {
        res.json(await svc.syncInvoiceDueDates(req.params.workspaceId));
    }
    catch (e) {
        console.error('Calendar sync invoices:', e);
        res.status(500).json({ error: 'Erreur' });
    }
};
exports.syncInvoices = syncInvoices;
//# sourceMappingURL=calendar.controller.js.map