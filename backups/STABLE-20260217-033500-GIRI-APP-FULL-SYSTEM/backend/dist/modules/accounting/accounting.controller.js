"use strict";
/**
 * Module Comptabilité - Controller
 * @description Handlers Express pour les endpoints API
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
exports.reprocessInvoice = exports.validateInvoice = exports.deleteInvoice = exports.updateInvoice = exports.getInvoice = exports.listInvoices = exports.scanInvoice = exports.createInvoice = void 0;
const service = __importStar(require("./accounting.service.js"));
const aiService = __importStar(require("./accounting.ai.js"));
// ============================================
// FACTURES - CRUD
// ============================================
const createInvoice = async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const data = req.body;
        if (!data.type || !data.fournisseur || data.montant_ht === undefined) {
            res.status(400).json({ error: 'Champs requis: type, fournisseur, montant_ht' });
            return;
        }
        const invoice = await service.createInvoice(workspaceId, data);
        res.status(201).json(invoice);
    }
    catch (error) {
        console.error('Erreur création facture:', error);
        res.status(500).json({ error: 'Erreur lors de la création de la facture' });
    }
};
exports.createInvoice = createInvoice;
const scanInvoice = async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const file = req.file;
        if (!file) {
            res.status(400).json({ error: 'Image requise' });
            return;
        }
        const extraction = await aiService.extractInvoiceFromImage(file.path);
        if (!extraction.success) {
            res.status(422).json({ error: 'Extraction échouée', details: extraction.errors });
            return;
        }
        const invoiceData = {
            type: 'expense',
            fournisseur: extraction.data.fournisseur || 'Non identifié',
            reference: extraction.data.reference || undefined,
            montant_ht: extraction.data.montant_ht || 0,
            montant_tva: extraction.data.montant_tva || 0,
            montant_ttc: extraction.data.montant_ttc || 0,
            tva_rate: extraction.data.tva_rate || 20,
            date_facture: extraction.data.date_facture || new Date().toISOString().split('T')[0],
            line_items: extraction.data.line_items.map(item => ({
                description: item.description || '',
                quantity: item.quantity || 1,
                unit_price: item.unit_price || 0,
                tva_rate: item.tva_rate || 20
            }))
        };
        const invoice = await service.createInvoice(workspaceId, invoiceData);
        // Mettre à jour avec les infos IA
        await service.updateInvoice(workspaceId, invoice.id, {
            status: 'pending'
        });
        res.status(201).json({
            invoice,
            extraction: {
                confidence: extraction.confidence,
                suggested_category: extraction.data.category_slug
            }
        });
    }
    catch (error) {
        console.error('Erreur scan facture:', error);
        res.status(500).json({ error: 'Erreur lors du scan de la facture' });
    }
};
exports.scanInvoice = scanInvoice;
const listInvoices = async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const filters = {
            type: req.query.type,
            status: req.query.status,
            category_id: req.query.category_id,
            date_from: req.query.date_from,
            date_to: req.query.date_to,
            search: req.query.search,
            page: req.query.page ? parseInt(req.query.page, 10) : 1,
            limit: req.query.limit ? parseInt(req.query.limit, 10) : 20
        };
        const result = await service.listInvoices(workspaceId, filters);
        res.json(result);
    }
    catch (error) {
        console.error('Erreur liste factures:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération des factures' });
    }
};
exports.listInvoices = listInvoices;
const getInvoice = async (req, res) => {
    try {
        const { workspaceId, id } = req.params;
        const invoice = await service.getInvoiceById(workspaceId, id);
        if (!invoice) {
            res.status(404).json({ error: 'Facture non trouvée' });
            return;
        }
        res.json(invoice);
    }
    catch (error) {
        console.error('Erreur récupération facture:', error);
        res.status(500).json({ error: 'Erreur lors de la récupération de la facture' });
    }
};
exports.getInvoice = getInvoice;
const updateInvoice = async (req, res) => {
    try {
        const { workspaceId, id } = req.params;
        const data = req.body;
        const invoice = await service.updateInvoice(workspaceId, id, data);
        if (!invoice) {
            res.status(404).json({ error: 'Facture non trouvée' });
            return;
        }
        res.json(invoice);
    }
    catch (error) {
        console.error('Erreur mise à jour facture:', error);
        res.status(500).json({ error: 'Erreur lors de la mise à jour de la facture' });
    }
};
exports.updateInvoice = updateInvoice;
const deleteInvoice = async (req, res) => {
    try {
        const { workspaceId, id } = req.params;
        const deleted = await service.deleteInvoice(workspaceId, id);
        if (!deleted) {
            res.status(404).json({ error: 'Facture non trouvée' });
            return;
        }
        res.status(204).send();
    }
    catch (error) {
        console.error('Erreur suppression facture:', error);
        res.status(500).json({ error: 'Erreur lors de la suppression de la facture' });
    }
};
exports.deleteInvoice = deleteInvoice;
const validateInvoice = async (req, res) => {
    try {
        const { workspaceId, id } = req.params;
        const invoice = await service.validateInvoice(workspaceId, id);
        if (!invoice) {
            res.status(404).json({ error: 'Facture non trouvée' });
            return;
        }
        res.json(invoice);
    }
    catch (error) {
        console.error('Erreur validation facture:', error);
        res.status(500).json({ error: 'Erreur lors de la validation de la facture' });
    }
};
exports.validateInvoice = validateInvoice;
const reprocessInvoice = async (req, res) => {
    try {
        const { workspaceId, id } = req.params;
        const invoice = await service.getInvoiceById(workspaceId, id);
        if (!invoice) {
            res.status(404).json({ error: 'Facture non trouvée' });
            return;
        }
        if (!invoice.image_url) {
            res.status(400).json({ error: 'Pas d\'image associée à cette facture' });
            return;
        }
        const extraction = await aiService.reprocessInvoice(invoice.image_url);
        res.json({ invoice, extraction });
    }
    catch (error) {
        console.error('Erreur retraitement facture:', error);
        res.status(500).json({ error: 'Erreur lors du retraitement de la facture' });
    }
};
exports.reprocessInvoice = reprocessInvoice;
//# sourceMappingURL=accounting.controller.js.map