/**
 * Module Comptabilité - Service Notes de Frais
 * @description Gestion des notes de frais avec workflow d'approbation
 * (draft -> submitted -> under_review -> approved/rejected -> reimbursed)
 */

import { Pool } from 'pg';
import {
  ExpenseReport,
  ExpenseItem,
  CreateExpenseReportDTO,
  UpdateExpenseReportDTO,
  CreateExpenseItemDTO,
  ExpenseReportFilters,
  ExpenseStatus,
  PaginatedResponse
} from './accounting.types.js';

let pool: Pool;

export const initExpensesService = (dbPool: Pool): void => {
  pool = dbPool;
};

// ============================================
// CRÉATION
// ============================================

/**
 * Crée une nouvelle note de frais en statut 'draft'
 */
export const createExpenseReport = async (
  workspaceId: string,
  data: CreateExpenseReportDTO
): Promise<ExpenseReport> => {
  try {
    const result = await pool.query<ExpenseReport>(
      `INSERT INTO expense_reports (
        workspace_id, member_id, member_name, department_id,
        title, description, status, total_amount, currency
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

    return result.rows[0];
  } catch (error) {
    throw new Error(`Erreur création note de frais: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
};

// ============================================
// LISTE PAGINÉE
// ============================================

/**
 * Liste les notes de frais avec pagination et filtres
 */
export const listExpenseReports = async (
  workspaceId: string,
  filters: ExpenseReportFilters
): Promise<PaginatedResponse<ExpenseReport>> => {
  try {
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 20, 100);
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE er.workspace_id = $1';
    const params: (string | number)[] = [workspaceId];
    let paramIndex = 2;

    if (filters.status) {
      whereClause += ` AND er.status = $${paramIndex++}`;
      params.push(filters.status);
    }

    if (filters.member_id) {
      whereClause += ` AND er.member_id = $${paramIndex++}`;
      params.push(filters.member_id);
    }

    if (filters.department_id) {
      whereClause += ` AND er.department_id = $${paramIndex++}`;
      params.push(filters.department_id);
    }

    if (filters.date_from) {
      whereClause += ` AND er.created_at >= $${paramIndex++}`;
      params.push(filters.date_from);
    }

    if (filters.date_to) {
      whereClause += ` AND er.created_at <= $${paramIndex++}`;
      params.push(filters.date_to);
    }

    // Count
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM expense_reports er ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count, 10);

    // Fetch
    params.push(limit, offset);
    const result = await pool.query<ExpenseReport>(
      `SELECT er.*,
        d.name as department_name
       FROM expense_reports er
       LEFT JOIN departments d ON er.department_id = d.id
       ${whereClause}
       ORDER BY er.created_at DESC
       LIMIT $${paramIndex++} OFFSET $${paramIndex}`,
      params
    );

    return {
      data: result.rows,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    throw new Error(`Erreur liste notes de frais: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
};

// ============================================
// DÉTAIL AVEC ITEMS
// ============================================

/**
 * Récupère une note de frais par ID avec tous ses items
 */
export const getExpenseReportById = async (
  workspaceId: string,
  reportId: string
): Promise<ExpenseReport | null> => {
  try {
    const reportResult = await pool.query<ExpenseReport>(
      `SELECT er.*,
        d.name as department_name
       FROM expense_reports er
       LEFT JOIN departments d ON er.department_id = d.id
       WHERE er.id = $1 AND er.workspace_id = $2`,
      [reportId, workspaceId]
    );

    if (!reportResult.rows[0]) return null;

    const itemsResult = await pool.query<ExpenseItem>(
      `SELECT ei.*, c.name as category_name
       FROM expense_items ei
       LEFT JOIN accounting_categories c ON ei.category_id = c.id
       WHERE ei.expense_report_id = $1
       ORDER BY ei.date ASC, ei.created_at ASC`,
      [reportId]
    );

    return {
      ...reportResult.rows[0],
      items: itemsResult.rows.map(item => ({
        ...item,
        amount: parseFloat(item.amount as unknown as string),
        tva_rate: parseFloat(item.tva_rate as unknown as string),
        tva_amount: parseFloat(item.tva_amount as unknown as string)
      }))
    };
  } catch (error) {
    throw new Error(`Erreur récupération note de frais: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
};

// ============================================
// MISE À JOUR (BROUILLON UNIQUEMENT)
// ============================================

/**
 * Met à jour une note de frais (uniquement si en statut 'draft')
 */
export const updateExpenseReport = async (
  workspaceId: string,
  reportId: string,
  data: UpdateExpenseReportDTO
): Promise<ExpenseReport | null> => {
  try {
    // Vérifier que le rapport est en brouillon
    const checkResult = await pool.query(
      `SELECT status FROM expense_reports
       WHERE id = $1 AND workspace_id = $2`,
      [reportId, workspaceId]
    );

    if (!checkResult.rows[0]) return null;
    if (checkResult.rows[0].status !== 'draft') {
      throw new Error('Seules les notes de frais en brouillon peuvent être modifiées');
    }

    const fields: string[] = [];
    const values: (string | null)[] = [];
    let paramIndex = 1;

    if (data.title !== undefined) {
      fields.push(`title = $${paramIndex++}`);
      values.push(data.title);
    }
    if (data.description !== undefined) {
      fields.push(`description = $${paramIndex++}`);
      values.push(data.description || null);
    }
    if (data.department_id !== undefined) {
      fields.push(`department_id = $${paramIndex++}`);
      values.push(data.department_id || null);
    }

    if (fields.length === 0) {
      return getExpenseReportById(workspaceId, reportId);
    }

    values.push(reportId, workspaceId);
    const result = await pool.query<ExpenseReport>(
      `UPDATE expense_reports
       SET ${fields.join(', ')}, updated_at = NOW()
       WHERE id = $${paramIndex++} AND workspace_id = $${paramIndex}
       RETURNING *`,
      values
    );

    return result.rows[0] || null;
  } catch (error) {
    throw new Error(`Erreur mise à jour note de frais: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
};

// ============================================
// GESTION DES ITEMS
// ============================================

/**
 * Ajoute un item à une note de frais et recalcule le total
 */
export const addExpenseItem = async (
  reportId: string,
  data: CreateExpenseItemDTO
): Promise<ExpenseItem> => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Vérifier que le rapport existe et est en draft
    const reportCheck = await client.query(
      `SELECT id, status FROM expense_reports WHERE id = $1`,
      [reportId]
    );

    if (!reportCheck.rows[0]) {
      throw new Error('Note de frais non trouvée');
    }
    if (reportCheck.rows[0].status !== 'draft') {
      throw new Error('Impossible d\'ajouter un item à une note de frais qui n\'est pas en brouillon');
    }

    const tvaRate = data.tva_rate ?? 20;
    const tvaAmount = data.amount * (tvaRate / (100 + tvaRate));

    const itemResult = await client.query<ExpenseItem>(
      `INSERT INTO expense_items (
        expense_report_id, date, description, category_id,
        amount, currency, tva_rate, tva_amount, receipt_url, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        reportId,
        data.date,
        data.description,
        data.category_id || null,
        data.amount,
        data.currency || 'EUR',
        tvaRate,
        Math.round(tvaAmount * 100) / 100,
        data.receipt_url || null,
        data.notes || null
      ]
    );

    // Recalculer le total de la note de frais
    await recalculateTotal(client, reportId);

    await client.query('COMMIT');
    return itemResult.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw new Error(`Erreur ajout item: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  } finally {
    client.release();
  }
};

/**
 * Supprime un item d'une note de frais et recalcule le total
 */
export const removeExpenseItem = async (
  reportId: string,
  itemId: string
): Promise<boolean> => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Vérifier que le rapport est en draft
    const reportCheck = await client.query(
      `SELECT status FROM expense_reports WHERE id = $1`,
      [reportId]
    );

    if (!reportCheck.rows[0]) {
      throw new Error('Note de frais non trouvée');
    }
    if (reportCheck.rows[0].status !== 'draft') {
      throw new Error('Impossible de supprimer un item d\'une note de frais qui n\'est pas en brouillon');
    }

    const deleteResult = await client.query(
      `DELETE FROM expense_items
       WHERE id = $1 AND expense_report_id = $2`,
      [itemId, reportId]
    );

    if ((deleteResult.rowCount ?? 0) === 0) {
      await client.query('ROLLBACK');
      return false;
    }

    // Recalculer le total
    await recalculateTotal(client, reportId);

    await client.query('COMMIT');
    return true;
  } catch (error) {
    await client.query('ROLLBACK');
    throw new Error(`Erreur suppression item: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  } finally {
    client.release();
  }
};

// ============================================
// WORKFLOW D'APPROBATION
// ============================================

/**
 * Soumet une note de frais pour approbation (draft -> submitted)
 */
export const submitExpenseReport = async (
  workspaceId: string,
  reportId: string
): Promise<ExpenseReport | null> => {
  try {
    return await transitionStatus(workspaceId, reportId, 'draft', 'submitted', {
      submitted_at: 'NOW()'
    });
  } catch (error) {
    throw new Error(`Erreur soumission note de frais: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
};

/**
 * Approuve une note de frais (submitted/under_review -> approved)
 */
export const approveExpenseReport = async (
  workspaceId: string,
  reportId: string,
  reviewerName: string,
  notes?: string
): Promise<ExpenseReport | null> => {
  try {
    const report = await getReportForTransition(workspaceId, reportId);
    if (!report) return null;

    const validFrom: ExpenseStatus[] = ['submitted', 'under_review'];
    if (!validFrom.includes(report.status)) {
      throw new Error(`Impossible d'approuver: statut actuel '${report.status}', attendu 'submitted' ou 'under_review'`);
    }

    const result = await pool.query<ExpenseReport>(
      `UPDATE expense_reports
       SET status = 'approved',
           reviewer_name = $1,
           review_notes = $2,
           reviewed_at = NOW(),
           updated_at = NOW()
       WHERE id = $3 AND workspace_id = $4
       RETURNING *`,
      [reviewerName, notes || null, reportId, workspaceId]
    );

    return result.rows[0] || null;
  } catch (error) {
    throw new Error(`Erreur approbation note de frais: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
};

/**
 * Rejette une note de frais (submitted/under_review -> rejected)
 */
export const rejectExpenseReport = async (
  workspaceId: string,
  reportId: string,
  reviewerName: string,
  notes: string
): Promise<ExpenseReport | null> => {
  try {
    const report = await getReportForTransition(workspaceId, reportId);
    if (!report) return null;

    const validFrom: ExpenseStatus[] = ['submitted', 'under_review'];
    if (!validFrom.includes(report.status)) {
      throw new Error(`Impossible de rejeter: statut actuel '${report.status}', attendu 'submitted' ou 'under_review'`);
    }

    const result = await pool.query<ExpenseReport>(
      `UPDATE expense_reports
       SET status = 'rejected',
           reviewer_name = $1,
           review_notes = $2,
           reviewed_at = NOW(),
           updated_at = NOW()
       WHERE id = $3 AND workspace_id = $4
       RETURNING *`,
      [reviewerName, notes, reportId, workspaceId]
    );

    return result.rows[0] || null;
  } catch (error) {
    throw new Error(`Erreur rejet note de frais: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
};

/**
 * Marque une note de frais comme remboursée (approved -> reimbursed)
 */
export const reimburseExpenseReport = async (
  workspaceId: string,
  reportId: string
): Promise<ExpenseReport | null> => {
  try {
    return await transitionStatus(workspaceId, reportId, 'approved', 'reimbursed', {
      reimbursed_at: 'NOW()'
    });
  } catch (error) {
    throw new Error(`Erreur remboursement note de frais: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
};

// ============================================
// UTILITAIRES INTERNES
// ============================================

/**
 * Recalcule le total d'une note de frais à partir de ses items
 */
const recalculateTotal = async (
  client: { query: (text: string, values?: unknown[]) => Promise<unknown> },
  reportId: string
): Promise<void> => {
  await client.query(
    `UPDATE expense_reports
     SET total_amount = COALESCE((
       SELECT SUM(amount) FROM expense_items WHERE expense_report_id = $1
     ), 0),
     updated_at = NOW()
     WHERE id = $1`,
    [reportId]
  );
};

/**
 * Récupère un rapport pour vérifier son statut avant transition
 */
const getReportForTransition = async (
  workspaceId: string,
  reportId: string
): Promise<{ status: ExpenseStatus } | null> => {
  const result = await pool.query<{ status: ExpenseStatus }>(
    `SELECT status FROM expense_reports
     WHERE id = $1 AND workspace_id = $2`,
    [reportId, workspaceId]
  );
  return result.rows[0] || null;
};

/**
 * Effectue une transition de statut avec validation
 */
const transitionStatus = async (
  workspaceId: string,
  reportId: string,
  expectedFrom: ExpenseStatus,
  newStatus: ExpenseStatus,
  extraFields: Record<string, string>
): Promise<ExpenseReport | null> => {
  const report = await getReportForTransition(workspaceId, reportId);
  if (!report) return null;

  if (report.status !== expectedFrom) {
    throw new Error(
      `Transition invalide: statut actuel '${report.status}', attendu '${expectedFrom}' pour passer à '${newStatus}'`
    );
  }

  const extraSets = Object.entries(extraFields)
    .map(([field, value]) => `${field} = ${value}`)
    .join(', ');

  const extraSetClause = extraSets ? `, ${extraSets}` : '';

  const result = await pool.query<ExpenseReport>(
    `UPDATE expense_reports
     SET status = $1, updated_at = NOW()${extraSetClause}
     WHERE id = $2 AND workspace_id = $3
     RETURNING *`,
    [newStatus, reportId, workspaceId]
  );

  return result.rows[0] || null;
};
