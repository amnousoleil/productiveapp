"use strict";
/**
 * Module Comptabilité - Service Départements & Budgets
 * @description Gestion des départements, lignes budgétaires et analyse des écarts
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDepartmentBudget = exports.getBudgetVariance = exports.getBudgetOverview = exports.setBudgetLine = exports.deleteDepartment = exports.updateDepartment = exports.listDepartments = exports.createDepartment = exports.initDepartmentsService = void 0;
let pool;
const initDepartmentsService = (dbPool) => {
    pool = dbPool;
};
exports.initDepartmentsService = initDepartmentsService;
// ============================================
// GESTION DES DÉPARTEMENTS
// ============================================
/**
 * Crée un nouveau département
 */
const createDepartment = async (workspaceId, data) => {
    try {
        const result = await pool.query(`INSERT INTO departments (
        workspace_id, name, code, manager_name, is_active
      ) VALUES ($1, $2, $3, $4, true)
      RETURNING *`, [
            workspaceId,
            data.name,
            data.code,
            data.manager_name || null
        ]);
        return result.rows[0];
    }
    catch (error) {
        throw new Error(`Erreur création département: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
};
exports.createDepartment = createDepartment;
/**
 * Liste tous les départements actifs d'un workspace
 */
const listDepartments = async (workspaceId) => {
    try {
        const result = await pool.query(`SELECT * FROM departments
       WHERE workspace_id = $1 AND is_active = true
       ORDER BY name ASC`, [workspaceId]);
        return result.rows;
    }
    catch (error) {
        throw new Error(`Erreur liste départements: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
};
exports.listDepartments = listDepartments;
/**
 * Met à jour un département
 */
const updateDepartment = async (workspaceId, departmentId, data) => {
    try {
        const fields = [];
        const values = [];
        let paramIndex = 1;
        const allowedFields = [
            'name', 'code', 'manager_name', 'is_active'
        ];
        for (const field of allowedFields) {
            if (data[field] !== undefined) {
                fields.push(`${field} = $${paramIndex++}`);
                values.push(data[field]);
            }
        }
        if (fields.length === 0)
            return null;
        values.push(departmentId, workspaceId);
        const result = await pool.query(`UPDATE departments
       SET ${fields.join(', ')}, updated_at = NOW()
       WHERE id = $${paramIndex++} AND workspace_id = $${paramIndex}
       RETURNING *`, values);
        return result.rows[0] || null;
    }
    catch (error) {
        throw new Error(`Erreur mise à jour département: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
};
exports.updateDepartment = updateDepartment;
/**
 * Désactive un département (soft delete)
 */
const deleteDepartment = async (workspaceId, departmentId) => {
    try {
        const result = await pool.query(`UPDATE departments
       SET is_active = false, updated_at = NOW()
       WHERE id = $1 AND workspace_id = $2`, [departmentId, workspaceId]);
        return (result.rowCount ?? 0) > 0;
    }
    catch (error) {
        throw new Error(`Erreur suppression département: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
};
exports.deleteDepartment = deleteDepartment;
// ============================================
// GESTION DES LIGNES BUDGÉTAIRES
// ============================================
/**
 * Crée ou met à jour une ligne budgétaire (UPSERT)
 * Si une ligne existe déjà pour le même department_id + category_id + year + month,
 * elle est mise à jour avec le nouveau montant alloué.
 */
const setBudgetLine = async (workspaceId, data) => {
    try {
        const result = await pool.query(`INSERT INTO budget_lines (
        workspace_id, department_id, category_id, year, month,
        budget_amount, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (workspace_id, department_id, COALESCE(category_id, '00000000-0000-0000-0000-000000000000'), year, COALESCE(month, 0))
      DO UPDATE SET
        budget_amount = EXCLUDED.budget_amount,
        notes = COALESCE(EXCLUDED.notes, budget_lines.notes),
        updated_at = NOW()
      RETURNING *`, [
            workspaceId,
            data.department_id,
            data.category_id || null,
            data.year,
            data.month ?? null,
            data.budget_amount,
            data.notes || null
        ]);
        return result.rows[0];
    }
    catch (error) {
        // If UPSERT fails due to missing unique constraint, fall back to INSERT or UPDATE
        try {
            // Check if exists
            const existing = await pool.query(`SELECT id FROM budget_lines
         WHERE workspace_id = $1 AND department_id = $2
           AND COALESCE(category_id, '00000000-0000-0000-0000-000000000000') = COALESCE($3, '00000000-0000-0000-0000-000000000000')
           AND year = $4
           AND COALESCE(month, 0) = COALESCE($5, 0)`, [workspaceId, data.department_id, data.category_id || null, data.year, data.month ?? null]);
            if (existing.rows.length > 0) {
                const updateResult = await pool.query(`UPDATE budget_lines
           SET budget_amount = $1, notes = COALESCE($2, notes), updated_at = NOW()
           WHERE id = $3
           RETURNING *`, [data.budget_amount, data.notes || null, existing.rows[0].id]);
                return updateResult.rows[0];
            }
            else {
                const insertResult = await pool.query(`INSERT INTO budget_lines (
            workspace_id, department_id, category_id, year, month,
            budget_amount, notes
          ) VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING *`, [
                    workspaceId, data.department_id, data.category_id || null,
                    data.year, data.month ?? null, data.budget_amount,
                    data.notes || null
                ]);
                return insertResult.rows[0];
            }
        }
        catch (fallbackError) {
            throw new Error(`Erreur UPSERT budget: ${fallbackError instanceof Error ? fallbackError.message : 'Erreur inconnue'}`);
        }
    }
};
exports.setBudgetLine = setBudgetLine;
// ============================================
// VUE D'ENSEMBLE BUDGÉTAIRE
// ============================================
/**
 * Vue globale du budget : toutes les lignes avec montants réels calculés depuis les factures
 */
const getBudgetOverview = async (workspaceId, year) => {
    try {
        // Récupérer toutes les lignes budgétaires avec noms
        const budgetResult = await pool.query(`SELECT
        bl.*,
        d.name as department_name,
        c.name as category_name
       FROM budget_lines bl
       JOIN departments d ON bl.department_id = d.id
       LEFT JOIN accounting_categories c ON bl.category_id = c.id
       WHERE bl.workspace_id = $1 AND bl.year = $2
       ORDER BY d.name, c.name`, [workspaceId, year]);
        // Calculer les montants réels par département à partir des factures
        const actualResult = await pool.query(`SELECT
        i.department_id,
        COALESCE(SUM(i.montant_ttc), 0) as actual_total
       FROM invoices i
       WHERE i.workspace_id = $1
         AND EXTRACT(YEAR FROM i.date_facture) = $2
         AND i.type = 'expense'
         AND i.department_id IS NOT NULL
       GROUP BY i.department_id`, [workspaceId, year]);
        const actualByDept = {};
        for (const row of actualResult.rows) {
            actualByDept[row.department_id] = parseFloat(row.actual_total);
        }
        // Agréger par département
        const deptMap = {};
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
            deptMap[deptId].allocated += parseFloat(line.budget_amount);
        }
        const byDepartment = Object.values(deptMap).map(dept => ({
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
    }
    catch (error) {
        throw new Error(`Erreur vue budget: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
};
exports.getBudgetOverview = getBudgetOverview;
// ============================================
// ÉCARTS BUDGÉTAIRES
// ============================================
/**
 * Analyse des écarts budget vs réel avec pourcentage d'utilisation
 * Optionnel: filtrer par département
 */
const getBudgetVariance = async (workspaceId, year, departmentId) => {
    try {
        let deptFilter = '';
        const params = [workspaceId, year];
        let paramIndex = 3;
        if (departmentId) {
            deptFilter = ` AND bl.department_id = $${paramIndex++}`;
            params.push(departmentId);
        }
        const result = await pool.query(`SELECT
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
       ORDER BY d.name, bl.month NULLS FIRST, c.name`, params);
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
    }
    catch (error) {
        throw new Error(`Erreur écarts budgétaires: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
};
exports.getBudgetVariance = getBudgetVariance;
// ============================================
// BUDGET DÉTAILLÉ PAR DÉPARTEMENT
// ============================================
/**
 * Budget détaillé pour un département spécifique avec ventilation mensuelle
 */
const getDepartmentBudget = async (workspaceId, departmentId, year) => {
    try {
        // Récupérer le département
        const deptResult = await pool.query(`SELECT * FROM departments
       WHERE id = $1 AND workspace_id = $2`, [departmentId, workspaceId]);
        if (!deptResult.rows[0]) {
            throw new Error('Département non trouvé');
        }
        // Récupérer les lignes budgétaires
        const budgetResult = await pool.query(`SELECT bl.*, c.name as category_name
       FROM budget_lines bl
       LEFT JOIN accounting_categories c ON bl.category_id = c.id
       WHERE bl.workspace_id = $1 AND bl.department_id = $2 AND bl.year = $3
       ORDER BY bl.month NULLS FIRST, c.name`, [workspaceId, departmentId, year]);
        // Dépenses réelles mensuelles
        const monthlyResult = await pool.query(`SELECT
        EXTRACT(MONTH FROM date_facture)::int as month,
        COALESCE(SUM(montant_ttc), 0) as actual
       FROM invoices
       WHERE workspace_id = $1
         AND department_id = $2
         AND type = 'expense'
         AND EXTRACT(YEAR FROM date_facture) = $3
       GROUP BY EXTRACT(MONTH FROM date_facture)
       ORDER BY month`, [workspaceId, departmentId, year]);
        // Remplir les 12 mois (y compris ceux sans données)
        const monthlyActuals = [];
        const monthlyMap = {};
        for (const row of monthlyResult.rows) {
            monthlyMap[row.month] = parseFloat(row.actual);
        }
        for (let m = 1; m <= 12; m++) {
            monthlyActuals.push({ month: m, actual: monthlyMap[m] || 0 });
        }
        const totalAllocated = budgetResult.rows.reduce((sum, bl) => sum + parseFloat(bl.budget_amount), 0);
        const totalActual = monthlyActuals.reduce((sum, m) => sum + m.actual, 0);
        return {
            department: deptResult.rows[0],
            budget_lines: budgetResult.rows.map(bl => ({
                ...bl,
                budget_amount: parseFloat(bl.budget_amount)
            })),
            monthly_actuals: monthlyActuals,
            total_allocated: totalAllocated,
            total_actual: totalActual,
            variance: totalAllocated - totalActual,
            utilization_pct: totalAllocated > 0 ? Math.round((totalActual / totalAllocated) * 10000) / 100 : 0
        };
    }
    catch (error) {
        throw new Error(`Erreur budget département: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
};
exports.getDepartmentBudget = getDepartmentBudget;
//# sourceMappingURL=accounting.departments.js.map