"use strict";
/**
 * Module Comptabilite - Controller Contacts
 * @description Handlers Express pour les endpoints contacts (clients, fournisseurs)
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
exports.getContactInvoices = exports.deleteContact = exports.updateContact = exports.getContact = exports.createContact = exports.listContacts = void 0;
const contactsService = __importStar(require("./accounting.contacts.js"));
// ============================================
// CONTACTS - CRUD
// ============================================
/**
 * GET /contacts
 * Liste des contacts avec filtres : type, search, page, limit
 */
const listContacts = async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const filters = {
            type: req.query.type,
            search: req.query.search,
            is_active: req.query.is_active !== undefined
                ? req.query.is_active === 'true'
                : undefined,
            page: req.query.page ? parseInt(req.query.page, 10) : 1,
            limit: req.query.limit ? parseInt(req.query.limit, 10) : 20
        };
        const result = await contactsService.listContacts(workspaceId, filters);
        res.json(result);
    }
    catch (error) {
        console.error('Erreur liste contacts:', error);
        res.status(500).json({ error: 'Erreur lors de la recuperation des contacts' });
    }
};
exports.listContacts = listContacts;
/**
 * POST /contacts
 * Creer un nouveau contact
 * Body: { type, name?, company?, email?, ... }
 */
const createContact = async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const data = req.body;
        // Validation: au moins un nom requis
        const hasName = data.name || data.company;
        if (!hasName) {
            res.status(400).json({ error: 'Un nom est requis (name ou company)' });
            return;
        }
        // Validation: type doit etre client, supplier ou both
        if (!data.type || !['client', 'supplier', 'both'].includes(data.type)) {
            res.status(400).json({ error: 'Type requis: client, supplier ou both' });
            return;
        }
        const contact = await contactsService.createContact(workspaceId, data);
        res.status(201).json(contact);
    }
    catch (error) {
        console.error('Erreur creation contact:', error);
        res.status(500).json({ error: 'Erreur lors de la creation du contact' });
    }
};
exports.createContact = createContact;
/**
 * GET /contacts/:id
 * Detail d'un contact avec totaux recalcules
 */
const getContact = async (req, res) => {
    try {
        const { workspaceId, id } = req.params;
        const contact = await contactsService.getContactById(workspaceId, id);
        if (!contact) {
            res.status(404).json({ error: 'Contact non trouve' });
            return;
        }
        res.json(contact);
    }
    catch (error) {
        console.error('Erreur recuperation contact:', error);
        res.status(500).json({ error: 'Erreur lors de la recuperation du contact' });
    }
};
exports.getContact = getContact;
/**
 * PUT /contacts/:id
 * Modifier un contact
 */
const updateContact = async (req, res) => {
    try {
        const { workspaceId, id } = req.params;
        const data = req.body;
        // Validation: si type fourni, doit etre valide
        if (data.type && !['client', 'supplier', 'both'].includes(data.type)) {
            res.status(400).json({ error: 'Type invalide: client, supplier ou both' });
            return;
        }
        const contact = await contactsService.updateContact(workspaceId, id, data);
        if (!contact) {
            res.status(404).json({ error: 'Contact non trouve' });
            return;
        }
        res.json(contact);
    }
    catch (error) {
        console.error('Erreur mise a jour contact:', error);
        res.status(500).json({ error: 'Erreur lors de la mise a jour du contact' });
    }
};
exports.updateContact = updateContact;
/**
 * DELETE /contacts/:id
 * Desactiver un contact (soft delete)
 */
const deleteContact = async (req, res) => {
    try {
        const { workspaceId, id } = req.params;
        const deleted = await contactsService.deleteContact(workspaceId, id);
        if (!deleted) {
            res.status(404).json({ error: 'Contact non trouve' });
            return;
        }
        res.status(204).send();
    }
    catch (error) {
        console.error('Erreur suppression contact:', error);
        res.status(500).json({ error: 'Erreur lors de la suppression du contact' });
    }
};
exports.deleteContact = deleteContact;
/**
 * GET /contacts/:id/invoices
 * Factures associees a un contact
 */
const getContactInvoices = async (req, res) => {
    try {
        const { workspaceId, id } = req.params;
        // Verifier que le contact existe
        const contact = await contactsService.getContactById(workspaceId, id);
        if (!contact) {
            res.status(404).json({ error: 'Contact non trouve' });
            return;
        }
        const invoices = await contactsService.getContactInvoices(workspaceId, id);
        res.json({ contact_id: id, contact_name: contact.company || contact.name, invoices });
    }
    catch (error) {
        console.error('Erreur factures contact:', error);
        res.status(500).json({ error: 'Erreur lors de la recuperation des factures du contact' });
    }
};
exports.getContactInvoices = getContactInvoices;
//# sourceMappingURL=accounting.controller.contacts.js.map