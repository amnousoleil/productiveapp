/**
 * Module Comptabilite - Controller Notes de Frais
 * @description Handlers Express pour les endpoints notes de frais (expense reports)
 */

import { Request, Response } from 'express';
import pool from './pool.js';
import * as aiService from './accounting.ai.js';
import {
  ExpenseReport, ExpenseItem,
  CreateExpenseReportDTO, UpdateExpenseReportDTO, CreateExpenseItemDTO,
  PaginatedResponse
} from './accounting.types.js';

type Req = Request<{ workspaceId: string; id?: string; itemId?: string }>;

// ============================================
// NOTES DE FRAIS - CRUD
// ============================================

/**
 * GET /expense-reports
 * Liste des notes de frais avec filtres : status, member_id, page, limit
 */
export const listExpenseReports = async (req: Req, res: Response): Promise<void> => {
  try {
    const { workspaceId } = req.params;
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = Math.min(req.query.limit ? parseInt(req.query.limit as string, 10) : 20, 100);
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE er.workspace_id = $1';
    const params: (string | number)[] = [workspaceId];
    let paramIndex = 2;

    if (req.query.status) {
      whereClause += ` AND er.status = $${paramIndex++}`;
      params.push(req.query.status as string);
    }
    if (req.query.member_id) {
      whereClause += ` AND er.member_id = $${paramIndex++}`;
      params.push(req.query.member_id as string);
    }
    if (req.query.department_id) {
      whereClause += ` AND er.department_id = $${paramIndex++}`;
      params.push(req.query.department_id as string);
    }
    if (req.query.date_from) {
      whereClause += ` AND er.created_at >= $${paramIndex++}`;
      params.push(req.query.date_from as string);
    }
    if (req.query.date_to) {
      whereClause += ` AND er.created_at <= $${paramIndex++}`;
      params.push(req.query.date_to as string);
    }

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM expense_reports er ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count, 10);

    params.push(limit, offset);
    const result = await pool.query<ExpenseReport>(
      `SELECT er.*, d.name as department_name
       FROM expense_reports er
       LEFT JOIN departments d ON er.department_id = d.id
       ${whereClause}
       ORDER BY er.created_at DESC
       LIMIT $${paramIndex++} OFFSET $${paramIndex}`,
      params
    );

    res.json({
      data: result.rows,
      pagination: { page, limit, total, total_pages: Math.ceil(total / limit) }
    } as PaginatedResponse<ExpenseReport>);
  } catch (error) {
    console.error('Erreur liste notes de frais:', error);
    res.status(500).json({ error: 'Erreur lors de la recuperation des notes de frais' });
  }
};

/**
 * POST /expense-reports
 * Creer une nouvelle note de frais
 * Body: { member_id, member_name, title, description?, department_id?, currency? }
 */
export const createExpenseReport = async (req: Req, res: Response): Promise<void> => {
  try {
    const { workspaceId } = req.params;
    const data: CreateExpenseReportDTO = req.body;

    if (!data.title) {
      res.status(400).json({ error: 'Champ requis: title' });
      return;
    }
    if (!data.member_id || !data.member_name) {
      res.status(400).json({ error: 'Champs requis: member_id, member_name' });
      return;
    }

    const result = await pool.query<ExpenseReport>(
      `INSERT INTO expense_reports (
        workspace_id, member_id, member_name, department_id, title,
        description, status, total_amount, currency
      ) VALUES ($1, $2, $3, $4, $5, $6, 'draft', 0, $7)
      RETURNING *`,
      [
        workspaceId,
        data.member_id,
        data.member_name,
        data.department_id || null,
        data.title,
        data.description || null,
        data.currency || 'EUR'
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erreur creation note de frais:', error);
    res.status(500).json({ error: 'Erreur lors de la creation de la note de frais' });
  }
};

/**
 * GET /expense-reports/:id
 * Detail d'une note de frais avec ses items
 */
export const getExpenseReport = async (req: Req, res: Response): Promise<void> => {
  try {
    const { workspaceId, id } = req.params;

    const result = await pool.query<ExpenseReport>(
      `SELECT er.*, d.name as department_name
       FROM expense_reports er
       LEFT JOIN departments d ON er.department_id = d.id
       WHERE er.id = $1 AND er.workspace_id = $2`,
      [id, workspaceId]
    );

    if (!result.rows[0]) {
      res.status(404).json({ error: 'Note de frais non trouvee' });
      return;
    }

    // Recuperer les items
    const itemsResult = await pool.query<ExpenseItem>(
      `SELECT ei.*, c.name as category_name
       FROM expense_items ei
       LEFT JOIN accounting_categories c ON ei.category_id = c.id
       WHERE ei.expense_report_id = $1
       ORDER BY ei.date ASC, ei.created_at ASC`,
      [id]
    );

    res.json({ ...result.rows[0], items: itemsResult.rows });
  } catch (error) {
    console.error('Erreur recuperation note de frais:', error);
    res.status(500).json({ error: 'Erreur lors de la recuperation de la note de frais' });
  }
};

/**
 * PUT /expense-reports/:id
 * Modifier une note de frais (seulement si status = draft)
 */
export const updateExpenseReport = async (req: Req, res: Response): Promise<void> => {
  try {
    const { workspaceId, id } = req.params;
    const data: UpdateExpenseReportDTO = req.body;

    // Verifier que la note existe et est en brouillon
    const existing = await pool.query(
      'SELECT status FROM expense_reports WHERE id = $1 AND workspace_id = $2',
      [id, workspaceId]
    );

    if (!existing.rows[0]) {
      res.status(404).json({ error: 'Note de frais non trouvee' });
      return;
    }

    if (existing.rows[0].status !== 'draft') {
      res.status(400).json({ error: 'Seules les notes de frais en brouillon peuvent etre modifiees' });
      return;
    }

    const fields: string[] = [];
    const values: (string | number | null)[] = [];
    let paramIndex = 1;

    const allowedFields: (keyof UpdateExpenseReportDTO)[] = ['title', 'description', 'department_id'];
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        fields.push(`${field} = $${paramIndex++}`);
        values.push(data[field] as string | null);
      }
    }

    if (fields.length === 0) {
      res.status(400).json({ error: 'Aucun champ a mettre a jour' });
      return;
    }

    values.push(id!, workspaceId);
    const result = await pool.query<ExpenseReport>(
      `UPDATE expense_reports
       SET ${fields.join(', ')}, updated_at = NOW()
       WHERE id = $${paramIndex++} AND workspace_id = $${paramIndex}
       RETURNING *`,
      values
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erreur mise a jour note de frais:', error);
    res.status(500).json({ error: 'Erreur lors de la mise a jour de la note de frais' });
  }
};

/**
 * POST /expense-reports/:id/items
 * Ajouter un item a une note de frais
 * Body: { description, amount, date, category_id?, tva_rate?, receipt_url?, notes? }
 */
export const addExpenseItem = async (req: Req, res: Response): Promise<void> => {
  try {
    const { workspaceId, id } = req.params;
    const data: CreateExpenseItemDTO = req.body;

    // Validation champs requis
    if (!data.description) {
      res.status(400).json({ error: 'Champ requis: description' });
      return;
    }
    if (data.amount === undefined || data.amount === null) {
      res.status(400).json({ error: 'Champ requis: amount' });
      return;
    }
    if (!data.date) {
      res.status(400).json({ error: 'Champ requis: date (date_expense)' });
      return;
    }

    // Verifier que la note existe et est en brouillon
    const existing = await pool.query(
      'SELECT status FROM expense_reports WHERE id = $1 AND workspace_id = $2',
      [id, workspaceId]
    );

    if (!existing.rows[0]) {
      res.status(404).json({ error: 'Note de frais non trouvee' });
      return;
    }

    if (existing.rows[0].status !== 'draft') {
      res.status(400).json({ error: 'Impossible d\'ajouter des items a une note soumise' });
      return;
    }

    const tvaRate = data.tva_rate ?? 20;
    const tvaAmount = data.amount * (tvaRate / 100);

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Inserer l'item
      const itemResult = await client.query<ExpenseItem>(
        `INSERT INTO expense_items (
          expense_report_id, date, description, category_id,
          amount, currency, tva_rate, tva_amount, receipt_url, notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *`,
        [
          id,
          data.date,
          data.description,
          data.category_id || null,
          data.amount,
          data.currency || 'EUR',
          tvaRate,
          tvaAmount,
          data.receipt_url || null,
          data.notes || null
        ]
      );

      // Recalculer le total de la note
      await client.query(
        `UPDATE expense_reports
         SET total_amount = (
           SELECT COALESCE(SUM(amount), 0)
           FROM expense_items
           WHERE expense_report_id = $1
         ), updated_at = NOW()
         WHERE id = $1`,
        [id]
      );

      await client.query('COMMIT');
      res.status(201).json(itemResult.rows[0]);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erreur ajout item note de frais:', error);
    res.status(500).json({ error: 'Erreur lors de l\'ajout de l\'item' });
  }
};

/**
 * POST /expense-reports/:id/items/:itemId/scan
 * Scanner un justificatif et extraire les donnees via IA
 */
export const scanExpenseReceipt = async (req: Req, res: Response): Promise<void> => {
  try {
    const { workspaceId, id, itemId } = req.params;
    const file = req.file;

    if (!file) {
      res.status(400).json({ error: 'Image du justificatif requise' });
      return;
    }

    // Verifier que la note et l'item existent
    const existing = await pool.query(
      `SELECT er.status FROM expense_reports er
       JOIN expense_items ei ON ei.expense_report_id = er.id
       WHERE er.id = $1 AND er.workspace_id = $2 AND ei.id = $3`,
      [id, workspaceId, itemId]
    );

    if (!existing.rows[0]) {
      res.status(404).json({ error: 'Note de frais ou item non trouve' });
      return;
    }

    // Extraction IA
    const extraction = await aiService.extractInvoiceFromImage(file.path);

    if (!extraction.success) {
      res.status(422).json({ error: 'Extraction echouee', details: extraction.errors });
      return;
    }

    // Mettre a jour l'item avec les donnees extraites
    await pool.query(
      `UPDATE expense_items
       SET description = COALESCE($1, description),
           amount = COALESCE($2, amount),
           tva_rate = COALESCE($3, tva_rate),
           tva_amount = COALESCE($4, tva_amount),
           receipt_url = $5,
           updated_at = NOW()
       WHERE id = $6`,
      [
        extraction.data.fournisseur ? `${extraction.data.fournisseur} - ${extraction.data.reference || ''}`.trim() : null,
        extraction.data.montant_ttc,
        extraction.data.tva_rate,
        extraction.data.montant_tva,
        file.path,
        itemId
      ]
    );

    // Recalculer le total
    await pool.query(
      `UPDATE expense_reports
       SET total_amount = (
         SELECT COALESCE(SUM(amount), 0)
         FROM expense_items
         WHERE expense_report_id = $1
       ), updated_at = NOW()
       WHERE id = $1`,
      [id]
    );

    res.json({
      item_id: itemId,
      extraction: {
        confidence: extraction.confidence,
        data: extraction.data
      }
    });
  } catch (error) {
    console.error('Erreur scan justificatif:', error);
    res.status(500).json({ error: 'Erreur lors du scan du justificatif' });
  }
};

/**
 * POST /expense-reports/:id/submit
 * Soumettre une note de frais pour validation
 */
export const submitExpenseReport = async (req: Req, res: Response): Promise<void> => {
  try {
    const { workspaceId, id } = req.params;

    const existing = await pool.query(
      'SELECT status, total_amount FROM expense_reports WHERE id = $1 AND workspace_id = $2',
      [id, workspaceId]
    );

    if (!existing.rows[0]) {
      res.status(404).json({ error: 'Note de frais non trouvee' });
      return;
    }

    if (existing.rows[0].status !== 'draft') {
      res.status(400).json({ error: 'Seules les notes en brouillon peuvent etre soumises' });
      return;
    }

    if (parseFloat(existing.rows[0].total_amount) <= 0) {
      res.status(400).json({ error: 'La note de frais doit contenir au moins un item' });
      return;
    }

    const result = await pool.query<ExpenseReport>(
      `UPDATE expense_reports
       SET status = 'submitted', submitted_at = NOW(), updated_at = NOW()
       WHERE id = $1 AND workspace_id = $2
       RETURNING *`,
      [id, workspaceId]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erreur soumission note de frais:', error);
    res.status(500).json({ error: 'Erreur lors de la soumission de la note de frais' });
  }
};

/**
 * POST /expense-reports/:id/approve
 * Approuver une note de frais
 * Body: { reviewer_name, notes? }
 */
export const approveExpenseReport = async (req: Req, res: Response): Promise<void> => {
  try {
    const { workspaceId, id } = req.params;
    const { reviewer_name, notes } = req.body;

    if (!reviewer_name) {
      res.status(400).json({ error: 'Champ requis: reviewer_name' });
      return;
    }

    const existing = await pool.query(
      'SELECT status FROM expense_reports WHERE id = $1 AND workspace_id = $2',
      [id, workspaceId]
    );

    if (!existing.rows[0]) {
      res.status(404).json({ error: 'Note de frais non trouvee' });
      return;
    }

    if (existing.rows[0].status !== 'submitted' && existing.rows[0].status !== 'under_review') {
      res.status(400).json({ error: 'Seules les notes soumises peuvent etre approuvees' });
      return;
    }

    const result = await pool.query<ExpenseReport>(
      `UPDATE expense_reports
       SET status = 'approved', reviewed_at = NOW(), reviewer_name = $1,
           review_notes = $2, updated_at = NOW()
       WHERE id = $3 AND workspace_id = $4
       RETURNING *`,
      [reviewer_name, notes || null, id, workspaceId]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erreur approbation note de frais:', error);
    res.status(500).json({ error: 'Erreur lors de l\'approbation de la note de frais' });
  }
};

/**
 * POST /expense-reports/:id/reject
 * Rejeter une note de frais
 * Body: { reviewer_name, notes }
 */
export const rejectExpenseReport = async (req: Req, res: Response): Promise<void> => {
  try {
    const { workspaceId, id } = req.params;
    const { reviewer_name, notes } = req.body;

    if (!reviewer_name) {
      res.status(400).json({ error: 'Champ requis: reviewer_name' });
      return;
    }
    if (!notes) {
      res.status(400).json({ error: 'Champ requis: notes (motif du rejet)' });
      return;
    }

    const existing = await pool.query(
      'SELECT status FROM expense_reports WHERE id = $1 AND workspace_id = $2',
      [id, workspaceId]
    );

    if (!existing.rows[0]) {
      res.status(404).json({ error: 'Note de frais non trouvee' });
      return;
    }

    if (existing.rows[0].status !== 'submitted' && existing.rows[0].status !== 'under_review') {
      res.status(400).json({ error: 'Seules les notes soumises peuvent etre rejetees' });
      return;
    }

    const result = await pool.query<ExpenseReport>(
      `UPDATE expense_reports
       SET status = 'rejected', reviewed_at = NOW(), reviewer_name = $1,
           review_notes = $2, updated_at = NOW()
       WHERE id = $3 AND workspace_id = $4
       RETURNING *`,
      [reviewer_name, notes, id, workspaceId]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erreur rejet note de frais:', error);
    res.status(500).json({ error: 'Erreur lors du rejet de la note de frais' });
  }
};

/**
 * POST /expense-reports/:id/reimburse
 * Marquer une note de frais comme remboursee
 */
export const reimburseExpenseReport = async (req: Req, res: Response): Promise<void> => {
  try {
    const { workspaceId, id } = req.params;

    const existing = await pool.query(
      'SELECT status FROM expense_reports WHERE id = $1 AND workspace_id = $2',
      [id, workspaceId]
    );

    if (!existing.rows[0]) {
      res.status(404).json({ error: 'Note de frais non trouvee' });
      return;
    }

    if (existing.rows[0].status !== 'approved') {
      res.status(400).json({ error: 'Seules les notes approuvees peuvent etre remboursees' });
      return;
    }

    const result = await pool.query<ExpenseReport>(
      `UPDATE expense_reports
       SET status = 'reimbursed', reimbursed_at = NOW(), updated_at = NOW()
       WHERE id = $1 AND workspace_id = $2
       RETURNING *`,
      [id, workspaceId]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erreur remboursement note de frais:', error);
    res.status(500).json({ error: 'Erreur lors du remboursement de la note de frais' });
  }
};
