/**
 * Module Comptabilité - Controller Analytics & Catégories
 * @description Handlers Express pour analytics, catégories et exports
 */

import { Request, Response } from 'express';
import * as service from './accounting.service.js';
import * as analytics from './accounting.analytics.js';
import * as exportService from './accounting.export.js';
import { CreateCategoryDTO, ExportFilters } from './accounting.types.js';

type Req = Request<{ workspaceId: string }>;

// ============================================
// CATÉGORIES
// ============================================

export const listCategories = async (req: Req, res: Response): Promise<void> => {
  try {
    const { workspaceId } = req.params;
    const categories = await service.listCategories(workspaceId);
    res.json(categories);
  } catch (error) {
    console.error('Erreur liste catégories:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des catégories' });
  }
};

export const createCategory = async (req: Req, res: Response): Promise<void> => {
  try {
    const { workspaceId } = req.params;
    const data: CreateCategoryDTO = req.body;

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
  } catch (error) {
    console.error('Erreur création catégorie:', error);
    res.status(500).json({ error: 'Erreur lors de la création de la catégorie' });
  }
};

// ============================================
// ANALYTICS
// ============================================

export const getDashboard = async (req: Req, res: Response): Promise<void> => {
  try {
    const { workspaceId } = req.params;
    const year = req.query.year ? parseInt(req.query.year as string, 10) : undefined;

    const stats = await analytics.getDashboardStats(workspaceId, year);
    res.json(stats);
  } catch (error) {
    console.error('Erreur dashboard:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du dashboard' });
  }
};

export const getMonthlyAnalytics = async (req: Req, res: Response): Promise<void> => {
  try {
    const { workspaceId } = req.params;
    const month = req.query.month
      ? parseInt(req.query.month as string, 10)
      : new Date().getMonth() + 1;
    const year = req.query.year
      ? parseInt(req.query.year as string, 10)
      : new Date().getFullYear();

    if (month < 1 || month > 12) {
      res.status(400).json({ error: 'Mois invalide (1-12)' });
      return;
    }

    const data = await analytics.getMonthlyAnalytics(workspaceId, month, year);
    res.json(data);
  } catch (error) {
    console.error('Erreur analytics mensuel:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des analytics' });
  }
};

export const getTVASummary = async (req: Req, res: Response): Promise<void> => {
  try {
    const { workspaceId } = req.params;
    const year = req.query.year
      ? parseInt(req.query.year as string, 10)
      : new Date().getFullYear();
    const quarter = req.query.quarter
      ? parseInt(req.query.quarter as string, 10)
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
  } catch (error) {
    console.error('Erreur résumé TVA:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du résumé TVA' });
  }
};

// ============================================
// EXPORTS
// ============================================

export const generateExport = async (req: Req, res: Response): Promise<void> => {
  try {
    const { workspaceId } = req.params;
    const { type, format, filters } = req.body as {
      type: 'invoices' | 'tva';
      format: 'csv' | 'pdf' | 'excel';
      filters?: ExportFilters & { year?: number; quarter?: number };
    };

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

    let filePath: string;

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
    } else {
      const year = filters?.year || new Date().getFullYear();
      filePath = await exportService.exportTVAToCSV(workspaceId, year, filters?.quarter);
    }

    res.json({
      success: true,
      file_path: filePath,
      message: `Export ${type} en ${format} généré avec succès`
    });
  } catch (error) {
    console.error('Erreur export:', error);
    res.status(500).json({ error: 'Erreur lors de la génération de l\'export' });
  }
};

// ============================================
// INITIALISATION WORKSPACE
// ============================================

export const initWorkspace = async (req: Req, res: Response): Promise<void> => {
  try {
    const { workspaceId } = req.params;
    await service.seedDefaultCategories(workspaceId);
    res.json({ success: true, message: 'Catégories par défaut créées' });
  } catch (error) {
    console.error('Erreur initialisation workspace:', error);
    res.status(500).json({ error: 'Erreur lors de l\'initialisation' });
  }
};
