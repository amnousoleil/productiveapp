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
exports.getConfig = getConfig;
exports.updateConfig = updateConfig;
exports.uploadLogo = uploadLogo;
exports.deleteLogo = deleteLogo;
const configService = __importStar(require("./config.service.js"));
// Helper pour récupérer workspace
async function getWorkspaceId(req) {
    if (req.workspace?.id)
        return req.workspace.id;
    if (req.user?.id)
        return await configService.getUserFirstWorkspace(req.user.id);
    return null;
}
// GET /api/v1/config - Récupérer config workspace
async function getConfig(req, res) {
    try {
        const workspaceId = await getWorkspaceId(req);
        if (!workspaceId) {
            res.status(400).json({ error: 'No workspace found' });
            return;
        }
        const config = await configService.getWorkspaceConfig(workspaceId);
        res.json({ success: true, data: config });
    }
    catch (error) {
        console.error('Get config error:', error);
        res.status(500).json({ error: 'Failed to get config' });
    }
}
// PUT /api/v1/config - Modifier config
async function updateConfig(req, res) {
    try {
        const workspaceId = await getWorkspaceId(req);
        if (!workspaceId) {
            res.status(400).json({ error: 'No workspace found' });
            return;
        }
        const { name, primary_color, default_theme, timezone, locale } = req.body;
        const updated = await configService.updateWorkspaceConfig(workspaceId, {
            name,
            primary_color,
            default_theme,
            timezone,
            locale
        });
        res.json({ success: true, data: updated });
    }
    catch (error) {
        console.error('Update config error:', error);
        res.status(500).json({ error: 'Failed to update config' });
    }
}
// POST /api/v1/config/upload-logo - Upload logo
async function uploadLogo(req, res) {
    try {
        const workspaceId = await getWorkspaceId(req);
        const file = req.file;
        if (!workspaceId || !file) {
            res.status(400).json({ error: 'Missing workspace or file' });
            return;
        }
        // Upload vers local storage
        const logoUrl = await configService.uploadLogoToLocal(file);
        // Sauvegarder URL en DB
        await configService.updateWorkspaceConfig(workspaceId, {
            logo_url: logoUrl
        });
        res.json({ success: true, data: { logo_url: logoUrl } });
    }
    catch (error) {
        console.error('Upload logo error:', error);
        res.status(500).json({ error: 'Failed to upload logo' });
    }
}
// DELETE /api/v1/config/logo - Supprimer logo
async function deleteLogo(req, res) {
    try {
        const workspaceId = await getWorkspaceId(req);
        if (!workspaceId) {
            res.status(400).json({ error: 'No workspace found' });
            return;
        }
        await configService.updateWorkspaceConfig(workspaceId, {
            logo_url: null
        });
        res.json({ success: true });
    }
    catch (error) {
        console.error('Delete logo error:', error);
        res.status(500).json({ error: 'Failed to delete logo' });
    }
}
//# sourceMappingURL=config.controller.js.map