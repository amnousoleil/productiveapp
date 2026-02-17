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
exports.signContract = exports.sendForSignature = exports.deleteContract = exports.updateContract = exports.getContract = exports.createContract = exports.listContracts = exports.deleteTemplate = exports.updateTemplate = exports.createTemplate = exports.listTemplates = void 0;
const svc = __importStar(require("./contracts.service.js"));
const listTemplates = async (req, res) => { try {
    res.json(await svc.listTemplates(req.params.workspaceId));
}
catch (e) {
    res.status(500).json({ error: 'Erreur' });
} };
exports.listTemplates = listTemplates;
const createTemplate = async (req, res) => { try {
    if (!req.body.name || !req.body.content) {
        res.status(400).json({ error: 'name et content requis' });
        return;
    }
    res.status(201).json(await svc.createTemplate(req.params.workspaceId, req.body));
}
catch (e) {
    res.status(500).json({ error: 'Erreur' });
} };
exports.createTemplate = createTemplate;
const updateTemplate = async (req, res) => { try {
    const r = await svc.updateTemplate(req.params.workspaceId, req.params.id, req.body);
    if (!r) {
        res.status(404).json({ error: 'Template non trouve' });
        return;
    }
    res.json(r);
}
catch (e) {
    res.status(500).json({ error: 'Erreur' });
} };
exports.updateTemplate = updateTemplate;
const deleteTemplate = async (req, res) => { try {
    const ok = await svc.deleteTemplate(req.params.workspaceId, req.params.id);
    if (!ok) {
        res.status(404).json({ error: 'Template non trouve' });
        return;
    }
    res.status(204).send();
}
catch (e) {
    res.status(500).json({ error: 'Erreur' });
} };
exports.deleteTemplate = deleteTemplate;
const listContracts = async (req, res) => { try {
    res.json(await svc.listContracts(req.params.workspaceId, { status: req.query.status, contactId: req.query.contact_id, page: req.query.page ? parseInt(req.query.page) : 1, limit: req.query.limit ? parseInt(req.query.limit) : 20 }));
}
catch (e) {
    res.status(500).json({ error: 'Erreur' });
} };
exports.listContracts = listContracts;
const createContract = async (req, res) => { try {
    if (!req.body.title || !req.body.content) {
        res.status(400).json({ error: 'title et content requis' });
        return;
    }
    res.status(201).json(await svc.createContract(req.params.workspaceId, req.body));
}
catch (e) {
    res.status(500).json({ error: 'Erreur' });
} };
exports.createContract = createContract;
const getContract = async (req, res) => { try {
    const r = await svc.getContract(req.params.workspaceId, req.params.id);
    if (!r) {
        res.status(404).json({ error: 'Contrat non trouve' });
        return;
    }
    res.json(r);
}
catch (e) {
    res.status(500).json({ error: 'Erreur' });
} };
exports.getContract = getContract;
const updateContract = async (req, res) => { try {
    const r = await svc.updateContract(req.params.workspaceId, req.params.id, req.body);
    if (!r) {
        res.status(404).json({ error: 'Contrat non trouve' });
        return;
    }
    res.json(r);
}
catch (e) {
    res.status(500).json({ error: 'Erreur' });
} };
exports.updateContract = updateContract;
const deleteContract = async (req, res) => { try {
    const ok = await svc.deleteContract(req.params.workspaceId, req.params.id);
    if (!ok) {
        res.status(404).json({ error: 'Contrat non trouve ou non draft' });
        return;
    }
    res.status(204).send();
}
catch (e) {
    res.status(500).json({ error: 'Erreur' });
} };
exports.deleteContract = deleteContract;
const sendForSignature = async (req, res) => { try {
    if (!req.body.signer_email || !req.body.signer_name) {
        res.status(400).json({ error: 'signer_email et signer_name requis' });
        return;
    }
    res.json(await svc.sendForSignature(req.params.workspaceId, req.params.id, req.body.signer_email, req.body.signer_name));
}
catch (e) {
    res.status(e.message?.includes('non trouve') ? 404 : 500).json({ error: e.message || 'Erreur' });
} };
exports.sendForSignature = sendForSignature;
const signContract = async (req, res) => { try {
    const r = await svc.signContract(req.params.token || req.body.token);
    res.json(r);
}
catch (e) {
    res.status(400).json({ error: e.message || 'Erreur' });
} };
exports.signContract = signContract;
//# sourceMappingURL=contracts.controller.js.map