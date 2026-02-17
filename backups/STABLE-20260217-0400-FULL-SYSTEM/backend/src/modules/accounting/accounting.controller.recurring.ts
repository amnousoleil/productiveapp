/**
 * Module Comptabilite - Controller Factures Recurrentes
 * @description Handlers Express pour les endpoints de recurrence
 */

import { Request, Response } from 'express';
import * as recurringService from './accounting.recurring.js';

type Req = Request<{ workspaceId: string; id?: string }>;

/**
 * GET /recurring - Liste
 */
export const listRecurring = async (req: Req, res: Response): Promise<void> => {
  try {
    const { workspaceId } = req.params;
    const result = await recurringService.listRecurring(workspaceId, {
      is_active: req.query.active === 'true' ? true : req.query.active === 'false' ? false : undefined,
      page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 20,
    });
    res.json(result);
  } catch (error) {
    console.error('Erreur liste recurrentes:', error);
    res.status(500).json({ error: 'Erreur lors de la recuperation des factures recurrentes' });
  }
};

/**
 * POST /recurring - Creer
 */
export const createRecurring = async (req: Req, res: Response): Promise<void> => {
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
  } catch (error) {
    console.error('Erreur creation recurrente:', error);
    res.status(500).json({ error: 'Erreur lors de la creation de la facture recurrente' });
  }
};

/**
 * GET /recurring/:id - Detail
 */
export const getRecurring = async (req: Req, res: Response): Promise<void> => {
  try {
    const { workspaceId, id } = req.params;
    const recurring = await recurringService.getRecurringById(workspaceId, id!);

    if (!recurring) {
      res.status(404).json({ error: 'Facture recurrente non trouvee' });
      return;
    }

    res.json(recurring);
  } catch (error) {
    console.error('Erreur detail recurrente:', error);
    res.status(500).json({ error: 'Erreur lors de la recuperation' });
  }
};

/**
 * PUT /recurring/:id - Modifier
 */
export const updateRecurring = async (req: Req, res: Response): Promise<void> => {
  try {
    const { workspaceId, id } = req.params;
    const recurring = await recurringService.updateRecurring(workspaceId, id!, req.body);

    if (!recurring) {
      res.status(404).json({ error: 'Facture recurrente non trouvee' });
      return;
    }

    res.json(recurring);
  } catch (error) {
    console.error('Erreur mise a jour recurrente:', error);
    res.status(500).json({ error: 'Erreur lors de la mise a jour' });
  }
};

/**
 * DELETE /recurring/:id - Supprimer
 */
export const deleteRecurring = async (req: Req, res: Response): Promise<void> => {
  try {
    const { workspaceId, id } = req.params;
    const deleted = await recurringService.deleteRecurring(workspaceId, id!);

    if (!deleted) {
      res.status(404).json({ error: 'Facture recurrente non trouvee' });
      return;
    }

    res.status(204).send();
  } catch (error) {
    console.error('Erreur suppression recurrente:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression' });
  }
};

/**
 * POST /recurring/:id/pause - Mettre en pause
 */
export const pauseRecurring = async (req: Req, res: Response): Promise<void> => {
  try {
    const { workspaceId, id } = req.params;
    const recurring = await recurringService.updateRecurring(workspaceId, id!, { is_paused: true });

    if (!recurring) {
      res.status(404).json({ error: 'Facture recurrente non trouvee' });
      return;
    }

    res.json(recurring);
  } catch (error) {
    console.error('Erreur pause recurrente:', error);
    res.status(500).json({ error: 'Erreur lors de la mise en pause' });
  }
};

/**
 * POST /recurring/:id/resume - Reprendre
 */
export const resumeRecurring = async (req: Req, res: Response): Promise<void> => {
  try {
    const { workspaceId, id } = req.params;
    const recurring = await recurringService.updateRecurring(workspaceId, id!, { is_paused: false });

    if (!recurring) {
      res.status(404).json({ error: 'Facture recurrente non trouvee' });
      return;
    }

    res.json(recurring);
  } catch (error) {
    console.error('Erreur reprise recurrente:', error);
    res.status(500).json({ error: 'Erreur lors de la reprise' });
  }
};

/**
 * POST /recurring/process - Lancer la generation manuelle
 */
export const processRecurring = async (_req: Req, res: Response): Promise<void> => {
  try {
    const result = await recurringService.processRecurringInvoices();
    res.json(result);
  } catch (error) {
    console.error('Erreur generation recurrentes:', error);
    res.status(500).json({ error: 'Erreur lors de la generation des factures' });
  }
};
