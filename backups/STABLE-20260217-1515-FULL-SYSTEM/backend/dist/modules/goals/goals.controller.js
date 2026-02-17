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
exports.dashboard = exports.refresh = exports.remove = exports.update = exports.create = exports.get = exports.list = void 0;
const svc = __importStar(require("./goals.service.js"));
const list = async (req, res) => { try {
    res.json(await svc.listGoals(req.params.workspaceId, { type: req.query.type, status: req.query.status }));
}
catch (e) {
    res.status(500).json({ error: 'Erreur' });
} };
exports.list = list;
const get = async (req, res) => { try {
    const r = await svc.getGoal(req.params.workspaceId, req.params.id);
    if (!r) {
        res.status(404).json({ error: 'Objectif non trouve' });
        return;
    }
    res.json(r);
}
catch (e) {
    res.status(500).json({ error: 'Erreur' });
} };
exports.get = get;
const create = async (req, res) => { try {
    if (!req.body.title || !req.body.type || !req.body.target_amount) {
        res.status(400).json({ error: 'title, type et target_amount requis' });
        return;
    }
    res.status(201).json(await svc.createGoal(req.params.workspaceId, req.body.member_id || '', req.body));
}
catch (e) {
    res.status(500).json({ error: 'Erreur' });
} };
exports.create = create;
const update = async (req, res) => { try {
    const r = await svc.updateGoal(req.params.workspaceId, req.params.id, req.body);
    if (!r) {
        res.status(404).json({ error: 'Objectif non trouve' });
        return;
    }
    res.json(r);
}
catch (e) {
    res.status(500).json({ error: 'Erreur' });
} };
exports.update = update;
const remove = async (req, res) => { try {
    const ok = await svc.deleteGoal(req.params.workspaceId, req.params.id);
    if (!ok) {
        res.status(404).json({ error: 'Objectif non trouve' });
        return;
    }
    res.status(204).send();
}
catch (e) {
    res.status(500).json({ error: 'Erreur' });
} };
exports.remove = remove;
const refresh = async (req, res) => { try {
    const r = await svc.refreshGoalProgress(req.params.workspaceId, req.params.id);
    if (!r) {
        res.status(404).json({ error: 'Objectif non trouve' });
        return;
    }
    res.json(r);
}
catch (e) {
    res.status(500).json({ error: 'Erreur' });
} };
exports.refresh = refresh;
const dashboard = async (req, res) => { try {
    res.json(await svc.getDashboard(req.params.workspaceId));
}
catch (e) {
    res.status(500).json({ error: 'Erreur' });
} };
exports.dashboard = dashboard;
//# sourceMappingURL=goals.controller.js.map