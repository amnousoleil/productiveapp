"use strict";
/**
 * Module Comptabilité - Service Rapprochement Bancaire
 * @description Import de transactions bancaires, rapprochement manuel et automatique
 * avec les factures, statistiques de réconciliation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReconciliationSummary = exports.getUnreconciledTransactions = exports.autoMatchTransactions = exports.unmatchTransaction = exports.matchTransaction = exports.listBankTransactions = exports.importBankTransactions = exports.initBankService = void 0;
let pool;
const initBankService = (dbPool) => {
    pool = dbPool;
};
exports.initBankService = initBankService;
// ============================================
// IMPORT EN MASSE
// ============================================
/**
 * Importe un lot de transactions bancaires (depuis un CSV parsé)
 * Chaque transaction reçoit un batch ID commun pour le suivi
 */
const importBankTransactions = async (workspaceId, transactions) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        // Générer un ID de batch unique pour ce lot d'import
        const batchResult = await client.query(`SELECT gen_random_uuid() as id`);
        const batchId = batchResult.rows[0].id;
        let imported = 0;
        for (const tx of transactions) {
            // Vérifier les doublons par date + montant + description + compte
            const duplicateCheck = await client.query(`SELECT id FROM bank_transactions
         WHERE workspace_id = $1
           AND transaction_date = $2
           AND amount = $3
           AND description = $4
           AND COALESCE(bank_account_name, '') = COALESCE($5, '')`, [workspaceId, tx.transaction_date, tx.amount, tx.description, tx.bank_account_name || '']);
            if (duplicateCheck.rows.length > 0) {
                continue; // Skip duplicates
            }
            await client.query(`INSERT INTO bank_transactions (
          workspace_id, transaction_date, value_date, description,
          reference, amount, type, bank_account_name,
          is_reconciled
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, false)`, [
                workspaceId,
                tx.transaction_date,
                tx.value_date || null,
                tx.description,
                tx.reference || null,
                tx.amount,
                tx.type,
                tx.bank_account_name || null
            ]);
            imported++;
        }
        await client.query('COMMIT');
        return { imported, batch_id: batchId };
    }
    catch (error) {
        await client.query('ROLLBACK');
        throw new Error(`Erreur import transactions: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
    finally {
        client.release();
    }
};
exports.importBankTransactions = importBankTransactions;
// ============================================
// LISTE PAGINÉE
// ============================================
/**
 * Liste les transactions bancaires avec filtres et pagination
 */
const listBankTransactions = async (workspaceId, filters) => {
    try {
        const page = filters.page || 1;
        const limit = Math.min(filters.limit || 20, 100);
        const offset = (page - 1) * limit;
        let whereClause = 'WHERE bt.workspace_id = $1';
        const params = [workspaceId];
        let paramIndex = 2;
        if (filters.date_from) {
            whereClause += ` AND bt.transaction_date >= $${paramIndex++}`;
            params.push(filters.date_from);
        }
        if (filters.date_to) {
            whereClause += ` AND bt.transaction_date <= $${paramIndex++}`;
            params.push(filters.date_to);
        }
        if (filters.type) {
            whereClause += ` AND bt.type = $${paramIndex++}`;
            params.push(filters.type);
        }
        if (filters.is_reconciled !== undefined) {
            whereClause += ` AND bt.is_reconciled = $${paramIndex++}`;
            params.push(filters.is_reconciled ? 'true' : 'false');
        }
        if (filters.min_amount !== undefined) {
            whereClause += ` AND ABS(bt.amount) >= $${paramIndex++}`;
            params.push(filters.min_amount);
        }
        if (filters.max_amount !== undefined) {
            whereClause += ` AND ABS(bt.amount) <= $${paramIndex++}`;
            params.push(filters.max_amount);
        }
        if (filters.search) {
            whereClause += ` AND (bt.description ILIKE $${paramIndex} OR bt.reference ILIKE $${paramIndex})`;
            params.push(`%${filters.search}%`);
            paramIndex++;
        }
        // Count
        const countResult = await pool.query(`SELECT COUNT(*) FROM bank_transactions bt ${whereClause}`, params);
        const total = parseInt(countResult.rows[0].count, 10);
        // Fetch with matched invoice info
        params.push(limit, offset);
        const result = await pool.query(`SELECT bt.*,
        i.fournisseur as matched_invoice_fournisseur,
        i.reference as matched_invoice_reference,
        i.montant_ttc as matched_invoice_amount,
        bt.category_suggestion as category_name
       FROM bank_transactions bt
       LEFT JOIN invoices i ON bt.matched_invoice_id = i.id
       ${whereClause}
       ORDER BY bt.transaction_date DESC, bt.created_at DESC
       LIMIT $${paramIndex++} OFFSET $${paramIndex}`, params);
        return {
            data: result.rows,
            pagination: {
                page,
                limit,
                total,
                total_pages: Math.ceil(total / limit)
            }
        };
    }
    catch (error) {
        throw new Error(`Erreur liste transactions: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
};
exports.listBankTransactions = listBankTransactions;
// ============================================
// RAPPROCHEMENT MANUEL
// ============================================
/**
 * Associe manuellement une transaction bancaire à une facture
 */
const matchTransaction = async (workspaceId, transactionId, invoiceId) => {
    try {
        // Vérifier que la facture appartient au workspace
        const invoiceCheck = await pool.query(`SELECT id, montant_ttc FROM invoices WHERE id = $1 AND workspace_id = $2`, [invoiceId, workspaceId]);
        if (!invoiceCheck.rows[0]) {
            throw new Error('Facture non trouvée dans ce workspace');
        }
        const result = await pool.query(`UPDATE bank_transactions
       SET matched_invoice_id = $1,
           is_reconciled = true,
           match_confidence = 100
       WHERE id = $2 AND workspace_id = $3
       RETURNING *`, [invoiceId, transactionId, workspaceId]);
        return result.rows[0] || null;
    }
    catch (error) {
        throw new Error(`Erreur rapprochement: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
};
exports.matchTransaction = matchTransaction;
/**
 * Supprime l'association d'une transaction avec une facture
 */
const unmatchTransaction = async (workspaceId, transactionId) => {
    try {
        const result = await pool.query(`UPDATE bank_transactions
       SET matched_invoice_id = NULL,
           is_reconciled = false,
           match_confidence = NULL
       WHERE id = $1 AND workspace_id = $2
       RETURNING *`, [transactionId, workspaceId]);
        return result.rows[0] || null;
    }
    catch (error) {
        throw new Error(`Erreur dé-rapprochement: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
};
exports.unmatchTransaction = unmatchTransaction;
// ============================================
// RAPPROCHEMENT AUTOMATIQUE
// ============================================
/**
 * Tente un rapprochement automatique basé sur:
 * - Correspondance exacte du montant
 * - Proximité de date (±5 jours)
 * - Correspondance de référence (si disponible)
 * Retourne les correspondances avec score de confiance
 */
const autoMatchTransactions = async (workspaceId) => {
    try {
        const matches = [];
        // Récupérer les transactions non rapprochées
        const unmatchedTx = await pool.query(`SELECT * FROM bank_transactions
       WHERE workspace_id = $1
         AND is_reconciled = false
       ORDER BY transaction_date DESC`, [workspaceId]);
        // Récupérer les factures non rapprochées (pas déjà associées à une transaction)
        const availableInvoices = await pool.query(`SELECT i.id, i.montant_ttc, i.date_facture, i.reference, i.fournisseur, i.type
       FROM invoices i
       WHERE i.workspace_id = $1
         AND i.id NOT IN (
           SELECT matched_invoice_id FROM bank_transactions
           WHERE workspace_id = $1 AND matched_invoice_id IS NOT NULL
         )
       ORDER BY i.date_facture DESC`, [workspaceId]);
        const invoices = availableInvoices.rows;
        for (const tx of unmatchedTx.rows) {
            let bestMatch = null;
            for (const inv of invoices) {
                let confidence = 0;
                const reasons = [];
                const txAmount = Math.abs(parseFloat(tx.amount));
                const invAmount = parseFloat(inv.montant_ttc);
                // Correspondance de montant exacte
                if (Math.abs(txAmount - invAmount) < 0.01) {
                    confidence += 50;
                    reasons.push('montant exact');
                }
                // Correspondance de montant approchée (±1%)
                else if (Math.abs(txAmount - invAmount) / invAmount < 0.01) {
                    confidence += 30;
                    reasons.push('montant approché (±1%)');
                }
                else {
                    continue; // Skip si les montants ne correspondent pas
                }
                // Correspondance de type (débit = expense, crédit = income)
                const expectedType = inv.type === 'expense' ? 'debit' : 'credit';
                if (tx.type === expectedType) {
                    confidence += 10;
                    reasons.push('type cohérent');
                }
                // Proximité de date (±5 jours)
                const txDate = new Date(tx.transaction_date);
                const invDate = new Date(inv.date_facture);
                const daysDiff = Math.abs((txDate.getTime() - invDate.getTime()) / (1000 * 60 * 60 * 24));
                if (daysDiff <= 1) {
                    confidence += 25;
                    reasons.push('même jour');
                }
                else if (daysDiff <= 3) {
                    confidence += 15;
                    reasons.push('±3 jours');
                }
                else if (daysDiff <= 5) {
                    confidence += 10;
                    reasons.push('±5 jours');
                }
                else if (daysDiff <= 15) {
                    confidence += 5;
                    reasons.push('±15 jours');
                }
                // Correspondance de référence
                if (tx.reference && inv.reference) {
                    const txRef = tx.reference.toLowerCase().replace(/[^a-z0-9]/g, '');
                    const invRef = inv.reference.toLowerCase().replace(/[^a-z0-9]/g, '');
                    if (txRef.includes(invRef) || invRef.includes(txRef)) {
                        confidence += 15;
                        reasons.push('référence correspondante');
                    }
                }
                // Fournisseur mentionné dans la description
                if (inv.fournisseur && tx.description) {
                    const fournisseurNorm = inv.fournisseur.toLowerCase();
                    const descNorm = tx.description.toLowerCase();
                    if (descNorm.includes(fournisseurNorm) || fournisseurNorm.includes(descNorm.substring(0, 10))) {
                        confidence += 10;
                        reasons.push('fournisseur dans description');
                    }
                }
                if (!bestMatch || confidence > bestMatch.confidence) {
                    bestMatch = {
                        invoiceId: inv.id,
                        confidence: Math.min(confidence, 100),
                        reason: reasons.join(', ')
                    };
                }
            }
            // Seuil minimum de confiance pour proposer un match
            if (bestMatch && bestMatch.confidence >= 60) {
                matches.push({
                    transaction_id: tx.id,
                    invoice_id: bestMatch.invoiceId,
                    confidence: bestMatch.confidence,
                    match_reason: bestMatch.reason
                });
                // Appliquer le match automatiquement si confiance >= 85
                if (bestMatch.confidence >= 85) {
                    await pool.query(`UPDATE bank_transactions
             SET matched_invoice_id = $1,
                 is_reconciled = true,
                 match_confidence = $2
             WHERE id = $3 AND workspace_id = $4`, [bestMatch.invoiceId, bestMatch.confidence, tx.id, workspaceId]);
                    // Retirer la facture des disponibles pour éviter les doublons
                    const idx = invoices.findIndex(i => i.id === bestMatch.invoiceId);
                    if (idx !== -1)
                        invoices.splice(idx, 1);
                }
            }
        }
        return matches;
    }
    catch (error) {
        throw new Error(`Erreur auto-rapprochement: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
};
exports.autoMatchTransactions = autoMatchTransactions;
// ============================================
// TRANSACTIONS NON RAPPROCHÉES
// ============================================
/**
 * Récupère toutes les transactions non rapprochées
 */
const getUnreconciledTransactions = async (workspaceId) => {
    try {
        const result = await pool.query(`SELECT * FROM bank_transactions
       WHERE workspace_id = $1
         AND is_reconciled = false
       ORDER BY transaction_date DESC`, [workspaceId]);
        return result.rows;
    }
    catch (error) {
        throw new Error(`Erreur récupération non-rapprochées: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
};
exports.getUnreconciledTransactions = getUnreconciledTransactions;
// ============================================
// STATISTIQUES DE RÉCONCILIATION
// ============================================
/**
 * Retourne un résumé des statistiques de réconciliation
 */
const getReconciliationSummary = async (workspaceId) => {
    try {
        const result = await pool.query(`SELECT
        COUNT(*) as total_transactions,
        COUNT(CASE WHEN is_reconciled = true THEN 1 END) as matched_count,
        COUNT(CASE WHEN is_reconciled = false THEN 1 END) as unmatched_count,
        0 as partial_count,
        0 as excluded_count,
        COALESCE(SUM(CASE WHEN type = 'credit' THEN ABS(amount) ELSE 0 END), 0) as total_credits,
        COALESCE(SUM(CASE WHEN type = 'debit' THEN ABS(amount) ELSE 0 END), 0) as total_debits,
        COALESCE(SUM(CASE WHEN is_reconciled = true THEN ABS(amount) ELSE 0 END), 0) as matched_amount,
        COALESCE(SUM(CASE WHEN is_reconciled = false THEN ABS(amount) ELSE 0 END), 0) as unmatched_amount
       FROM bank_transactions
       WHERE workspace_id = $1`, [workspaceId]);
        const row = result.rows[0];
        return {
            total_transactions: parseInt(row.total_transactions, 10),
            matched_count: parseInt(row.matched_count, 10),
            unmatched_count: parseInt(row.unmatched_count, 10),
            partial_count: parseInt(row.partial_count, 10),
            excluded_count: parseInt(row.excluded_count, 10),
            total_credits: parseFloat(row.total_credits),
            total_debits: parseFloat(row.total_debits),
            matched_amount: parseFloat(row.matched_amount),
            unmatched_amount: parseFloat(row.unmatched_amount)
        };
    }
    catch (error) {
        throw new Error(`Erreur résumé réconciliation: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
};
exports.getReconciliationSummary = getReconciliationSummary;
//# sourceMappingURL=accounting.bank.js.map