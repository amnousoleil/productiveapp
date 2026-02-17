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
exports.overdueReport = exports.cancel = exports.list = exports.process = exports.schedule = exports.updateSettings = exports.getSettings = void 0;
const svc = __importStar(require("./relances.service.js"));
const getSettings = async (req, res) => { try {
    res.json(await svc.getSettings(req.params.workspaceId));
}
catch (e) {
    res.status(500).json({ error: 'Erreur' });
} };
exports.getSettings = getSettings;
const updateSettings = async (req, res) => { try {
    res.json(await svc.updateSettings(req.params.workspaceId, req.body));
}
catch (e) {
    res.status(500).json({ error: 'Erreur' });
} };
exports.updateSettings = updateSettings;
const schedule = async (req, res) => { try {
    res.json(await svc.scheduleReminders(req.params.workspaceId));
}
catch (e) {
    console.error('Relances schedule:', e);
    res.status(500).json({ error: 'Erreur' });
} };
exports.schedule = schedule;
const process = async (_req, res) => { try {
    res.json(await svc.processReminders());
}
catch (e) {
    console.error('Relances process:', e);
    res.status(500).json({ error: 'Erreur' });
} };
exports.process = process;
const list = async (req, res) => { try {
    res.json(await svc.listReminders(req.params.workspaceId, { invoiceId: req.query.invoice_id, status: req.query.status, page: req.query.page ? parseInt(req.query.page) : 1, limit: req.query.limit ? parseInt(req.query.limit) : 20 }));
}
catch (e) {
    res.status(500).json({ error: 'Erreur' });
} };
exports.list = list;
const cancel = async (req, res) => { try {
    const r = await svc.cancelReminder(req.params.workspaceId, req.params.id);
    if (!r) {
        res.status(404).json({ error: 'Relance non trouvee ou deja envoyee' });
        return;
    }
    res.json(r);
}
catch (e) {
    res.status(500).json({ error: 'Erreur' });
} };
exports.cancel = cancel;
const overdueReport = async (req, res) => { try {
    res.json(await svc.getOverdueReport(req.params.workspaceId));
}
catch (e) {
    res.status(500).json({ error: 'Erreur' });
} };
exports.overdueReport = overdueReport;
//# sourceMappingURL=relances.controller.js.map