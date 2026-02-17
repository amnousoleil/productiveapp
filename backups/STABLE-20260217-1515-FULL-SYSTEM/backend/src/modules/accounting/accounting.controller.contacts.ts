/**
 * Module Comptabilite - Controller Contacts
 * @description Handlers Express pour les endpoints contacts (clients, fournisseurs)
 */

import { Request, Response } from 'express';
import * as contactsService from './accounting.contacts.js';
import { ContactFilters, ContactType, CreateContactDTO, UpdateContactDTO } from './accounting.types.js';

type Req = Request<{ workspaceId: string; id?: string }>;

// ============================================
// CONTACTS - CRUD
// ============================================

/**
 * GET /contacts
 * Liste des contacts avec filtres : type, search, page, limit
 */
export const listContacts = async (req: Req, res: Response): Promise<void> => {
  try {
    const { workspaceId } = req.params;
    const filters: ContactFilters = {
      type: req.query.type as ContactType | undefined,
      search: req.query.search as string | undefined,
      is_active: req.query.is_active !== undefined
        ? req.query.is_active === 'true'
        : undefined,
      page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 20
    };

    const result = await contactsService.listContacts(workspaceId, filters);
    res.json(result);
  } catch (error) {
    console.error('Erreur liste contacts:', error);
    res.status(500).json({ error: 'Erreur lors de la recuperation des contacts' });
  }
};

/**
 * POST /contacts
 * Creer un nouveau contact
 * Body: { type, name?, company?, email?, ... }
 */
export const createContact = async (req: Req, res: Response): Promise<void> => {
  try {
    const { workspaceId } = req.params;
    const data: CreateContactDTO = req.body;

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
  } catch (error) {
    console.error('Erreur creation contact:', error);
    res.status(500).json({ error: 'Erreur lors de la creation du contact' });
  }
};

/**
 * GET /contacts/:id
 * Detail d'un contact avec totaux recalcules
 */
export const getContact = async (req: Req, res: Response): Promise<void> => {
  try {
    const { workspaceId, id } = req.params;
    const contact = await contactsService.getContactById(workspaceId, id!);

    if (!contact) {
      res.status(404).json({ error: 'Contact non trouve' });
      return;
    }

    res.json(contact);
  } catch (error) {
    console.error('Erreur recuperation contact:', error);
    res.status(500).json({ error: 'Erreur lors de la recuperation du contact' });
  }
};

/**
 * PUT /contacts/:id
 * Modifier un contact
 */
export const updateContact = async (req: Req, res: Response): Promise<void> => {
  try {
    const { workspaceId, id } = req.params;
    const data: UpdateContactDTO = req.body;

    // Validation: si type fourni, doit etre valide
    if (data.type && !['client', 'supplier', 'both'].includes(data.type)) {
      res.status(400).json({ error: 'Type invalide: client, supplier ou both' });
      return;
    }

    const contact = await contactsService.updateContact(workspaceId, id!, data);

    if (!contact) {
      res.status(404).json({ error: 'Contact non trouve' });
      return;
    }

    res.json(contact);
  } catch (error) {
    console.error('Erreur mise a jour contact:', error);
    res.status(500).json({ error: 'Erreur lors de la mise a jour du contact' });
  }
};

/**
 * DELETE /contacts/:id
 * Desactiver un contact (soft delete)
 */
export const deleteContact = async (req: Req, res: Response): Promise<void> => {
  try {
    const { workspaceId, id } = req.params;
    const deleted = await contactsService.deleteContact(workspaceId, id!);

    if (!deleted) {
      res.status(404).json({ error: 'Contact non trouve' });
      return;
    }

    res.status(204).send();
  } catch (error) {
    console.error('Erreur suppression contact:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression du contact' });
  }
};

/**
 * GET /contacts/:id/invoices
 * Factures associees a un contact
 */
export const getContactInvoices = async (req: Req, res: Response): Promise<void> => {
  try {
    const { workspaceId, id } = req.params;

    // Verifier que le contact existe
    const contact = await contactsService.getContactById(workspaceId, id!);
    if (!contact) {
      res.status(404).json({ error: 'Contact non trouve' });
      return;
    }

    const invoices = await contactsService.getContactInvoices(workspaceId, id!);
    res.json({ contact_id: id, contact_name: contact.company || contact.name, invoices });
  } catch (error) {
    console.error('Erreur factures contact:', error);
    res.status(500).json({ error: 'Erreur lors de la recuperation des factures du contact' });
  }
};
