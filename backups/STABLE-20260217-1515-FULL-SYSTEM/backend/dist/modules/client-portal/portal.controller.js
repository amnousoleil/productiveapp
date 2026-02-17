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
exports.portalAccess = exports.revokeToken = exports.listTokens = exports.generateToken = void 0;
const svc = __importStar(require("./portal.service.js"));
// Admin endpoints (workspace-scoped)
const generateToken = async (req, res) => {
    try {
        if (!req.body.contact_id) {
            res.status(400).json({ error: 'contact_id requis' });
            return;
        }
        res.status(201).json(await svc.generateToken(req.params.workspaceId, req.body.contact_id, req.body.expires_in_days));
    }
    catch (e) {
        res.status(500).json({ error: 'Erreur' });
    }
};
exports.generateToken = generateToken;
const listTokens = async (req, res) => { try {
    res.json(await svc.listPortalTokens(req.params.workspaceId));
}
catch (e) {
    res.status(500).json({ error: 'Erreur' });
} };
exports.listTokens = listTokens;
const revokeToken = async (req, res) => {
    try {
        const r = await svc.revokeToken(req.params.workspaceId, req.params.id);
        if (!r) {
            res.status(404).json({ error: 'Token non trouve' });
            return;
        }
        res.json(r);
    }
    catch (e) {
        res.status(500).json({ error: 'Erreur' });
    }
};
exports.revokeToken = revokeToken;
// Public endpoints (token-based, no auth)
const portalAccess = async (req, res) => {
    try {
        const session = await svc.validateToken(req.params.token);
        if (!session) {
            res.status(401).json({ error: 'Token invalide ou expire' });
            return;
        }
        const dashboard = await svc.getPortalDashboard(session.workspace_id, session.contact_id);
        res.json({ ...dashboard, contact_name: session.contact_name, contact_email: session.contact_email, contact_company: session.contact_company });
    }
    catch (e) {
        res.status(500).json({ error: 'Erreur' });
    }
};
exports.portalAccess = portalAccess;
//# sourceMappingURL=portal.controller.js.map