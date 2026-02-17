"use strict";
/**
 * Module Comptabilite - Controller Bank, Departments, Budgets, Alerts, Settings, Statements, AI, Exports
 * @description Handlers Express pour les endpoints v2.0 etendus
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertQuoteToInvoice = exports.createDocument = exports.getOverdueInvoices = exports.batchScanInvoices = exports.sendReminder = exports.sendInvoice = exports.markInvoicePaid = exports.exportTVADeclaration = exports.exportFEC = exports.detectAnomalies = exports.aiCategorize = exports.predictCashFlow = exports.getCashFlowStatement = exports.getProfitLoss = exports.getBalanceSheet = exports.uploadLogo = exports.updateCompanySettings = exports.getCompanySettings = exports.generateAlerts = exports.dismissAlert = exports.markAlertRead = exports.listAlerts = exports.getDepartmentBudget = exports.getBudgetVariance = exports.setBudget = exports.getBudgets = exports.deleteDepartment = exports.updateDepartment = exports.createDepartment = exports.listDepartments = exports.getUnreconciledTransactions = exports.autoMatchBankTransactions = exports.matchBankTransaction = exports.listBankTransactions = exports.importBankTransactions = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const pool_js_1 = __importDefault(require("./pool.js"));
const aiService = __importStar(require("./accounting.ai.js"));
const service = __importStar(require("./accounting.service.js"));
// ============================================
// BANK RECONCILIATION
// ============================================
/**
 * POST /bank/import
 * Importer des transactions bancaires depuis un fichier CSV
 */
const importBankTransactions = async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const file = req.file;
        if (!file) {
            res.status(400).json({ error: 'Fichier CSV requis' });
            return;
        }
        const csvContent = fs.readFileSync(file.path, 'utf8');
        const lines = csvContent.split('\n').filter(l => l.trim());
        if (lines.length < 2) {
            res.status(400).json({ error: 'Le fichier CSV doit contenir au moins un en-tete et une ligne de donnees' });
            return;
        }
        const headers = lines[0].split(';').map(h => h.trim().toLowerCase());
        const batchId = `import-${Date.now()}`;
        const imported = [];
        const errors = [];
        const client = await pool_js_1.default.connect();
        try {
            await client.query('BEGIN');
            for (let i = 1; i < lines.length; i++) {
                const cols = lines[i].split(';').map(c => c.trim().replace(/^"|"$/g, ''));
                if (cols.length < 3) {
                    errors.push(`Ligne ${i + 1}: nombre de colonnes insuffisant`);
                    continue;
                }
                try {
                    const dateIdx = headers.indexOf('date') >= 0 ? headers.indexOf('date') : 0;
                    const descIdx = headers.indexOf('description') >= 0 ? headers.indexOf('description') : headers.indexOf('libelle') >= 0 ? headers.indexOf('libelle') : 1;
                    const amountIdx = headers.indexOf('montant') >= 0 ? headers.indexOf('montant') : headers.indexOf('amount') >= 0 ? headers.indexOf('amount') : 2;
                    const refIdx = headers.indexOf('reference') >= 0 ? headers.indexOf('reference') : -1;
                    const amount = parseFloat(cols[amountIdx].replace(',', '.').replace(/\s/g, ''));
                    if (isNaN(amount)) {
                        errors.push(`Ligne ${i + 1}: montant invalide`);
                        continue;
                    }
                    const txType = amount >= 0 ? 'credit' : 'debit';
                    const result = await client.query(`INSERT INTO bank_transactions (
              workspace_id, transaction_date, description, reference,
              amount, type, is_reconciled
            ) VALUES ($1, $2, $3, $4, $5, $6, false)
            RETURNING *`, [
                        workspaceId,
                        cols[dateIdx] || new Date().toISOString().split('T')[0],
                        cols[descIdx] || 'Transaction importee',
                        refIdx >= 0 ? (cols[refIdx] || null) : null,
                        Math.abs(amount),
                        txType
                    ]);
                    imported.push(result.rows[0]);
                }
                catch (lineErr) {
                    errors.push(`Ligne ${i + 1}: ${lineErr instanceof Error ? lineErr.message : 'erreur inconnue'}`);
                }
            }
            await client.query('COMMIT');
        }
        catch (err) {
            await client.query('ROLLBACK');
            throw err;
        }
        finally {
            client.release();
        }
        res.status(201).json({
            imported_count: imported.length,
            error_count: errors.length,
            batch_id: batchId,
            errors: errors.length > 0 ? errors : undefined,
            transactions: imported
        });
    }
    catch (error) {
        console.error('Erreur import transactions bancaires:', error);
        res.status(500).json({ error: 'Erreur lors de l\'import des transactions bancaires' });
    }
};
exports.importBankTransactions = importBankTransactions;
/**
 * GET /bank/transactions
 * Liste des transactions bancaires avec filtres
 */
const listBankTransactions = async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const page = req.query.page ? parseInt(req.query.page, 10) : 1;
        const limit = Math.min(req.query.limit ? parseInt(req.query.limit, 10) : 20, 100);
        const offset = (page - 1) * limit;
        let whereClause = 'WHERE bt.workspace_id = $1';
        const params = [workspaceId];
        let paramIndex = 2;
        if (req.query.date_from) {
            whereClause += ` AND bt.transaction_date >= $${paramIndex++}`;
            params.push(req.query.date_from);
        }
        if (req.query.date_to) {
            whereClause += ` AND bt.transaction_date <= $${paramIndex++}`;
            params.push(req.query.date_to);
        }
        if (req.query.type) {
            whereClause += ` AND bt.type = $${paramIndex++}`;
            params.push(req.query.type);
        }
        if (req.query.is_reconciled !== undefined) {
            whereClause += ` AND bt.is_reconciled = $${paramIndex++}`;
            params.push(req.query.is_reconciled === 'true' ? 'true' : 'false');
        }
        if (req.query.min_amount) {
            whereClause += ` AND bt.amount >= $${paramIndex++}`;
            params.push(parseFloat(req.query.min_amount));
        }
        if (req.query.max_amount) {
            whereClause += ` AND bt.amount <= $${paramIndex++}`;
            params.push(parseFloat(req.query.max_amount));
        }
        if (req.query.search) {
            whereClause += ` AND (bt.description ILIKE $${paramIndex} OR bt.reference ILIKE $${paramIndex})`;
            params.push(`%${req.query.search}%`);
            paramIndex++;
        }
        const countResult = await pool_js_1.default.query(`SELECT COUNT(*) FROM bank_transactions bt ${whereClause}`, params);
        const total = parseInt(countResult.rows[0].count, 10);
        params.push(limit, offset);
        const result = await pool_js_1.default.query(`SELECT bt.*, i.fournisseur as matched_invoice_name, bt.category_suggestion as category_name
       FROM bank_transactions bt
       LEFT JOIN invoices i ON bt.matched_invoice_id = i.id
       ${whereClause}
       ORDER BY bt.transaction_date DESC, bt.created_at DESC
       LIMIT $${paramIndex++} OFFSET $${paramIndex}`, params);
        res.json({
            data: result.rows,
            pagination: { page, limit, total, total_pages: Math.ceil(total / limit) }
        });
    }
    catch (error) {
        console.error('Erreur liste transactions bancaires:', error);
        res.status(500).json({ error: 'Erreur lors de la recuperation des transactions' });
    }
};
exports.listBankTransactions = listBankTransactions;
/**
 * POST /bank/match/:txId/:invoiceId
 * Rapprocher manuellement une transaction avec une facture
 */
const matchBankTransaction = async (req, res) => {
    try {
        const { workspaceId, txId, invoiceId } = req.params;
        // Verifier que la transaction existe
        const txResult = await pool_js_1.default.query('SELECT id FROM bank_transactions WHERE id = $1 AND workspace_id = $2', [txId, workspaceId]);
        if (!txResult.rows[0]) {
            res.status(404).json({ error: 'Transaction non trouvee' });
            return;
        }
        // Verifier que la facture existe
        const invResult = await pool_js_1.default.query('SELECT id FROM invoices WHERE id = $1 AND workspace_id = $2', [invoiceId, workspaceId]);
        if (!invResult.rows[0]) {
            res.status(404).json({ error: 'Facture non trouvee' });
            return;
        }
        const result = await pool_js_1.default.query(`UPDATE bank_transactions
       SET matched_invoice_id = $1, is_reconciled = true,
           match_confidence = 100
       WHERE id = $2 AND workspace_id = $3
       RETURNING *`, [invoiceId, txId, workspaceId]);
        res.json(result.rows[0]);
    }
    catch (error) {
        console.error('Erreur rapprochement bancaire:', error);
        res.status(500).json({ error: 'Erreur lors du rapprochement' });
    }
};
exports.matchBankTransaction = matchBankTransaction;
/**
 * POST /bank/auto-match
 * Rapprochement automatique des transactions non rapprochees
 */
const autoMatchBankTransactions = async (req, res) => {
    try {
        const { workspaceId } = req.params;
        // Recuperer les transactions non rapprochees
        const unmatchedTx = await pool_js_1.default.query(`SELECT * FROM bank_transactions
       WHERE workspace_id = $1 AND is_reconciled = false
       ORDER BY transaction_date DESC`, [workspaceId]);
        // Recuperer les factures non rapprochees
        const unmatchedInv = await pool_js_1.default.query(`SELECT * FROM invoices
       WHERE workspace_id = $1 AND id NOT IN (
         SELECT matched_invoice_id FROM bank_transactions
         WHERE workspace_id = $1 AND matched_invoice_id IS NOT NULL
       )
       ORDER BY date_facture DESC`, [workspaceId]);
        const matches = [];
        const matchedTxIds = new Set();
        const matchedInvIds = new Set();
        for (const tx of unmatchedTx.rows) {
            if (matchedTxIds.has(tx.id))
                continue;
            for (const inv of unmatchedInv.rows) {
                if (matchedInvIds.has(inv.id))
                    continue;
                let confidence = 0;
                let reason = '';
                // Match par montant exact
                if (Math.abs(tx.amount - inv.montant_ttc) < 0.01) {
                    confidence += 60;
                    reason = 'Montant exact';
                }
                else if (Math.abs(tx.amount - inv.montant_ttc) / inv.montant_ttc < 0.02) {
                    confidence += 30;
                    reason = 'Montant proche (< 2%)';
                }
                // Match par reference
                if (tx.reference && inv.reference &&
                    tx.reference.toLowerCase().includes(inv.reference.toLowerCase())) {
                    confidence += 30;
                    reason += (reason ? ' + ' : '') + 'Reference trouvee';
                }
                // Match par description/fournisseur
                if (tx.description && inv.fournisseur &&
                    tx.description.toLowerCase().includes(inv.fournisseur.toLowerCase())) {
                    confidence += 20;
                    reason += (reason ? ' + ' : '') + 'Fournisseur dans description';
                }
                // Match par date (meme semaine)
                const txDate = new Date(tx.transaction_date);
                const invDate = new Date(inv.date_facture);
                const dayDiff = Math.abs((txDate.getTime() - invDate.getTime()) / (1000 * 60 * 60 * 24));
                if (dayDiff <= 7) {
                    confidence += 10;
                    reason += (reason ? ' + ' : '') + 'Date proche';
                }
                if (confidence >= 60) {
                    matches.push({
                        transaction_id: tx.id,
                        invoice_id: inv.id,
                        confidence: Math.min(confidence, 100),
                        match_reason: reason
                    });
                    matchedTxIds.add(tx.id);
                    matchedInvIds.add(inv.id);
                    break;
                }
            }
        }
        // Appliquer les rapprochements
        for (const match of matches) {
            await pool_js_1.default.query(`UPDATE bank_transactions
         SET matched_invoice_id = $1, is_reconciled = true,
             match_confidence = $2
         WHERE id = $3`, [match.invoice_id, match.confidence, match.transaction_id]);
        }
        res.json({
            matched_count: matches.length,
            unmatched_remaining: unmatchedTx.rows.length - matches.length,
            matches
        });
    }
    catch (error) {
        console.error('Erreur auto-rapprochement:', error);
        res.status(500).json({ error: 'Erreur lors du rapprochement automatique' });
    }
};
exports.autoMatchBankTransactions = autoMatchBankTransactions;
/**
 * GET /bank/unreconciled
 * Transactions non rapprochees avec resume
 */
const getUnreconciledTransactions = async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const summaryResult = await pool_js_1.default.query(`SELECT
        COUNT(*) as total_transactions,
        COUNT(CASE WHEN is_reconciled = true THEN 1 END) as matched_count,
        COUNT(CASE WHEN is_reconciled = false THEN 1 END) as unmatched_count,
        0 as partial_count,
        0 as excluded_count,
        COALESCE(SUM(CASE WHEN type = 'credit' THEN amount ELSE 0 END), 0) as total_credits,
        COALESCE(SUM(CASE WHEN type = 'debit' THEN amount ELSE 0 END), 0) as total_debits,
        COALESCE(SUM(CASE WHEN is_reconciled = true THEN amount ELSE 0 END), 0) as matched_amount,
        COALESCE(SUM(CASE WHEN is_reconciled = false THEN amount ELSE 0 END), 0) as unmatched_amount
       FROM bank_transactions
       WHERE workspace_id = $1`, [workspaceId]);
        const unreconciledResult = await pool_js_1.default.query(`SELECT * FROM bank_transactions
       WHERE workspace_id = $1 AND is_reconciled = false
       ORDER BY transaction_date DESC
       LIMIT 100`, [workspaceId]);
        const summary = summaryResult.rows[0];
        res.json({
            summary: {
                total_transactions: parseInt(summary.total_transactions, 10),
                matched_count: parseInt(summary.matched_count, 10),
                unmatched_count: parseInt(summary.unmatched_count, 10),
                partial_count: parseInt(summary.partial_count, 10),
                excluded_count: parseInt(summary.excluded_count, 10),
                total_credits: parseFloat(summary.total_credits),
                total_debits: parseFloat(summary.total_debits),
                matched_amount: parseFloat(summary.matched_amount),
                unmatched_amount: parseFloat(summary.unmatched_amount)
            },
            transactions: unreconciledResult.rows
        });
    }
    catch (error) {
        console.error('Erreur transactions non rapprochees:', error);
        res.status(500).json({ error: 'Erreur lors de la recuperation des transactions non rapprochees' });
    }
};
exports.getUnreconciledTransactions = getUnreconciledTransactions;
// ============================================
// DEPARTMENTS
// ============================================
/**
 * GET /departments
 * Liste des departements
 */
const listDepartments = async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const result = await pool_js_1.default.query(`SELECT * FROM departments
       WHERE workspace_id = $1
       ORDER BY name ASC`, [workspaceId]);
        res.json(result.rows);
    }
    catch (error) {
        console.error('Erreur liste departements:', error);
        res.status(500).json({ error: 'Erreur lors de la recuperation des departements' });
    }
};
exports.listDepartments = listDepartments;
/**
 * POST /departments
 * Creer un departement
 */
const createDepartment = async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const data = req.body;
        if (!data.name || !data.code) {
            res.status(400).json({ error: 'Champs requis: name, code' });
            return;
        }
        const result = await pool_js_1.default.query(`INSERT INTO departments (
        workspace_id, name, code, manager_name, is_active
      ) VALUES ($1, $2, $3, $4, true)
      RETURNING *`, [workspaceId, data.name, data.code, data.manager_name || null]);
        res.status(201).json(result.rows[0]);
    }
    catch (error) {
        console.error('Erreur creation departement:', error);
        res.status(500).json({ error: 'Erreur lors de la creation du departement' });
    }
};
exports.createDepartment = createDepartment;
/**
 * PUT /departments/:id
 * Modifier un departement
 */
const updateDepartment = async (req, res) => {
    try {
        const { workspaceId, id } = req.params;
        const data = req.body;
        const fields = [];
        const values = [];
        let paramIndex = 1;
        const allowedFields = ['name', 'code', 'manager_name', 'is_active'];
        for (const field of allowedFields) {
            if (data[field] !== undefined) {
                fields.push(`${field} = $${paramIndex++}`);
                values.push(data[field]);
            }
        }
        if (fields.length === 0) {
            res.status(400).json({ error: 'Aucun champ a mettre a jour' });
            return;
        }
        values.push(id, workspaceId);
        const result = await pool_js_1.default.query(`UPDATE departments
       SET ${fields.join(', ')}, updated_at = NOW()
       WHERE id = $${paramIndex++} AND workspace_id = $${paramIndex}
       RETURNING *`, values);
        if (!result.rows[0]) {
            res.status(404).json({ error: 'Departement non trouve' });
            return;
        }
        res.json(result.rows[0]);
    }
    catch (error) {
        console.error('Erreur mise a jour departement:', error);
        res.status(500).json({ error: 'Erreur lors de la mise a jour du departement' });
    }
};
exports.updateDepartment = updateDepartment;
/**
 * DELETE /departments/:id
 * Supprimer un departement (soft delete)
 */
const deleteDepartment = async (req, res) => {
    try {
        const { workspaceId, id } = req.params;
        const result = await pool_js_1.default.query(`UPDATE departments
       SET is_active = false, updated_at = NOW()
       WHERE id = $1 AND workspace_id = $2`, [id, workspaceId]);
        if ((result.rowCount ?? 0) === 0) {
            res.status(404).json({ error: 'Departement non trouve' });
            return;
        }
        res.status(204).send();
    }
    catch (error) {
        console.error('Erreur suppression departement:', error);
        res.status(500).json({ error: 'Erreur lors de la suppression du departement' });
    }
};
exports.deleteDepartment = deleteDepartment;
// ============================================
// BUDGETS
// ============================================
/**
 * GET /budgets
 * Vue d'ensemble des budgets par annee
 */
const getBudgets = async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const year = req.query.year ? parseInt(req.query.year, 10) : new Date().getFullYear();
        // Resume par departement
        const deptResult = await pool_js_1.default.query(`SELECT
        d.id as department_id,
        d.name as department_name,
        COALESCE(SUM(b.budget_amount), 0) as allocated,
        COALESCE(SUM(b.actual_amount), 0) as actual
       FROM departments d
       LEFT JOIN budget_lines b ON d.id = b.department_id AND b.year = $2
       WHERE d.workspace_id = $1 AND d.is_active = true
       GROUP BY d.id, d.name
       ORDER BY d.name`, [workspaceId, year]);
        const byDept = deptResult.rows.map(r => {
            const allocated = parseFloat(r.allocated);
            const actual = parseFloat(r.actual);
            return {
                department_id: r.department_id,
                department_name: r.department_name,
                allocated,
                actual,
                variance: allocated - actual,
                utilization_pct: allocated > 0 ? Math.round((actual / allocated) * 100) : 0
            };
        });
        const totalAllocated = byDept.reduce((s, d) => s + d.allocated, 0);
        const totalActual = byDept.reduce((s, d) => s + d.actual, 0);
        const overview = {
            year,
            total_allocated: totalAllocated,
            total_actual: totalActual,
            total_variance: totalAllocated - totalActual,
            utilization_pct: totalAllocated > 0 ? Math.round((totalActual / totalAllocated) * 100) : 0,
            by_department: byDept
        };
        res.json(overview);
    }
    catch (error) {
        console.error('Erreur recuperation budgets:', error);
        res.status(500).json({ error: 'Erreur lors de la recuperation des budgets' });
    }
};
exports.getBudgets = getBudgets;
/**
 * POST /budgets
 * Creer/mettre a jour une ligne de budget
 */
const setBudget = async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const data = req.body;
        if (!data.department_id || !data.year || data.budget_amount === undefined) {
            res.status(400).json({ error: 'Champs requis: department_id, year, budget_amount' });
            return;
        }
        // Upsert: creer ou mettre a jour
        const result = await pool_js_1.default.query(`INSERT INTO budget_lines (
        workspace_id, department_id, category_id, year, month,
        budget_amount, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (workspace_id, department_id, year, COALESCE(month, 0), COALESCE(category_id, '00000000-0000-0000-0000-000000000000'))
      DO UPDATE SET budget_amount = EXCLUDED.budget_amount,
                    notes = EXCLUDED.notes, updated_at = NOW()
      RETURNING *`, [
            workspaceId,
            data.department_id,
            data.category_id || null,
            data.year,
            data.month || null,
            data.budget_amount,
            data.notes || null
        ]);
        res.status(201).json(result.rows[0]);
    }
    catch (error) {
        console.error('Erreur creation budget:', error);
        res.status(500).json({ error: 'Erreur lors de la creation du budget' });
    }
};
exports.setBudget = setBudget;
/**
 * GET /budgets/variance
 * Ecarts budgetaires par annee et optionnellement par departement
 */
const getBudgetVariance = async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const year = req.query.year ? parseInt(req.query.year, 10) : new Date().getFullYear();
        const departmentId = req.query.department_id;
        let whereClause = 'WHERE b.workspace_id = $1 AND b.year = $2';
        const params = [workspaceId, year];
        if (departmentId) {
            whereClause += ' AND b.department_id = $3';
            params.push(departmentId);
        }
        const result = await pool_js_1.default.query(`SELECT
        b.*,
        d.name as department_name,
        c.name as category_name,
        (b.budget_amount - b.actual_amount) as variance,
        CASE WHEN b.budget_amount > 0
          THEN ROUND((b.actual_amount / b.budget_amount * 100)::numeric, 1)
          ELSE 0
        END as utilization_pct
       FROM budget_lines b
       LEFT JOIN departments d ON b.department_id = d.id
       LEFT JOIN accounting_categories c ON b.category_id = c.id
       ${whereClause}
       ORDER BY d.name, b.month NULLS FIRST`, params);
        res.json({
            year,
            department_id: departmentId || null,
            lines: result.rows.map(r => ({
                ...r,
                budget_amount: parseFloat(r.budget_amount),
                actual_amount: parseFloat(r.actual_amount),
                variance: parseFloat(r.variance),
                utilization_pct: parseFloat(r.utilization_pct)
            }))
        });
    }
    catch (error) {
        console.error('Erreur ecarts budgetaires:', error);
        res.status(500).json({ error: 'Erreur lors de la recuperation des ecarts' });
    }
};
exports.getBudgetVariance = getBudgetVariance;
/**
 * GET /budgets/:departmentId
 * Budget detaille d'un departement
 */
const getDepartmentBudget = async (req, res) => {
    try {
        const { workspaceId, departmentId } = req.params;
        const year = req.query.year ? parseInt(req.query.year, 10) : new Date().getFullYear();
        const deptResult = await pool_js_1.default.query('SELECT * FROM departments WHERE id = $1 AND workspace_id = $2', [departmentId, workspaceId]);
        if (!deptResult.rows[0]) {
            res.status(404).json({ error: 'Departement non trouve' });
            return;
        }
        const budgetResult = await pool_js_1.default.query(`SELECT b.*, c.name as category_name
       FROM budget_lines b
       LEFT JOIN accounting_categories c ON b.category_id = c.id
       WHERE b.workspace_id = $1 AND b.department_id = $2 AND b.year = $3
       ORDER BY b.month NULLS FIRST, c.name`, [workspaceId, departmentId, year]);
        const totalAllocated = budgetResult.rows.reduce((s, r) => s + parseFloat(r.budget_amount), 0);
        const totalActual = budgetResult.rows.reduce((s, r) => s + parseFloat(r.actual_amount), 0);
        res.json({
            department: deptResult.rows[0],
            year,
            total_allocated: totalAllocated,
            total_actual: totalActual,
            variance: totalAllocated - totalActual,
            utilization_pct: totalAllocated > 0 ? Math.round((totalActual / totalAllocated) * 100) : 0,
            lines: budgetResult.rows.map(r => ({
                ...r,
                budget_amount: parseFloat(r.budget_amount),
                actual_amount: parseFloat(r.actual_amount)
            }))
        });
    }
    catch (error) {
        console.error('Erreur budget departement:', error);
        res.status(500).json({ error: 'Erreur lors de la recuperation du budget du departement' });
    }
};
exports.getDepartmentBudget = getDepartmentBudget;
// ============================================
// ALERTS
// ============================================
/**
 * GET /alerts
 * Liste des alertes comptables
 */
const listAlerts = async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const unreadOnly = req.query.unread_only === 'true';
        let whereClause = 'WHERE workspace_id = $1 AND is_dismissed = false';
        const params = [workspaceId];
        if (unreadOnly) {
            whereClause += ' AND is_read = false';
        }
        const result = await pool_js_1.default.query(`SELECT * FROM accounting_alerts
       ${whereClause}
       ORDER BY
         CASE severity WHEN 'critical' THEN 0 WHEN 'warning' THEN 1 ELSE 2 END,
         created_at DESC
       LIMIT 100`, params);
        // Compter les alertes
        const countsResult = await pool_js_1.default.query(`SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN is_read = false THEN 1 END) as unread,
        COUNT(CASE WHEN severity = 'info' THEN 1 END) as info,
        COUNT(CASE WHEN severity = 'warning' THEN 1 END) as warning,
        COUNT(CASE WHEN severity = 'critical' THEN 1 END) as critical
       FROM accounting_alerts
       WHERE workspace_id = $1 AND is_dismissed = false`, [workspaceId]);
        const counts = countsResult.rows[0];
        res.json({
            alerts: result.rows,
            counts: {
                total: parseInt(counts.total, 10),
                unread: parseInt(counts.unread, 10),
                info: parseInt(counts.info, 10),
                warning: parseInt(counts.warning, 10),
                critical: parseInt(counts.critical, 10)
            }
        });
    }
    catch (error) {
        console.error('Erreur liste alertes:', error);
        res.status(500).json({ error: 'Erreur lors de la recuperation des alertes' });
    }
};
exports.listAlerts = listAlerts;
/**
 * PUT /alerts/:id/read
 * Marquer une alerte comme lue
 */
const markAlertRead = async (req, res) => {
    try {
        const { workspaceId, id } = req.params;
        const result = await pool_js_1.default.query(`UPDATE accounting_alerts
       SET is_read = true, updated_at = NOW()
       WHERE id = $1 AND workspace_id = $2
       RETURNING *`, [id, workspaceId]);
        if (!result.rows[0]) {
            res.status(404).json({ error: 'Alerte non trouvee' });
            return;
        }
        res.json(result.rows[0]);
    }
    catch (error) {
        console.error('Erreur lecture alerte:', error);
        res.status(500).json({ error: 'Erreur lors de la mise a jour de l\'alerte' });
    }
};
exports.markAlertRead = markAlertRead;
/**
 * PUT /alerts/:id/dismiss
 * Rejeter/masquer une alerte
 */
const dismissAlert = async (req, res) => {
    try {
        const { workspaceId, id } = req.params;
        const result = await pool_js_1.default.query(`UPDATE accounting_alerts
       SET is_dismissed = true, is_read = true, updated_at = NOW()
       WHERE id = $1 AND workspace_id = $2
       RETURNING *`, [id, workspaceId]);
        if (!result.rows[0]) {
            res.status(404).json({ error: 'Alerte non trouvee' });
            return;
        }
        res.json(result.rows[0]);
    }
    catch (error) {
        console.error('Erreur dismiss alerte:', error);
        res.status(500).json({ error: 'Erreur lors du rejet de l\'alerte' });
    }
};
exports.dismissAlert = dismissAlert;
/**
 * POST /alerts/generate
 * Generer des alertes automatiques (factures en retard, budgets depasses, etc.)
 */
const generateAlerts = async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const generated = [];
        // 1. Factures en retard
        const overdueResult = await pool_js_1.default.query(`SELECT id, fournisseur, montant_ttc, date_echeance
       FROM invoices
       WHERE workspace_id = $1 AND status NOT IN ('paid', 'cancelled')
         AND date_echeance IS NOT NULL AND date_echeance < CURRENT_DATE`, [workspaceId]);
        for (const inv of overdueResult.rows) {
            const daysDue = Math.floor((Date.now() - new Date(inv.date_echeance).getTime()) / (1000 * 60 * 60 * 24));
            const severity = daysDue > 30 ? 'critical' : daysDue > 14 ? 'warning' : 'info';
            const existingAlert = await pool_js_1.default.query(`SELECT id FROM accounting_alerts
         WHERE workspace_id = $1 AND type = 'overdue_invoice' AND related_entity_id = $2 AND is_dismissed = false`, [workspaceId, inv.id]);
            if (!existingAlert.rows[0]) {
                const alertResult = await pool_js_1.default.query(`INSERT INTO accounting_alerts (
            workspace_id, type, severity, title, message,
            related_entity_id, related_entity_type, metadata
          ) VALUES ($1, 'overdue_invoice', $2, $3, $4, $5, 'invoice', $6)
          RETURNING *`, [
                    workspaceId,
                    severity,
                    `Facture en retard: ${inv.fournisseur}`,
                    `La facture de ${inv.fournisseur} (${parseFloat(inv.montant_ttc).toFixed(2)} EUR) est en retard de ${daysDue} jours.`,
                    inv.id,
                    JSON.stringify({ days_overdue: daysDue, amount: inv.montant_ttc })
                ]);
                generated.push(alertResult.rows[0]);
            }
        }
        // 2. Budgets depasses
        const budgetResult = await pool_js_1.default.query(`SELECT b.department_id, d.name as department_name,
              SUM(b.budget_amount) as allocated,
              SUM(b.actual_amount) as actual
       FROM budget_lines b
       JOIN departments d ON b.department_id = d.id
       WHERE b.workspace_id = $1 AND b.year = $2
       GROUP BY b.department_id, d.name
       HAVING SUM(b.actual_amount) > SUM(b.budget_amount) * 0.9`, [workspaceId, new Date().getFullYear()]);
        for (const dept of budgetResult.rows) {
            const utilization = parseFloat(dept.actual) / parseFloat(dept.allocated) * 100;
            const severity = utilization > 100 ? 'critical' : 'warning';
            const existingAlert = await pool_js_1.default.query(`SELECT id FROM accounting_alerts
         WHERE workspace_id = $1 AND type = $2 AND related_entity_id = $3 AND is_dismissed = false
           AND created_at > CURRENT_DATE - INTERVAL '7 days'`, [workspaceId, utilization > 100 ? 'budget_exceeded' : 'budget_warning', dept.department_id]);
            if (!existingAlert.rows[0]) {
                const alertResult = await pool_js_1.default.query(`INSERT INTO accounting_alerts (
            workspace_id, type, severity, title, message,
            related_entity_id, related_entity_type, metadata
          ) VALUES ($1, $2, $3, $4, $5, $6, 'department', $7)
          RETURNING *`, [
                    workspaceId,
                    utilization > 100 ? 'budget_exceeded' : 'budget_warning',
                    severity,
                    `Budget ${utilization > 100 ? 'depasse' : 'proche du seuil'}: ${dept.department_name}`,
                    `Le departement ${dept.department_name} a utilise ${utilization.toFixed(1)}% de son budget (${parseFloat(dept.actual).toFixed(2)} / ${parseFloat(dept.allocated).toFixed(2)} EUR).`,
                    dept.department_id,
                    JSON.stringify({ utilization_pct: utilization, allocated: dept.allocated, actual: dept.actual })
                ]);
                generated.push(alertResult.rows[0]);
            }
        }
        res.json({
            generated_count: generated.length,
            alerts: generated
        });
    }
    catch (error) {
        console.error('Erreur generation alertes:', error);
        res.status(500).json({ error: 'Erreur lors de la generation des alertes' });
    }
};
exports.generateAlerts = generateAlerts;
// ============================================
// COMPANY SETTINGS
// ============================================
/**
 * GET /settings
 * Recuperer les parametres de la societe
 */
const getCompanySettings = async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const result = await pool_js_1.default.query('SELECT * FROM company_settings WHERE workspace_id = $1', [workspaceId]);
        if (!result.rows[0]) {
            // Creer les parametres par defaut
            const defaultResult = await pool_js_1.default.query(`INSERT INTO company_settings (
          workspace_id, company_name, country, default_currency,
          fiscal_year_start, default_tva_rate, default_payment_terms
        ) VALUES ($1, 'Mon Entreprise', 'FR', 'EUR', 1, 20, 30)
        RETURNING *`, [workspaceId]);
            res.json(defaultResult.rows[0]);
            return;
        }
        res.json(result.rows[0]);
    }
    catch (error) {
        console.error('Erreur recuperation parametres:', error);
        res.status(500).json({ error: 'Erreur lors de la recuperation des parametres' });
    }
};
exports.getCompanySettings = getCompanySettings;
/**
 * PUT /settings
 * Modifier les parametres de la societe
 */
const updateCompanySettings = async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const data = req.body;
        const fields = [];
        const values = [];
        let paramIndex = 1;
        const allowedFields = [
            'company_name', 'siret', 'tva_number',
            'address', 'postal_code', 'city', 'country',
            'phone', 'email', 'website', 'default_currency',
            'fiscal_year_start', 'default_tva_rate', 'default_payment_terms',
            'bank_name', 'bank_iban', 'bank_bic'
        ];
        for (const field of allowedFields) {
            if (data[field] !== undefined) {
                fields.push(`${field} = $${paramIndex++}`);
                values.push(data[field]);
            }
        }
        if (fields.length === 0) {
            res.status(400).json({ error: 'Aucun champ a mettre a jour' });
            return;
        }
        values.push(workspaceId);
        const result = await pool_js_1.default.query(`UPDATE company_settings
       SET ${fields.join(', ')}, updated_at = NOW()
       WHERE workspace_id = $${paramIndex}
       RETURNING *`, values);
        if (!result.rows[0]) {
            res.status(404).json({ error: 'Parametres non trouves (initialiser d\'abord via GET /settings)' });
            return;
        }
        res.json(result.rows[0]);
    }
    catch (error) {
        console.error('Erreur mise a jour parametres:', error);
        res.status(500).json({ error: 'Erreur lors de la mise a jour des parametres' });
    }
};
exports.updateCompanySettings = updateCompanySettings;
/**
 * POST /settings/logo
 * Upload du logo de la societe
 */
const uploadLogo = async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const file = req.file;
        if (!file) {
            res.status(400).json({ error: 'Image du logo requise' });
            return;
        }
        const result = await pool_js_1.default.query(`UPDATE company_settings
       SET logo_url = $1, updated_at = NOW()
       WHERE workspace_id = $2
       RETURNING *`, [file.path, workspaceId]);
        if (!result.rows[0]) {
            res.status(404).json({ error: 'Parametres non trouves' });
            return;
        }
        res.json({ logo_url: file.path, settings: result.rows[0] });
    }
    catch (error) {
        console.error('Erreur upload logo:', error);
        res.status(500).json({ error: 'Erreur lors de l\'upload du logo' });
    }
};
exports.uploadLogo = uploadLogo;
// ============================================
// FINANCIAL STATEMENTS
// ============================================
/**
 * GET /statements/balance-sheet
 * Bilan comptable simplifie
 */
const getBalanceSheet = async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const year = req.query.year ? parseInt(req.query.year, 10) : new Date().getFullYear();
        // Actifs: total des factures income payees
        const assetsResult = await pool_js_1.default.query(`SELECT
        COALESCE(SUM(CASE WHEN status = 'paid' AND type = 'income' THEN montant_ttc ELSE 0 END), 0) as receivables_paid,
        COALESCE(SUM(CASE WHEN status != 'paid' AND type = 'income' THEN montant_ttc ELSE 0 END), 0) as receivables_pending
       FROM invoices
       WHERE workspace_id = $1 AND EXTRACT(YEAR FROM date_facture) = $2`, [workspaceId, year]);
        // Passifs: total des factures expense
        const liabilitiesResult = await pool_js_1.default.query(`SELECT
        COALESCE(SUM(CASE WHEN status = 'paid' AND type = 'expense' THEN montant_ttc ELSE 0 END), 0) as payables_paid,
        COALESCE(SUM(CASE WHEN status != 'paid' AND type = 'expense' THEN montant_ttc ELSE 0 END), 0) as payables_pending,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN montant_tva ELSE 0 END), 0) as tva_deductible,
        COALESCE(SUM(CASE WHEN type = 'income' THEN montant_tva ELSE 0 END), 0) as tva_collectee
       FROM invoices
       WHERE workspace_id = $1 AND EXTRACT(YEAR FROM date_facture) = $2`, [workspaceId, year]);
        const assets = assetsResult.rows[0];
        const liabilities = liabilitiesResult.rows[0];
        const totalAssets = parseFloat(assets.receivables_paid) + parseFloat(assets.receivables_pending);
        const totalLiabilities = parseFloat(liabilities.payables_pending) +
            parseFloat(liabilities.tva_collectee) - parseFloat(liabilities.tva_deductible);
        const equity = totalAssets - totalLiabilities;
        const balanceSheet = {
            workspace_id: workspaceId,
            date: `${year}-12-31`,
            assets: {
                current: [
                    { account_code: '411', label: 'Clients - Creances encaissees', amount: parseFloat(assets.receivables_paid) },
                    { account_code: '411-P', label: 'Clients - Creances en attente', amount: parseFloat(assets.receivables_pending) }
                ],
                non_current: [],
                total: totalAssets
            },
            liabilities: {
                current: [
                    { account_code: '401', label: 'Fournisseurs - Dettes en attente', amount: parseFloat(liabilities.payables_pending) },
                    { account_code: '44571', label: 'TVA collectee', amount: parseFloat(liabilities.tva_collectee) },
                    { account_code: '44566', label: 'TVA deductible (credit)', amount: -parseFloat(liabilities.tva_deductible) }
                ],
                non_current: [],
                total: totalLiabilities
            },
            equity: {
                lines: [
                    { account_code: '120', label: 'Resultat de l\'exercice', amount: equity }
                ],
                total: equity
            }
        };
        res.json(balanceSheet);
    }
    catch (error) {
        console.error('Erreur bilan comptable:', error);
        res.status(500).json({ error: 'Erreur lors de la generation du bilan' });
    }
};
exports.getBalanceSheet = getBalanceSheet;
/**
 * GET /statements/profit-loss
 * Compte de resultat
 */
const getProfitLoss = async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const year = req.query.year ? parseInt(req.query.year, 10) : new Date().getFullYear();
        // Revenus par categorie
        const revenueResult = await pool_js_1.default.query(`SELECT c.id as category_id, c.name as label,
              COALESCE(SUM(i.montant_ht), 0) as amount,
              COUNT(i.id) as count
       FROM accounting_categories c
       LEFT JOIN invoices i ON c.id = i.category_id
         AND i.type = 'income' AND EXTRACT(YEAR FROM i.date_facture) = $2
       WHERE c.workspace_id = $1 AND c.type = 'income'
       GROUP BY c.id, c.name
       HAVING COUNT(i.id) > 0
       ORDER BY amount DESC`, [workspaceId, year]);
        // Depenses par categorie
        const expenseResult = await pool_js_1.default.query(`SELECT c.id as category_id, c.name as label,
              COALESCE(SUM(i.montant_ht), 0) as amount,
              COUNT(i.id) as count
       FROM accounting_categories c
       LEFT JOIN invoices i ON c.id = i.category_id
         AND i.type = 'expense' AND EXTRACT(YEAR FROM i.date_facture) = $2
       WHERE c.workspace_id = $1 AND c.type = 'expense'
       GROUP BY c.id, c.name
       HAVING COUNT(i.id) > 0
       ORDER BY amount DESC`, [workspaceId, year]);
        const revenue = revenueResult.rows.map(r => ({
            category_id: r.category_id,
            label: r.label,
            amount: parseFloat(r.amount),
            count: parseInt(r.count, 10)
        }));
        const expenses = expenseResult.rows.map(r => ({
            category_id: r.category_id,
            label: r.label,
            amount: parseFloat(r.amount),
            count: parseInt(r.count, 10)
        }));
        const totalRevenue = revenue.reduce((s, r) => s + r.amount, 0);
        const totalExpenses = expenses.reduce((s, r) => s + r.amount, 0);
        const profitLoss = {
            workspace_id: workspaceId,
            period: { start: `${year}-01-01`, end: `${year}-12-31` },
            revenue,
            total_revenue: totalRevenue,
            cost_of_goods: [],
            total_cogs: 0,
            gross_profit: totalRevenue,
            operating_expenses: expenses,
            total_operating_expenses: totalExpenses,
            operating_income: totalRevenue - totalExpenses,
            other_income: [],
            other_expenses: [],
            net_income_before_tax: totalRevenue - totalExpenses,
            tax: 0,
            net_income: totalRevenue - totalExpenses
        };
        res.json(profitLoss);
    }
    catch (error) {
        console.error('Erreur compte de resultat:', error);
        res.status(500).json({ error: 'Erreur lors de la generation du compte de resultat' });
    }
};
exports.getProfitLoss = getProfitLoss;
/**
 * GET /statements/cash-flow
 * Tableau des flux de tresorerie
 */
const getCashFlowStatement = async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const year = req.query.year ? parseInt(req.query.year, 10) : new Date().getFullYear();
        const monthlyResult = await pool_js_1.default.query(`SELECT
        EXTRACT(MONTH FROM date_facture)::int as month,
        COALESCE(SUM(CASE WHEN type = 'income' AND status = 'paid' THEN montant_ttc ELSE 0 END), 0) as cash_in,
        COALESCE(SUM(CASE WHEN type = 'expense' AND status = 'paid' THEN montant_ttc ELSE 0 END), 0) as cash_out
       FROM invoices
       WHERE workspace_id = $1 AND EXTRACT(YEAR FROM date_facture) = $2
       GROUP BY EXTRACT(MONTH FROM date_facture)
       ORDER BY month`, [workspaceId, year]);
        let runningBalance = 0;
        const monthlyFlows = monthlyResult.rows.map(r => {
            const cashIn = parseFloat(r.cash_in);
            const cashOut = parseFloat(r.cash_out);
            const netFlow = cashIn - cashOut;
            runningBalance += netFlow;
            return {
                month: r.month,
                cash_in: cashIn,
                cash_out: cashOut,
                net_flow: netFlow,
                running_balance: runningBalance
            };
        });
        const totalCashIn = monthlyFlows.reduce((s, m) => s + m.cash_in, 0);
        const totalCashOut = monthlyFlows.reduce((s, m) => s + m.cash_out, 0);
        res.json({
            workspace_id: workspaceId,
            year,
            monthly_flows: monthlyFlows,
            totals: {
                cash_in: totalCashIn,
                cash_out: totalCashOut,
                net: totalCashIn - totalCashOut
            }
        });
    }
    catch (error) {
        console.error('Erreur flux de tresorerie:', error);
        res.status(500).json({ error: 'Erreur lors de la generation du flux de tresorerie' });
    }
};
exports.getCashFlowStatement = getCashFlowStatement;
// ============================================
// AI FEATURES
// ============================================
/**
 * POST /ai/predict-cashflow
 * Prediction de tresorerie basee sur l'historique
 */
const predictCashFlow = async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const { months = 3 } = req.body;
        if (![3, 6, 12].includes(months)) {
            res.status(400).json({ error: 'months doit etre 3, 6 ou 12' });
            return;
        }
        // Recuperer l'historique sur 12 derniers mois
        const historyResult = await pool_js_1.default.query(`SELECT
        EXTRACT(MONTH FROM date_facture)::int as month,
        EXTRACT(YEAR FROM date_facture)::int as year,
        COALESCE(SUM(CASE WHEN type = 'income' THEN montant_ttc ELSE 0 END), 0) as income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN montant_ttc ELSE 0 END), 0) as expense
       FROM invoices
       WHERE workspace_id = $1
         AND date_facture >= CURRENT_DATE - INTERVAL '12 months'
       GROUP BY EXTRACT(YEAR FROM date_facture), EXTRACT(MONTH FROM date_facture)
       ORDER BY year, month`, [workspaceId]);
        if (historyResult.rows.length < 3) {
            res.status(400).json({ error: 'Historique insuffisant (minimum 3 mois requis)' });
            return;
        }
        // Calcul des moyennes et tendances simples
        const history = historyResult.rows.map(r => ({
            income: parseFloat(r.income),
            expense: parseFloat(r.expense),
            month: r.month,
            year: r.year
        }));
        const avgIncome = history.reduce((s, h) => s + h.income, 0) / history.length;
        const avgExpense = history.reduce((s, h) => s + h.expense, 0) / history.length;
        // Tendance lineaire simple
        const n = history.length;
        const incomeSlope = n > 1 ? (history[n - 1].income - history[0].income) / n : 0;
        const expenseSlope = n > 1 ? (history[n - 1].expense - history[0].expense) / n : 0;
        const currentBalance = history.reduce((s, h) => s + h.income - h.expense, 0);
        const predictions = [];
        let balance = currentBalance;
        const now = new Date();
        for (let i = 1; i <= months; i++) {
            const targetDate = new Date(now.getFullYear(), now.getMonth() + i, 1);
            const monthStr = targetDate.toISOString().slice(0, 7);
            const predictedIncome = Math.max(0, avgIncome + incomeSlope * i);
            const predictedExpense = Math.max(0, avgExpense + expenseSlope * i);
            balance += predictedIncome - predictedExpense;
            const confidence = Math.max(40, 90 - (i * 5));
            predictions.push({
                month: monthStr,
                predicted_income: Math.round(predictedIncome * 100) / 100,
                predicted_expense: Math.round(predictedExpense * 100) / 100,
                predicted_balance: Math.round(balance * 100) / 100,
                confidence,
                factors: [
                    `Moyenne revenus: ${avgIncome.toFixed(0)} EUR/mois`,
                    `Moyenne depenses: ${avgExpense.toFixed(0)} EUR/mois`,
                    `Tendance revenus: ${incomeSlope > 0 ? '+' : ''}${incomeSlope.toFixed(0)} EUR/mois`,
                    `Tendance depenses: ${expenseSlope > 0 ? '+' : ''}${expenseSlope.toFixed(0)} EUR/mois`
                ]
            });
        }
        const minBalance = Math.min(...predictions.map(p => p.predicted_balance));
        const riskLevel = minBalance < 0 ? 'high' : minBalance < avgExpense ? 'medium' : 'low';
        const forecast = {
            workspace_id: workspaceId,
            generated_at: new Date().toISOString(),
            current_balance: Math.round(currentBalance * 100) / 100,
            predictions,
            summary: `Prediction sur ${months} mois basee sur ${history.length} mois d'historique. ` +
                `Solde predit final: ${predictions[predictions.length - 1].predicted_balance.toFixed(2)} EUR.`,
            risk_level: riskLevel
        };
        res.json(forecast);
    }
    catch (error) {
        console.error('Erreur prediction tresorerie:', error);
        res.status(500).json({ error: 'Erreur lors de la prediction de tresorerie' });
    }
};
exports.predictCashFlow = predictCashFlow;
/**
 * POST /ai/categorize
 * Suggestion de categorie par IA basee sur la description et le montant
 */
const aiCategorize = async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const { description } = req.body;
        if (!description) {
            res.status(400).json({ error: 'Champ requis: description' });
            return;
        }
        // Recuperer les categories existantes
        await pool_js_1.default.query('SELECT id, slug, name, type FROM accounting_categories WHERE workspace_id = $1', [workspaceId]);
        // Analyser l'historique pour trouver des patterns similaires
        const similarResult = await pool_js_1.default.query(`SELECT c.slug, c.name, COUNT(*) as frequency
       FROM invoices i
       JOIN accounting_categories c ON i.category_id = c.id
       WHERE i.workspace_id = $1
         AND (i.fournisseur ILIKE $2 OR i.notes ILIKE $2)
       GROUP BY c.slug, c.name
       ORDER BY frequency DESC
       LIMIT 5`, [workspaceId, `%${description.split(' ')[0]}%`]);
        // Categorisation basee sur des mots-cles
        const descLower = description.toLowerCase();
        const keywordMap = {
            'logiciels': ['software', 'logiciel', 'saas', 'licence', 'abonnement', 'subscription'],
            'hebergement': ['hosting', 'hebergement', 'serveur', 'cloud', 'aws', 'azure', 'ovh'],
            'repas': ['restaurant', 'repas', 'dejeuner', 'diner', 'cafe', 'traiteur'],
            'transport': ['transport', 'train', 'avion', 'taxi', 'uber', 'essence', 'carburant', 'peage'],
            'telecom': ['telephone', 'internet', 'mobile', 'telecom', 'fibre', 'forfait'],
            'fournitures-bureau': ['fourniture', 'papier', 'encre', 'bureau', 'stylo', 'materiel'],
            'honoraires': ['honoraires', 'consultant', 'avocat', 'comptable', 'expert', 'conseil'],
            'marketing': ['marketing', 'pub', 'publicite', 'google ads', 'facebook', 'campagne'],
            'formation': ['formation', 'cours', 'conference', 'seminaire', 'workshop'],
            'assurances': ['assurance', 'mutuelle', 'prevoyance'],
            'prestations-clients': ['prestation', 'mission', 'projet', 'facture client'],
            'ventes-produits': ['vente', 'produit', 'marchandise']
        };
        let bestMatch = { category: 'autres-depenses', confidence: 30, reasoning: 'Categorie par defaut' };
        const alternatives = [];
        for (const [slug, keywords] of Object.entries(keywordMap)) {
            const matchCount = keywords.filter(kw => descLower.includes(kw)).length;
            if (matchCount > 0) {
                const conf = Math.min(90, 50 + matchCount * 20);
                if (conf > bestMatch.confidence) {
                    if (bestMatch.confidence > 30) {
                        alternatives.push({ category: bestMatch.category, confidence: bestMatch.confidence });
                    }
                    bestMatch = {
                        category: slug,
                        confidence: conf,
                        reasoning: `Mots-cles detectes: ${keywords.filter(kw => descLower.includes(kw)).join(', ')}`
                    };
                }
                else {
                    alternatives.push({ category: slug, confidence: conf });
                }
            }
        }
        // Enrichir avec l'historique
        if (similarResult.rows.length > 0) {
            const histMatch = similarResult.rows[0];
            const histConf = Math.min(85, 50 + parseInt(histMatch.frequency) * 10);
            if (histConf > bestMatch.confidence) {
                alternatives.unshift({ category: bestMatch.category, confidence: bestMatch.confidence });
                bestMatch = {
                    category: histMatch.slug,
                    confidence: histConf,
                    reasoning: `Historique: ${histMatch.frequency} factures similaires dans la categorie "${histMatch.name}"`
                };
            }
        }
        const result = {
            suggested_category: bestMatch.category,
            confidence: bestMatch.confidence,
            reasoning: bestMatch.reasoning,
            alternatives: alternatives.slice(0, 3).sort((a, b) => b.confidence - a.confidence)
        };
        res.json(result);
    }
    catch (error) {
        console.error('Erreur categorisation IA:', error);
        res.status(500).json({ error: 'Erreur lors de la categorisation' });
    }
};
exports.aiCategorize = aiCategorize;
/**
 * POST /ai/detect-anomalies
 * Detection d'anomalies dans les donnees comptables
 */
const detectAnomalies = async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const anomalies = [];
        // 1. Factures avec montant anormalement eleve (> 3x la moyenne)
        const avgResult = await pool_js_1.default.query(`SELECT AVG(montant_ttc) as avg_amount, STDDEV(montant_ttc) as stddev_amount
       FROM invoices WHERE workspace_id = $1`, [workspaceId]);
        const avgAmount = parseFloat(avgResult.rows[0].avg_amount || '0');
        const stddev = parseFloat(avgResult.rows[0].stddev_amount || '0');
        if (avgAmount > 0 && stddev > 0) {
            const outlierThreshold = avgAmount + 3 * stddev;
            const outliersResult = await pool_js_1.default.query(`SELECT id, fournisseur, montant_ttc, type
         FROM invoices
         WHERE workspace_id = $1 AND montant_ttc > $2
         ORDER BY montant_ttc DESC LIMIT 10`, [workspaceId, outlierThreshold]);
            for (const inv of outliersResult.rows) {
                const deviation = ((parseFloat(inv.montant_ttc) - avgAmount) / avgAmount) * 100;
                anomalies.push({
                    type: 'unusual_amount',
                    severity: deviation > 500 ? 'critical' : 'warning',
                    description: `Facture ${inv.fournisseur} avec montant anormalement eleve: ${parseFloat(inv.montant_ttc).toFixed(2)} EUR (moyenne: ${avgAmount.toFixed(2)} EUR)`,
                    entity_id: inv.id,
                    entity_type: 'invoice',
                    expected_value: avgAmount,
                    actual_value: parseFloat(inv.montant_ttc),
                    deviation_pct: Math.round(deviation),
                    recommendation: 'Verifier cette facture et confirmer le montant'
                });
            }
        }
        // 2. Doublons potentiels (meme fournisseur, meme montant, dates proches)
        const duplicatesResult = await pool_js_1.default.query(`SELECT a.id as id_a, b.id as id_b, a.fournisseur, a.montant_ttc,
              a.date_facture as date_a, b.date_facture as date_b
       FROM invoices a
       JOIN invoices b ON a.workspace_id = b.workspace_id
         AND a.fournisseur = b.fournisseur
         AND a.montant_ttc = b.montant_ttc
         AND a.id < b.id
         AND ABS(EXTRACT(EPOCH FROM (a.date_facture - b.date_facture))) < 7 * 86400
       WHERE a.workspace_id = $1
       LIMIT 20`, [workspaceId]);
        for (const dup of duplicatesResult.rows) {
            anomalies.push({
                type: 'potential_duplicate',
                severity: 'warning',
                description: `Doublon potentiel: ${dup.fournisseur} - ${parseFloat(dup.montant_ttc).toFixed(2)} EUR (${new Date(dup.date_a).toISOString().split('T')[0]} / ${new Date(dup.date_b).toISOString().split('T')[0]})`,
                entity_id: dup.id_a,
                entity_type: 'invoice',
                expected_value: null,
                actual_value: parseFloat(dup.montant_ttc),
                deviation_pct: null,
                recommendation: 'Verifier si ces deux factures ne sont pas un doublon'
            });
        }
        // 3. Factures sans categorie
        const uncategorizedResult = await pool_js_1.default.query(`SELECT COUNT(*) as count
       FROM invoices
       WHERE workspace_id = $1 AND category_id IS NULL`, [workspaceId]);
        const uncatCount = parseInt(uncategorizedResult.rows[0].count, 10);
        if (uncatCount > 0) {
            anomalies.push({
                type: 'missing_category',
                severity: 'info',
                description: `${uncatCount} facture(s) sans categorie assignee`,
                entity_id: null,
                entity_type: 'invoice',
                expected_value: null,
                actual_value: uncatCount,
                deviation_pct: null,
                recommendation: 'Assigner une categorie a ces factures pour un meilleur suivi'
            });
        }
        // 4. Variation mensuelle importante
        const monthlyResult = await pool_js_1.default.query(`SELECT
        EXTRACT(MONTH FROM date_facture)::int as month,
        EXTRACT(YEAR FROM date_facture)::int as year,
        SUM(CASE WHEN type = 'expense' THEN montant_ttc ELSE 0 END) as expenses
       FROM invoices
       WHERE workspace_id = $1 AND date_facture >= CURRENT_DATE - INTERVAL '6 months'
       GROUP BY EXTRACT(YEAR FROM date_facture), EXTRACT(MONTH FROM date_facture)
       ORDER BY year, month`, [workspaceId]);
        if (monthlyResult.rows.length >= 2) {
            const monthlyExpenses = monthlyResult.rows.map(r => parseFloat(r.expenses));
            const monthlyAvg = monthlyExpenses.reduce((s, v) => s + v, 0) / monthlyExpenses.length;
            for (let i = 1; i < monthlyExpenses.length; i++) {
                const variation = monthlyAvg > 0
                    ? ((monthlyExpenses[i] - monthlyAvg) / monthlyAvg) * 100
                    : 0;
                if (Math.abs(variation) > 50) {
                    const row = monthlyResult.rows[i];
                    anomalies.push({
                        type: 'monthly_spike',
                        severity: Math.abs(variation) > 100 ? 'warning' : 'info',
                        description: `Variation importante des depenses en ${row.month}/${row.year}: ${variation > 0 ? '+' : ''}${variation.toFixed(0)}% par rapport a la moyenne`,
                        entity_id: null,
                        entity_type: 'period',
                        expected_value: monthlyAvg,
                        actual_value: monthlyExpenses[i],
                        deviation_pct: Math.round(variation),
                        recommendation: 'Analyser les depenses de ce mois pour identifier la cause'
                    });
                }
            }
        }
        const result = {
            workspace_id: workspaceId,
            generated_at: new Date().toISOString(),
            anomalies,
            summary: `${anomalies.length} anomalie(s) detectee(s): ` +
                `${anomalies.filter(a => a.severity === 'critical').length} critique(s), ` +
                `${anomalies.filter(a => a.severity === 'warning').length} avertissement(s), ` +
                `${anomalies.filter(a => a.severity === 'info').length} info(s).`
        };
        res.json(result);
    }
    catch (error) {
        console.error('Erreur detection anomalies:', error);
        res.status(500).json({ error: 'Erreur lors de la detection des anomalies' });
    }
};
exports.detectAnomalies = detectAnomalies;
// ============================================
// EXPORTS FEC & TVA
// ============================================
/**
 * POST /export/fec
 * Generer le Fichier des Ecritures Comptables (format legal francais)
 */
const exportFEC = async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const { year } = req.body;
        if (!year) {
            res.status(400).json({ error: 'Champ requis: year' });
            return;
        }
        // Recuperer toutes les factures de l'annee
        const invoicesResult = await pool_js_1.default.query(`SELECT i.*, c.name as category_name, c.slug as category_slug
       FROM invoices i
       LEFT JOIN accounting_categories c ON i.category_id = c.id
       WHERE i.workspace_id = $1 AND EXTRACT(YEAR FROM i.date_facture) = $2
         AND i.status IN ('validated', 'paid')
       ORDER BY i.date_facture, i.created_at`, [workspaceId, year]);
        // Recuperer les parametres de la societe
        const settingsResult = await pool_js_1.default.query('SELECT * FROM company_settings WHERE workspace_id = $1', [workspaceId]);
        // companyName available via settingsResult.rows[0]?.company_name if needed
        const siret = settingsResult.rows[0]?.siret || '00000000000000';
        const entries = [];
        let ecritureNum = 1;
        for (const inv of invoicesResult.rows) {
            const dateStr = new Date(inv.date_facture).toISOString().split('T')[0].replace(/-/g, '');
            const isIncome = inv.type === 'income';
            // Ecriture principale (HT)
            entries.push({
                JournalCode: isIncome ? 'VE' : 'AC',
                JournalLib: isIncome ? 'Journal des Ventes' : 'Journal des Achats',
                EcritureNum: String(ecritureNum).padStart(6, '0'),
                EcritureDate: dateStr,
                CompteNum: isIncome ? '701000' : '607000',
                CompteLib: isIncome ? 'Ventes de produits finis' : 'Achats de marchandises',
                CompAuxNum: '',
                CompAuxLib: '',
                PieceRef: inv.reference || `FAC-${inv.id.slice(0, 8)}`,
                PieceDate: dateStr,
                EcritureLib: `${inv.fournisseur} - ${inv.reference || 'Facture'}`,
                Debit: isIncome ? '0.00' : inv.montant_ht.toFixed(2),
                Credit: isIncome ? inv.montant_ht.toFixed(2) : '0.00',
                EcritureLet: '',
                DateLet: '',
                ValidDate: dateStr,
                Montantdevise: '',
                Idevise: ''
            });
            // Ecriture TVA
            if (inv.montant_tva > 0) {
                entries.push({
                    JournalCode: isIncome ? 'VE' : 'AC',
                    JournalLib: isIncome ? 'Journal des Ventes' : 'Journal des Achats',
                    EcritureNum: String(ecritureNum).padStart(6, '0'),
                    EcritureDate: dateStr,
                    CompteNum: isIncome ? '445710' : '445660',
                    CompteLib: isIncome ? 'TVA collectee' : 'TVA deductible',
                    CompAuxNum: '',
                    CompAuxLib: '',
                    PieceRef: inv.reference || `FAC-${inv.id.slice(0, 8)}`,
                    PieceDate: dateStr,
                    EcritureLib: `TVA ${inv.tva_rate}% - ${inv.fournisseur}`,
                    Debit: isIncome ? '0.00' : inv.montant_tva.toFixed(2),
                    Credit: isIncome ? inv.montant_tva.toFixed(2) : '0.00',
                    EcritureLet: '',
                    DateLet: '',
                    ValidDate: dateStr,
                    Montantdevise: '',
                    Idevise: ''
                });
            }
            // Ecriture contrepartie (TTC)
            entries.push({
                JournalCode: isIncome ? 'VE' : 'AC',
                JournalLib: isIncome ? 'Journal des Ventes' : 'Journal des Achats',
                EcritureNum: String(ecritureNum).padStart(6, '0'),
                EcritureDate: dateStr,
                CompteNum: isIncome ? '411000' : '401000',
                CompteLib: isIncome ? 'Clients' : 'Fournisseurs',
                CompAuxNum: inv.fournisseur.slice(0, 17),
                CompAuxLib: inv.fournisseur,
                PieceRef: inv.reference || `FAC-${inv.id.slice(0, 8)}`,
                PieceDate: dateStr,
                EcritureLib: `${inv.fournisseur} - ${inv.reference || 'Facture'}`,
                Debit: isIncome ? inv.montant_ttc.toFixed(2) : '0.00',
                Credit: isIncome ? '0.00' : inv.montant_ttc.toFixed(2),
                EcritureLet: '',
                DateLet: '',
                ValidDate: dateStr,
                Montantdevise: '',
                Idevise: ''
            });
            ecritureNum++;
        }
        // Generer le fichier FEC (format tab-separated)
        const fecHeaders = [
            'JournalCode', 'JournalLib', 'EcritureNum', 'EcritureDate',
            'CompteNum', 'CompteLib', 'CompAuxNum', 'CompAuxLib',
            'PieceRef', 'PieceDate', 'EcritureLib', 'Debit', 'Credit',
            'EcritureLet', 'DateLet', 'ValidDate', 'Montantdevise', 'Idevise'
        ];
        const fecContent = [
            fecHeaders.join('\t'),
            ...entries.map(e => fecHeaders.map(h => e[h]).join('\t'))
        ].join('\n');
        const exportDir = process.env.EXPORT_DIR || './exports';
        if (!fs.existsSync(exportDir)) {
            fs.mkdirSync(exportDir, { recursive: true });
        }
        const filename = `${siret}FEC${year}0101.txt`;
        const filepath = path.join(exportDir, filename);
        fs.writeFileSync(filepath, '\ufeff' + fecContent, 'utf8');
        const result = {
            filename,
            filepath,
            entry_count: entries.length,
            period: { year, start: `${year}-01-01`, end: `${year}-12-31` },
            generated_at: new Date().toISOString()
        };
        res.json(result);
    }
    catch (error) {
        console.error('Erreur export FEC:', error);
        res.status(500).json({ error: 'Erreur lors de la generation du FEC' });
    }
};
exports.exportFEC = exportFEC;
/**
 * POST /export/tva-declaration
 * Generer la declaration de TVA
 */
const exportTVADeclaration = async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const { year, quarter } = req.body;
        if (!year) {
            res.status(400).json({ error: 'Champ requis: year' });
            return;
        }
        if (quarter && (quarter < 1 || quarter > 4)) {
            res.status(400).json({ error: 'Trimestre invalide (1-4)' });
            return;
        }
        let dateFilter = `EXTRACT(YEAR FROM date_facture) = $2`;
        const params = [workspaceId, year];
        if (quarter) {
            const startMonth = (quarter - 1) * 3 + 1;
            const endMonth = quarter * 3;
            dateFilter += ` AND EXTRACT(MONTH FROM date_facture) BETWEEN $3 AND $4`;
            params.push(startMonth, endMonth);
        }
        const tvaResult = await pool_js_1.default.query(`SELECT
        tva_rate,
        SUM(CASE WHEN type = 'income' THEN montant_ht ELSE 0 END) as base_collectee,
        SUM(CASE WHEN type = 'income' THEN montant_tva ELSE 0 END) as tva_collectee,
        SUM(CASE WHEN type = 'expense' THEN montant_ht ELSE 0 END) as base_deductible,
        SUM(CASE WHEN type = 'expense' THEN montant_tva ELSE 0 END) as tva_deductible
       FROM invoices
       WHERE workspace_id = $1 AND ${dateFilter}
         AND status IN ('validated', 'paid')
       GROUP BY tva_rate
       ORDER BY tva_rate DESC`, params);
        const details = tvaResult.rows.map(r => ({
            tva_rate: parseFloat(r.tva_rate),
            base_collectee: parseFloat(r.base_collectee),
            tva_collectee: parseFloat(r.tva_collectee),
            base_deductible: parseFloat(r.base_deductible),
            tva_deductible: parseFloat(r.tva_deductible),
            solde: parseFloat(r.tva_collectee) - parseFloat(r.tva_deductible)
        }));
        const totalCollectee = details.reduce((s, d) => s + d.tva_collectee, 0);
        const totalDeductible = details.reduce((s, d) => s + d.tva_deductible, 0);
        const solde = totalCollectee - totalDeductible;
        // Generer le CSV de declaration
        const exportDir = process.env.EXPORT_DIR || './exports';
        if (!fs.existsSync(exportDir)) {
            fs.mkdirSync(exportDir, { recursive: true });
        }
        const csvHeaders = ['Taux TVA', 'Base collectee', 'TVA collectee', 'Base deductible', 'TVA deductible', 'Solde'];
        const csvRows = details.map(d => [
            `${d.tva_rate}%`, d.base_collectee.toFixed(2), d.tva_collectee.toFixed(2),
            d.base_deductible.toFixed(2), d.tva_deductible.toFixed(2), d.solde.toFixed(2)
        ]);
        csvRows.push(['TOTAL', '', totalCollectee.toFixed(2), '', totalDeductible.toFixed(2), solde.toFixed(2)]);
        const csvContent = [csvHeaders.join(';'), ...csvRows.map(r => r.join(';'))].join('\n');
        const filename = `declaration_tva_${year}${quarter ? `_Q${quarter}` : ''}_${Date.now()}.csv`;
        const filepath = path.join(exportDir, filename);
        fs.writeFileSync(filepath, '\ufeff' + csvContent, 'utf8');
        res.json({
            year,
            quarter: quarter || null,
            details,
            totals: {
                tva_collectee: totalCollectee,
                tva_deductible: totalDeductible,
                solde,
                a_payer: solde > 0 ? solde : 0,
                credit_tva: solde < 0 ? Math.abs(solde) : 0
            },
            export_file: filepath
        });
    }
    catch (error) {
        console.error('Erreur declaration TVA:', error);
        res.status(500).json({ error: 'Erreur lors de la generation de la declaration TVA' });
    }
};
exports.exportTVADeclaration = exportTVADeclaration;
// ============================================
// INVOICE ENHANCEMENTS
// ============================================
/**
 * POST /invoices/:id/mark-paid
 * Marquer une facture comme payee
 */
const markInvoicePaid = async (req, res) => {
    try {
        const { workspaceId, id } = req.params;
        const { payment_method, payment_reference, paid_at } = req.body;
        const result = await pool_js_1.default.query(`UPDATE invoices
       SET status = 'paid',
           notes = COALESCE(notes, '') || E'\nPaiement: ' || $1 || ' ref:' || COALESCE($2, '-') || ' le ' || $3,
           updated_at = NOW()
       WHERE id = $4 AND workspace_id = $5
       RETURNING *`, [
            payment_method || 'virement',
            payment_reference || null,
            paid_at || new Date().toISOString().split('T')[0],
            id,
            workspaceId
        ]);
        if (!result.rows[0]) {
            res.status(404).json({ error: 'Facture non trouvee' });
            return;
        }
        // Mettre a jour les totaux du contact si lie
        if (result.rows[0].contact_id) {
            await pool_js_1.default.query(`UPDATE contacts
         SET total_paid = COALESCE((
           SELECT SUM(montant_ttc) FROM invoices
           WHERE contact_id = $1 AND workspace_id = $2 AND status = 'paid'
         ), 0),
         updated_at = NOW()
         WHERE id = $1 AND workspace_id = $2`, [result.rows[0].contact_id, workspaceId]);
        }
        res.json(result.rows[0]);
    }
    catch (error) {
        console.error('Erreur marquage paiement facture:', error);
        res.status(500).json({ error: 'Erreur lors du marquage du paiement' });
    }
};
exports.markInvoicePaid = markInvoicePaid;
/**
 * POST /invoices/:id/send
 * Simuler l'envoi d'une facture par email
 */
const sendInvoice = async (req, res) => {
    try {
        const { workspaceId, id } = req.params;
        const invoice = await pool_js_1.default.query('SELECT * FROM invoices WHERE id = $1 AND workspace_id = $2', [id, workspaceId]);
        if (!invoice.rows[0]) {
            res.status(404).json({ error: 'Facture non trouvee' });
            return;
        }
        // Marquer comme envoyee
        const result = await pool_js_1.default.query(`UPDATE invoices
       SET status = CASE WHEN status = 'draft' THEN 'pending' ELSE status END,
           notes = COALESCE(notes, '') || E'\nEnvoyee le ' || $1,
           updated_at = NOW()
       WHERE id = $2 AND workspace_id = $3
       RETURNING *`, [new Date().toISOString().split('T')[0], id, workspaceId]);
        res.json({
            success: true,
            message: `Facture envoyee a ${invoice.rows[0].client_email || invoice.rows[0].fournisseur}`,
            invoice: result.rows[0]
        });
    }
    catch (error) {
        console.error('Erreur envoi facture:', error);
        res.status(500).json({ error: 'Erreur lors de l\'envoi de la facture' });
    }
};
exports.sendInvoice = sendInvoice;
/**
 * POST /invoices/:id/remind
 * Envoyer un rappel pour une facture en retard
 */
const sendReminder = async (req, res) => {
    try {
        const { workspaceId, id } = req.params;
        const invoice = await pool_js_1.default.query('SELECT * FROM invoices WHERE id = $1 AND workspace_id = $2', [id, workspaceId]);
        if (!invoice.rows[0]) {
            res.status(404).json({ error: 'Facture non trouvee' });
            return;
        }
        if (invoice.rows[0].status === 'paid') {
            res.status(400).json({ error: 'Cette facture est deja payee' });
            return;
        }
        await pool_js_1.default.query(`UPDATE invoices
       SET notes = COALESCE(notes, '') || E'\nRappel envoye le ' || $1,
           updated_at = NOW()
       WHERE id = $2 AND workspace_id = $3`, [new Date().toISOString().split('T')[0], id, workspaceId]);
        res.json({
            success: true,
            message: `Rappel envoye pour la facture ${invoice.rows[0].reference || invoice.rows[0].id}`,
            invoice_id: id
        });
    }
    catch (error) {
        console.error('Erreur envoi rappel:', error);
        res.status(500).json({ error: 'Erreur lors de l\'envoi du rappel' });
    }
};
exports.sendReminder = sendReminder;
/**
 * POST /invoices/batch-scan
 * Scanner plusieurs factures en lot
 */
const batchScanInvoices = async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const files = req.files;
        if (!files || files.length === 0) {
            res.status(400).json({ error: 'Au moins un fichier requis' });
            return;
        }
        const results = [];
        for (const file of files) {
            try {
                const extraction = await aiService.extractInvoiceFromImage(file.path);
                if (!extraction.success) {
                    results.push({ filename: file.originalname, success: false, error: extraction.errors.join(', ') });
                    continue;
                }
                const invoiceData = {
                    type: 'expense',
                    fournisseur: extraction.data.fournisseur || 'Non identifie',
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
                results.push({
                    filename: file.originalname,
                    success: true,
                    invoice,
                    confidence: extraction.confidence
                });
            }
            catch (fileErr) {
                results.push({
                    filename: file.originalname,
                    success: false,
                    error: fileErr instanceof Error ? fileErr.message : 'Erreur inconnue'
                });
            }
        }
        res.status(201).json({
            total: files.length,
            success_count: results.filter(r => r.success).length,
            error_count: results.filter(r => !r.success).length,
            results
        });
    }
    catch (error) {
        console.error('Erreur batch scan factures:', error);
        res.status(500).json({ error: 'Erreur lors du scan en lot' });
    }
};
exports.batchScanInvoices = batchScanInvoices;
/**
 * GET /invoices/overdue
 * Liste des factures en retard
 */
const getOverdueInvoices = async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const result = await pool_js_1.default.query(`SELECT i.*,
        c.name as category_name,
        (CURRENT_DATE - i.date_echeance::date) as days_overdue
       FROM invoices i
       LEFT JOIN accounting_categories c ON i.category_id = c.id
       WHERE i.workspace_id = $1
         AND i.status NOT IN ('paid', 'cancelled')
         AND i.date_echeance IS NOT NULL
         AND i.date_echeance < CURRENT_DATE
       ORDER BY i.date_echeance ASC`, [workspaceId]);
        const totalOverdue = result.rows.reduce((s, r) => s + parseFloat(r.montant_ttc), 0);
        res.json({
            count: result.rows.length,
            total_amount: totalOverdue,
            invoices: result.rows
        });
    }
    catch (error) {
        console.error('Erreur factures en retard:', error);
        res.status(500).json({ error: 'Erreur lors de la recuperation des factures en retard' });
    }
};
exports.getOverdueInvoices = getOverdueInvoices;
/**
 * POST /documents
 * Creer un document (devis, avoir)
 */
const createDocument = async (req, res) => {
    try {
        const { workspaceId } = req.params;
        const data = req.body;
        if (!data.document_type || !['quote', 'credit_note', 'proforma'].includes(data.document_type)) {
            res.status(400).json({ error: 'document_type requis: quote, credit_note ou proforma' });
            return;
        }
        if (!data.fournisseur || data.montant_ht === undefined) {
            res.status(400).json({ error: 'Champs requis: fournisseur, montant_ht' });
            return;
        }
        const invoiceData = {
            type: data.type || 'income',
            fournisseur: data.fournisseur,
            reference: data.reference,
            montant_ht: data.montant_ht,
            montant_tva: data.montant_tva || 0,
            montant_ttc: data.montant_ttc || data.montant_ht,
            tva_rate: data.tva_rate || 20,
            date_facture: data.date_facture || new Date().toISOString().split('T')[0],
            date_echeance: data.date_echeance,
            notes: data.notes,
            document_type: data.document_type,
            client_name: data.client_name,
            client_email: data.client_email,
            contact_id: data.contact_id,
            department_id: data.department_id,
            currency: data.currency,
            line_items: data.line_items
        };
        const invoice = await service.createInvoice(workspaceId, invoiceData);
        res.status(201).json(invoice);
    }
    catch (error) {
        console.error('Erreur creation document:', error);
        res.status(500).json({ error: 'Erreur lors de la creation du document' });
    }
};
exports.createDocument = createDocument;
/**
 * POST /documents/:id/convert
 * Convertir un devis en facture
 */
const convertQuoteToInvoice = async (req, res) => {
    try {
        const { workspaceId, id } = req.params;
        const quoteResult = await pool_js_1.default.query(`SELECT * FROM invoices
       WHERE id = $1 AND workspace_id = $2 AND document_type = 'quote'`, [id, workspaceId]);
        if (!quoteResult.rows[0]) {
            res.status(404).json({ error: 'Devis non trouve' });
            return;
        }
        const quote = quoteResult.rows[0];
        // Recuperer les lignes du devis
        const linesResult = await pool_js_1.default.query('SELECT * FROM invoice_line_items WHERE invoice_id = $1', [id]);
        // Creer la facture a partir du devis
        const invoiceData = {
            type: quote.type,
            fournisseur: quote.fournisseur,
            reference: `FAC-${(quote.reference || '').replace('DEV-', '')}`,
            montant_ht: quote.montant_ht,
            montant_tva: quote.montant_tva,
            montant_ttc: quote.montant_ttc,
            tva_rate: quote.tva_rate,
            date_facture: new Date().toISOString().split('T')[0],
            date_echeance: quote.date_echeance
                ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                : undefined,
            notes: `Converti depuis devis ${quote.reference || quote.id}`,
            document_type: 'invoice',
            client_name: quote.client_name || undefined,
            client_email: quote.client_email || undefined,
            contact_id: quote.contact_id || undefined,
            department_id: quote.department_id || undefined,
            currency: quote.currency || undefined,
            line_items: linesResult.rows.map(l => ({
                description: l.description,
                quantity: l.quantity,
                unit_price: l.unit_price,
                tva_rate: l.tva_rate
            }))
        };
        const newInvoice = await service.createInvoice(workspaceId, invoiceData);
        // Marquer le devis comme converti
        await pool_js_1.default.query(`UPDATE invoices
       SET status = 'validated',
           notes = COALESCE(notes, '') || E'\nConverti en facture ' || $1 || ' le ' || $2,
           updated_at = NOW()
       WHERE id = $3`, [newInvoice.id, new Date().toISOString().split('T')[0], id]);
        res.status(201).json({
            quote_id: id,
            invoice: newInvoice,
            message: 'Devis converti en facture avec succes'
        });
    }
    catch (error) {
        console.error('Erreur conversion devis:', error);
        res.status(500).json({ error: 'Erreur lors de la conversion du devis en facture' });
    }
};
exports.convertQuoteToInvoice = convertQuoteToInvoice;
//# sourceMappingURL=accounting.controller.bank.js.map