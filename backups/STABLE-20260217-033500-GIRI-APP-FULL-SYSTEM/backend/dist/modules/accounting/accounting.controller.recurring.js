"use strict";
/**
 * Module Comptabilite - Controller Factures Recurrentes
 * @description Handlers Express pour les endpoints de recurrence
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
exports.processRecurring = exports.resumeRecurring = exports.pauseRecurring = exports.deleteRecurring = exports.updateRecurring = exports.getRecurring = exports.createRecurring = exports.listRecurring = void 0;
const recurringService = __importStar(require("./accounting.recurring.js"));
/**
 * GET /recurring - Liste
 */
const listRecurring = async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const result = await recurringService.listRecurring(workspaceId, {
            is_active: req.query.active === 'true' ? true : req.query.active === 'false' ? false : undefined,
            page: req.query.page ? parseInt(req.query.page, 10) : 1,
            limit: req.query.limit ? parseInt(req.query.limit, 10) : 20,
        });
        res.json(result);
    }
    catch (error) {
        console.error('Erreur liste recurrentes:', error);
        res.status(500).json({ error: 'Erreur lors de la recuperation des factures recurrentes' });
    }
};
exports.listRecurring = listRecurring;
/**
 * POST /recurring - Creer
 */
const createRecurring = async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const data = req.body;
        if (!data.type || !data.fournisseur || !data.frequency || !data.start_date) {
            res.status(400).json({ error: 'Champs requis: type, fournisseur, frequency, start_date' });
            return;
        }
        // Auto-generate line_items from montant if not provided
        if (!data.line_items?.length && data.montant_ttc) {
            data.line_items = [{ description: data.fournisseur, quantity: 1, unit_price: data.montant_ht || data.montant_ttc, tva_rate: data.tva_rate || 20 }];
        }
        const recurring = await recurringService.createRecurring(workspaceId, data);
        res.status(201).json(recurring);
    }
    catch (error) {
        console.error('Erreur creation recurrente:', error);
        res.status(500).json({ error: 'Erreur lors de la creation de la facture recurrente' });
    }
};
exports.createRecurring = createRecurring;
/**
 * GET /recurring/:id - Detail
 */
const getRecurring = async (req, res) => {
    try {
        const { workspaceId, id } = req.params;
        const recurring = await recurringService.getRecurringById(workspaceId, id);
        if (!recurring) {
            res.status(404).json({ error: 'Facture recurrente non trouvee' });
            return;
        }
        res.json(recurring);
    }
    catch (error) {
        console.error('Erreur detail recurrente:', error);
        res.status(500).json({ error: 'Erreur lors de la recuperation' });
    }
};
exports.getRecurring = getRecurring;
/**
 * PUT /recurring/:id - Modifier
 */
const updateRecurring = async (req, res) => {
    try {
        const { workspaceId, id } = req.params;
        const recurring = await recurringService.updateRecurring(workspaceId, id, req.body);
        if (!recurring) {
            res.status(404).json({ error: 'Facture recurrente non trouvee' });
            return;
        }
        res.json(recurring);
    }
    catch (error) {
        console.error('Erreur mise a jour recurrente:', error);
        res.status(500).json({ error: 'Erreur lors de la mise a jour' });
    }
};
exports.updateRecurring = updateRecurring;
/**
 * DELETE /recurring/:id - Supprimer
 */
const deleteRecurring = async (req, res) => {
    try {
        const { workspaceId, id } = req.params;
        const deleted = await recurringService.deleteRecurring(workspaceId, id);
        if (!deleted) {
            res.status(404).json({ error: 'Facture recurrente non trouvee' });
            return;
        }
        res.status(204).send();
    }
    catch (error) {
        console.error('Erreur suppression recurrente:', error);
        res.status(500).json({ error: 'Erreur lors de la suppression' });
    }
};
exports.deleteRecurring = deleteRecurring;
/**
 * POST /recurring/:id/pause - Mettre en pause
 */
const pauseRecurring = async (req, res) => {
    try {
        const { workspaceId, id } = req.params;
        const recurring = await recurringService.updateRecurring(workspaceId, id, { is_paused: true });
        if (!recurring) {
            res.status(404).json({ error: 'Facture recurrente non trouvee' });
            return;
        }
        res.json(recurring);
    }
    catch (error) {
        console.error('Erreur pause recurrente:', error);
        res.status(500).json({ error: 'Erreur lors de la mise en pause' });
    }
};
exports.pauseRecurring = pauseRecurring;
/**
 * POST /recurring/:id/resume - Reprendre
 */
const resumeRecurring = async (req, res) => {
    try {
        const { workspaceId, id } = req.params;
        const recurring = await recurringService.updateRecurring(workspaceId, id, { is_paused: false });
        if (!recurring) {
            res.status(404).json({ error: 'Facture recurrente non trouvee' });
            return;
        }
        res.json(recurring);
    }
    catch (error) {
        console.error('Erreur reprise recurrente:', error);
        res.status(500).json({ error: 'Erreur lors de la reprise' });
    }
};
exports.resumeRecurring = resumeRecurring;
/**
 * POST /recurring/process - Lancer la generation manuelle
 */
const processRecurring = async (_req, res) => {
    try {
        const result = await recurringService.processRecurringInvoices();
        res.json(result);
    }
    catch (error) {
        console.error('Erreur generation recurrentes:', error);
        res.status(500).json({ error: 'Erreur lors de la generation des factures' });
    }
};
exports.processRecurring = processRecurring;
//# sourceMappingURL=accounting.controller.recurring.js.map