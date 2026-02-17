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
exports.autoCalc = exports.annualSummary = exports.updateDeclaration = exports.createDeclaration = exports.listDeclarations = exports.simulate = void 0;
const svc = __importStar(require("./urssaf.service.js"));
const simulate = async (req, res) => {
    try {
        if (!req.body.ca || !req.body.activity_type) {
            res.status(400).json({ error: 'ca et activity_type requis' });
            return;
        }
        res.json(await svc.simulateCotisations(req.params.workspaceId, req.body));
    }
    catch (e) {
        res.status(500).json({ error: 'Erreur' });
    }
};
exports.simulate = simulate;
const listDeclarations = async (req, res) => { try {
    res.json(await svc.getDeclarations(req.params.workspaceId));
}
catch (e) {
    res.status(500).json({ error: 'Erreur' });
} };
exports.listDeclarations = listDeclarations;
const createDeclaration = async (req, res) => {
    try {
        if (!req.body.quarter || !req.body.year || !req.body.activity_type || req.body.chiffre_affaires === undefined) {
            res.status(400).json({ error: 'quarter, year, activity_type et chiffre_affaires requis' });
            return;
        }
        res.status(201).json(await svc.createDeclaration(req.params.workspaceId, req.body.member_id || '', req.body));
    }
    catch (e) {
        console.error('URSSAF create:', e);
        res.status(500).json({ error: 'Erreur' });
    }
};
exports.createDeclaration = createDeclaration;
const updateDeclaration = async (req, res) => { try {
    const r = await svc.updateDeclaration(req.params.workspaceId, req.params.id, req.body);
    if (!r) {
        res.status(404).json({ error: 'Declaration non trouvee' });
        return;
    }
    res.json(r);
}
catch (e) {
    res.status(500).json({ error: 'Erreur' });
} };
exports.updateDeclaration = updateDeclaration;
const annualSummary = async (req, res) => { try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    res.json(await svc.getAnnualSummary(req.params.workspaceId, year));
}
catch (e) {
    res.status(500).json({ error: 'Erreur' });
} };
exports.annualSummary = annualSummary;
const autoCalc = async (req, res) => {
    try {
        if (!req.body.quarter || !req.body.year) {
            res.status(400).json({ error: 'quarter et year requis' });
            return;
        }
        res.json(await svc.autoCalculateFromInvoices(req.params.workspaceId, req.body.quarter, req.body.year));
    }
    catch (e) {
        res.status(500).json({ error: 'Erreur' });
    }
};
exports.autoCalc = autoCalc;
//# sourceMappingURL=urssaf.controller.js.map