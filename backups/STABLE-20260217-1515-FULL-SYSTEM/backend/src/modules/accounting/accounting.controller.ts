/**
 * Module Comptabilité - Controller
 * @description Handlers Express pour les endpoints API
 */

import { Request, Response } from 'express';
import * as service from './accounting.service.js';
import * as _analytics from './accounting.analytics.js';
import * as aiService from './accounting.ai.js';
import * as _exportService from './accounting.export.js';
import { CreateInvoiceDTO, UpdateInvoiceDTO,  InvoiceFilters } from './accounting.types.js';

type Req = Request<{ workspaceId: string; id?: string }>;

// ============================================
// FACTURES - CRUD
// ============================================

export const createInvoice = async (req: Req, res: Response): Promise<void> => {
  try {
    const { workspaceId } = req.params;
    const data: CreateInvoiceDTO = req.body;

    if (!data.type || !data.fournisseur || data.montant_ht === undefined) {
      res.status(400).json({ error: 'Champs requis: type, fournisseur, montant_ht' });
      return;
    }

    const invoice = await service.createInvoice(workspaceId, data);
    res.status(201).json(invoice);
  } catch (error) {
    console.error('Erreur création facture:', error);
    res.status(500).json({ error: 'Erreur lors de la création de la facture' });
  }
};

export const scanInvoice = async (req: Req, res: Response): Promise<void> => {
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

    const invoiceData: CreateInvoiceDTO = {
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
  } catch (error) {
    console.error('Erreur scan facture:', error);
    res.status(500).json({ error: 'Erreur lors du scan de la facture' });
  }
};

export const listInvoices = async (req: Req, res: Response): Promise<void> => {
  try {
    const { workspaceId } = req.params;
    const filters: InvoiceFilters = {
      type: req.query.type as InvoiceFilters['type'],
      status: req.query.status as InvoiceFilters['status'],
      category_id: req.query.category_id as string,
      date_from: req.query.date_from as string,
      date_to: req.query.date_to as string,
      search: req.query.search as string,
      page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 20
    };

    const result = await service.listInvoices(workspaceId, filters);
    res.json(result);
  } catch (error) {
    console.error('Erreur liste factures:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des factures' });
  }
};

export const getInvoice = async (req: Req, res: Response): Promise<void> => {
  try {
    const { workspaceId, id } = req.params;
    const invoice = await service.getInvoiceById(workspaceId, id!);

    if (!invoice) {
      res.status(404).json({ error: 'Facture non trouvée' });
      return;
    }

    res.json(invoice);
  } catch (error) {
    console.error('Erreur récupération facture:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de la facture' });
  }
};

export const updateInvoice = async (req: Req, res: Response): Promise<void> => {
  try {
    const { workspaceId, id } = req.params;
    const data: UpdateInvoiceDTO = req.body;

    const invoice = await service.updateInvoice(workspaceId, id!, data);

    if (!invoice) {
      res.status(404).json({ error: 'Facture non trouvée' });
      return;
    }

    res.json(invoice);
  } catch (error) {
    console.error('Erreur mise à jour facture:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de la facture' });
  }
};

export const deleteInvoice = async (req: Req, res: Response): Promise<void> => {
  try {
    const { workspaceId, id } = req.params;
    const deleted = await service.deleteInvoice(workspaceId, id!);

    if (!deleted) {
      res.status(404).json({ error: 'Facture non trouvée' });
      return;
    }

    res.status(204).send();
  } catch (error) {
    console.error('Erreur suppression facture:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de la facture' });
  }
};

export const validateInvoice = async (req: Req, res: Response): Promise<void> => {
  try {
    const { workspaceId, id } = req.params;
    const invoice = await service.validateInvoice(workspaceId, id!);

    if (!invoice) {
      res.status(404).json({ error: 'Facture non trouvée' });
      return;
    }

    res.json(invoice);
  } catch (error) {
    console.error('Erreur validation facture:', error);
    res.status(500).json({ error: 'Erreur lors de la validation de la facture' });
  }
};

export const reprocessInvoice = async (req: Req, res: Response): Promise<void> => {
  try {
    const { workspaceId, id } = req.params;
    const invoice = await service.getInvoiceById(workspaceId, id!);

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
  } catch (error) {
    console.error('Erreur retraitement facture:', error);
    res.status(500).json({ error: 'Erreur lors du retraitement de la facture' });
  }
};
