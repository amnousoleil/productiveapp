/**
 * Module Comptabilité - Service Départements & Budgets
 * @description Gestion des départements, lignes budgétaires et analyse des écarts
 */

import { Pool } from 'pg';
import {
  Department,
  CreateDepartmentDTO,
  UpdateDepartmentDTO,
  BudgetLine,
  CreateBudgetDTO,
  BudgetOverview,
  DepartmentBudgetSummary
} from './accounting.types.js';

let pool: Pool;

export const initDepartmentsService = (dbPool: Pool): void => {
  pool = dbPool;
};

// ============================================
// GESTION DES DÉPARTEMENTS
// ============================================

/**
 * Crée un nouveau département
 */
export const createDepartment = async (
  workspaceId: string,
  data: CreateDepartmentDTO
): Promise<Department> => {
  try {
    const result = await pool.query<Department>(
      `INSERT INTO departments (
        workspace_id, name, code, manager_name, is_active
      ) VALUES ($1, $2, $3, $4, true)
      RETURNING *`,
      [
        workspaceId,
        data.name,
        data.code,
        data.manager_name || null
      ]
    );

    return result.rows[0];
  } catch (error) {
    throw new Error(`Erreur création département: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
};

/**
 * Liste tous les départements actifs d'un workspace
 */
export const listDepartments = async (
  workspaceId: string
): Promise<Department[]> => {
  try {
    const result = await pool.query<Department>(
      `SELECT * FROM departments
       WHERE workspace_id = $1 AND is_active = true
       ORDER BY name ASC`,
      [workspaceId]
    );

    return result.rows;
  } catch (error) {
    throw new Error(`Erreur liste départements: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
};

/**
 * Met à jour un département
 */
export const updateDepartment = async (
  workspaceId: string,
  departmentId: string,
  data: UpdateDepartmentDTO
): Promise<Department | null> => {
  try {
    const fields: string[] = [];
    const values: (string | boolean | null)[] = [];
    let paramIndex = 1;

    const allowedFields: (keyof UpdateDepartmentDTO)[] = [
      'name', 'code', 'manager_name', 'is_active'
    ];

    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        fields.push(`${field} = $${paramIndex++}`);
        values.push(data[field] as string | boolean | null);
      }
    }

    if (fields.length === 0) return null;

    values.push(departmentId, workspaceId);
    const result = await pool.query<Department>(
      `UPDATE departments
       SET ${fields.join(', ')}, updated_at = NOW()
       WHERE id = $${paramIndex++} AND workspace_id = $${paramIndex}
       RETURNING *`,
      values
    );

    return result.rows[0] || null;
  } catch (error) {
    throw new Error(`Erreur mise à jour département: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
};

/**
 * Désactive un département (soft delete)
 */
export const deleteDepartment = async (
  workspaceId: string,
  departmentId: string
): Promise<boolean> => {
  try {
    const result = await pool.query(
      `UPDATE departments
       SET is_active = false, updated_at = NOW()
       WHERE id = $1 AND workspace_id = $2`,
      [departmentId, workspaceId]
    );
    return (result.rowCount ?? 0) > 0;
  } catch (error) {
    throw new Error(`Erreur suppression département: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
};

// ============================================
// GESTION DES LIGNES BUDGÉTAIRES
// ============================================

/**
 * Crée ou met à jour une ligne budgétaire (UPSERT)
 * Si une ligne existe déjà pour le même department_id + category_id + year + month,
 * elle est mise à jour avec le nouveau montant alloué.
 */
export const setBudgetLine = async (
  workspaceId: string,
  data: CreateBudgetDTO
): Promise<BudgetLine> => {
  try {
    const result = await pool.query<BudgetLine>(
      `INSERT INTO budget_lines (
        workspace_id, department_id, category_id, year, month,
        budget_amount, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (workspace_id, department_id, COALESCE(category_id, '00000000-0000-0000-0000-000000000000'), year, COALESCE(month, 0))
      DO UPDATE SET
        budget_amount = EXCLUDED.budget_amount,
        notes = COALESCE(EXCLUDED.notes, budget_lines.notes),
        updated_at = NOW()
      RETURNING *`,
      [
        workspaceId,
        data.department_id,
        data.category_id || null,
        data.year,
        data.month ?? null,
        data.budget_amount,
        data.notes || null
      ]
    );

    return result.rows[0];
  } catch (error) {
    // If UPSERT fails due to missing unique constraint, fall back to INSERT or UPDATE
    try {
      // Check if exists
      const existing = await pool.query<BudgetLine>(
        `SELECT id FROM budget_lines
         WHERE workspace_id = $1 AND department_id = $2
           AND COALESCE(category_id, '00000000-0000-0000-0000-000000000000') = COALESCE($3, '00000000-0000-0000-0000-000000000000')
           AND year = $4
           AND COALESCE(month, 0) = COALESCE($5, 0)`,
        [workspaceId, data.department_id, data.category_id || null, data.year, data.month ?? null]
      );

      if (existing.rows.length > 0) {
        const updateResult = await pool.query<BudgetLine>(
          `UPDATE budget_lines
           SET budget_amount = $1, notes = COALESCE($2, notes), updated_at = NOW()
           WHERE id = $3
           RETURNING *`,
          [data.budget_amount, data.notes || null, existing.rows[0].id]
        );
        return updateResult.rows[0];
      } else {
        const insertResult = await pool.query<BudgetLine>(
          `INSERT INTO budget_lines (
            workspace_id, department_id, category_id, year, month,
            budget_amount, notes
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING *`,
          [
            workspaceId, data.department_id, data.category_id || null,
            data.year, data.month ?? null, data.budget_amount,
            data.notes || null
          ]
        );
        return insertResult.rows[0];
      }
    } catch (fallbackError) {
      throw new Error(`Erreur UPSERT budget: ${fallbackError instanceof Error ? fallbackError.message : 'Erreur inconnue'}`);
    }
  }
};

// ============================================
// VUE D'ENSEMBLE BUDGÉTAIRE
// ============================================

/**
 * Vue globale du budget : toutes les lignes avec montants réels calculés depuis les factures
 */
export const getBudgetOverview = async (
  workspaceId: string,
  year: number
): Promise<BudgetOverview> => {
  try {
    // Récupérer toutes les lignes budgétaires avec noms
    const budgetResult = await pool.query<BudgetLine & { department_name: string; category_name: string }>(
      `SELECT
        bl.*,
        d.name as department_name,
        c.name as category_name
       FROM budget_lines bl
       JOIN departments d ON bl.department_id = d.id
       LEFT JOIN accounting_categories c ON bl.category_id = c.id
       WHERE bl.workspace_id = $1 AND bl.year = $2
       ORDER BY d.name, c.name`,
      [workspaceId, year]
    );

    // Calculer les montants réels par département à partir des factures
    const actualResult = await pool.query(
      `SELECT
        i.department_id,
        COALESCE(SUM(i.montant_ttc), 0) as actual_total
       FROM invoices i
       WHERE i.workspace_id = $1
         AND EXTRACT(YEAR FROM i.date_facture) = $2
         AND i.type = 'expense'
         AND i.department_id IS NOT NULL
       GROUP BY i.department_id`,
      [workspaceId, year]
    );

    const actualByDept: Record<string, number> = {};
    for (const row of actualResult.rows) {
      actualByDept[row.department_id] = parseFloat(row.actual_total);
    }

    // Agréger par département
    const deptMap: Record<string, DepartmentBudgetSummary> = {};

    for (const line of budgetResult.rows) {
      const deptId = line.department_id;
      if (!deptMap[deptId]) {
        deptMap[deptId] = {
          department_id: deptId,
          department_name: line.department_name,
          allocated: 0,
          actual: actualByDept[deptId] || 0,
          variance: 0,
          utilization_pct: 0
        };
      }
      deptMap[deptId].allocated += parseFloat(line.budget_amount as unknown as string);
    }

    const byDepartment: DepartmentBudgetSummary[] = Object.values(deptMap).map(dept => ({
      ...dept,
      variance: dept.allocated - dept.actual,
      utilization_pct: dept.allocated > 0 ? Math.round((dept.actual / dept.allocated) * 10000) / 100 : 0
    }));

    const totalAllocated = byDepartment.reduce((sum, d) => sum + d.allocated, 0);
    const totalActual = byDepartment.reduce((sum, d) => sum + d.actual, 0);

    return {
      year,
      total_allocated: totalAllocated,
      total_actual: totalActual,
      total_variance: totalAllocated - totalActual,
      utilization_pct: totalAllocated > 0 ? Math.round((totalActual / totalAllocated) * 10000) / 100 : 0,
      by_department: byDepartment
    };
  } catch (error) {
    throw new Error(`Erreur vue budget: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
};

// ============================================
// ÉCARTS BUDGÉTAIRES
// ============================================

/**
 * Analyse des écarts budget vs réel avec pourcentage d'utilisation
 * Optionnel: filtrer par département
 */
export const getBudgetVariance = async (
  workspaceId: string,
  year: number,
  departmentId?: string
): Promise<Array<BudgetLine & { actual_amount: number; utilization_pct: number; variance: number }>> => {
  try {
    let deptFilter = '';
    const params: (string | number)[] = [workspaceId, year];
    let paramIndex = 3;

    if (departmentId) {
      deptFilter = ` AND bl.department_id = $${paramIndex++}`;
      params.push(departmentId);
    }

    const result = await pool.query(
      `SELECT
        bl.*,
        d.name as department_name,
        c.name as category_name,
        COALESCE(actual.total, 0) as actual_amount
       FROM budget_lines bl
       JOIN departments d ON bl.department_id = d.id
       LEFT JOIN accounting_categories c ON bl.category_id = c.id
       LEFT JOIN LATERAL (
         SELECT SUM(i.montant_ttc) as total
         FROM invoices i
         WHERE i.workspace_id = bl.workspace_id
           AND i.type = 'expense'
           AND i.department_id = bl.department_id
           AND (bl.category_id IS NULL OR i.category_id = bl.category_id)
           AND EXTRACT(YEAR FROM i.date_facture) = bl.year
           AND (bl.month IS NULL OR EXTRACT(MONTH FROM i.date_facture) = bl.month)
       ) actual ON true
       WHERE bl.workspace_id = $1 AND bl.year = $2${deptFilter}
       ORDER BY d.name, bl.month NULLS FIRST, c.name`,
      params
    );

    return result.rows.map(row => {
      const allocated = parseFloat(row.budget_amount);
      const actual = parseFloat(row.actual_amount);
      return {
        ...row,
        budget_amount: allocated,
        actual_amount: actual,
        variance: allocated - actual,
        utilization_pct: allocated > 0 ? Math.round((actual / allocated) * 10000) / 100 : 0
      };
    });
  } catch (error) {
    throw new Error(`Erreur écarts budgétaires: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
};

// ============================================
// BUDGET DÉTAILLÉ PAR DÉPARTEMENT
// ============================================

/**
 * Budget détaillé pour un département spécifique avec ventilation mensuelle
 */
export const getDepartmentBudget = async (
  workspaceId: string,
  departmentId: string,
  year: number
): Promise<{
  department: Department;
  budget_lines: BudgetLine[];
  monthly_actuals: Array<{ month: number; actual: number }>;
  total_allocated: number;
  total_actual: number;
  variance: number;
  utilization_pct: number;
}> => {
  try {
    // Récupérer le département
    const deptResult = await pool.query<Department>(
      `SELECT * FROM departments
       WHERE id = $1 AND workspace_id = $2`,
      [departmentId, workspaceId]
    );

    if (!deptResult.rows[0]) {
      throw new Error('Département non trouvé');
    }

    // Récupérer les lignes budgétaires
    const budgetResult = await pool.query<BudgetLine>(
      `SELECT bl.*, c.name as category_name
       FROM budget_lines bl
       LEFT JOIN accounting_categories c ON bl.category_id = c.id
       WHERE bl.workspace_id = $1 AND bl.department_id = $2 AND bl.year = $3
       ORDER BY bl.month NULLS FIRST, c.name`,
      [workspaceId, departmentId, year]
    );

    // Dépenses réelles mensuelles
    const monthlyResult = await pool.query(
      `SELECT
        EXTRACT(MONTH FROM date_facture)::int as month,
        COALESCE(SUM(montant_ttc), 0) as actual
       FROM invoices
       WHERE workspace_id = $1
         AND department_id = $2
         AND type = 'expense'
         AND EXTRACT(YEAR FROM date_facture) = $3
       GROUP BY EXTRACT(MONTH FROM date_facture)
       ORDER BY month`,
      [workspaceId, departmentId, year]
    );

    // Remplir les 12 mois (y compris ceux sans données)
    const monthlyActuals: Array<{ month: number; actual: number }> = [];
    const monthlyMap: Record<number, number> = {};
    for (const row of monthlyResult.rows) {
      monthlyMap[row.month] = parseFloat(row.actual);
    }
    for (let m = 1; m <= 12; m++) {
      monthlyActuals.push({ month: m, actual: monthlyMap[m] || 0 });
    }

    const totalAllocated = budgetResult.rows.reduce(
      (sum, bl) => sum + parseFloat(bl.budget_amount as unknown as string), 0
    );
    const totalActual = monthlyActuals.reduce((sum, m) => sum + m.actual, 0);

    return {
      department: deptResult.rows[0],
      budget_lines: budgetResult.rows.map(bl => ({
        ...bl,
        budget_amount: parseFloat(bl.budget_amount as unknown as string)
      })),
      monthly_actuals: monthlyActuals,
      total_allocated: totalAllocated,
      total_actual: totalActual,
      variance: totalAllocated - totalActual,
      utilization_pct: totalAllocated > 0 ? Math.round((totalActual / totalAllocated) * 10000) / 100 : 0
    };
  } catch (error) {
    throw new Error(`Erreur budget département: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  }
};
