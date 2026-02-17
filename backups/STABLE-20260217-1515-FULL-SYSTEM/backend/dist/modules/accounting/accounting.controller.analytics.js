"use strict";
/**
 * Module Comptabilité - Controller Analytics & Catégories
 * @description Handlers Express pour analytics, catégories et exports
 */
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
exports.initWorkspace = exports.generateExport = exports.getTVASummary = exports.getMonthlyAnalytics = exports.getDashboard = exports.createCategory = exports.listCategories = void 0;
const service = __importStar(require("./accounting.service.js"));
const analytics = __importStar(require("./accounting.analytics.js"));
const exportService = __importStar(require("./accounting.export.js"));
// ============================================
// CATÉGORIES
// ============================================
const listCategories = async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const categories = await service.listCategories(workspaceId);
        res.json(categories);
    }
    catch (error) {
        console.error('Erreur liste catégories:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des catégories' });
    }
};
exports.listCategories = listCategories;
const createCategory = async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const data = req.body;
        if (!data.name || !data.type) {
            res.status(400).json({ error: 'Champs requis: name, type' });
            return;
        }
        if (!['expense', 'income'].includes(data.type)) {
            res.status(400).json({ error: 'Type doit être "expense" ou "income"' });
            return;
        }
        const category = await service.createCategory(workspaceId, data);
        res.status(201).json(category);
    }
    catch (error) {
        console.error('Erreur création catégorie:', error);
        res.status(500).json({ error: 'Erreur lors de la création de la catégorie' });
    }
};
exports.createCategory = createCategory;
// ============================================
// ANALYTICS
// ============================================
const getDashboard = async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const year = req.query.year ? parseInt(req.query.year, 10) : undefined;
        const stats = await analytics.getDashboardStats(workspaceId, year);
        res.json(stats);
    }
    catch (error) {
        console.error('Erreur dashboard:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération du dashboard' });
    }
};
exports.getDashboard = getDashboard;
const getMonthlyAnalytics = async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const month = req.query.month
            ? parseInt(req.query.month, 10)
            : new Date().getMonth() + 1;
        const year = req.query.year
            ? parseInt(req.query.year, 10)
            : new Date().getFullYear();
        if (month < 1 || month > 12) {
            res.status(400).json({ error: 'Mois invalide (1-12)' });
            return;
        }
        const data = await analytics.getMonthlyAnalytics(workspaceId, month, year);
        res.json(data);
    }
    catch (error) {
        console.error('Erreur analytics mensuel:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des analytics' });
    }
};
exports.getMonthlyAnalytics = getMonthlyAnalytics;
const getTVASummary = async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const year = req.query.year
            ? parseInt(req.query.year, 10)
            : new Date().getFullYear();
        const quarter = req.query.quarter
            ? parseInt(req.query.quarter, 10)
            : undefined;
        if (quarter && (quarter < 1 || quarter > 4)) {
            res.status(400).json({ error: 'Trimestre invalide (1-4)' });
            return;
        }
        const data = await analytics.getTVASummary(workspaceId, year, quarter);
        res.json({
            year,
            quarter: quarter || null,
            tva_details: data,
            totals: {
                base_ht: data.reduce((sum, t) => sum + t.base_ht, 0),
                tva_collectee: data.reduce((sum, t) => sum + t.montant_collecte, 0),
                tva_deductible: data.reduce((sum, t) => sum + t.montant_deductible, 0),
                solde: data.reduce((sum, t) => sum + t.solde, 0)
            }
        });
    }
    catch (error) {
        console.error('Erreur résumé TVA:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération du résumé TVA' });
    }
};
exports.getTVASummary = getTVASummary;
// ============================================
// EXPORTS
// ============================================
const generateExport = async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const { type, format, filters } = req.body;
        if (!type || !format) {
            res.status(400).json({ error: 'Champs requis: type, format' });
            return;
        }
        if (!['invoices', 'tva'].includes(type)) {
            res.status(400).json({ error: 'Type doit être "invoices" ou "tva"' });
            return;
        }
        if (!['csv', 'pdf', 'excel'].includes(format)) {
            res.status(400).json({ error: 'Format doit être "csv", "pdf" ou "excel"' });
            return;
        }
        let filePath;
        if (type === 'invoices') {
            switch (format) {
                case 'csv':
                    filePath = await exportService.exportInvoicesToCSV(workspaceId, filters || {});
                    break;
                case 'pdf':
                    filePath = await exportService.exportInvoicesToPDF(workspaceId, filters || {});
                    break;
                case 'excel':
                    filePath = await exportService.exportInvoicesToExcel(workspaceId, filters || {});
                    break;
                default:
                    res.status(400).json({ error: 'Format non supporté' });
                    return;
            }
        }
        else {
            const year = filters?.year || new Date().getFullYear();
            filePath = await exportService.exportTVAToCSV(workspaceId, year, filters?.quarter);
        }
        res.json({
            success: true,
            file_path: filePath,
            message: `Export ${type} en ${format} généré avec succès`
        });
    }
    catch (error) {
        console.error('Erreur export:', error);
        res.status(500).json({ error: 'Erreur lors de la génération de l\'export' });
    }
};
exports.generateExport = generateExport;
// ============================================
// INITIALISATION WORKSPACE
// ============================================
const initWorkspace = async (req, res) => {
    try {
        const { workspaceId } = req.params;
        await service.seedDefaultCategories(workspaceId);
        res.json({ success: true, message: 'Catégories par défaut créées' });
    }
    catch (error) {
        console.error('Erreur initialisation workspace:', error);
        res.status(500).json({ error: 'Erreur lors de l\'initialisation' });
    }
};
exports.initWorkspace = initWorkspace;
//# sourceMappingURL=accounting.controller.analytics.js.map